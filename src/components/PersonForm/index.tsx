import { Input, Picker, Text, View } from "@tarojs/components";
import type { PersonFormState } from "../../types/report";
import "./index.scss";

interface Props {
  title: string;
  value: PersonFormState;
  onChange: (patch: Partial<PersonFormState>) => void;
}

const genderOptions = [
  { value: "female", label: "\u5973" },
  { value: "male", label: "\u7537" }
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
        <Text className="field-label">{"\u540d\u5b57"}</Text>
        <Input
          className="field-input"
          value={value.name}
          placeholder="\u8bf7\u8f93\u5165\u540d\u5b57"
          placeholderClass="field-placeholder"
          onInput={(event) => onChange({ name: event.detail.value })}
        />
      </View>

      <View className="field">
        <Text className="field-label">{"\u6027\u522b"}</Text>
        <Picker
          mode="selector"
          range={genderOptions.map((item) => item.label)}
          value={genderIndex}
          onChange={(event) => {
            const next = genderOptions[Number(event.detail.value)]?.value || "female";
            onChange({ gender: next as PersonFormState["gender"] });
          }}
        >
          <View className="field-input picker-input">{genderOptions[genderIndex]?.label || "\u5973"}</View>
        </Picker>
      </View>

      <View className="field">
        <Text className="field-label">{"\u751f\u65e5"}</Text>
        <Picker
          mode="date"
          value={value.birthDate}
          start="1940-01-01"
          end="2100-12-31"
          fields="day"
          onChange={(event) => onChange({ birthDate: event.detail.value })}
        >
          <View className="field-input picker-input">{value.birthDate || "\u8bf7\u9009\u62e9\u751f\u65e5"}</View>
        </Picker>
      </View>

      <View className="field">
        <Text className="field-label">{"\u51fa\u751f\u65f6\u95f4"}</Text>
        <Picker mode="time" value={value.birthTime} onChange={(event) => onChange({ birthTime: event.detail.value })}>
          <View className="field-input picker-input">{value.birthTime || "12:30"}</View>
        </Picker>
      </View>

      <View className="field">
        <Text className="field-label">{"\u51fa\u751f\u5730"}</Text>
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
            {regionText || "\u8bf7\u9009\u62e9\u7701 / \u5e02 / \u533a"}
          </View>
        </Picker>
      </View>
    </View>
  );
}
