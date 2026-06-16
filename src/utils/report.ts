import type { CompatibilityResponse, PersonFormState, ThemeType } from "../types/report";
import { WEB_SHARE_BASE, ZODIAC_SYMBOLS } from "./constants";

export function getZodiacSymbol(value?: string) {
  const normalized = String(value || "").trim();
  if (!normalized) return "\u2726";
  return ZODIAC_SYMBOLS[normalized] || ZODIAC_SYMBOLS[normalized.toUpperCase()] || "\u2726";
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
  if (inviteCode) url.searchParams.set("invite", inviteCode);
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
  if (!personA.name.trim()) return "\u8bf7\u5148\u586b\u5199\u4f60\u7684\u540d\u5b57";
  if (!personA.birthDate) return "\u8bf7\u5148\u9009\u62e9\u4f60\u7684\u751f\u65e5";
  if (!personA.birthProvince || !personA.birthCity || !personA.birthDistrict) {
    return "\u8bf7\u5b8c\u6574\u9009\u62e9\u4f60\u7684\u51fa\u751f\u5730";
  }

  if (theme === "love") {
    if (!personB || !personB.name.trim()) return "\u8bf7\u5148\u586b\u5199 TA \u7684\u540d\u5b57";
    if (!personB.birthDate) return "\u8bf7\u5148\u9009\u62e9 TA \u7684\u751f\u65e5";
    if (!personB.birthProvince || !personB.birthCity || !personB.birthDistrict) {
      return "\u8bf7\u5b8c\u6574\u9009\u62e9 TA \u7684\u51fa\u751f\u5730";
    }
    if ((personA.gender || "").toLowerCase() === (personB.gender || "").toLowerCase()) {
      return "\u7231\u60c5\u5408\u76d8\u6682\u4e0d\u652f\u6301\u540c\u4e00\u6027\u522b\u7ec4\u5408";
    }
  }

  return "";
}

export function getReportTitle(reportType: ThemeType) {
  if (reportType === "love") return "\u7231\u60c5\u5408\u76d8";
  if (reportType === "career") return "\u4e8b\u4e1a\u62a5\u544a";
  return "\u8d22\u8fd0\u62a5\u544a";
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
    report.relationshipType || "\u661f\u76d8\u6d1e\u5bdf",
    report.tagline || "\u6253\u5f00\u67e5\u770b\u5b8c\u6574\u62a5\u544a",
    `COLLECTOR CODE ${report.reportUid}`,
    buildWebShareUrl(report.reportUid, inviteCode)
  ].join("\n");
}
