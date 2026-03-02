// Common chart margins
export const chartMargins = {
  default: { top: 10, right: 10, left: 0, bottom: 0 },
  withLeftPadding: { top: 10, right: 10, left: 20, bottom: 0 },
} as const;

// Chart heights
export const chartHeights = {
  small: 200,
  medium: 280,
  large: 300,
} as const;

// Chart axis configuration
export const axisConfig = {
  axisLine: false,
  tickLine: false,
  fontSize: 12,
} as const;
