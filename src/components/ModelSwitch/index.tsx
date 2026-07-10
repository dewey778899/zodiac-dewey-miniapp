import { Text, View } from "@tarojs/components";
import type { ModelType } from "../../types/report";
import { MODEL_COPY } from "../../utils/constants";
import "./index.scss";

interface Props {
  activeModel: ModelType;
  premiumUnlocked: boolean;
  onChange: (model: ModelType) => void;
}

export function ModelSwitch({ activeModel, premiumUnlocked, onChange }: Props) {
  return (
    <View className="model-switch">
      {(["deepseek", "claude"] as ModelType[]).map((model) => (
        <View
          key={model}
          className={`model-chip ${activeModel === model ? "active" : ""} ${model === "claude" ? "premium" : ""}`}
          onClick={() => onChange(model)}
        >
          <Text className="model-chip-label">{MODEL_COPY[model].label}</Text>
          <Text className="model-chip-badge">
            {model === "claude" && premiumUnlocked ? "已开通" : MODEL_COPY[model].badge}
          </Text>
        </View>
      ))}
    </View>
  );
}
