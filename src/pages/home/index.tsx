import { Button, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

const quickLinks = [
  { label: "支付查看", action: () => Taro.navigateTo({ url: "/pages/payment/index?theme=love" }) },
  { label: "返现钱包", action: () => Taro.navigateTo({ url: "/pages/wallet/index" }) },
  {
    label: "内容页",
    action: () =>
      Taro.showToast({
        title: "内容页待补联调",
        icon: "none"
      })
  },
  {
    label: "分享页",
    action: () =>
      Taro.showToast({
        title: "分享页待补联调",
        icon: "none"
      })
  }
];

export default function HomePage() {
  return (
    <View className="page-shell">
      <View className="card home-hero">
        <Text className="hero-tag">MINIAPP READY</Text>
        <Text className="section-title">小登哥内容助手</Text>
        <Text className="section-subtitle">
          小程序首页已经恢复成可见可点的调试页。你现在可以在微信开发者工具里直接验证页面渲染、跳转和基础交互。
        </Text>
      </View>

      <View className="card home-panel">
        <Text className="panel-title">当前联调范围</Text>
        <View className="status-list">
          <View className="status-item">
            <Text className="status-dot success" />
            <Text className="status-text">首页可见渲染</Text>
          </View>
          <View className="status-item">
            <Text className="status-dot success" />
            <Text className="status-text">支付页跳转</Text>
          </View>
          <View className="status-item">
            <Text className="status-dot success" />
            <Text className="status-text">钱包页跳转</Text>
          </View>
          <View className="status-item">
            <Text className="status-dot warn" />
            <Text className="status-text">内容和分享页待继续补联调</Text>
          </View>
        </View>
      </View>

      <View className="card home-panel">
        <Text className="panel-title">快捷入口</Text>
        <View className="quick-grid">
          {quickLinks.map((item) => (
            <View key={item.label} className="quick-card" onClick={item.action}>
              <Text className="quick-card-title">{item.label}</Text>
              <Text className="quick-card-subtitle">点击进入</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="home-actions">
        <Button className="button-primary" onClick={() => Taro.navigateTo({ url: "/pages/payment/index?theme=love" })}>
          进入支付查看页
        </Button>
        <Button className="button-secondary" onClick={() => Taro.navigateTo({ url: "/pages/wallet/index" })}>
          打开返现钱包页
        </Button>
      </View>
    </View>
  );
}
