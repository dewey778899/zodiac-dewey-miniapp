import { View, Text } from "@tarojs/components";
import type { ThemeType } from "../../types/report";
import { REPORT_THEMES } from "../../utils/constants";
import "./index.scss";

interface Props {
  activeTheme: ThemeType;
  onChange: (theme: ThemeType) => void;
}

export function ThemeTabs({ activeTheme, onChange }: Props) {
  return (
    <View className="pill-tabs theme-tabs">
      {REPORT_THEMES.map((item) => (
        <View
          key={item.key}
          className={`pill-tab theme-tab ${item.key === activeTheme ? "active" : ""}`}
          onClick={() => onChange(item.key)}
        >
          <Text className="theme-tab-text">{item.label}</Text>
          <Text className="theme-tab-subtitle">{item.subtitle}</Text>
        </View>
      ))}
    </View>
  );
}
