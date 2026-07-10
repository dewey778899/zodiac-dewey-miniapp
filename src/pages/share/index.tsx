import { Button, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function SharePage() {
  return (
    <View className="page-shell share-page">
      <View className="card share-card">
        <Text className="section-title">分享内容</Text>
        <Text className="section-subtitle">
          当前先保留分享页入口，后续补分享海报、分享文案和落地页联调。
        </Text>

        <View className="share-actions">
          <Button
            className="button-primary"
            onClick={() =>
              Taro.showToast({
                title: "可直接使用页面分享能力",
                icon: "none"
              })
            }
          >
            查看分享说明
          </Button>
          <Button className="button-secondary" onClick={() => Taro.navigateBack()}>
            返回上一页
          </Button>
        </View>
      </View>
    </View>
  );
}
