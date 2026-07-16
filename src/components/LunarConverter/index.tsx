import { Picker, Text, View } from "@tarojs/components";
import { useMemo, useState } from "react";
import {
  formatLunar,
  formatSolarWithWeekday,
  getLunarDayOptions,
  getLunarMonthOptions,
  lunarToSolar,
  parseLunarMonthValue,
  solarToLunar
} from "../../utils/lunar";
import "./index.scss";

type ConverterMode = "solarToLunar" | "lunarToSolar";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const yearOptions = Array.from({ length: 201 }, (_, index) => 1900 + index);
const solarMonthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const solarDayOptions = Array.from({ length: 31 }, (_, index) => index + 1);

export function LunarConverter({ visible, onClose }: Props) {
  const today = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<ConverterMode>("solarToLunar");
  const [solarYear, setSolarYear] = useState(today.getFullYear());
  const [solarMonth, setSolarMonth] = useState(today.getMonth() + 1);
  const [solarDay, setSolarDay] = useState(today.getDate());
  const [lunarYear, setLunarYear] = useState(today.getFullYear());
  const [lunarMonthValue, setLunarMonthValue] = useState("1");
  const [lunarDay, setLunarDay] = useState(1);
  const [result, setResult] = useState<{ main: string; sub: string } | null>(null);

  const lunarMonthOptions = useMemo(() => getLunarMonthOptions(lunarYear), [lunarYear]);
  const lunarDayOptions = useMemo(() => getLunarDayOptions(lunarYear, lunarMonthValue), [lunarYear, lunarMonthValue]);

  const handleConvert = () => {
    if (mode === "solarToLunar") {
      const lunar = solarToLunar(solarYear, solarMonth, solarDay);
      setResult({
        main: formatLunar(lunar),
        sub: formatSolarWithWeekday({ year: solarYear, month: solarMonth, day: solarDay })
      });
      return;
    }

    const parsed = parseLunarMonthValue(lunarMonthValue);
    const solar = lunarToSolar(lunarYear, parsed.month, lunarDay, parsed.isLeap);
    const monthLabel = lunarMonthOptions.find((item) => item.value === lunarMonthValue)?.label || "";
    const dayLabel = lunarDayOptions.find((item) => item.value === lunarDay)?.label || "";
    const lunarLabel = `${parsed.isLeap ? "闰" : ""}${monthLabel}${dayLabel}`;
    setResult({
      main: formatSolarWithWeekday(solar),
      sub: `传统日期 ${lunarYear}年 ${lunarLabel}`
    });
  };

  if (!visible) return null;

  return (
    <View className="lunar-modal-mask">
      <View className="lunar-modal-card">
        <View className="lunar-modal-head">
          <Text className="lunar-modal-tag">DATE CONVERTER</Text>
          <Text className="lunar-modal-title">日期转换</Text>
          <Text className="lunar-modal-close" onClick={onClose}>
            ×
          </Text>
        </View>

        <View className="lunar-tabs">
          <View className={`lunar-tab ${mode === "solarToLunar" ? "active" : ""}`} onClick={() => setMode("solarToLunar")}>
            标准转传统
          </View>
          <View className={`lunar-tab ${mode === "lunarToSolar" ? "active" : ""}`} onClick={() => setMode("lunarToSolar")}>
            传统转标准
          </View>
        </View>

        {mode === "solarToLunar" ? (
          <View className="lunar-picker-group">
            <Picker
              mode="selector"
              range={yearOptions}
              value={Math.max(yearOptions.indexOf(solarYear), 0)}
              onChange={(event) => setSolarYear(yearOptions[Number(event.detail.value)] || today.getFullYear())}
            >
              <View className="lunar-picker-item">{solarYear}年</View>
            </Picker>
            <Picker
              mode="selector"
              range={solarMonthOptions}
              value={Math.max(solarMonthOptions.indexOf(solarMonth), 0)}
              onChange={(event) => setSolarMonth(solarMonthOptions[Number(event.detail.value)] || 1)}
            >
              <View className="lunar-picker-item">{solarMonth}月</View>
            </Picker>
            <Picker
              mode="selector"
              range={solarDayOptions}
              value={Math.max(solarDayOptions.indexOf(solarDay), 0)}
              onChange={(event) => setSolarDay(solarDayOptions[Number(event.detail.value)] || 1)}
            >
              <View className="lunar-picker-item">{solarDay}日</View>
            </Picker>
          </View>
        ) : (
          <View className="lunar-picker-group">
            <Picker
              mode="selector"
              range={yearOptions}
              value={Math.max(yearOptions.indexOf(lunarYear), 0)}
              onChange={(event) => {
                const nextYear = yearOptions[Number(event.detail.value)] || today.getFullYear();
                setLunarYear(nextYear);
                const nextMonthOptions = getLunarMonthOptions(nextYear);
                if (!nextMonthOptions.some((item) => item.value === lunarMonthValue)) {
                  setLunarMonthValue(nextMonthOptions[0]?.value || "1");
                }
              }}
            >
              <View className="lunar-picker-item">{lunarYear}年</View>
            </Picker>
            <Picker
              mode="selector"
              range={lunarMonthOptions.map((item) => item.label)}
              value={Math.max(lunarMonthOptions.findIndex((item) => item.value === lunarMonthValue), 0)}
              onChange={(event) => {
                const nextValue = lunarMonthOptions[Number(event.detail.value)]?.value || "1";
                setLunarMonthValue(nextValue);
                const nextDays = getLunarDayOptions(lunarYear, nextValue);
                if (!nextDays.some((item) => item.value === lunarDay)) {
                  setLunarDay(nextDays[0]?.value || 1);
                }
              }}
            >
              <View className="lunar-picker-item">
                {lunarMonthOptions.find((item) => item.value === lunarMonthValue)?.label || "正月"}
              </View>
            </Picker>
            <Picker
              mode="selector"
              range={lunarDayOptions.map((item) => item.label)}
              value={Math.max(lunarDayOptions.findIndex((item) => item.value === lunarDay), 0)}
              onChange={(event) => setLunarDay(lunarDayOptions[Number(event.detail.value)]?.value || 1)}
            >
              <View className="lunar-picker-item">
                {lunarDayOptions.find((item) => item.value === lunarDay)?.label || "初一"}
              </View>
            </Picker>
          </View>
        )}

        <View className="button-primary lunar-convert-btn" onClick={handleConvert}>
          立即转换
        </View>

        {result ? (
          <View className="lunar-result">
            <Text className="lunar-result-main">{result.main}</Text>
            <Text className="lunar-result-sub">{result.sub}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
