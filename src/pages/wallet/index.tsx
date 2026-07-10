import { Button, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function WalletPage() {
  return (
    <View className="page-shell">
      <View className="card wallet-card">
        <Text className="section-title">返现钱包</Text>
        <Text className="section-subtitle">当前页面已恢复显示，用于继续联调返现、提现和邀请功能。</Text>

        <View className="wallet-summary">
          <Text className="wallet-line">可提现金额：¥0.00</Text>
          <Text className="wallet-line">账户余额：¥0.00</Text>
          <Text className="wallet-line">邀请人数：0</Text>
          <Text className="wallet-line">返现次数：0</Text>
        </View>

        <View className="wallet-section">
          <Text className="wallet-section-title">当前状态</Text>
          <Text className="wallet-empty">小程序钱包页已经可见，下一步继续补真实钱包数据。</Text>
        </View>

        <View className="wallet-actions">
          <Button className="button-primary" onClick={() => Taro.navigateTo({ url: "/pages/payment/index?theme=love" })}>
            去支付页
          </Button>
          <Button className="button-secondary" onClick={() => Taro.navigateBack()}>
            返回上一页
          </Button>
        </View>
      </View>
    </View>
  );
}
