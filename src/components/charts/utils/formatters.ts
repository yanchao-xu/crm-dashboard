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
  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(2)}K`;
  }
  return `${symbol}${value}`;
}

export function formatCurrencyWithSymbol(
  value: number,
  language: Language = "zh",
): string {
  console.log("formatCurrencyWithSymbol", language);
  return formatCurrency(value, language);
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
