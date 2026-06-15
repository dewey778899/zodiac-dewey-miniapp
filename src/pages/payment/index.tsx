import { useMemo, useState } from "react";
import Taro, { useRouter } from "@tarojs/taro";
import { Input, Text, View } from "@tarojs/components";
import { bindReferralUser, fetchOrder, prepareWechatJsapi } from "../../api/compatibility";
import { useReportStore } from "../../store/useReportStore";
import type { PaymentOrderResponse, ThemeType } from "../../types/report";
import "./index.scss";

type WechatPayPayload = {
  appId?: string;
  timeStamp?: string;
  nonceStr?: string;
  package?: string;
  signType?: string;
  paySign?: string;
};

function ensureDeviceToken() {
  const key = "zodiac_device_token";
  const existing = Taro.getStorageSync<string>(key);
  if (existing) return existing;
  const token = `mini-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  Taro.setStorageSync(key, token);
  return token;
}

function getThemeLabel(theme: ThemeType) {
  if (theme === "career") return "事业";
  if (theme === "wealth") return "财运";
  return "爱情";
}

export default function PaymentPage() {
  const router = useRouter();
  const theme = ((router.params.theme as ThemeType) || "love") as ThemeType;
  const { referralProfile, pendingInviteCode, setReferralProfile, setAccessToken, setThemeModel } = useReportStore();
  const [phone, setPhone] = useState(referralProfile?.phone || "");
  const [status, setStatus] = useState("支付前先绑定手机号。好友通过你的邀请码付费后，你会获得返现。");
  const [latestOutTradeNo, setLatestOutTradeNo] = useState("");
  const [loading, setLoading] = useState(false);

  const clientContext = useMemo(
    () => ({
      deviceToken: ensureDeviceToken(),
      userAgent: `${Taro.getEnv()} miniapp`,
      source: `miniapp-${theme}`,
      insideWechat: Taro.getEnv() === Taro.ENV_TYPE.WEAPP,
      mobile: true
    }),
    [theme]
  );

  const requestWechatPay = async (payload: WechatPayPayload) => {
    if (!payload.timeStamp || !payload.nonceStr || !payload.package || !payload.paySign) {
      throw new Error("支付参数不完整，暂时无法拉起微信支付");
    }
    await Taro.requestPayment({
      timeStamp: payload.timeStamp,
      nonceStr: payload.nonceStr,
      package: payload.package,
      signType: (payload.signType as "RSA" | "MD5" | "HMAC-SHA256") || "RSA",
      paySign: payload.paySign
    });
  };

  const ensureBoundPhone = async () => {
    if (!phone.trim()) {
      throw new Error("请先填写手机号");
    }
    const profile = await bindReferralUser({
      phone: phone.trim(),
      inviteCode: pendingInviteCode || undefined,
      deviceToken: ensureDeviceToken(),
      source: `miniapp-pay-${theme}`
    });
    setReferralProfile(profile);
    return profile.phone;
  };

  const handleWechatPay = async () => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      setStatus("请在微信小程序环境里测试微信支付。");
      return;
    }

    setLoading(true);
    try {
      const boundPhone = await ensureBoundPhone();
      const loginRes = await Taro.login();
      if (!loginRes.code) {
        throw new Error("微信登录失败，未获取到登录 code");
      }

      const response = await prepareWechatJsapi({
        code: loginRes.code,
        order: {
          channel: "wechat",
          scene: "wechat_jsapi",
          reportType: theme,
          amountFen: 2990,
          subject: "深度解析服务",
          returnUrl: "https://zodiac.njjyin.com",
          clientContext,
          phone: boundPhone
        }
      });

      setLatestOutTradeNo(response.outTradeNo || "");
      setStatus("订单已创建，正在拉起微信支付...");
      await requestWechatPay((response.payPayload || {}) as WechatPayPayload);

      const latest: PaymentOrderResponse = response.outTradeNo ? await fetchOrder(response.outTradeNo) : response;
      const token = latest.token || latest.accessToken || response.token || response.accessToken || "";
      if (token) {
        setAccessToken(theme, token);
        setThemeModel(theme, "claude");
      }
      Taro.showToast({ title: "支付成功", icon: "success" });
      setTimeout(() => Taro.navigateBack({ delta: 1 }), 500);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "支付发起失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="page-shell">
      <View className="card payment-card">
        <Text className="payment-tag">WECHAT PAY</Text>
        <Text className="section-title">深度解析支付</Text>
        <Text className="section-subtitle">当前主题：{getThemeLabel(theme)} · 金额：29.9 元。支付成功后自动解锁当前主题一次深度解析。</Text>

        <View className="payment-price-block">
          <Text className="payment-price-symbol">￥</Text>
          <Text className="payment-price-value">29.9</Text>
        </View>

        <View className="payment-grid">
          <View className="payment-item">
            <Text className="payment-item-title">微信支付体验</Text>
            <Text className="payment-item-subtitle">支付按钮使用微信绿色，但整体底色仍保持当前星盘产品的深色科技感。</Text>
          </View>
          <View className="payment-item">
            <Text className="payment-item-title">解锁范围</Text>
            <Text className="payment-item-subtitle">本次支付只解锁当前主题一次深度解析，不影响其他主题默认免费状态。</Text>
          </View>
        </View>

        <View className="wallet-field">
          <Text className="wallet-label">手机号</Text>
          <Input
            className="wallet-input"
            value={phone}
            placeholder="支付前请先绑定手机号"
            onInput={(event) => setPhone(event.detail.value)}
          />
        </View>

        <View className="payment-actions">
          <View className="button-primary payment-wechat-button" onClick={loading ? undefined : handleWechatPay}>
            {loading ? "正在拉起支付..." : "立即微信支付"}
          </View>
          <View className="button-secondary" onClick={() => Taro.navigateTo({ url: "/pages/wallet/index" })}>
            查看邀请返现
          </View>
        </View>

        {latestOutTradeNo ? <Text className="payment-meta">最近订单号：{latestOutTradeNo}</Text> : null}
        <Text className="payment-status">{status}</Text>
      </View>
    </View>
  );
}
