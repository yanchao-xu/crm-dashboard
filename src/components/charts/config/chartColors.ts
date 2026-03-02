// Stage colors for charts
export const stageColors = {
  Discovery: "hsl(217, 91%, 60%)",
  Qualification: "hsl(252, 87%, 67%)",
  Proposal: "hsl(280, 100%, 70%)",
  Negotiation: "hsl(330, 85%, 65%)",
  Closing: "hsl(142, 76%, 45%)",
} as const;

// Activity status colors
export const activityColors = {
  active: "hsl(142, 71%, 45%)",
  activeHighlight: "hsl(142, 71%, 55%)",
  over30: "hsl(45, 93%, 47%)",
  over30Highlight: "hsl(45, 93%, 57%)",
  over60: "hsl(0, 84%, 60%)",
  over60Highlight: "hsl(0, 84%, 70%)",
  zombie: "hsl(0, 72%, 40%)",
  zombieHighlight: "hsl(0, 72%, 50%)",
} as const;

// Chart theme colors
export const chartTheme = {
  grid: "hsl(222, 47%, 16%)",
  tick: "hsl(215, 20%, 55%)",
  target: "hsl(45, 93%, 58%)",
  cursor: "hsl(222, 47%, 12%)",
} as const;
