import { Text, View } from "@tarojs/components";
import type { CompatibilityResponse } from "../../types/report";
import { getReportDateText, getReportTitle, getZodiacSymbol } from "../../utils/report";
import "./index.scss";

interface Props {
  report: CompatibilityResponse;
}

export function ReportCover({ report }: Props) {
  const isLove = report.reportType === "love";

  return (
    <View className="report-cover card">
      <Text className="report-cover-kicker">SOULMATE COMPATIBILITY</Text>
      <Text className="report-cover-title">{getReportTitle(report.reportType)}</Text>
      <View className="report-cover-score-row">
        <Text className="report-cover-score">{report.score ?? "--"}</Text>
        <Text className="report-cover-score-unit">/100</Text>
      </View>
      <Text className="report-cover-type">{report.relationshipType || "关系洞察"}</Text>
      <Text className="report-cover-tagline">{report.tagline || "打开完整报告查看星盘细节"}</Text>

      <View className={`report-cover-people ${isLove ? "double" : "single"}`}>
        <View className="report-cover-person">
          <Text className="report-cover-symbol">{getZodiacSymbol(report.zodiacA?.sun)}</Text>
          <Text className="report-cover-zodiac">{String(report.zodiacA?.sun || "SUN").toUpperCase()}</Text>
          <Text className="report-cover-name">{report.personA?.name || "我"}</Text>
        </View>
        {isLove ? (
          <>
            <Text className="report-cover-heart">❤</Text>
            <View className="report-cover-person">
              <Text className="report-cover-symbol">{getZodiacSymbol(report.zodiacB?.sun)}</Text>
              <Text className="report-cover-zodiac">{String(report.zodiacB?.sun || "MOON").toUpperCase()}</Text>
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
