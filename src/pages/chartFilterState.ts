export type ChartFilterContext = {
  type: "health" | "funnel" | "stagnation" | "collection";
  stage?: string;
  activityStatus?: string;
  month?: string;
  segment?: "native" | "overdue" | "all";
} | null;

export type ChartFilterAction =
  | { kind: "selectMonth"; month: string }
  | { kind: "selectStage"; stage: string }
  | { kind: "selectStatus"; stage?: string; activityStatus: string }
  | { kind: "removeMonth" }
  | { kind: "removeStage" }
  | { kind: "removeStatus" };

export function transitionChartFilter(
  previous: ChartFilterContext,
  action: ChartFilterAction,
): ChartFilterContext {
  const parent = previous?.type === "collection" ? null : previous;
  switch (action.kind) {
    case "selectMonth":
      return { type: "health", month: action.month };
    case "selectStage":
      return { type: "funnel", month: parent?.month, stage: action.stage };
    case "selectStatus":
      return {
        type: "stagnation",
        month: parent?.month,
        stage: action.stage ?? parent?.stage,
        activityStatus: action.activityStatus,
      };
    case "removeMonth":
      if (!parent) return previous;
      if (parent.activityStatus) return { type: "stagnation", month: undefined, stage: parent.stage, activityStatus: parent.activityStatus };
      return parent.stage ? { type: "funnel", month: undefined, stage: parent.stage } : null;
    case "removeStage":
      if (!parent) return previous;
      if (parent.activityStatus) return { type: "stagnation", month: parent.month, stage: undefined, activityStatus: parent.activityStatus };
      return parent.month ? { type: "health", month: parent.month } : null;
    case "removeStatus":
      if (!parent) return previous;
      if (parent.stage) return { type: "funnel", month: parent.month, stage: parent.stage };
      return parent.month ? { type: "health", month: parent.month } : null;
  }
}
