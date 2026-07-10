import { Input, Picker, Text, View } from "@tarojs/components";
import type { PersonFormState } from "../../types/report";
import "./index.scss";

interface Props {
  title: string;
  value: PersonFormState;
  onChange: (patch: Partial<PersonFormState>) => void;
}

const genderOptions = [
  { value: "female", label: "女" },
  { value: "male", label: "男" }
];

export function PersonForm({ title, value, onChange }: Props) {
  const genderIndex = Math.max(
    genderOptions.findIndex((item) => item.value === value.gender),
    0
  );
  const regionValue = [value.birthProvince || "", value.birthCity || "", value.birthDistrict || ""];
  const regionText = regionValue.filter(Boolean).join(" / ");

  return (
    <View className="person-form card">
      <Text className="person-form-title">{title}</Text>

      <View className="field">
        <Text className="field-label">姓名</Text>
        <Input
          className="field-input"
          value={value.name}
          placeholder="请输入姓名"
          placeholderClass="field-placeholder"
          onInput={(event) => onChange({ name: event.detail.value })}
        />
      </View>

      <View className="field">
        <Text className="field-label">性别</Text>
        <Picker
          mode="selector"
          range={genderOptions.map((item) => item.label)}
          value={genderIndex}
          onChange={(event) => {
            const next = genderOptions[Number(event.detail.value)]?.value || "female";
            onChange({ gender: next as PersonFormState["gender"] });
          }}
        >
          <View className="field-input picker-input">{genderOptions[genderIndex]?.label || "女"}</View>
        </Picker>
      </View>

      <View className="field">
        <Text className="field-label">生日</Text>
        <Picker
          mode="date"
          value={value.birthDate}
          start="1940-01-01"
          end="2100-12-31"
          fields="day"
          onChange={(event) => onChange({ birthDate: event.detail.value })}
        >
          <View className="field-input picker-input">{value.birthDate || "请选择生日"}</View>
        </Picker>
      </View>

      <View className="field">
        <Text className="field-label">出生时间</Text>
        <Picker mode="time" value={value.birthTime} onChange={(event) => onChange({ birthTime: event.detail.value })}>
          <View className="field-input picker-input">{value.birthTime || "12:30"}</View>
        </Picker>
      </View>

      <View className="field">
        <Text className="field-label">出生地</Text>
        <Picker
          mode="region"
          value={regionValue}
          onChange={(event) => {
            const [birthProvince = "", birthCity = "", birthDistrict = ""] = event.detail.value || [];
            onChange({
              birthProvince,
              birthCity,
              birthDistrict,
              birthPlace: [birthProvince, birthCity, birthDistrict].filter(Boolean).join(" "),
              birthLatitude: null,
              birthLongitude: null
            });
          }}
        >
          <View className={`field-input picker-input region-input ${regionText ? "" : "is-placeholder"}`}>
            {regionText || "请选择省 / 市 / 区"}
          </View>
        </Picker>
      </View>
    </View>
  );
}
