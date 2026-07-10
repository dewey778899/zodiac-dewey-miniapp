import { Button, Text, View } from "@tarojs/components";
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import { useMemo, useState } from "react";
import { fetchOrder, prepareWechatJsapi } from "../../api/compatibility";
import { useReportStore } from "../../store/useReportStore";
import { ensureDeviceToken, getSessionOpenid, setSessionOpenid } from "../../utils/auth";
import "./index.scss";

type JsapiPayload = {
  appId?: string;
  timeStamp?: string;
  nonceStr?: string;
  package?: string;
  signType?: string;
  paySign?: string;
};

export default function PaymentPage() {
  const router = useRouter();
  const activeTheme = useReportStore((state) => state.activeTheme);
  const referralProfile = useReportStore((state) => state.referralProfile);
  const setAccessToken = useReportStore((state) => state.setAccessToken);
  const setThemeModel = useReportStore((state) => state.setThemeModel);

  const theme = String(router.params.theme || activeTheme || "love");
  const pendingOrderNo = String(router.params.outTradeNo || "");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusText, setStatusText] = useState("在微信内完成支付后，会自动开通当前主题的扩展内容。");
  const [lastOrderNo, setLastOrderNo] = useState(pendingOrderNo);

  const phone = useMemo(() => referralProfile?.phone || "", [referralProfile]);

  useDidShow(() => {
    if (pendingOrderNo) {
      void refreshOrder(pendingOrderNo, true);
    }
  });

  async function handlePay() {
    setSubmitting(true);
    setStatusText("正在拉起微信支付...");
    try {
      const loginRes = await Taro.login();
      if (!loginRes.code) {
        throw new Error("未获取到微信登录 code");
      }

      const response = await prepareWechatJsapi({
        code: loginRes.code,
        order: {
          channel: "wechat",
          scene: "wechat_jsapi",
          reportType: theme,
          amountFen: 1,
          subject: "小登哥扩展内容服务",
          phone: phone || undefined,
          openid: getSessionOpenid() || undefined,
          clientContext: {
            deviceToken: ensureDeviceToken(),
            source: "miniapp-payment",
            insideWechat: true,
            mobile: true
          }
        }
      });

      const payload = (response.payPayload || {}) as JsapiPayload;
      if (!payload.timeStamp || !payload.nonceStr || !payload.package || !payload.paySign) {
        throw new Error("未获取到有效的微信支付参数");
      }

      if (response.outTradeNo) {
        setLastOrderNo(response.outTradeNo);
      }

      if (response.channel === "wechat" && typeof response.payPayload?.appId === "string") {
        setSessionOpenid(getSessionOpenid() || "wechat-session");
      }

      await Taro.requestPayment({
        timeStamp: payload.timeStamp,
        nonceStr: payload.nonceStr,
        package: payload.package,
        signType: (payload.signType as "RSA") || "RSA",
        paySign: payload.paySign
      });

      setStatusText("支付已完成，正在确认订单状态...");
      await refreshOrder(response.outTradeNo || "", false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "支付未完成";
      if (String(message).toLowerCase().includes("cancel")) {
        setStatusText("你已取消支付，可以稍后再次发起。");
      } else {
        setStatusText(message || "支付启动失败");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function refreshOrder(orderNo = lastOrderNo, silent = false) {
    if (!orderNo) {
      if (!silent) {
        setStatusText("当前还没有可查询的订单。");
      }
      return;
    }

    setRefreshing(true);
    if (!silent) {
      setStatusText("正在同步支付状态...");
    }

    try {
      const latest = await fetchOrder(orderNo);
      if (latest.accessToken && latest.paid) {
        setAccessToken(theme as "love" | "career" | "wealth", latest.accessToken);
        setThemeModel(theme as "love" | "career" | "wealth", "claude");
        setStatusText("支付成功，扩展内容已开通。");
        return;
      }

      setStatusText("暂未确认支付完成，付款成功后可再次刷新。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "订单查询失败";
      setStatusText(message || "订单查询失败");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <View className="page-shell">
      <View className="card payment-card">
        <Text className="payment-tag">WECHAT PAY</Text>
        <View className="payment-price-block">
          <Text className="payment-price-symbol">¥</Text>
          <Text className="payment-price-value">0.01</Text>
        </View>

        <View className="payment-grid">
          <View className="payment-item">
            <Text className="payment-item-title">本次开通内容</Text>
            <Text className="payment-item-subtitle">
              开通当前主题一次扩展内容，并下发对应的访问凭证，供后续内容页读取。
            </Text>
          </View>
          <View className="payment-item">
            <Text className="payment-item-title">支付方式</Text>
            <Text className="payment-item-subtitle">
              微信小程序支付。支付完成后会回到当前页，并自动同步最新状态。
            </Text>
          </View>
          <View className="payment-item">
            <Text className="payment-item-title">奖励账户</Text>
            <Text className="payment-item-subtitle">
              {phone ? `已绑定手机号 ${phone}` : "当前未绑定手机号，不影响本次支付。"}
            </Text>
          </View>
        </View>

        <View className="payment-actions">
          <Button
            className="button-primary payment-wechat-button"
            loading={submitting}
            disabled={submitting}
            onClick={handlePay}
          >
            立即微信支付
          </Button>
          <Button
            className="button-secondary"
            loading={refreshing}
            disabled={refreshing}
            onClick={() => void refreshOrder()}
          >
            刷新支付状态
          </Button>
        </View>

        <Text className="payment-status">{statusText}</Text>
        <Text className="payment-meta">
          主题：{theme}
          {"\n"}
          内容编号：{lastOrderNo || "暂无"}
        </Text>
      </View>
    </View>
  );
}
