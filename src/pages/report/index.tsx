import { useEffect, useMemo, useState } from "react";
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import { fetchReport } from "../../api/compatibility";
import { ChapterList } from "../../components/ChapterList";
import { EssenceList } from "../../components/EssenceList";
import { ReportCover } from "../../components/ReportCover";
import { useReportStore } from "../../store/useReportStore";
import type { CompatibilityResponse } from "../../types/report";
import { buildSharePath, getReportTitle } from "../../utils/report";
import "./index.scss";

export default function ReportPage() {
  const router = useRouter();
  const routeUid = router.params.uid || "";
  const { latestReport, setLatestReport } = useReportStore();
  const [report, setReport] = useState<CompatibilityResponse | null>(
    latestReport && latestReport.reportUid === routeUid ? latestReport : null
  );
  const [loading, setLoading] = useState(!report);
  const [error, setError] = useState("");

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
        setError(fetchError instanceof Error ? fetchError.message : "报告加载失败");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [report, routeUid, setLatestReport]);

  const shareInfo = useMemo(() => {
    if (!report) {
      return {
        title: "小登哥星盘",
        path: "/pages/home/index"
      };
    }

    return {
      title: `${getReportTitle(report.reportType)} · ${report.relationshipType || "星盘洞察"}`,
      path: buildSharePath(report.reportUid)
    };
  }, [report]);

  useShareAppMessage(() => shareInfo);
  useShareTimeline(() => ({
    title: shareInfo.title,
    query: shareInfo.path.split("?")[1] || ""
  }));

  if (loading) {
    return (
      <View className="page-shell">
        <View className="card report-state-card">
          <Text className="section-title">报告生成中</Text>
          <Text className="section-subtitle">正在拉取最新内容，请稍候。</Text>
        </View>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View className="page-shell">
        <View className="card report-state-card">
          <Text className="section-title">报告暂时不可用</Text>
          <Text className="section-subtitle">{error || "报告数据为空"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="page-shell report-page">
      <ReportCover report={report} />
      <EssenceList items={report.essence || []} />
      <ChapterList chapters={report.chapters || []} />

      <View className="report-actions">
        <View className="button-primary" onClick={() => Taro.navigateTo({ url: `/pages/share/index?uid=${encodeURIComponent(report.reportUid)}` })}>
          分享报告
        </View>
        <View className="button-secondary" onClick={() => Taro.navigateBack({ delta: 1 })}>
          返回继续查看
        </View>
      </View>
    </View>
  );
}
