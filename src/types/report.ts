export type ThemeType = "love" | "career" | "wealth";
export type ModelType = "deepseek" | "claude";

export interface PersonFormState {
  name: string;
  gender: "male" | "female";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  birthProvince?: string;
  birthCity?: string;
  birthDistrict?: string;
  birthLatitude?: number | null;
  birthLongitude?: number | null;
  birthTimezone: string;
}

export interface CompatibilityRequestPayload {
  model: ModelType;
  reportType: ThemeType;
  personA: PersonFormState;
  personB?: PersonFormState;
  accessToken?: string;
}

export interface Chapter {
  title: string;
  emoji?: string;
  content: string;
}

export interface ZodiacInfo {
  sun?: string;
  moon?: string;
  rising?: string;
}

export interface PersonInfo {
  name?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
}

export interface CompatibilityResponse {
  score: number;
  relationshipType: string;
  tagline: string;
  reportType: ThemeType;
  chapters: Chapter[];
  essence: string[];
  reportUid: string;
  zodiacA?: ZodiacInfo;
  zodiacB?: ZodiacInfo;
  personA?: PersonInfo;
  personB?: PersonInfo | null;
}

export interface PaymentOrderResponse {
  outTradeNo?: string;
  channel?: string;
  scene?: string;
  status?: string;
  amountFen?: number;
  accessToken?: string;
  payPayload?: Record<string, unknown>;
  token?: string;
  codeUrl?: string;
  mwebUrl?: string;
  paid?: boolean;
  unlockStatus?: string;
  unlockSource?: string;
}

export interface ReferralProfile {
  userId: number;
  phone: string;
  inviteCode: string;
  displayName?: string;
  balanceFen: number;
  availableFen?: number;
  withdrawableFen: number;
  frozenFen: number;
  withdrawnFen: number;
  premiumPaidCount?: number;
  inviterEligible?: boolean;
  wechatOpenid?: string;
  unionid?: string;
}

export interface ReferralSummary extends ReferralProfile {
  inviteCount: number;
  rewardCount: number;
}

export interface ReferralRewardRecord {
  id: number;
  amountFen: number;
  status: string;
  settledAt?: string;
  withdrawalId?: number;
}

export interface ReferralBindingRecord {
  id: number;
  inviteCode: string;
  boundAt?: string;
  bindSource?: string;
}

export interface ReferralRecordsResponse {
  rewards: ReferralRewardRecord[];
  bindings: ReferralBindingRecord[];
  withdrawals?: Array<{
    id: number;
    amountFen: number;
    status: string;
    remark?: string;
    createdAt?: string;
  }>;
}
