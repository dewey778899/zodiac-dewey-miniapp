import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { Input, Text, View } from "@tarojs/components";
import {
  bindReferralUser,
  createWithdrawal,
  fetchReferralRecords,
  fetchReferralSummary
} from "../../api/compatibility";
import { useReportStore } from "../../store/useReportStore";
import type { ReferralBindingRecord, ReferralRewardRecord, ReferralSummary } from "../../types/report";
import "./index.scss";

function fenToYuan(value = 0) {
  return (value / 100).toFixed(2);
}

function ensureDeviceToken() {
  const key = "zodiac_device_token";
  const existing = Taro.getStorageSync<string>(key);
  if (existing) return existing;
  const token = `mini-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  Taro.setStorageSync(key, token);
  return token;
}

function detectPlatform() {
  return Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? "WECHAT" : "DOUYIN";
}

export default function WalletPage() {
  const { referralProfile, setReferralProfile, pendingInviteCode } = useReportStore();
  const [phone, setPhone] = useState(referralProfile?.phone || "");
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [rewards, setRewards] = useState<ReferralRewardRecord[]>([]);
  const [bindings, setBindings] = useState<ReferralBindingRecord[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("2990");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async (currentPhone: string) => {
    const [summaryRes, recordsRes] = await Promise.all([fetchReferralSummary(currentPhone), fetchReferralRecords(currentPhone)]);
    setSummary(summaryRes);
    setRewards(recordsRes.rewards || []);
    setBindings(recordsRes.bindings || []);
    setReferralProfile(summaryRes);
  };

  useEffect(() => {
    if (referralProfile?.phone) {
      setPhone(referralProfile.phone);
      loadData(referralProfile.phone).catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "返现账户加载失败");
      });
    }
  }, [referralProfile, setReferralProfile]);

  const bindPhone = async () => {
    if (!phone.trim()) {
      setError("请先填写手机号");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const profile = await bindReferralUser({
        phone: phone.trim(),
        inviteCode: pendingInviteCode || undefined,
        deviceToken: ensureDeviceToken(),
        source: "miniapp-wallet",
        platform: detectPlatform()
      });
      setReferralProfile(profile);
      await loadData(profile.phone);
      Taro.showToast({ title: "账户已绑定", icon: "success" });
    } catch (bindError) {
      setError(bindError instanceof Error ? bindError.message : "账户绑定失败");
    } finally {
      setLoading(false);
    }
  };

  const applyWithdraw = async () => {
    if (!summary?.phone) {
      setError("请先绑定返现账户");
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
      Taro.showToast({ title: "提现申请已提交", icon: "success" });
    } catch (withdrawError) {
      setError(withdrawError instanceof Error ? withdrawError.message : "提现申请失败");
    } finally {
      setLoading(false);
    }
  };

  const shareInvite = async () => {
    if (!summary?.inviteCode) {
      setError("请先绑定返现账户");
      return;
    }
    await Taro.setClipboardData({
      data: `https://zodiac.nccyin.com/?invite=${encodeURIComponent(summary.inviteCode)}`
    });
    Taro.showToast({ title: "邀请链接已复制", icon: "success" });
  };

  return (
    <View className="page-shell">
      <View className="card wallet-card">
        <Text className="section-title">返现账户</Text>
        <Text className="section-subtitle">先完成一次深度解析付费，再分享给好友。好友付费后，30% 会自动返到你的统一账户。</Text>

        <View className="wallet-field">
          <Text className="wallet-label">手机号</Text>
          <Input
            className="wallet-input"
            value={phone}
            placeholder="请输入你的手机号"
            onInput={(event) => setPhone(event.detail.value)}
          />
        </View>

        <View className="wallet-actions">
          <View className="button-primary" onClick={loading ? undefined : bindPhone}>
            {loading ? "处理中..." : "绑定并查看账户"}
          </View>
          <View className="button-secondary" onClick={shareInvite}>
            复制邀请链接
          </View>
        </View>

        {summary ? (
          <View className="wallet-summary">
            <Text className="wallet-line">邀请码：{summary.inviteCode}</Text>
            <Text className="wallet-line">累计返现：￥{fenToYuan(summary.balanceFen)}</Text>
            <Text className="wallet-line">当前可用：￥{fenToYuan(summary.availableFen ?? summary.withdrawableFen)}</Text>
            <Text className="wallet-line">提现中：￥{fenToYuan(summary.frozenFen)}</Text>
            <Text className="wallet-line">已提现：￥{fenToYuan(summary.withdrawnFen)}</Text>
            <Text className="wallet-line">邀请人数：{summary.inviteCount}</Text>
            <Text className="wallet-line">返现订单：{summary.rewardCount}</Text>
            <Text className="wallet-line">邀请资格：{summary.inviterEligible ? "已激活" : "需先完成一次深度解析付费"}</Text>
          </View>
        ) : null}

        <View className="wallet-field">
          <Text className="wallet-label">提现金额（分）</Text>
          <Input
            className="wallet-input"
            value={withdrawAmount}
            placeholder="例如 2990"
            onInput={(event) => setWithdrawAmount(event.detail.value)}
          />
        </View>

        <View className="button-primary" onClick={loading ? undefined : applyWithdraw}>
          {loading ? "处理中..." : `提现到${detectPlatform() === "WECHAT" ? "微信" : "抖音"}钱包`}
        </View>

        {error ? <View className="home-form-error">{error}</View> : null}

        <View className="wallet-section">
          <Text className="wallet-section-title">最近返现记录</Text>
          {rewards.map((reward) => (
            <View className="wallet-record" key={`reward-${reward.id}`}>
              <Text>+￥{fenToYuan(reward.amountFen)}</Text>
              <Text>{reward.status}</Text>
            </View>
          ))}
          {!rewards.length ? <Text className="wallet-empty">暂时还没有返现记录</Text> : null}
        </View>

        <View className="wallet-section">
          <Text className="wallet-section-title">邀请绑定</Text>
          {bindings.map((binding) => (
            <View className="wallet-record" key={`binding-${binding.id}`}>
              <Text>{binding.inviteCode}</Text>
              <Text>{binding.bindSource || "miniapp"}</Text>
            </View>
          ))}
          {!bindings.length ? <Text className="wallet-empty">暂时还没有邀请绑定</Text> : null}
        </View>
      </View>
    </View>
  );
}
