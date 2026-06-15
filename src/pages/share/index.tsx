import { useEffect, useMemo, useState } from "react";
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import { fetchReport, recordReferralVisit } from "../../api/compatibility";
import { ReportCover } from "../../components/ReportCover";
import { useReportStore } from "../../store/useReportStore";
import type { CompatibilityResponse } from "../../types/report";
import { buildSharePath, buildWalletPath, buildWebShareUrl, getReportTitle } from "../../utils/report";
import "./index.scss";

export default function SharePage() {
  const router = useRouter();
  const routeUid = router.params.uid || "";
  const routeInvite = router.params.invite || "";
  const { latestReport, referralProfile, setLatestReport, setPendingInviteCode } = useReportStore();
  const [report, setReport] = useState<CompatibilityResponse | null>(
    latestReport && latestReport.reportUid === routeUid ? latestReport : null
  );
  const [loading, setLoading] = useState(!report);
  const [error, setError] = useState("");

  useEffect(() => {
    if (routeInvite) {
      setPendingInviteCode(routeInvite);
      recordReferralVisit({
        inviteCode: routeInvite,
        source: "miniapp-share-landing"
      }).catch(() => {});
    }
  }, [routeInvite, setPendingInviteCode]);

  useEffect(() => {
    let mounted = true;

    if (!routeUid) {
      setError("缺少报告编号");
      setLoading(false);
      return;
    }

    if (report && report.reportUid === routeUid) {
      return;
    }

    setLoading(true);
    fetchReport(routeUid)
      .then((response) => {
        if (!mounted) return;
        setReport(response);
        setLatestReport(response);
        setError("");
      })
      .catch((fetchError) => {
        if (!mounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "分享内容加载失败");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [report, routeUid, setLatestReport]);

  const inviteCode = referralProfile?.inviteCode || routeInvite || "";

  const shareInfo = useMemo(() => {
    if (!report) {
      return {
        title: "小登哥星盘",
        path: buildWalletPath(inviteCode)
      };
    }

    return {
      title: `${getReportTitle(report.reportType)} · ${report.relationshipType || "星盘洞察"}`,
      path: buildSharePath(report.reportUid, inviteCode)
    };
  }, [inviteCode, report]);

  useShareAppMessage(() => shareInfo);
  useShareTimeline(() => ({
    title: shareInfo.title,
    query: shareInfo.path.split("?")[1] || ""
  }));

  const handleCopyLink = async () => {
    if (!report?.reportUid) {
      setError("请先生成报告");
      return;
    }
    await Taro.setClipboardData({
      data: buildWebShareUrl(report.reportUid, inviteCode)
    });
    Taro.showToast({ title: "链接已复制", icon: "success" });
  };

  if (loading) {
    return (
      <View className="page-shell">
        <View className="card report-state-card">
          <Text className="section-title">分享页加载中</Text>
          <Text className="section-subtitle">正在拉取最新报告内容，请稍候。</Text>
        </View>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View className="page-shell">
        <View className="card report-state-card">
          <Text className="section-title">分享页暂时不可用</Text>
          <Text className="section-subtitle">{error || "报告数据为空"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="page-shell share-page">
      <ReportCover report={report} />

      <View className="card share-card">
        <Text className="section-title">分享这份报告</Text>
        <Text className="section-subtitle">当前分享路径会带上你的邀请标识。好友完成深度解析付费后，返现会自动进入你的统一账户。</Text>

        <View className="share-actions">
          <View className="button-primary" onClick={handleCopyLink}>
            复制链接
          </View>
          <View className="button-secondary" onClick={() => Taro.navigateTo({ url: buildWalletPath(inviteCode) })}>
            查看返现账户
          </View>
        </View>
      </View>
    </View>
  );
}
