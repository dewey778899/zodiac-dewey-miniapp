export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
}

export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
];

const LUNAR_DAYS = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
];

const LUNAR_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

export const LUNAR_START_YEAR = 1900;
export const LUNAR_END_YEAR = 2100;

export function leapMonth(year: number) {
  return lunarInfo[year - 1900] & 0xf;
}

export function leapDays(year: number) {
  if (leapMonth(year)) return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
  return 0;
}

export function monthDays(year: number, month: number) {
  return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

export function lunarYearDays(year: number) {
  let sum = 348;
  for (let flag = 0x8000; flag > 0x8; flag >>= 1) {
    sum += lunarInfo[year - 1900] & flag ? 1 : 0;
  }
  return sum + leapDays(year);
}

export function ganzhi(year: number) {
  return `${GAN[(year - 4) % 10]}${ZHI[(year - 4) % 12]}`;
}

export function solarToLunar(year: number, month: number, day: number): LunarDate {
  let offset = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000);
  let lunarYear = 1900;
  let temp = 0;

  for (; lunarYear < 2101 && offset > 0; lunarYear += 1) {
    temp = lunarYearDays(lunarYear);
    offset -= temp;
  }

  if (offset < 0) {
    offset += temp;
    lunarYear -= 1;
  }

  const leap = leapMonth(lunarYear);
  let isLeap = false;
  let lunarMonth = 1;

  for (; lunarMonth < 13 && offset > 0; lunarMonth += 1) {
    if (leap > 0 && lunarMonth === leap + 1 && !isLeap) {
      lunarMonth -= 1;
      isLeap = true;
      temp = leapDays(lunarYear);
    } else {
      temp = monthDays(lunarYear, lunarMonth);
    }

    if (isLeap && lunarMonth === leap + 1) {
      isLeap = false;
    }

    offset -= temp;
  }

  if (offset === 0 && leap > 0 && lunarMonth === leap + 1) {
    if (isLeap) {
      isLeap = false;
    } else {
      isLeap = true;
      lunarMonth -= 1;
    }
  }

  if (offset < 0) {
    offset += temp;
    lunarMonth -= 1;
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: offset + 1,
    isLeap
  };
}

export function lunarToSolar(year: number, month: number, day: number, isLeap: boolean): SolarDate {
  let offset = 0;
  for (let currentYear = 1900; currentYear < year; currentYear += 1) {
    offset += lunarYearDays(currentYear);
  }

  const leap = leapMonth(year);
  for (let currentMonth = 1; currentMonth < month; currentMonth += 1) {
    offset += monthDays(year, currentMonth);
    if (leap === currentMonth) {
      offset += leapDays(year);
    }
  }

  if (isLeap && leap === month) {
    offset += monthDays(year, month);
  }

  offset += day - 1;
  const date = new Date(Date.UTC(1900, 0, 31) + offset * 86400000);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

export function formatLunar(result: LunarDate) {
  const monthLabel = `${result.isLeap ? "闰" : ""}${LUNAR_MONTHS[result.month - 1]}月`;
  const animal = ANIMALS[(result.year - 4) % 12];
  return `${ganzhi(result.year)}${animal}年 ${monthLabel}${LUNAR_DAYS[result.day - 1]}`;
}

export function formatSolar(result: SolarDate) {
  return `${result.year}年${result.month}月${result.day}日`;
}

export function formatSolarWithWeekday(result: SolarDate) {
  const weekDay = WEEK_DAYS[new Date(result.year, result.month - 1, result.day).getDay()];
  return `${formatSolar(result)} 星期${weekDay}`;
}

export function formatSolarInput(result: SolarDate) {
  const month = String(result.month).padStart(2, "0");
  const day = String(result.day).padStart(2, "0");
  return `${result.year}-${month}-${day}`;
}

export function getLunarMonthOptions(year: number) {
  const options: Array<{ value: string; label: string; month: number; isLeap: boolean }> = [];
  const leap = leapMonth(year);
  for (let month = 1; month <= 12; month += 1) {
    options.push({ value: `${month}`, label: `${LUNAR_MONTHS[month - 1]}月`, month, isLeap: false });
    if (leap === month) {
      options.push({ value: `L${month}`, label: `闰${LUNAR_MONTHS[month - 1]}月`, month, isLeap: true });
    }
  }
  return options;
}

export function getLunarDayOptions(year: number, monthValue: string) {
  const isLeap = monthValue.startsWith("L");
  const month = Number(isLeap ? monthValue.slice(1) : monthValue);
  const totalDays = isLeap ? leapDays(year) : monthDays(year, month);
  return Array.from({ length: totalDays }, (_, index) => ({
    value: index + 1,
    label: LUNAR_DAYS[index]
  }));
}

export function parseLunarMonthValue(value: string) {
  const isLeap = value.startsWith("L");
  return {
    month: Number(isLeap ? value.slice(1) : value),
    isLeap
  };
}
