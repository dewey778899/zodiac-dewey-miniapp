import Taro, { useRouter } from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import type { ThemeType } from "../../types/report";
import "./index.scss";

export default function UnlockPage() {
  const router = useRouter();
  const theme = ((router.params.theme as ThemeType) || "love") as ThemeType;

  return (
    <View className="page-shell">
      <View className="card unlock-card">
        <Text className="section-title">深度解析已改为付费解锁</Text>
        <Text className="section-subtitle">当前不再使用关注解锁。请直接进入微信支付页，完成 29.9 元支付后再回到表单页生成深度报告。</Text>

        <View className="unlock-actions">
          <View
            className="button-primary"
            onClick={() =>
              Taro.redirectTo({
                url: `/pages/payment/index?theme=${theme}`
              })
            }
          >
            去微信支付
          </View>
          <View className="button-secondary" onClick={() => Taro.navigateBack({ delta: 1 })}>
            返回
          </View>
        </View>
      </View>
    </View>
  );
}
