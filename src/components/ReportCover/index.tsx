import { Text, View } from "@tarojs/components";
import type { CompatibilityResponse } from "../../types/report";
import { getReportDateText, getReportTitle } from "../../utils/report";
import "./index.scss";

interface Props {
  report: CompatibilityResponse;
}

export function ReportCover({ report }: Props) {
  const isLove = report.reportType === "love";

  return (
    <View className="report-cover card">
      <Text className="report-cover-kicker">RELATIONSHIP INSIGHT</Text>
      <Text className="report-cover-title">{getReportTitle(report.reportType)}</Text>
      <View className="report-cover-score-row">
        <Text className="report-cover-score">{report.score ?? "--"}</Text>
        <Text className="report-cover-score-unit">/100</Text>
      </View>
      <Text className="report-cover-type">{report.relationshipType || "关系洞察"}</Text>
      <Text className="report-cover-tagline">{report.tagline || "打开查看详细内容"}</Text>

      <View className={`report-cover-people ${isLove ? "double" : "single"}`}>
        <View className="report-cover-person">
          <Text className="report-cover-symbol">A</Text>
          <Text className="report-cover-zodiac">维度 A</Text>
          <Text className="report-cover-name">{report.personA?.name || "我"}</Text>
        </View>
        {isLove ? (
          <>
            <Text className="report-cover-heart">♥</Text>
            <View className="report-cover-person">
              <Text className="report-cover-symbol">B</Text>
              <Text className="report-cover-zodiac">维度 B</Text>
              <Text className="report-cover-name">{report.personB?.name || "TA"}</Text>
            </View>
          </>
        ) : null}
      </View>

      <View className="report-cover-meta">
        <Text className="report-cover-meta-label">COLLECTOR CODE</Text>
        <Text className="report-cover-meta-value">{report.reportUid}</Text>
        <Text className="report-cover-meta-date">{getReportDateText()}</Text>
      </View>
    </View>
  );
}
