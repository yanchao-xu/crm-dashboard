import { describe, expect, it } from "vitest";
import {
  transitionChartFilter,
  type ChartFilterContext,
} from "./chartFilterState";

const MONTH = "Jun";
const STAGE = "quotation";
const STATUS = "active";

function contextFor(
  month?: string,
  stage?: string,
  activityStatus?: string,
): ChartFilterContext {
  if (activityStatus) {
    return { type: "stagnation", month, stage, activityStatus };
  }
  if (stage) return { type: "funnel", month, stage };
  if (month) return { type: "health", month };
  return null;
}

const combinations = [false, true].flatMap((hasMonth) =>
  [false, true].flatMap((hasStage) =>
    [false, true].map((hasStatus) => ({
      month: hasMonth ? MONTH : undefined,
      stage: hasStage ? STAGE : undefined,
      status: hasStatus ? STATUS : undefined,
    })),
  ),
);

describe("transitionChartFilter - 独立删除排列组合", () => {
  it.each(combinations)(
    "月份=$month 阶段=$stage 状态=$status：删除任一维度不影响其余维度",
    ({ month, stage, status }) => {
      const previous = contextFor(month, stage, status);
      expect(transitionChartFilter(previous, { kind: "removeMonth" }))
        .toEqual(contextFor(undefined, stage, status));
      expect(transitionChartFilter(previous, { kind: "removeStage" }))
        .toEqual(contextFor(month, undefined, status));
      expect(transitionChartFilter(previous, { kind: "removeStatus" }))
        .toEqual(contextFor(month, stage, undefined));
    },
  );
});

describe("transitionChartFilter - 点击顺序", () => {
  it("月份 → 阶段 → 状态，逐级保留已有条件", () => {
    let state = transitionChartFilter(null, { kind: "selectMonth", month: MONTH });
    state = transitionChartFilter(state, { kind: "selectStage", stage: STAGE });
    state = transitionChartFilter(state, { kind: "selectStatus", activityStatus: STATUS });
    expect(state).toEqual(contextFor(MONTH, STAGE, STATUS));
  });

  it("月份 → 状态，不会凭空产生阶段", () => {
    let state = transitionChartFilter(null, { kind: "selectMonth", month: MONTH });
    state = transitionChartFilter(state, { kind: "selectStatus", activityStatus: STATUS });
    expect(state).toEqual(contextFor(MONTH, undefined, STATUS));
  });

  it("阶段 → 状态，不会凭空产生月份", () => {
    let state = transitionChartFilter(null, { kind: "selectStage", stage: STAGE });
    state = transitionChartFilter(state, { kind: "selectStatus", activityStatus: STATUS });
    expect(state).toEqual(contextFor(undefined, STAGE, STATUS));
  });

  it("重新点击月份会开始新的月份钻取", () => {
    const previous = contextFor("May", STAGE, STATUS);
    expect(transitionChartFilter(previous, { kind: "selectMonth", month: MONTH }))
      .toEqual(contextFor(MONTH));
  });

  it("重新点击阶段保留月份并开始新的阶段钻取", () => {
    const previous = contextFor(MONTH, "lead", STATUS);
    expect(transitionChartFilter(previous, { kind: "selectStage", stage: STAGE }))
      .toEqual(contextFor(MONTH, STAGE));
  });
});

describe("transitionChartFilter - 已删除条件不复活", () => {
  it("删除阶段后切换顶部状态，阶段保持为空", () => {
    let state = contextFor(MONTH, STAGE, STATUS);
    state = transitionChartFilter(state, { kind: "removeStage" });
    state = transitionChartFilter(state, { kind: "selectStatus", activityStatus: "over30" });
    expect(state).toEqual(contextFor(MONTH, undefined, "over30"));
  });

  it("删除月份后切换顶部状态，月份保持为空", () => {
    let state = contextFor(MONTH, undefined, STATUS);
    state = transitionChartFilter(state, { kind: "removeMonth" });
    state = transitionChartFilter(state, { kind: "selectStatus", activityStatus: "over30" });
    expect(state).toEqual(contextFor(undefined, undefined, "over30"));
  });

  it("删除月份后仍保留阶段和状态", () => {
    const previous = contextFor(MONTH, STAGE, STATUS);
    expect(transitionChartFilter(previous, { kind: "removeMonth" }))
      .toEqual(contextFor(undefined, STAGE, STATUS));
  });

  it("清除操作不改变回款分析筛选", () => {
    const collection: ChartFilterContext = {
      type: "collection",
      month: MONTH,
      segment: "overdue",
    };
    expect(transitionChartFilter(collection, { kind: "removeMonth" })).toBe(collection);
    expect(transitionChartFilter(collection, { kind: "removeStage" })).toBe(collection);
    expect(transitionChartFilter(collection, { kind: "removeStatus" })).toBe(collection);
  });
});
