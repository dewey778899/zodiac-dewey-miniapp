import type { CompatibilityResponse, PersonFormState, ThemeType } from "../types/report";
import { WEB_SHARE_BASE, ZODIAC_SYMBOLS } from "./constants";

export function getZodiacSymbol(value?: string) {
  const normalized = String(value || "").trim();
  if (!normalized) return "✦";
  return ZODIAC_SYMBOLS[normalized] || ZODIAC_SYMBOLS[normalized.toUpperCase()] || "✦";
}

export function buildSharePath(reportUid: string, inviteCode?: string) {
  const params = new URLSearchParams({ uid: reportUid });
  if (inviteCode) params.set("invite", inviteCode);
  return `/pages/report/index?${params.toString()}`;
}

export function buildWalletPath(inviteCode?: string) {
  return inviteCode ? `/pages/wallet/index?invite=${encodeURIComponent(inviteCode)}` : "/pages/wallet/index";
}

export function buildWebShareUrl(reportUid: string, inviteCode?: string) {
  const url = new URL(`${WEB_SHARE_BASE}/`);
  url.searchParams.set("report", reportUid);
  if (inviteCode) {
    url.searchParams.set("invite", inviteCode);
  }
  return url.toString();
}

export function buildPersonPayload(person: PersonFormState) {
  const birthPlace =
    person.birthPlace || [person.birthProvince, person.birthCity, person.birthDistrict].filter(Boolean).join(" ");

  return {
    ...person,
    birthPlace,
    birthTime: person.birthTime || "12:30",
    birthTimezone: person.birthTimezone || "Asia/Shanghai"
  };
}

export function validateThemeForm(theme: ThemeType, personA: PersonFormState, personB?: PersonFormState) {
  if (!personA.name.trim()) return "请先填写你的名字";
  if (!personA.birthDate) return "请先选择你的生日";
  if (!personA.birthProvince || !personA.birthCity || !personA.birthDistrict) {
    return "请完整选择你的出生地";
  }

  if (theme === "love") {
    if (!personB || !personB.name.trim()) return "请先填写 TA 的名字";
    if (!personB.birthDate) return "请先选择 TA 的生日";
    if (!personB.birthProvince || !personB.birthCity || !personB.birthDistrict) {
      return "请完整选择 TA 的出生地";
    }
    if ((personA.gender || "").toLowerCase() === (personB.gender || "").toLowerCase()) {
      return "爱情合盘暂不支持同一性别组合";
    }
  }

  return "";
}

export function getReportTitle(reportType: ThemeType) {
  if (reportType === "love") return "爱情合盘";
  if (reportType === "career") return "事业报告";
  return "财运报告";
}

export function getReportDateText() {
  return new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

export function buildSharePosterText(report: CompatibilityResponse, inviteCode?: string) {
  return [
    getReportTitle(report.reportType),
    report.relationshipType || "星盘洞察",
    report.tagline || "打开查看完整报告",
    `COLLECTOR CODE ${report.reportUid}`,
    buildWebShareUrl(report.reportUid, inviteCode)
  ].join("\n");
}
