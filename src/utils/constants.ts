import type { ModelType, ThemeType } from "../types/report";

export const API_BASE = "https://zodiac.xiaodengge.top";
export const WEB_SHARE_BASE = "https://zodiac.xiaodengge.top";

export const REPORT_THEMES: Array<{ key: ThemeType; label: string; subtitle: string; icon: string }> = [
  { key: "love", label: "\u7231\u60c5", subtitle: "\u53cc\u4eba\u5408\u76d8\u5173\u7cfb\u6d1e\u5bdf", icon: "\u2661" },
  { key: "career", label: "\u4e8b\u4e1a", subtitle: "\u4e2a\u4eba\u4e8b\u4e1a\u8d8b\u52bf\u89e3\u6790", icon: "\u2726" },
  { key: "wealth", label: "\u8d22\u8fd0", subtitle: "\u4e2a\u4eba\u8d22\u5bcc\u8282\u594f\u63d0\u9192", icon: "\u25cc" }
];

export const MODEL_COPY: Record<ModelType, { label: string; badge: string }> = {
  deepseek: { label: "\u514d\u8d39\u7248", badge: "\u57fa\u7840\u89e3\u6790" },
  claude: { label: "\u6df1\u5ea6\u89e3\u6790", badge: "\u00a529.9 \u5f53\u524d\u4e3b\u9898\u4e00\u6b21" }
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

export const ZODIAC_SYMBOLS: Record<string, string> = {
  ARIES: "\u2648",
  TAURUS: "\u2649",
  GEMINI: "\u264a",
  CANCER: "\u264b",
  LEO: "\u264c",
  VIRGO: "\u264d",
  LIBRA: "\u264e",
  SCORPIO: "\u264f",
  SAGITTARIUS: "\u2650",
  CAPRICORN: "\u2651",
  AQUARIUS: "\u2652",
  PISCES: "\u2653",
  "\u767d\u7f8a\u5ea7": "\u2648",
  "\u91d1\u725b\u5ea7": "\u2649",
  "\u53cc\u5b50\u5ea7": "\u264a",
  "\u5de8\u87f9\u5ea7": "\u264b",
  "\u72ee\u5b50\u5ea7": "\u264c",
  "\u5904\u5973\u5ea7": "\u264d",
  "\u5929\u79e4\u5ea7": "\u264e",
  "\u5929\u874e\u5ea7": "\u264f",
  "\u5c04\u624b\u5ea7": "\u2650",
  "\u6469\u7faf\u5ea7": "\u2651",
  "\u6c34\u74f6\u5ea7": "\u2652",
  "\u53cc\u9c7c\u5ea7": "\u2653"
};
