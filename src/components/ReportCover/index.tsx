import { Text, View } from "@tarojs/components";
import type { CompatibilityResponse } from "../../types/report";
import { getReportDateText, getReportTitle } from "../../utils/report";
import "./index.scss";

interface Props {
  report: CompatibilityResponse;
}

export function ReportCover({ report }: Props) {
  const isLove = report.reportType === "love";
  const kicker =
    report.reportType === "career" ? "CAREER INSIGHT" : report.reportType === "wealth" ? "LIFE RHYTHM" : "RELATIONSHIP INSIGHT";
  const singleLabel = report.reportType === "career" ? "职业画像" : "个人状态";
  const singleSymbol = report.reportType === "career" ? "C" : "L";

  return (
    <View className="report-cover card">
      <Text className="report-cover-kicker">{kicker}</Text>
      <Text className="report-cover-title">{getReportTitle(report.reportType)}</Text>
      <View className="report-cover-score-row">
        <Text className="report-cover-score">{report.score ?? "--"}</Text>
        <Text className="report-cover-score-unit">/100</Text>
      </View>
      <Text className="report-cover-type">{report.relationshipType || "内容洞察"}</Text>
      <Text className="report-cover-tagline">{report.tagline || "打开查看详细内容"}</Text>

      <View className={`report-cover-people ${isLove ? "double" : "single"}`}>
        <View className="report-cover-person">
          <Text className="report-cover-symbol">{isLove ? "A" : singleSymbol}</Text>
          <Text className="report-cover-zodiac">{isLove ? "你" : singleLabel}</Text>
          <Text className="report-cover-name">{report.personA?.name || "我"}</Text>
        </View>
        {isLove ? (
          <>
            <Text className="report-cover-heart">♥</Text>
            <View className="report-cover-person">
              <Text className="report-cover-symbol">B</Text>
              <Text className="report-cover-zodiac">TA</Text>
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
