export type Language = "zh" | "en" | "ja";

const currencySymbolMap: Record<Language, string> = {
  zh: "¥",
  en: "$",
  ja: "¥",
};

export function getCurrencySymbol(language: Language): string {
  return currencySymbolMap[language] || "¥";
}

export function formatCurrency(
  value: number,
  language: Language = "zh",
): string {
  const symbol = getCurrencySymbol(language);
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
  language: Language = "zh",
): string {
  return formatCurrency(value, language);
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

const monthMap: Record<Language, Record<string, string>> = {
  zh: {
    Jan: "1月", Feb: "2月", Mar: "3月", Apr: "4月",
    May: "5月", Jun: "6月", Jul: "7月", Aug: "8月",
    Sep: "9月", Oct: "10月", Nov: "11月", Dec: "12月",
  },
  en: {
    Jan: "Jan", Feb: "Feb", Mar: "Mar", Apr: "Apr",
    May: "May", Jun: "Jun", Jul: "Jul", Aug: "Aug",
    Sep: "Sep", Oct: "Oct", Nov: "Nov", Dec: "Dec",
  },
  ja: {
    Jan: "1月", Feb: "2月", Mar: "3月", Apr: "4月",
    May: "5月", Jun: "6月", Jul: "7月", Aug: "8月",
    Sep: "9月", Oct: "10月", Nov: "11月", Dec: "12月",
  },
};

export function formatMonth(month: string, language: Language = "zh"): string {
  return monthMap[language]?.[month] ?? month;
}
