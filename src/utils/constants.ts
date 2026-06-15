import type { ModelType, ThemeType } from "../types/report";

export const API_BASE = "http://zodiac.nccyin.com";
export const WEB_SHARE_BASE = "http://zodiac.nccyin.com";

export const REPORT_THEMES: Array<{ key: ThemeType; label: string; subtitle: string; icon: string }> = [
  { key: "love", label: "爱情", subtitle: "双人合盘关系洞察", icon: "♥" },
  { key: "career", label: "事业", subtitle: "个人事业趋势解析", icon: "✦" },
  { key: "wealth", label: "财运", subtitle: "个人财富节奏提醒", icon: "✧" }
];

export const MODEL_COPY: Record<ModelType, { label: string; badge: string }> = {
  deepseek: { label: "免费版", badge: "基础解析" },
  claude: { label: "深度解析", badge: "¥29.9 当前主题一次" }
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
  ARIES: "♈",
  TAURUS: "♉",
  GEMINI: "♊",
  CANCER: "♋",
  LEO: "♌",
  VIRGO: "♍",
  LIBRA: "♎",
  SCORPIO: "♏",
  SAGITTARIUS: "♐",
  CAPRICORN: "♑",
  AQUARIUS: "♒",
  PISCES: "♓",
  白羊座: "♈",
  金牛座: "♉",
  双子座: "♊",
  巨蟹座: "♋",
  狮子座: "♌",
  处女座: "♍",
  天秤座: "♎",
  天蝎座: "♏",
  射手座: "♐",
  摩羯座: "♑",
  水瓶座: "♒",
  双鱼座: "♓"
};
