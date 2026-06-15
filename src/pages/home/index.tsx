import { useEffect, useMemo, useRef, useState } from "react";
import Taro from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import { generateCompatibility } from "../../api/compatibility";
import { ModelSwitch } from "../../components/ModelSwitch";
import { PersonForm } from "../../components/PersonForm";
import { ThemeTabs } from "../../components/ThemeTabs";
import { useReportStore } from "../../store/useReportStore";
import type { PersonFormState, ThemeType } from "../../types/report";
import { REPORT_THEMES } from "../../utils/constants";
import { buildPersonPayload, buildSharePath, validateThemeForm } from "../../utils/report";
import "./index.scss";

const progressStages = [
  { min: 0, label: "准备开始" },
  { min: 8, label: "正在校对出生信息" },
  { min: 28, label: "正在计算星盘位置" },
  { min: 52, label: "正在分析关系结构" },
  { min: 76, label: "正在整理结果细节" },
  { min: 96, label: "即将完成" }
];

export default function HomePage() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    activeTheme,
    themeModels,
    accessTokens,
    stateByTheme,
    setActiveTheme,
    setThemeModel,
    setLatestReport,
    clearAccessToken,
    updatePerson
  } = useReportStore();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("准备开始");
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const currentTheme = useMemo(
    () => REPORT_THEMES.find((item) => item.key === activeTheme) ?? REPORT_THEMES[0],
    [activeTheme]
  );
  const activeModel = themeModels[activeTheme];
  const themeAccessToken = accessTokens[activeTheme];
  const personA = stateByTheme[activeTheme].a;
  const personB = stateByTheme[activeTheme].b;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const clearError = () => setError("");

  const updateProgressLabel = (value: number) => {
    const stage = [...progressStages].reverse().find((item) => value >= item.min) ?? progressStages[0];
    setProgressLabel(stage.label);
  };

  const stopProgress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startProgress = () => {
    stopProgress();
    setProgress(3);
    setProgressLabel("准备开始");

    const tick = (value: number) => {
      const cap = 96;
      const next =
        value < 20 ? value + 7 : value < 45 ? value + 5 : value < 70 ? value + 3 : value < 88 ? value + 2 : value + 1;
      const clamped = Math.min(next, cap);
      setProgress(clamped);
      updateProgressLabel(clamped);
      if (clamped < cap) {
        timerRef.current = setTimeout(() => tick(clamped), clamped < 70 ? 320 : 460);
      }
    };

    timerRef.current = setTimeout(() => tick(3), 180);
  };

  const finishProgress = async () => {
    stopProgress();
    setProgressLabel("正在完成报告");
    for (const value of [98, 100]) {
      setProgress(value);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    setProgressLabel("已完成");
  };

  const handleThemeChange = (theme: ThemeType) => {
    clearError();
    setActiveTheme(theme);
    setShowPremiumModal(false);
  };

  const handleModelChange = () => {
    if (themeAccessToken) {
      setThemeModel(activeTheme, "claude");
      return;
    }
    setShowPremiumModal(true);
  };

  const handleSubmit = async () => {
    const message = validateThemeForm(activeTheme, personA, activeTheme === "love" ? personB : undefined);
    if (message) {
      setError(message);
      return;
    }

    if (activeModel === "claude" && !themeAccessToken) {
      setShowPremiumModal(true);
      return;
    }

    setSubmitting(true);
    clearError();
    startProgress();

    try {
      const response = await generateCompatibility({
        model: activeModel,
        reportType: activeTheme,
        personA: buildPersonPayload(personA),
        personB: activeTheme === "love" ? buildPersonPayload(personB) : undefined,
        accessToken: activeModel === "claude" ? themeAccessToken : undefined
      });

      await finishProgress();
      if (activeModel === "claude" && themeAccessToken) {
        clearAccessToken(activeTheme);
      }
      setLatestReport(response);
      Taro.navigateTo({ url: buildSharePath(response.reportUid) });
    } catch (submitError) {
      stopProgress();
      setProgress(0);
      setProgressLabel("准备开始");
      setError(submitError instanceof Error ? submitError.message : "生成报告失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  const renderActionLabel = () => {
    if (submitting) return "正在生成报告...";
    if (activeModel === "claude") return "生成深度报告";
    if (activeTheme === "love") return "生成爱情报告";
    return `生成${currentTheme.label}报告`;
  };

  const updateCurrentPerson = (side: "a" | "b", patch: Partial<PersonFormState>) => {
    clearError();
    updatePerson(activeTheme, side, patch);
  };

  return (
    <View className="page-shell">
      <View className="card home-hero">
        <Text className="hero-tag">
          {activeTheme === "love" ? "LOVE REPORT" : activeTheme === "career" ? "CAREER READING" : "WEALTH READING"}
        </Text>
        <Text className="section-title">小登哥星盘</Text>
        <Text className="section-subtitle">{currentTheme.subtitle}</Text>
      </View>

      <ThemeTabs activeTheme={activeTheme} onChange={handleThemeChange} />

      <View className="model-switch-inline">
        <ModelSwitch
          activeModel={activeModel}
          premiumUnlocked={Boolean(themeAccessToken)}
          onChange={(model) => {
            clearError();
            if (model === "deepseek") {
              setThemeModel(activeTheme, "deepseek");
              return;
            }
            handleModelChange();
          }}
        />
      </View>

      <View className="home-actions home-actions-inline">
        <View className="button-secondary" onClick={() => Taro.navigateTo({ url: "/pages/wallet/index" })}>
          邀请返现
        </View>
      </View>

      <View className="home-tip">好友通过你的分享进入并完成深度解析付费后，返现会自动进入你的统一账户。</View>

      <PersonForm title="我的信息" value={personA} onChange={(patch) => updateCurrentPerson("a", patch)} />
      {activeTheme === "love" ? (
        <PersonForm title="TA 的信息" value={personB} onChange={(patch) => updateCurrentPerson("b", patch)} />
      ) : null}

      {submitting ? (
        <View className="card mini-loading-card">
          <View className="mini-loading-head">
            <Text className="mini-loading-label">{progressLabel}</Text>
            <Text className="mini-loading-value">{progress}%</Text>
          </View>
          <View className="mini-loading-track">
            <View className="mini-loading-fill" style={{ width: `${progress}%` }} />
          </View>
        </View>
      ) : null}

      {error ? <View className="home-form-error">{error}</View> : null}

      <View className="home-actions">
        <View className="button-primary" onClick={submitting ? undefined : handleSubmit}>
          {renderActionLabel()}
        </View>
      </View>

      {showPremiumModal ? (
        <View className="premium-modal-mask" onClick={() => setShowPremiumModal(false)}>
          <View className="premium-modal-card" onClick={(event) => event.stopPropagation()}>
            <Text className="premium-modal-tag">PREMIUM</Text>
            <Text className="premium-modal-title">深度解析</Text>
            <Text className="premium-modal-copy">
              支付 29.9 元后解锁当前主题一次深度解析。支付成功后回到表单页，再手动点击生成深度报告。
            </Text>
            <View className="premium-entry-group">
              <View className="premium-entry-card" onClick={() => Taro.navigateTo({ url: `/pages/payment/index?theme=${activeTheme}` })}>
                <Text className="premium-entry-title">微信支付 29.9 元</Text>
                <Text className="premium-entry-subtitle">
                  进入支付页后先绑定手机号，再发起微信支付。支付成功后，当前主题会立刻解锁一次深度解析。
                </Text>
              </View>
            </View>
            <View className="premium-modal-actions">
              <View className="button-secondary premium-modal-btn ghost" onClick={() => setShowPremiumModal(false)}>
                关闭
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
