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
  const { latestReport, referralProfile, setLatestReport } = useReportStore();
  const [report, setReport] = useState<CompatibilityResponse | null>(
    latestReport && latestReport.reportUid === routeUid ? latestReport : null
  );
  const [loading, setLoading] = useState(!report);
  const [error, setError] = useState("");

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
        setError(fetchError instanceof Error ? fetchError.message : "\u62a5\u544a\u52a0\u8f7d\u5931\u8d25");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [report, routeUid, setLatestReport]);

  const inviteCode = referralProfile?.inviteCode || "";
  const shareInfo = useMemo(() => {
    if (!report) {
      return {
        title: "\u5c0f\u767b\u54e5\u661f\u76d8",
        path: "/pages/home/index"
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

  if (loading) {
    return (
      <View className="page-shell">
        <View className="card report-state-card">
          <Text className="section-title">{"\u62a5\u544a\u751f\u6210\u4e2d"}</Text>
          <Text className="section-subtitle">{"\u6b63\u5728\u62c9\u53d6\u6700\u65b0\u5185\u5bb9\uff0c\u8bf7\u7a0d\u5019\u3002"}</Text>
        </View>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View className="page-shell">
        <View className="card report-state-card">
          <Text className="section-title">{"\u62a5\u544a\u6682\u65f6\u4e0d\u53ef\u7528"}</Text>
          <Text className="section-subtitle">{error || "\u62a5\u544a\u6570\u636e\u4e3a\u7a7a"}</Text>
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
        <View
          className="button-primary"
          onClick={() =>
            Taro.navigateTo({
              url: `/pages/share/index?uid=${encodeURIComponent(report.reportUid)}${inviteCode ? `&invite=${encodeURIComponent(inviteCode)}` : ""}`
            })
          }
        >
          {"\u5206\u4eab\u62a5\u544a"}
        </View>
        <View className="button-secondary" onClick={() => Taro.navigateBack({ delta: 1 })}>
          {"\u8fd4\u56de\u7ee7\u7eed\u67e5\u770b"}
        </View>
      </View>
    </View>
  );
}
