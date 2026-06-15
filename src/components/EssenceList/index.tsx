import { Text, View } from "@tarojs/components";
import "./index.scss";

interface Props {
  items: string[];
}

export function EssenceList({ items }: Props) {
  if (!items.length) return null;

  return (
    <View className="card essence-card">
      <Text className="section-title">珍藏锦囊</Text>
      <Text className="section-subtitle">提炼这份报告里最值得记住的几个关键信息。</Text>
      <View className="essence-list">
        {items.map((item, index) => (
          <View className="essence-item" key={`${item}-${index}`}>
            <Text className="essence-index">{String(index + 1).padStart(2, "0")}</Text>
            <Text className="essence-text">{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
