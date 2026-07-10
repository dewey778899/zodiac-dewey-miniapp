import Taro from "@tarojs/taro";

const DEVICE_TOKEN_KEY = "zodiac_device_token";
const PENDING_INVITE_KEY = "zodiac_pending_invite_code";
const SESSION_OPENID_KEY = "zodiac_session_openid";

export function ensureDeviceToken() {
  const existing = Taro.getStorageSync<string>(DEVICE_TOKEN_KEY);
  if (existing) return existing;
  const token = `mini-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  Taro.setStorageSync(DEVICE_TOKEN_KEY, token);
  return token;
}

export function detectPlatform() {
  return Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? "WECHAT" : "WECHAT";
}

export function setPendingInviteCode(inviteCode: string) {
  if (!inviteCode) return;
  Taro.setStorageSync(PENDING_INVITE_KEY, inviteCode);
}

export function getPendingInviteCode() {
  return Taro.getStorageSync<string>(PENDING_INVITE_KEY) || "";
}

export function clearPendingInviteCode() {
  Taro.removeStorageSync(PENDING_INVITE_KEY);
}

export function setSessionOpenid(openid: string) {
  if (!openid) return;
  Taro.setStorageSync(SESSION_OPENID_KEY, openid);
}

export function getSessionOpenid() {
  return Taro.getStorageSync<string>(SESSION_OPENID_KEY) || "";
}
