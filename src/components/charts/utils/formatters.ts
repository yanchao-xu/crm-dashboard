export type Language = "zh" | "en" | "ja";

// 币种 code → 货币符号映射（ISO 4217）
const currencyCodeSymbolMap: Record<string, string> = {
  // 亚洲
  CNY: "¥",
  JPY: "¥",
  KRW: "₩",
  HKD: "HK$",
  TWD: "NT$",
  SGD: "S$",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  VND: "₫",
  IDR: "Rp",
  INR: "₹",
  PKR: "₨",
  BDT: "৳",
  LKR: "Rs",
  MMK: "K",
  KHR: "៛",
  LAK: "₭",
  MNT: "₮",
  // 中东
  AED: "د.إ",
  SAR: "﷼",
  QAR: "﷼",
  KWD: "د.ك",
  BHD: "BD",
  OMR: "﷼",
  ILS: "₪",
  TRY: "₺",
  // 欧洲
  EUR: "€",
  GBP: "£",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  CZK: "Kč",
  HUF: "Ft",
  RON: "lei",
  BGN: "лв",
  HRK: "kn",
  RUB: "₽",
  UAH: "₴",
  ISK: "kr",
  // 美洲
  USD: "$",
  CAD: "C$",
  MXN: "MX$",
  BRL: "R$",
  ARS: "AR$",
  CLP: "CL$",
  COP: "COL$",
  PEN: "S/",
  // 大洋洲
  AUD: "A$",
  NZD: "NZ$",
  // 非洲
  ZAR: "R",
  NGN: "₦",
  EGP: "E£",
  KES: "KSh",
  GHS: "GH₵",
  MAD: "MAD",
};

/**
 * 根据币种 code 获取货币符号
 * @param currencyCode 币种代码，如 "CNY", "USD", "JPY"
 */
export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return "$";
  return currencyCodeSymbolMap[currencyCode.toUpperCase()] || currencyCode;
}

export function formatCurrency(
  value: number,
  currencyCode?: string,
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1000000) {
    return `${sign}${symbol}${(abs / 1000000).toFixed(2)}M`;
  }
  if (abs >= 1000) {
    return `${sign}${symbol}${(abs / 1000).toFixed(2)}K`;
  }
  return `${sign}${symbol}${Math.round(abs * 100) / 100}`;
}

export function formatCurrencyWithSymbol(
  value: number,
  currencyCode?: string,
): string {
  return formatCurrency(value, currencyCode);
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

const monthMap: Record<Language, Record<string, string>> = {
  zh: {
    Jan: "1月",
    Feb: "2月",
    Mar: "3月",
    Apr: "4月",
    May: "5月",
    Jun: "6月",
    Jul: "7月",
    Aug: "8月",
    Sep: "9月",
    Oct: "10月",
    Nov: "11月",
    Dec: "12月",
  },
  en: {
    Jan: "Jan",
    Feb: "Feb",
    Mar: "Mar",
    Apr: "Apr",
    May: "May",
    Jun: "Jun",
    Jul: "Jul",
    Aug: "Aug",
    Sep: "Sep",
    Oct: "Oct",
    Nov: "Nov",
    Dec: "Dec",
  },
  ja: {
    Jan: "1月",
    Feb: "2月",
    Mar: "3月",
    Apr: "4月",
    May: "5月",
    Jun: "6月",
    Jul: "7月",
    Aug: "8月",
    Sep: "9月",
    Oct: "10月",
    Nov: "11月",
    Dec: "12月",
  },
};

export function formatMonth(month: string, language: Language = "zh"): string {
  return monthMap[language]?.[month] ?? month;
}
