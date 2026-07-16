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
  { min: 0, label: "\u51c6\u5907\u5f00\u59cb" },
  { min: 8, label: "\u6b63\u5728\u6821\u5bf9\u57fa\u672c\u4fe1\u606f" },
  { min: 28, label: "\u6b63\u5728\u6574\u7406\u4e2a\u4eba\u7ef4\u5ea6" },
  { min: 52, label: "\u6b63\u5728\u5206\u6790\u4e92\u52a8\u7ed3\u6784" },
  { min: 76, label: "\u6b63\u5728\u6574\u7406\u5185\u5bb9\u7ec6\u8282" },
  { min: 96, label: "\u5373\u5c06\u5b8c\u6210" }
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
  const [progressLabel, setProgressLabel] = useState("\u51c6\u5907\u5f00\u59cb");
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
      if (timerRef.current) clearTimeout(timerRef.current);
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
    setProgressLabel("\u51c6\u5907\u5f00\u59cb");

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
    setProgressLabel("\u6b63\u5728\u5b8c\u6210\u5185\u5bb9");
    for (const value of [98, 100]) {
      setProgress(value);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    setProgressLabel("\u5df2\u5b8c\u6210");
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
      setProgressLabel("\u51c6\u5907\u5f00\u59cb");
      setError(submitError instanceof Error ? submitError.message : "\u5185\u5bb9\u751f\u6210\u672a\u5b8c\u6210\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5");
    } finally {
      setSubmitting(false);
    }
  };

  const renderActionLabel = () => {
    if (submitting) return "\u6b63\u5728\u751f\u6210\u5185\u5bb9...";
    if (activeModel === "claude") return "\u751f\u6210\u6269\u5c55\u5185\u5bb9";
    if (activeTheme === "love") return "\u751f\u6210\u5173\u7cfb\u5185\u5bb9";
    return `\u751f\u6210${currentTheme.label}\u5185\u5bb9`;
  };

  const updateCurrentPerson = (side: "a" | "b", patch: Partial<PersonFormState>) => {
    clearError();
    updatePerson(activeTheme, side, patch);
  };

  return (
    <View className="page-shell">
      <View className="card home-hero">
        <Text className="hero-tag">
          {activeTheme === "love" ? "RELATIONSHIP INSIGHT" : activeTheme === "career" ? "CAREER INSIGHT" : "LIFE RHYTHM"}
        </Text>
        <Text className="section-title">{"\u5c0f\u767b\u54e5\u5185\u5bb9\u52a9\u624b"}</Text>
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
          {"\u8fd4\u73b0\u8d26\u6237"}
        </View>
      </View>

      <View className="home-tip">
        {"\u597d\u53cb\u901a\u8fc7\u4f60\u7684\u5206\u4eab\u8fdb\u5165\u5e76\u5b8c\u6210\u6269\u5c55\u5185\u5bb9\u4ed8\u8d39\u540e\uff0c\u8fd4\u73b0\u4f1a\u81ea\u52a8\u8fdb\u5165\u4f60\u7684\u7edf\u4e00\u8d26\u6237\u3002"}
      </View>

      <PersonForm title="\u6211\u7684\u4fe1\u606f" value={personA} onChange={(patch) => updateCurrentPerson("a", patch)} />
      {activeTheme === "love" ? (
        <PersonForm title="TA \u7684\u4fe1\u606f" value={personB} onChange={(patch) => updateCurrentPerson("b", patch)} />
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
            <Text className="premium-modal-title">{"\u6269\u5c55\u5185\u5bb9"}</Text>
            <Text className="premium-modal-copy">
              {"\u652f\u4ed8 0.01 \u5143\u540e\u67e5\u770b\u5f53\u524d\u4e3b\u9898\u4e00\u6b21\u6269\u5c55\u5185\u5bb9\u3002\u652f\u4ed8\u6210\u529f\u540e\u56de\u5230\u8868\u5355\u9875\uff0c\u518d\u70b9\u51fb\u751f\u6210\u6269\u5c55\u5185\u5bb9\u3002"}
            </Text>
            <View className="premium-entry-group">
              <View className="premium-entry-card" onClick={() => Taro.navigateTo({ url: `/pages/payment/index?theme=${activeTheme}` })}>
                <Text className="premium-entry-title">{"\u5fae\u4fe1\u652f\u4ed8 0.01 \u5143"}</Text>
                <Text className="premium-entry-subtitle">
                  {"\u8fdb\u5165\u652f\u4ed8\u9875\u540e\u5b8c\u6210\u5fae\u4fe1\u652f\u4ed8\u3002\u652f\u4ed8\u6210\u529f\u540e\uff0c\u5f53\u524d\u4e3b\u9898\u4f1a\u7acb\u5373\u5f00\u901a\u4e00\u6b21\u6269\u5c55\u5185\u5bb9\u3002"}
                </Text>
              </View>
            </View>
            <View className="premium-modal-actions">
              <View className="button-secondary premium-modal-btn ghost" onClick={() => setShowPremiumModal(false)}>
                {"\u5173\u95ed"}
              </View>
            </View>
          </View>
        </View>
      ) : null}

    </View>
  );
}
