import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { Button, Input, Text, View } from "@tarojs/components";
import {
  bindReferralUserByWechatPhone,
  createWithdrawal,
  fetchReferralRecords,
  fetchReferralSummary
} from "../../api/compatibility";
import { useReportStore } from "../../store/useReportStore";
import type { ReferralBindingRecord, ReferralRewardRecord, ReferralSummary } from "../../types/report";
import { detectPlatform, ensureDeviceToken, getPendingInviteCode, setPendingInviteCode } from "../../utils/auth";
import "./index.scss";

function fenToYuan(value = 0) {
  return (value / 100).toFixed(2);
}

export default function WalletPage() {
  const { referralProfile, setReferralProfile, pendingInviteCode, setPendingInviteCode: setStorePendingInviteCode } = useReportStore();
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [rewards, setRewards] = useState<ReferralRewardRecord[]>([]);
  const [bindings, setBindings] = useState<ReferralBindingRecord[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("2990");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async (phone: string) => {
    const [summaryRes, recordsRes] = await Promise.all([fetchReferralSummary(phone), fetchReferralRecords(phone)]);
    setSummary(summaryRes);
    setRewards(recordsRes.rewards || []);
    setBindings(recordsRes.bindings || []);
    setReferralProfile(summaryRes);
  };

  useEffect(() => {
    if (referralProfile?.phone) {
      loadData(referralProfile.phone).catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "\u8fd4\u73b0\u8d26\u6237\u52a0\u8f7d\u5931\u8d25");
      });
    }
  }, [referralProfile, setReferralProfile]);

  const bindWechatPhone = async (event?: { detail?: { code?: string } }) => {
    const phoneCode = event?.detail?.code;
    if (!phoneCode) {
      setError("\u4f60\u53d6\u6d88\u4e86\u624b\u673a\u53f7\u6388\u6743\uff0c\u6682\u65f6\u65e0\u6cd5\u67e5\u770b\u8fd4\u73b0\u8d26\u6237");
      return;
    }
    setLoading(true);
    setError("");
    try {
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
        source: "miniapp-wallet"
      });
      setReferralProfile(profile);
      await loadData(profile.phone);
      Taro.showToast({ title: "\u8d26\u6237\u5df2\u7ed1\u5b9a", icon: "success" });
    } catch (bindError) {
      setError(bindError instanceof Error ? bindError.message : "\u8d26\u6237\u7ed1\u5b9a\u5931\u8d25");
    } finally {
      setLoading(false);
    }
  };

  const applyWithdraw = async () => {
    if (!summary?.phone) {
      setError("\u8bf7\u5148\u5b8c\u6210\u5fae\u4fe1\u624b\u673a\u53f7\u6388\u6743");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createWithdrawal({
        phone: summary.phone,
        amountFen: Number(withdrawAmount),
        withdrawPlatform: detectPlatform()
      });
      await loadData(summary.phone);
      Taro.showToast({ title: "\u63d0\u73b0\u7533\u8bf7\u5df2\u63d0\u4ea4", icon: "success" });
    } catch (withdrawError) {
      setError(withdrawError instanceof Error ? withdrawError.message : "\u63d0\u73b0\u7533\u8bf7\u5931\u8d25");
    } finally {
      setLoading(false);
    }
  };

  const shareInvite = async () => {
    if (!summary?.inviteCode) {
      setError("\u8bf7\u5148\u5b8c\u6210\u8d26\u6237\u7ed1\u5b9a");
      return;
    }
    await Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ["shareAppMessage", "shareTimeline"]
    });
    Taro.showToast({ title: "\u5206\u4eab\u5165\u53e3\u5df2\u5f00\u542f", icon: "none" });
  };

  return (
    <View className="page-shell">
      <View className="card wallet-card">
        <Text className="section-title">{"\u8fd4\u73b0\u8d26\u6237"}</Text>
        <Text className="section-subtitle">
          {"\u7cfb\u7edf\u9ed8\u8ba4\u7528\u5fae\u4fe1\u624b\u673a\u53f7\u5efa\u7acb\u4f60\u7684\u4e3b\u8d26\u6237\u3002\u5206\u4eab\u65f6\u4f1a\u81ea\u52a8\u643a\u5e26\u4f60\u7684\u9080\u8bf7\u6807\u8bc6\uff0c\u597d\u53cb\u540e\u7eed\u4ed8\u8d39\u540e\u8fd4\u73b0\u4f1a\u81ea\u52a8\u8fdb\u5165\u8be5\u8d26\u6237\u3002"}
        </Text>

        {!summary ? (
          <View className="wallet-actions">
            <Button className="button-primary" openType="getPhoneNumber" loading={loading} onGetPhoneNumber={bindWechatPhone}>
              {loading ? "\u5904\u7406\u4e2d..." : "\u5fae\u4fe1\u6388\u6743\u5e76\u67e5\u770b\u8d26\u6237"}
            </Button>
          </View>
        ) : null}

        {summary ? (
          <>
            <View className="wallet-summary">
              <Text className="wallet-line">{`\u624b\u673a\u53f7\uff1a${summary.phone}`}</Text>
              <Text className="wallet-line">{`\u9080\u8bf7\u7801\uff1a${summary.inviteCode}`}</Text>
              <Text className="wallet-line">{`\u7d2f\u8ba1\u8fd4\u73b0\uff1a\u00a5${fenToYuan(summary.balanceFen)}`}</Text>
              <Text className="wallet-line">{`\u5f53\u524d\u53ef\u7528\uff1a\u00a5${fenToYuan(summary.availableFen ?? summary.withdrawableFen)}`}</Text>
              <Text className="wallet-line">{`\u63d0\u73b0\u4e2d\uff1a\u00a5${fenToYuan(summary.frozenFen)}`}</Text>
              <Text className="wallet-line">{`\u5df2\u63d0\u73b0\uff1a\u00a5${fenToYuan(summary.withdrawnFen)}`}</Text>
              <Text className="wallet-line">{`\u9080\u8bf7\u4eba\u6570\uff1a${summary.inviteCount}`}</Text>
              <Text className="wallet-line">{`\u8fd4\u73b0\u8ba2\u5355\uff1a${summary.rewardCount}`}</Text>
              <Text className="wallet-line">
                {`\u9080\u8bf7\u8d44\u683c\uff1a${summary.inviterEligible ? "\u5df2\u6fc0\u6d3b" : "\u9700\u5148\u5b8c\u6210\u4e00\u6b21\u6269\u5c55\u5185\u5bb9\u4ed8\u8d39"}`}
              </Text>
            </View>

            <View className="wallet-actions">
              <View className="button-secondary" onClick={shareInvite}>
                {"\u5206\u4eab\u7ed9\u597d\u53cb"}
              </View>
            </View>

            <View className="wallet-field">
              <Text className="wallet-label">{"\u63d0\u73b0\u91d1\u989d\uff08\u5206\uff09"}</Text>
              <Input
                className="wallet-input"
                value={withdrawAmount}
                placeholder="例如 2990"
                onInput={(event) => setWithdrawAmount(event.detail.value)}
              />
            </View>

            <View className="button-primary" onClick={loading ? undefined : applyWithdraw}>
              {loading
                ? "\u5904\u7406\u4e2d..."
                : `\u63d0\u73b0\u5230${detectPlatform() === "WECHAT" ? "\u5fae\u4fe1" : "\u6296\u97f3"}\u94b1\u5305`}
            </View>
          </>
        ) : null}

        {error ? <View className="home-form-error">{error}</View> : null}

        <View className="wallet-section">
          <Text className="wallet-section-title">{"\u6700\u8fd1\u8fd4\u73b0\u8bb0\u5f55"}</Text>
          {rewards.map((reward) => (
            <View className="wallet-record" key={`reward-${reward.id}`}>
              <Text>{`+\u00a5${fenToYuan(reward.amountFen)}`}</Text>
              <Text>{reward.status}</Text>
            </View>
          ))}
          {!rewards.length ? <Text className="wallet-empty">{"\u6682\u65f6\u8fd8\u6ca1\u6709\u8fd4\u73b0\u8bb0\u5f55"}</Text> : null}
        </View>

        <View className="wallet-section">
          <Text className="wallet-section-title">{"\u9080\u8bf7\u7ed1\u5b9a"}</Text>
          {bindings.map((binding) => (
            <View className="wallet-record" key={`binding-${binding.id}`}>
              <Text>{binding.inviteCode}</Text>
              <Text>{binding.bindSource || "miniapp"}</Text>
            </View>
          ))}
          {!bindings.length ? <Text className="wallet-empty">{"\u6682\u65f6\u8fd8\u6ca1\u6709\u9080\u8bf7\u7ed1\u5b9a"}</Text> : null}
        </View>
      </View>
    </View>
  );
}
