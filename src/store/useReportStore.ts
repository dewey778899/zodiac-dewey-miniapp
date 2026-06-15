import { create } from "zustand";
import type {
  CompatibilityResponse,
  ModelType,
  PersonFormState,
  ReferralProfile,
  ThemeType
} from "../types/report";
import { DEFAULT_PERSON } from "../utils/constants";

type ThemePeople = {
  a: PersonFormState;
  b: PersonFormState;
};

interface ReportStore {
  activeTheme: ThemeType;
  themeModels: Record<ThemeType, ModelType>;
  accessTokens: Record<ThemeType, string>;
  latestReport: CompatibilityResponse | null;
  referralProfile: ReferralProfile | null;
  pendingInviteCode: string;
  stateByTheme: Record<ThemeType, ThemePeople>;
  setActiveTheme: (theme: ThemeType) => void;
  setThemeModel: (theme: ThemeType, model: ModelType) => void;
  setAccessToken: (theme: ThemeType, token: string) => void;
  clearAccessToken: (theme: ThemeType) => void;
  setLatestReport: (report: CompatibilityResponse | null) => void;
  setReferralProfile: (profile: ReferralProfile | null) => void;
  setPendingInviteCode: (inviteCode: string) => void;
  updatePerson: (theme: ThemeType, side: "a" | "b", patch: Partial<PersonFormState>) => void;
}

function clonePerson(): PersonFormState {
  return { ...DEFAULT_PERSON };
}

export const useReportStore = create<ReportStore>((set) => ({
  activeTheme: "love",
  themeModels: {
    love: "deepseek",
    career: "deepseek",
    wealth: "deepseek"
  },
  accessTokens: {
    love: "",
    career: "",
    wealth: ""
  },
  latestReport: null,
  referralProfile: null,
  pendingInviteCode: "",
  stateByTheme: {
    love: { a: clonePerson(), b: clonePerson() },
    career: { a: clonePerson(), b: clonePerson() },
    wealth: { a: clonePerson(), b: clonePerson() }
  },
  setActiveTheme: (activeTheme) => set({ activeTheme }),
  setThemeModel: (theme, model) =>
    set((state) => ({
      themeModels: {
        ...state.themeModels,
        [theme]: model
      }
    })),
  setAccessToken: (theme, token) =>
    set((state) => ({
      accessTokens: {
        ...state.accessTokens,
        [theme]: token
      }
    })),
  clearAccessToken: (theme) =>
    set((state) => ({
      accessTokens: {
        ...state.accessTokens,
        [theme]: ""
      }
    })),
  setLatestReport: (latestReport) => set({ latestReport }),
  setReferralProfile: (referralProfile) => set({ referralProfile }),
  setPendingInviteCode: (pendingInviteCode) => set({ pendingInviteCode }),
  updatePerson: (theme, side, patch) =>
    set((state) => ({
      stateByTheme: {
        ...state.stateByTheme,
        [theme]: {
          ...state.stateByTheme[theme],
          [side]: {
            ...state.stateByTheme[theme][side],
            ...patch
          }
        }
      }
    }))
}));
