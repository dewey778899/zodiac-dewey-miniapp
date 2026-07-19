import type { ModelType, ThemeType } from "../types/report";

export const API_BASE = "https://zodiac.xiaodengge.top";
export const WEB_SHARE_BASE = "https://zodiac.xiaodengge.top";

export const REPORT_THEMES: Array<{ key: ThemeType; label: string; subtitle: string; icon: string }> = [
  { key: "love", label: "关系洞察", subtitle: "双人互动", icon: "01" },
  { key: "career", label: "职业状态", subtitle: "工作节奏", icon: "02" },
  { key: "wealth", label: "生活节奏", subtitle: "资源安排", icon: "03" }
];

export const MODEL_COPY: Record<ModelType, { label: string; badge: string }> = {
  deepseek: { label: "基础版", badge: "快速分析" },
  claude: { label: "扩展版", badge: "支付后查看当前主题扩展内容" }
};

export const DEFAULT_PERSON = {
  name: "",
  gender: "female" as const,
  birthDate: "1990-06-15",
  birthTime: "12:30",
  birthPlace: "",
  birthProvince: "",
  birthCity: "",
  birthDistrict: "",
  birthLatitude: null,
  birthLongitude: null,
  birthTimezone: "Asia/Shanghai"
};
