import { describe, it, expect } from "vitest";
import { buildContractRows } from "@/components/deals/ContractsTable";
import type { Contract, ReceivablePlan } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";
import type { MonthlyRollingMap } from "@/components/charts/CollectionHealthChart/useCollectionHealthData";
import type { HiddenSeries } from "@/components/charts/CollectionHealthChart";

// ─── Mock 数据工厂 ───────────────────────────────────────

function createContract(overrides: Partial<Contract> = {}): Contract {
  return { id: "c1", contractCode: "C001", contractName: "测试合同", customer: "客户A", owner: "张三", totalAmountWithTax: 28250, signingDate: "2026-07-16", expiryDate: "2026-08-31", ...overrides };
}

function createPlan(overrides: Partial<ReceivablePlan> = {}): ReceivablePlan {
  return { id: "p1", parentDataId: "c1", actualAmount: 0, actualDate: "", plannedAmount: 8475, plannedDate: "2026-06-04", plannedMonth: "Jun", plannedYearMonth: "2026-06", paymentStage: "预付款(30%)", paymentOwner: "胡剑飞", ...overrides };
}

function buildContractMap(contracts: Contract[]): ContractMap {
  const map: ContractMap = new Map();
  contracts.forEach((c) => { if (!map.has(c.contractCode)) map.set(c.contractCode, []); map.get(c.contractCode)!.push(c); });
  return map;
}

function buildPlanMap(plans: ReceivablePlan[]): ReceivablePlanMap {
  const map: ReceivablePlanMap = new Map();
  plans.forEach((p) => { if (!map.has(p.parentDataId)) map.set(p.parentDataId, []); map.get(p.parentDataId)!.push(p); });
  return map;
}

function buildRollingMap(entries: Array<{ yearMonth: string; contractId: string; planId: string; rollingSourceMonth: string | null; isOverdue: boolean }>): MonthlyRollingMap {
  const map: MonthlyRollingMap = new Map();
  entries.forEach((e) => { if (!map.has(e.yearMonth)) map.set(e.yearMonth, []); map.get(e.yearMonth)!.push({ contractId: e.contractId, planId: e.planId, contractCode: "C001", isOverdue: e.isOverdue, rollingSourceMonth: e.rollingSourceMonth, overdueAmount: 5000, status: e.isOverdue ? "overdue" : "normal" }); });
  return map;
}

// ─── 月份筛选基础 ───────────────────────────────────────

describe("月份筛选基础", () => {
  it("点击6月 → 只显示 plannedMonth=Jun", () => {
    const plans = [
      createPlan({ id: "p1", plannedMonth: "Jun", plannedYearMonth: "2026-06" }),
      createPlan({ id: "p2", plannedMonth: "May", plannedYearMonth: "2026-05", plannedDate: "2026-05-01" }),
      createPlan({ id: "p3", plannedMonth: undefined, plannedDate: "" }),
    ];
    const rows = buildContractRows(buildContractMap([createContract()]), buildPlanMap(plans), "Jun");
    expect(rows.length).toBe(1);
    expect(rows[0].plans.length).toBe(1);
    expect(rows[0].plans[0].id).toBe("p1");
  });

  it("点击5月 → 只显示 plannedMonth=May", () => {
    const plans = [
      createPlan({ id: "p1", plannedMonth: "Jun" }),
      createPlan({ id: "p2", plannedMonth: "May", plannedDate: "2026-05-01", plannedYearMonth: "2026-05" }),
    ];
    const rows = buildContractRows(buildContractMap([createContract()]), buildPlanMap(plans), "May");
    expect(rows.length).toBe(1);
    expect(rows[0].plans[0].id).toBe("p2");
  });
});

// ─── 滚动逾期在目标月份显示 ───────────────────────────────────────

describe("滚动逾期在目标月份显示", () => {
  it("5月逾期滚动到6月 → 点击6月能看到", () => {
    const plan = createPlan({ id: "p-d", plannedDate: "2026-05-01", plannedMonth: "May", plannedYearMonth: "2026-05", plannedAmount: 5000 });
    const rollingMap = buildRollingMap([{ yearMonth: "2026-06", contractId: "c1", planId: "p-d", rollingSourceMonth: "2026-05", isOverdue: true }]);
    const rows = buildContractRows(buildContractMap([createContract()]), buildPlanMap([plan]), "Jun", null, undefined, undefined, undefined, rollingMap);
    expect(rows.length).toBe(1);
    expect(rows[0].plans.map((p) => p.id)).toContain("p-d");
  });

  it("点击5月 → 只有原始计划（不含滚动）", () => {
    const plan = createPlan({ id: "p-d", plannedDate: "2026-05-01", plannedMonth: "May", plannedYearMonth: "2026-05", plannedAmount: 5000 });
    const rollingMap = buildRollingMap([
      { yearMonth: "2026-06", contractId: "c1", planId: "p-d", rollingSourceMonth: "2026-05", isOverdue: true },
      { yearMonth: "2026-07", contractId: "c1", planId: "p-d", rollingSourceMonth: "2026-05", isOverdue: true },
    ]);
    const rows = buildContractRows(buildContractMap([createContract()]), buildPlanMap([plan]), "May", null, undefined, undefined, undefined, rollingMap);
    expect(rows.length).toBe(1);
    expect(rows[0].plans[0].id).toBe("p-d");
  });

  it("点击7月 → 包含5月和6月滚动过来的", () => {
    const pMay = createPlan({ id: "p-may", plannedDate: "2026-05-01", plannedMonth: "May", plannedYearMonth: "2026-05", plannedAmount: 5000 });
    const pJun = createPlan({ id: "p-jun", plannedDate: "2026-06-04", plannedMonth: "Jun", plannedYearMonth: "2026-06", plannedAmount: 8475, actualAmount: 8000, actualDate: "2026-07-06", actualMonth: "Jul", actualYearMonth: "2026-07" });
    const rollingMap = buildRollingMap([
      { yearMonth: "2026-07", contractId: "c1", planId: "p-may", rollingSourceMonth: "2026-05", isOverdue: true },
      { yearMonth: "2026-07", contractId: "c1", planId: "p-jun", rollingSourceMonth: "2026-06", isOverdue: true },
    ]);
    const rows = buildContractRows(buildContractMap([createContract()]), buildPlanMap([pMay, pJun]), "Jul", null, undefined, undefined, undefined, rollingMap);
    expect(rows.length).toBe(1);
    const ids = rows[0].plans.map((p) => p.id);
    expect(ids).toContain("p-may");
    expect(ids).toContain("p-jun");
  });
});

// ─── hiddenSeries 图例过滤 ───────────────────────────────────────

describe("hiddenSeries 图例过滤", () => {
  it("隐藏逾期 → 原生合同仍显示", () => {
    const rollingMap = buildRollingMap([{ yearMonth: "2026-06", contractId: "c1", planId: "p1", rollingSourceMonth: null, isOverdue: false }]);
    const hidden: HiddenSeries = new Set(["rolledOverdue"]);
    const rows = buildContractRows(buildContractMap([createContract()]), buildPlanMap([createPlan()]), "Jun", null, undefined, undefined, undefined, rollingMap, undefined, hidden);
    expect(rows.length).toBe(1);
  });

  it("隐藏原生 → 只有原生的合同被过滤", () => {
    const rollingMap = buildRollingMap([{ yearMonth: "2026-06", contractId: "c1", planId: "p1", rollingSourceMonth: null, isOverdue: false }]);
    const hidden: HiddenSeries = new Set(["nativePlan"]);
    const rows = buildContractRows(buildContractMap([createContract()]), buildPlanMap([createPlan()]), "Jun", null, undefined, undefined, undefined, rollingMap, undefined, hidden);
    expect(rows.length).toBe(0);
  });

  it("两个都隐藏 → 全部过滤", () => {
    const rollingMap = buildRollingMap([{ yearMonth: "2026-06", contractId: "c1", planId: "p1", rollingSourceMonth: null, isOverdue: false }]);
    const hidden: HiddenSeries = new Set(["nativePlan", "rolledOverdue"]);
    const rows = buildContractRows(buildContractMap([createContract()]), buildPlanMap([createPlan()]), "Jun", null, undefined, undefined, undefined, rollingMap, undefined, hidden);
    expect(rows.length).toBe(0);
  });
});

// ─── 不同月份不同数据 ───────────────────────────────────────

describe("不同月份不同数据（真实场景）", () => {
  it("5月/6月/7月各自正确", () => {
    const planPrepay = createPlan({ id: "p-prepay", plannedDate: "2026-06-04", plannedMonth: "Jun", plannedYearMonth: "2026-06", plannedAmount: 8475, actualAmount: 8000, actualDate: "2026-07-06", actualMonth: "Jul", actualYearMonth: "2026-07" });
    const planDelivery = createPlan({ id: "p-delivery", plannedDate: "2026-05-01", plannedMonth: "May", plannedYearMonth: "2026-05", plannedAmount: 5000, actualAmount: 0, actualDate: "" });
    const contractMap = buildContractMap([createContract()]);
    const planMap = buildPlanMap([planPrepay, planDelivery]);
    const rollingMap = buildRollingMap([
      { yearMonth: "2026-05", contractId: "c1", planId: "p-delivery", rollingSourceMonth: null, isOverdue: false },
      { yearMonth: "2026-06", contractId: "c1", planId: "p-prepay", rollingSourceMonth: null, isOverdue: false },
      { yearMonth: "2026-06", contractId: "c1", planId: "p-delivery", rollingSourceMonth: "2026-05", isOverdue: true },
      { yearMonth: "2026-07", contractId: "c1", planId: "p-delivery", rollingSourceMonth: "2026-05", isOverdue: true },
      { yearMonth: "2026-07", contractId: "c1", planId: "p-prepay", rollingSourceMonth: "2026-06", isOverdue: true },
    ]);

    // 5月: 只有发货款
    const may = buildContractRows(contractMap, planMap, "May", null, undefined, undefined, undefined, rollingMap);
    expect(may[0].plans.map((p) => p.id)).toEqual(["p-delivery"]);

    // 6月: 预付款 + 发货款
    const jun = buildContractRows(contractMap, planMap, "Jun", null, undefined, undefined, undefined, rollingMap);
    expect(jun[0].plans.map((p) => p.id).sort()).toEqual(["p-delivery", "p-prepay"]);

    // 7月: 预付款(actualMonth=Jul) + 发货款(rollingMap)
    const jul = buildContractRows(contractMap, planMap, "Jul", null, undefined, undefined, undefined, rollingMap);
    expect(jul[0].plans.map((p) => p.id).sort()).toEqual(["p-delivery", "p-prepay"]);
  });
});
