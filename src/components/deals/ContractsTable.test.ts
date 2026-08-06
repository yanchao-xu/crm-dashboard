import { describe, it, expect } from "vitest";
import { buildContractRows } from "./ContractsTable";
import type { Contract, ReceivablePlan } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";
import type { MonthlyRollingMap } from "@/components/charts/CollectionHealthChart/useCollectionHealthData";
import type { HiddenSeries } from "@/components/charts/CollectionHealthChart";

// ─── Mock 数据工厂 ───────────────────────────────────────

function createContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "c1",
    contractCode: "C001",
    contractName: "测试合同",
    customer: "客户A",
    owner: "张三",
    totalAmountWithTax: 28250,
    signingDate: "2026-07-16",
    expiryDate: "2026-08-31",
    ...overrides,
  };
}

function createPlan(overrides: Partial<ReceivablePlan> = {}): ReceivablePlan {
  return {
    id: "p1",
    parentDataId: "c1",
    actualAmount: 0,
    actualDate: "",
    plannedAmount: 8475,
    plannedDate: "2026-06-04",
    plannedMonth: "Jun",
    plannedYearMonth: "2026-06",
    paymentStage: "预付款(30%)",
    paymentOwner: "胡剑飞",
    ...overrides,
  };
}

function buildContractMap(contracts: Contract[]): ContractMap {
  const map: ContractMap = new Map();
  contracts.forEach((c) => {
    const code = c.contractCode;
    if (!map.has(code)) map.set(code, []);
    map.get(code)!.push(c);
  });
  return map;
}

function buildPlanMap(plans: ReceivablePlan[]): ReceivablePlanMap {
  const map: ReceivablePlanMap = new Map();
  plans.forEach((p) => {
    const key = p.parentDataId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  });
  return map;
}

function buildRollingMap(entries: Array<{
  yearMonth: string;
  contractId: string;
  planId: string;
  rollingSourceMonth: string | null;
  isOverdue: boolean;
}>): MonthlyRollingMap {
  const map: MonthlyRollingMap = new Map();
  entries.forEach((e) => {
    if (!map.has(e.yearMonth)) map.set(e.yearMonth, []);
    map.get(e.yearMonth)!.push({
      contractId: e.contractId,
      planId: e.planId,
      contractCode: "C001",
      isOverdue: e.isOverdue,
      rollingSourceMonth: e.rollingSourceMonth,
      overdueAmount: 5000,
      status: e.isOverdue ? "overdue" : "normal",
    });
  });
  return map;
}

// ─── 测试用例 ───────────────────────────────────────

describe("buildContractRows - 月份筛选基础", () => {
  it("点击6月 → 只显示 plannedMonth=Jun 的应收计划", () => {
    const contract = createContract();
    const plans = [
      createPlan({ id: "p1", plannedMonth: "Jun", plannedYearMonth: "2026-06" }),
      createPlan({ id: "p2", plannedMonth: "May", plannedYearMonth: "2026-05", plannedDate: "2026-05-01" }),
      createPlan({ id: "p3", plannedMonth: undefined, plannedDate: "" }),
    ];

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap(plans);

    const rows = buildContractRows(contractMap, planMap, "Jun");
    expect(rows.length).toBe(1);
    expect(rows[0].plans.length).toBe(1);
    expect(rows[0].plans[0].id).toBe("p1");
  });

  it("点击5月 → 只显示 plannedMonth=May 的应收计划", () => {
    const contract = createContract();
    const plans = [
      createPlan({ id: "p1", plannedMonth: "Jun" }),
      createPlan({ id: "p2", plannedMonth: "May", plannedDate: "2026-05-01", plannedYearMonth: "2026-05" }),
    ];

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap(plans);

    const rows = buildContractRows(contractMap, planMap, "May");
    expect(rows.length).toBe(1);
    expect(rows[0].plans.length).toBe(1);
    expect(rows[0].plans[0].id).toBe("p2");
  });
});

describe("buildContractRows - 滚动逾期应收计划在目标月份显示", () => {
  it("5月逾期滚动到6月 → 点击6月时能看到5月的逾期应收计划", () => {
    const contract = createContract();
    // 发货款: 计划5月，未回款
    const plan = createPlan({
      id: "p-delivery",
      plannedDate: "2026-05-01",
      plannedMonth: "May",
      plannedYearMonth: "2026-05",
      plannedAmount: 5000,
      actualAmount: 0,
      paymentStage: "发货款(30%)",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    // rollingMap 标记这笔计划滚动到了6月
    const rollingMap = buildRollingMap([
      { yearMonth: "2026-06", contractId: "c1", planId: "p-delivery", rollingSourceMonth: "2026-05", isOverdue: true },
    ]);

    const rows = buildContractRows(contractMap, planMap, "Jun", null, undefined, undefined, undefined, rollingMap);
    expect(rows.length).toBe(1);
    // 应该包含发货款（通过 rollingMap 匹配进来）
    const planIds = rows[0].plans.map((p) => p.id);
    expect(planIds).toContain("p-delivery");
  });

  it("5月逾期滚动到6月和7月 → 点击5月时不显示滚动数据（只有原始计划）", () => {
    const contract = createContract();
    const plan = createPlan({
      id: "p-delivery",
      plannedDate: "2026-05-01",
      plannedMonth: "May",
      plannedYearMonth: "2026-05",
      plannedAmount: 5000,
      actualAmount: 0,
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    // rollingMap: 滚动到6月和7月，但不在5月
    const rollingMap = buildRollingMap([
      { yearMonth: "2026-06", contractId: "c1", planId: "p-delivery", rollingSourceMonth: "2026-05", isOverdue: true },
      { yearMonth: "2026-07", contractId: "c1", planId: "p-delivery", rollingSourceMonth: "2026-05", isOverdue: true },
    ]);

    // 点击5月: 发货款的 plannedMonth=May 匹配
    const rows = buildContractRows(contractMap, planMap, "May", null, undefined, undefined, undefined, rollingMap);
    expect(rows.length).toBe(1);
    expect(rows[0].plans[0].id).toBe("p-delivery");
  });

  it("点击7月 → 包含从5月和6月分别滚动过来的应收计划", () => {
    const contract = createContract();
    const planMay = createPlan({
      id: "p-may",
      plannedDate: "2026-05-01",
      plannedMonth: "May",
      plannedYearMonth: "2026-05",
      plannedAmount: 5000,
      actualAmount: 0,
    });
    const planJun = createPlan({
      id: "p-jun",
      plannedDate: "2026-06-04",
      plannedMonth: "Jun",
      plannedYearMonth: "2026-06",
      plannedAmount: 8475,
      actualAmount: 8000,
      actualDate: "2026-07-06",
      actualMonth: "Jul",
      actualYearMonth: "2026-07",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([planMay, planJun]);

    const rollingMap = buildRollingMap([
      { yearMonth: "2026-07", contractId: "c1", planId: "p-may", rollingSourceMonth: "2026-05", isOverdue: true },
      { yearMonth: "2026-07", contractId: "c1", planId: "p-jun", rollingSourceMonth: "2026-06", isOverdue: true },
    ]);

    const rows = buildContractRows(contractMap, planMap, "Jul", null, undefined, undefined, undefined, rollingMap);
    expect(rows.length).toBe(1);
    const planIds = rows[0].plans.map((p) => p.id);
    // 7月: planJun 通过 actualMonth=Jul 匹配，planMay 通过 rollingMap 匹配
    expect(planIds).toContain("p-may");
    expect(planIds).toContain("p-jun");
  });
});

describe("buildContractRows - hiddenSeries 图例过滤", () => {
  it("隐藏滚动逾期 → 只有原生计划的合同仍显示", () => {
    const contract = createContract();
    const plan = createPlan({
      id: "p1",
      plannedMonth: "Jun",
      plannedYearMonth: "2026-06",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    // rollingMap: p1 在6月是原生计划（rollingSourceMonth=null）
    const rollingMap = buildRollingMap([
      { yearMonth: "2026-06", contractId: "c1", planId: "p1", rollingSourceMonth: null, isOverdue: false },
    ]);

    const hidden: HiddenSeries = new Set(["rolledOverdue"]);
    const rows = buildContractRows(contractMap, planMap, "Jun", null, undefined, undefined, undefined, rollingMap, undefined, hidden);
    // 合同只有原生计划，隐藏逾期不影响它
    expect(rows.length).toBe(1);
  });

  it("隐藏原生计划 → 只有滚动逾期的合同仍显示", () => {
    const contract = createContract();
    const plan = createPlan({
      id: "p-delivery",
      plannedMonth: "May",
      plannedYearMonth: "2026-05",
      plannedDate: "2026-05-01",
      plannedAmount: 5000,
      actualAmount: 0,
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    // rollingMap: p-delivery 在6月是滚动逾期（从5月来）
    const rollingMap = buildRollingMap([
      { yearMonth: "2026-06", contractId: "c1", planId: "p-delivery", rollingSourceMonth: "2026-05", isOverdue: true },
    ]);

    const hidden: HiddenSeries = new Set(["nativePlan"]);
    const rows = buildContractRows(contractMap, planMap, "Jun", null, undefined, undefined, undefined, rollingMap, undefined, hidden);
    // 合同只有滚动逾期数据，隐藏原生计划不影响
    expect(rows.length).toBe(1);
  });

  it("隐藏原生计划 → 只有原生计划的合同被过滤掉", () => {
    const contract = createContract();
    const plan = createPlan({
      id: "p1",
      plannedMonth: "Jun",
      plannedYearMonth: "2026-06",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    // rollingMap: p1 在6月只有原生计划
    const rollingMap = buildRollingMap([
      { yearMonth: "2026-06", contractId: "c1", planId: "p1", rollingSourceMonth: null, isOverdue: false },
    ]);

    const hidden: HiddenSeries = new Set(["nativePlan"]);
    const rows = buildContractRows(contractMap, planMap, "Jun", null, undefined, undefined, undefined, rollingMap, undefined, hidden);
    // 合同只有原生计划，被隐藏了
    expect(rows.length).toBe(0);
  });

  it("两个都隐藏 → 所有合同被过滤掉", () => {
    const contract = createContract();
    const plan = createPlan({ id: "p1", plannedMonth: "Jun" });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    const rollingMap = buildRollingMap([
      { yearMonth: "2026-06", contractId: "c1", planId: "p1", rollingSourceMonth: null, isOverdue: false },
    ]);

    const hidden: HiddenSeries = new Set(["nativePlan", "rolledOverdue"]);
    const rows = buildContractRows(contractMap, planMap, "Jun", null, undefined, undefined, undefined, rollingMap, undefined, hidden);
    expect(rows.length).toBe(0);
  });
});

describe("buildContractRows - 不同月份显示不同数据", () => {
  it("模拟真实场景：5月、6月、7月各自显示正确的应收计划", () => {
    const contract = createContract();

    // 预付款: 计划6/4，7/6收到8000
    const planPrepay = createPlan({
      id: "p-prepay",
      plannedDate: "2026-06-04",
      plannedMonth: "Jun",
      plannedYearMonth: "2026-06",
      plannedAmount: 8475,
      actualAmount: 8000,
      actualDate: "2026-07-06",
      actualMonth: "Jul",
      actualYearMonth: "2026-07",
      paymentStage: "预付款(30%)",
    });

    // 发货款: 计划5/1，未回款
    const planDelivery = createPlan({
      id: "p-delivery",
      plannedDate: "2026-05-01",
      plannedMonth: "May",
      plannedYearMonth: "2026-05",
      plannedAmount: 5000,
      actualAmount: 0,
      actualDate: "",
      paymentStage: "发货款(30%)",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([planPrepay, planDelivery]);

    // rollingMap: 发货款滚动到6月和7月，预付款余额滚动到7月
    const rollingMap = buildRollingMap([
      // 5月: 发货款是原生计划
      { yearMonth: "2026-05", contractId: "c1", planId: "p-delivery", rollingSourceMonth: null, isOverdue: false },
      // 6月: 预付款是原生计划，发货款从5月滚入
      { yearMonth: "2026-06", contractId: "c1", planId: "p-prepay", rollingSourceMonth: null, isOverdue: false },
      { yearMonth: "2026-06", contractId: "c1", planId: "p-delivery", rollingSourceMonth: "2026-05", isOverdue: true },
      // 7月: 发货款继续从5月滚入，预付款余额从6月滚入
      { yearMonth: "2026-07", contractId: "c1", planId: "p-delivery", rollingSourceMonth: "2026-05", isOverdue: true },
      { yearMonth: "2026-07", contractId: "c1", planId: "p-prepay", rollingSourceMonth: "2026-06", isOverdue: true },
    ]);

    // 点击5月: 只有发货款（plannedMonth=May）
    const rowsMay = buildContractRows(contractMap, planMap, "May", null, undefined, undefined, undefined, rollingMap);
    expect(rowsMay.length).toBe(1);
    expect(rowsMay[0].plans.map((p) => p.id)).toEqual(["p-delivery"]);

    // 点击6月: 预付款（plannedMonth=Jun）+ 发货款（rollingMap 6月有记录）
    const rowsJun = buildContractRows(contractMap, planMap, "Jun", null, undefined, undefined, undefined, rollingMap);
    expect(rowsJun.length).toBe(1);
    const junPlanIds = rowsJun[0].plans.map((p) => p.id).sort();
    expect(junPlanIds).toEqual(["p-delivery", "p-prepay"]);

    // 点击7月: 预付款（actualMonth=Jul）+ 发货款（rollingMap 7月有记录）
    const rowsJul = buildContractRows(contractMap, planMap, "Jul", null, undefined, undefined, undefined, rollingMap);
    expect(rowsJul.length).toBe(1);
    const julPlanIds = rowsJul[0].plans.map((p) => p.id).sort();
    expect(julPlanIds).toEqual(["p-delivery", "p-prepay"]);
  });
});
