import { request } from "./request";
import type {
  CompatibilityRequestPayload,
  CompatibilityResponse,
  PaymentOrderResponse,
  ReferralProfile,
  ReferralRecordsResponse,
  ReferralSummary
} from "../types/report";

export function generateCompatibility(payload: CompatibilityRequestPayload) {
  return request<CompatibilityResponse>("/api/compatibility", {
    method: "POST",
    data: payload
  });
}

export function fetchReport(reportUid: string) {
  return request<CompatibilityResponse>(`/api/compatibility/report/${encodeURIComponent(reportUid)}`);
}

export function prepareWechatJsapi(data: Record<string, unknown>) {
  return request<PaymentOrderResponse>("/api/pay/wechat/jsapi-prepare", {
    method: "POST",
    data
  });
}

export function fetchOrder(outTradeNo: string) {
  return request<PaymentOrderResponse>(`/api/pay/orders/${encodeURIComponent(outTradeNo)}`);
}

export function devMarkOrderPaid(outTradeNo: string) {
  return request<PaymentOrderResponse>(`/api/pay/dev/mark-paid/${encodeURIComponent(outTradeNo)}`, {
    method: "POST"
  });
}

export function bindReferralUser(data: Record<string, unknown>) {
  return request<ReferralProfile>("/api/referral/bind", {
    method: "POST",
    data
  });
}

export function bindReferralUserByWechatPhone(data: Record<string, unknown>) {
  return request<ReferralProfile>("/api/referral/bind/wechat-phone", {
    method: "POST",
    data
  });
}

export function recordReferralVisit(data: Record<string, unknown>) {
  return request<Record<string, unknown>>("/api/referral/visit", {
    method: "POST",
    data
  });
}

export function fetchReferralProfile(params: { phone?: string; platform?: string; openid?: string }) {
  const query = new URLSearchParams();
  if (params.phone) query.set("phone", params.phone);
  if (params.platform) query.set("platform", params.platform);
  if (params.openid) query.set("openid", params.openid);
  return request<ReferralProfile>(`/api/referral/me?${query.toString()}`);
}

export function fetchReferralSummary(phone: string) {
  return request<ReferralSummary>(`/api/referral/summary?phone=${encodeURIComponent(phone)}`);
}

export function fetchReferralRecords(phone: string) {
  return request<ReferralRecordsResponse>(`/api/referral/records?phone=${encodeURIComponent(phone)}`);
}

export function createWithdrawal(data: Record<string, unknown>) {
  return request<Record<string, unknown>>("/api/referral/withdrawals", {
    method: "POST",
    data
  });
}
