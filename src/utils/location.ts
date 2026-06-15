export interface BirthPlaceOption {
  label: string;
  lng: number;
  lat: number;
}

export const HOT_BIRTH_PLACES: BirthPlaceOption[] = [
  { label: "北京市 北京 东城区", lng: 116.418, lat: 39.9367 },
  { label: "上海市 上海 浦东新区", lng: 121.5447, lat: 31.2211 },
  { label: "广东省 广州 天河区", lng: 113.3616, lat: 23.1247 },
  { label: "广东省 深圳 南山区", lng: 113.9304, lat: 22.5333 },
  { label: "浙江省 杭州 西湖区", lng: 120.1302, lat: 30.2595 },
  { label: "江苏省 南京 鼓楼区", lng: 118.7697, lat: 32.0663 },
  { label: "四川省 成都 武侯区", lng: 104.0434, lat: 30.6414 },
  { label: "湖北省 武汉 江汉区", lng: 114.2708, lat: 30.6012 },
  { label: "陕西省 西安 雁塔区", lng: 108.9488, lat: 34.2225 },
  { label: "重庆市 重庆 渝中区", lng: 106.5623, lat: 29.5521 }
];
