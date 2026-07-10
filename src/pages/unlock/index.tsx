import { Button, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function UnlockPage() {
  return (
    <View className="page-shell">
      <View className="card unlock-card">
        <Text className="section-title" style={{ color: "#ffffff" }}>
          支付查看
        </Text>
        <Text className="section-subtitle" style={{ color: "rgba(255,255,255,0.78)" }}>
          当前版本仅保留支付查看链路，完成支付后即可回到支付页同步最新状态。
        </Text>

        <View className="unlock-actions">
          <Button className="button-primary" onClick={() => Taro.navigateTo({ url: "/pages/payment/index?theme=love" })}>
            去支付查看
          </Button>
          <Button className="button-secondary" onClick={() => Taro.navigateBack()}>
            返回上一页
          </Button>
        </View>
      </View>
    </View>
  );
}
