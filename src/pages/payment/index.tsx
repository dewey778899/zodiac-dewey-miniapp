import { useMemo, useState } from "react";
import Taro, { useRouter } from "@tarojs/taro";
import { Button, Text, View } from "@tarojs/components";
import { bindReferralUserByWechatPhone, fetchOrder, prepareWechatJsapi } from "../../api/compatibility";
import { useReportStore } from "../../store/useReportStore";
import type { PaymentOrderResponse, ThemeType } from "../../types/report";
import { detectPlatform, ensureDeviceToken, getPendingInviteCode, setPendingInviteCode, setSessionOpenid } from "../../utils/auth";
import "./index.scss";

type WechatPayPayload = {
  appId?: string;
  timeStamp?: string;
  nonceStr?: string;
  package?: string;
  signType?: string;
  paySign?: string;
};

function getThemeLabel(theme: ThemeType) {
  if (theme === "career") return "\u4e8b\u4e1a";
  if (theme === "wealth") return "\u8d22\u8fd0";
  return "\u7231\u60c5";
}

export default function PaymentPage() {
  const router = useRouter();
  const theme = ((router.params.theme as ThemeType) || "love") as ThemeType;
  const {
    referralProfile,
    pendingInviteCode,
    setReferralProfile,
    setAccessToken,
    setThemeModel,
    setPendingInviteCode: setStorePendingInviteCode,
    setSessionOpenid: setStoreSessionOpenid
  } = useReportStore();
  const [status, setStatus] = useState(
    "\u652f\u4ed8\u524d\u5148\u5b8c\u6210\u5fae\u4fe1\u624b\u673a\u53f7\u6388\u6743\u3002\u6388\u6743\u540e\u7cfb\u7edf\u4f1a\u81ea\u52a8\u5efa\u7acb\u8d26\u6237\u3001\u8bb0\u5f55\u8ba2\u5355\uff0c\u5e76\u5728\u652f\u4ed8\u6210\u529f\u540e\u81ea\u52a8\u89e3\u9501\u3002"
  );
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
      throw new Error("\u652f\u4ed8\u53c2\u6570\u4e0d\u5b8c\u6574\uff0c\u6682\u65f6\u65e0\u6cd5\u62c9\u8d77\u5fae\u4fe1\u652f\u4ed8");
    }
    await Taro.requestPayment({
      timeStamp: payload.timeStamp,
      nonceStr: payload.nonceStr,
      package: payload.package,
      signType: (payload.signType as "RSA" | "MD5" | "HMAC-SHA256") || "RSA",
      paySign: payload.paySign
    });
  };

  const bindByWechatPhone = async (event?: { detail?: { code?: string } }) => {
    const phoneCode = event?.detail?.code;
    if (!phoneCode) {
      throw new Error("\u4f60\u53d6\u6d88\u4e86\u624b\u673a\u53f7\u6388\u6743\uff0c\u6682\u65f6\u65e0\u6cd5\u5b8c\u6210\u652f\u4ed8");
    }
    const loginRes = await Taro.login();
    if (!loginRes.code) {
      throw new Error("\u5fae\u4fe1\u767b\u5f55\u5931\u8d25\uff0c\u672a\u83b7\u53d6\u5230\u767b\u5f55 code");
    }

    const inviteCode = pendingInviteCode || getPendingInviteCode();
    if (inviteCode) {
      setPendingInviteCode(inviteCode);
      setStorePendingInviteCode(inviteCode);
    }

    const profile = await bindReferralUserByWechatPhone({
      loginCode: loginRes.code,
      phoneCode,
      inviteCode: inviteCode || undefined,
      deviceToken: ensureDeviceToken(),
      source: `miniapp-pay-${theme}`
    });

    setReferralProfile(profile);
    if (profile.wechatOpenid) {
      setSessionOpenid(profile.wechatOpenid);
      setStoreSessionOpenid(profile.wechatOpenid);
    }
    return profile.phone;
  };

  const handleWechatPay = async (event?: { detail?: { code?: string } }) => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      setStatus("\u8bf7\u5728\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u73af\u5883\u91cc\u6d4b\u8bd5\u5fae\u4fe1\u652f\u4ed8\u3002");
      return;
    }

    setLoading(true);
    try {
      const boundPhone = referralProfile?.phone || (await bindByWechatPhone(event));
      const loginRes = await Taro.login();
      if (!loginRes.code) {
        throw new Error("\u5fae\u4fe1\u767b\u5f55\u5931\u8d25\uff0c\u672a\u83b7\u53d6\u5230\u767b\u5f55 code");
      }

      const response = await prepareWechatJsapi({
        code: loginRes.code,
        order: {
          channel: "wechat",
          scene: "wechat_jsapi",
          reportType: theme,
          amountFen: 2990,
          subject: "\u6df1\u5ea6\u89e3\u6790\u670d\u52a1",
          returnUrl: "https://xiaodengge.top",
          clientContext,
          phone: boundPhone
        }
      });

      setLatestOutTradeNo(response.outTradeNo || "");
      setStatus("\u8ba2\u5355\u5df2\u521b\u5efa\uff0c\u6b63\u5728\u62c9\u8d77\u5fae\u4fe1\u652f\u4ed8...");
      await requestWechatPay((response.payPayload || {}) as WechatPayPayload);

      const latest: PaymentOrderResponse = response.outTradeNo ? await fetchOrder(response.outTradeNo) : response;
      const token = latest.accessToken || response.accessToken || "";
      if (token) {
        setAccessToken(theme, token);
        setThemeModel(theme, "claude");
      }
      Taro.showToast({ title: "\u652f\u4ed8\u6210\u529f", icon: "success" });
      setStatus(
        latest.unlockSource === "ADMIN_APPROVED"
          ? "\u8be5\u8ba2\u5355\u5df2\u7531\u540e\u53f0\u4eba\u5de5\u5ba1\u6279\u89e3\u9501\u3002"
          : "\u8be5\u8ba2\u5355\u5df2\u652f\u4ed8\u6210\u529f\u5e76\u81ea\u52a8\u89e3\u9501\u5f53\u524d\u4e3b\u9898\u4e00\u6b21\u6df1\u5ea6\u89e3\u6790\u3002"
      );
      setTimeout(() => Taro.navigateBack({ delta: 1 }), 500);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "\u652f\u4ed8\u53d1\u8d77\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="page-shell">
      <View className="card payment-card">
        <Text className="payment-tag">WECHAT PAY</Text>
        <Text className="section-title">{"\u6df1\u5ea6\u89e3\u6790\u652f\u4ed8"}</Text>
        <Text className="section-subtitle">
          {`\u5f53\u524d\u4e3b\u9898\uff1a${getThemeLabel(theme)} \u00b7 \u91d1\u989d\uff1a29.9 \u5143\u3002\u652f\u4ed8\u6210\u529f\u540e\u81ea\u52a8\u89e3\u9501\u5f53\u524d\u4e3b\u9898\u4e00\u6b21\u6df1\u5ea6\u89e3\u6790\uff1b\u5982\u6709\u5f02\u5e38\uff0c\u540e\u53f0\u4e5f\u53ef\u4ee5\u4eba\u5de5\u5ba1\u6279\u89e3\u9501\u3002`}
        </Text>

        <View className="payment-price-block">
          <Text className="payment-price-symbol">{"\u00a5"}</Text>
          <Text className="payment-price-value">29.9</Text>
        </View>

        <View className="payment-grid">
          <View className="payment-item">
            <Text className="payment-item-title">{"\u65e0\u611f\u8d26\u6237\u7ed1\u5b9a"}</Text>
            <Text className="payment-item-subtitle">
              {"\u70b9\u51fb\u652f\u4ed8\u6309\u94ae\u65f6\u4f1a\u540c\u6b65\u89e6\u53d1\u5fae\u4fe1\u624b\u673a\u53f7\u6388\u6743\u3002\u7cfb\u7edf\u81ea\u52a8\u5efa\u7acb\u624b\u673a\u53f7\u4e3b\u8d26\u6237\uff0c\u4e0d\u9700\u8981\u624b\u586b\u624b\u673a\u53f7\u3002"}
            </Text>
          </View>
          <View className="payment-item">
            <Text className="payment-item-title">{"\u53cc\u901a\u9053\u89e3\u9501"}</Text>
            <Text className="payment-item-subtitle">
              {"\u4f18\u5148\u8d70\u652f\u4ed8\u6210\u529f\u81ea\u52a8\u89e3\u9501\uff1b\u5982\u679c\u56de\u8c03\u5f02\u5e38\uff0c\u540e\u53f0\u53ef\u5bf9\u8ba2\u5355\u505a\u4eba\u5de5\u5ba1\u6279\u89e3\u9501\uff0c\u5e76\u4fdd\u7559\u6765\u6e90\u6807\u8bc6\u3002"}
            </Text>
          </View>
        </View>

        <View className="payment-actions">
          <Button className="button-primary payment-wechat-button" openType="getPhoneNumber" loading={loading} onGetPhoneNumber={handleWechatPay}>
            {loading ? "\u6b63\u5728\u62c9\u8d77\u652f\u4ed8..." : "\u7acb\u5373\u5fae\u4fe1\u652f\u4ed8"}
          </Button>
        </View>

        {latestOutTradeNo ? <Text className="payment-meta">{`\u6700\u8fd1\u8ba2\u5355\u53f7\uff1a${latestOutTradeNo}`}</Text> : null}
        <Text className="payment-status">{status}</Text>
        {referralProfile?.phone ? <Text className="payment-meta">{`\u5f53\u524d\u8d26\u6237\uff1a${referralProfile.phone}`}</Text> : null}
        <Text className="payment-meta">
          {`\u5f53\u524d\u5e73\u53f0\uff1a${detectPlatform() === "WECHAT" ? "\u5fae\u4fe1\u5c0f\u7a0b\u5e8f" : "\u6296\u97f3\u5c0f\u7a0b\u5e8f"}`}
        </Text>
      </View>
    </View>
  );
}
