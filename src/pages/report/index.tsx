import { Button, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function ReportPage() {
  return (
    <View className="page-shell report-page">
      <View className="card report-state-card">
        <Text className="section-title">内容详情</Text>
        <Text className="section-subtitle">
          当前小程序端内容详情页已接通页面入口，后续会继续补完整内容渲染和分享联调。
        </Text>

        <View className="report-actions">
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
