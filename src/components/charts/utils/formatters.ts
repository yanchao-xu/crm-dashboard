export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return String(value);
}

export function formatCurrencyWithSymbol(value: number, symbol = "¥"): string {
  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(2)}K`;
  }
  return `${symbol}${value}`;
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
