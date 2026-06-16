import { useEffect, useMemo, useState } from "react";
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import { fetchReport, recordReferralVisit } from "../../api/compatibility";
import { ReportCover } from "../../components/ReportCover";
import { useReportStore } from "../../store/useReportStore";
import type { CompatibilityResponse } from "../../types/report";
import { setPendingInviteCode as cachePendingInviteCode } from "../../utils/auth";
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
      cachePendingInviteCode(routeInvite);
      recordReferralVisit({
        inviteCode: routeInvite,
        source: "miniapp-share-landing"
      }).catch(() => {});
    }
  }, [routeInvite, setPendingInviteCode]);

  useEffect(() => {
    let mounted = true;

    if (!routeUid) {
      setError("\u7f3a\u5c11\u62a5\u544a\u7f16\u53f7");
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
        setError(fetchError instanceof Error ? fetchError.message : "\u5206\u4eab\u5185\u5bb9\u52a0\u8f7d\u5931\u8d25");
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
        title: "\u5c0f\u767b\u54e5\u661f\u76d8",
        path: buildWalletPath(inviteCode)
      };
    }

    return {
      title: `${getReportTitle(report.reportType)} \u00b7 ${report.relationshipType || "\u661f\u76d8\u6d1e\u5bdf"}`,
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
      setError("\u8bf7\u5148\u751f\u6210\u62a5\u544a");
      return;
    }
    await Taro.setClipboardData({
      data: buildWebShareUrl(report.reportUid, inviteCode)
    });
    Taro.showToast({ title: "\u94fe\u63a5\u5df2\u590d\u5236", icon: "success" });
  };

  if (loading) {
    return (
      <View className="page-shell">
        <View className="card report-state-card">
          <Text className="section-title">{"\u5206\u4eab\u9875\u52a0\u8f7d\u4e2d"}</Text>
          <Text className="section-subtitle">{"\u6b63\u5728\u62c9\u53d6\u6700\u65b0\u62a5\u544a\u5185\u5bb9\uff0c\u8bf7\u7a0d\u5019\u3002"}</Text>
        </View>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View className="page-shell">
        <View className="card report-state-card">
          <Text className="section-title">{"\u5206\u4eab\u9875\u6682\u65f6\u4e0d\u53ef\u7528"}</Text>
          <Text className="section-subtitle">{error || "\u62a5\u544a\u6570\u636e\u4e3a\u7a7a"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="page-shell share-page">
      <ReportCover report={report} />

      <View className="card share-card">
        <Text className="section-title">{"\u5206\u4eab\u8fd9\u4efd\u62a5\u544a"}</Text>
        <Text className="section-subtitle">
          {"\u5f53\u524d\u5206\u4eab\u8def\u5f84\u4f1a\u81ea\u52a8\u5e26\u4e0a\u4f60\u7684\u8d26\u6237\u6807\u8bc6\u3002\u597d\u53cb\u8fdb\u5165\u540e\u5b8c\u6210\u4ed8\u8d39\uff0c\u8fd4\u73b0\u4f1a\u81ea\u52a8\u8fdb\u5165\u4f60\u7684\u7edf\u4e00\u8d26\u6237\u3002"}
        </Text>

        <View className="share-actions">
          <View className="button-primary" onClick={handleCopyLink}>
            {"\u590d\u5236 H5 \u94fe\u63a5"}
          </View>
          <View className="button-secondary" onClick={() => Taro.navigateTo({ url: buildWalletPath(inviteCode) })}>
            {"\u67e5\u770b\u8fd4\u73b0\u8d26\u6237"}
          </View>
        </View>
      </View>
    </View>
  );
}
