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
