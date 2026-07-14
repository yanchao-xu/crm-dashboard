import { describe, it, expect } from "vitest";
import {
  calculateCollectionHealthFromApi,
  type CollectionHealthDataPoint,
  type MonthlyRollingMap,
} from "@/components/charts/CollectionHealthChart/useCollectionHealthData";
import type { Contract, ReceivablePlan, OrgNode } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";

// ─── Mock 数据工厂 ───────────────────────────────────────

function createContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "contract-1",
    contractCode: "C001",
    contractName: "测试合同",
    customer: "客户A",
    owner: "张三",
    totalAmountWithTax: 100000,
    signingDate: "2026-01-15",
    expiryDate: "2026-12-31",
    ...overrides,
  };
}

function createPlan(overrides: Partial<ReceivablePlan> = {}): ReceivablePlan {
  return {
    id: "plan-1",
    parentDataId: "contract-1",
    actualAmount: 0,
    actualDate: "",
    plannedAmount: 50000,
    plannedDate: "2026-06-01",
    plannedMonth: "Jun",
    plannedYearMonth: "2026-06",
    paymentStage: "首款",
    paymentOwner: "张三",
    ...overrides,
  };
}

function createOrgNode(overrides: Partial<OrgNode> = {}): OrgNode {
  return {
    id: "org-1",
    name: { zh: "测试组织", en: "Test Org" },
    type: "company",
    theStartDateOfTheFiscalYear: "2026-01-01",
    theEndDateOfTheFiscalYear: "2026-12-31",
    ...overrides,
  };
}

function buildContractMap(contracts: Contract[]): ContractMap {
  const map: ContractMap = new Map();
  contracts.forEach((c) => {
    if (!map.has(c.contractCode)) map.set(c.contractCode, []);
    map.get(c.contractCode)!.push(c);
  });
  return map;
}

function buildReceivablePlanMap(plans: ReceivablePlan[]): ReceivablePlanMap {
  const map: ReceivablePlanMap = new Map();
  plans.forEach((p) => {
    if (!map.has(p.parentDataId)) map.set(p.parentDataId, []);
    map.get(p.parentDataId)!.push(p);
  });
  return map;
}

// ─── 逾期判定 ───────────────────────────────────────

describe("逾期判定", () => {
  const org = createOrgNode();

  it("未到期 → nativePlan，无滚动", () => {
    const contract = createContract();
    const plan = createPlan({ plannedDate: "2026-12-01", plannedYearMonth: "2026-12", plannedMonth: "Dec", plannedAmount: 30000 });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    const dec = chartData.find((d) => d.month === "Dec")!;
    expect(dec.nativePlan).toBe(30000);
    expect(dec.rolledOverdue).toBe(0);
    expect(dec.target).toBe(30000);
  });

  it("全额回款 → 无逾期无滚动", () => {
    const contract = createContract();
    const plan = createPlan({ plannedDate: "2026-03-01", plannedYearMonth: "2026-03", plannedMonth: "Mar", plannedAmount: 50000, actualAmount: 50000, actualDate: "2026-03-15", actualYearMonth: "2026-03", actualMonth: "Mar" });
    const { chartData, rollingMap } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.reduce((sum, d) => sum + d.rolledOverdue, 0)).toBe(0);
    expect(Array.from(rollingMap.values()).flat().filter((e) => e.rollingSourceMonth !== null).length).toBe(0);
  });

  it("逾期同月回款 → 不滚动", () => {
    const contract = createContract();
    const plan = createPlan({ plannedDate: "2026-06-01", plannedYearMonth: "2026-06", plannedMonth: "Jun", plannedAmount: 40000, actualAmount: 40000, actualDate: "2026-06-20", actualYearMonth: "2026-06", actualMonth: "Jun" });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.find((d) => d.month === "Jun")!.nativePlan).toBe(40000);
    expect(chartData.reduce((sum, d) => sum + d.rolledOverdue, 0)).toBe(0);
  });
});

// ─── 滚动机制 ───────────────────────────────────────

describe("滚动机制", () => {
  const org = createOrgNode();

  it("月底未回款 → 逐月展示滚动", () => {
    const contract = createContract();
    const plan = createPlan({ plannedDate: "2026-01-15", plannedYearMonth: "2026-01", plannedMonth: "Jan", plannedAmount: 20000, actualAmount: 0, actualDate: "" });
    const { chartData, rollingMap } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.find((d) => d.month === "Jan")!.nativePlan).toBe(20000);
    expect(chartData.filter((d) => d.rolledOverdue > 0).length).toBeGreaterThanOrEqual(1);
    const overdueEntries = Array.from(rollingMap.values()).flat().filter((e) => e.rollingSourceMonth === "2026-01");
    expect(overdueEntries.length).toBeGreaterThanOrEqual(1);
    expect(overdueEntries[0].overdueAmount).toBe(20000);
  });

  it("部分回款 → 仅滚动余额", () => {
    const contract = createContract();
    const plan = createPlan({ plannedDate: "2026-02-01", plannedYearMonth: "2026-02", plannedMonth: "Feb", plannedAmount: 100000, actualAmount: 60000, actualDate: "2026-03-15", actualYearMonth: "2026-03", actualMonth: "Mar" });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.find((d) => d.month === "Feb")!.nativePlan).toBe(100000);
    expect(chartData.filter((d) => d.rolledOverdue === 40000).length).toBeGreaterThanOrEqual(1);
  });

  it("多笔逾期累加", () => {
    const c1 = createContract({ id: "c1", contractCode: "C001" });
    const c2 = createContract({ id: "c2", contractCode: "C002" });
    const p1 = createPlan({ id: "p1", parentDataId: "c1", plannedDate: "2026-01-10", plannedYearMonth: "2026-01", plannedMonth: "Jan", plannedAmount: 10000 });
    const p2 = createPlan({ id: "p2", parentDataId: "c2", plannedDate: "2026-02-10", plannedYearMonth: "2026-02", plannedMonth: "Feb", plannedAmount: 25000 });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([c1, c2]), buildReceivablePlanMap([p1, p2]), org, null);
    const now = new Date();
    const abbrs = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const cur = chartData.find((d) => d.month === abbrs[now.getMonth()]);
    if (cur) expect(cur.rolledOverdue).toBe(35000);
  });

  it("全额回款 → 不滚动", () => {
    const contract = createContract();
    const plan = createPlan({ plannedDate: "2026-01-15", plannedYearMonth: "2026-01", plannedMonth: "Jan", plannedAmount: 50000, actualAmount: 50000, actualDate: "2026-01-20", actualYearMonth: "2026-01", actualMonth: "Jan" });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.reduce((sum, d) => sum + d.rolledOverdue, 0)).toBe(0);
  });
});

// ─── 数据一致性 ───────────────────────────────────────

describe("数据一致性", () => {
  const org = createOrgNode();

  it("target = nativePlan + rolledOverdue", () => {
    const contract = createContract();
    const plans = [
      createPlan({ id: "p1", plannedDate: "2026-01-01", plannedYearMonth: "2026-01", plannedMonth: "Jan", plannedAmount: 30000 }),
      createPlan({ id: "p2", plannedDate: "2026-06-01", plannedYearMonth: "2026-06", plannedMonth: "Jun", plannedAmount: 50000 }),
    ];
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap(plans), org, null);
    chartData.forEach((d) => expect(d.target).toBe(d.nativePlan + d.rolledOverdue));
  });

  it("actual 按 actualYearMonth 归类", () => {
    const contract = createContract();
    const plan = createPlan({ plannedDate: "2026-04-01", plannedYearMonth: "2026-04", plannedMonth: "Apr", plannedAmount: 80000, actualAmount: 50000, actualDate: "2026-05-10", actualYearMonth: "2026-05", actualMonth: "May" });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.find((d) => d.month === "May")!.actual).toBe(50000);
    expect(chartData.find((d) => d.month === "Apr")!.actual).toBe(0);
  });

  it("空数据 → 12个月全零", () => {
    const { chartData } = calculateCollectionHealthFromApi(new Map(), new Map(), org, null);
    expect(chartData.length).toBe(12);
    chartData.forEach((d) => { expect(d.nativePlan).toBe(0); expect(d.rolledOverdue).toBe(0); expect(d.target).toBe(0); expect(d.actual).toBe(0); });
  });

  it("无效 plannedDate → 不参与计算", () => {
    const contract = createContract();
    const plan = createPlan({ plannedDate: "", plannedYearMonth: undefined, plannedMonth: undefined, plannedAmount: 50000 });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.reduce((sum, d) => sum + d.nativePlan, 0)).toBe(0);
    expect(chartData.reduce((sum, d) => sum + d.rolledOverdue, 0)).toBe(0);
  });

  it("白名单过滤", () => {
    const c1 = createContract({ id: "c1", contractCode: "C001" });
    const c2 = createContract({ id: "c2", contractCode: "C002" });
    const p1 = createPlan({ id: "p1", parentDataId: "c1", plannedDate: "2026-06-01", plannedYearMonth: "2026-06", plannedAmount: 10000 });
    const p2 = createPlan({ id: "p2", parentDataId: "c2", plannedDate: "2026-06-01", plannedYearMonth: "2026-06", plannedAmount: 20000 });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([c1, c2]), buildReceivablePlanMap([p1, p2]), org, null, undefined, new Set(["C001"]));
    expect(chartData.find((d) => d.month === "Jun")!.nativePlan).toBe(10000);
  });
});

// ─── 财年 & 真实场景 ───────────────────────────────────────

describe("财年适配", () => {
  it("非自然年财年正确排列", () => {
    const org = createOrgNode({ theStartDateOfTheFiscalYear: "2026-04-01", theEndDateOfTheFiscalYear: "2027-03-31" });
    const contract = createContract();
    const plan = createPlan({ plannedDate: "2026-04-15", plannedYearMonth: "2026-04", plannedMonth: "Apr", plannedAmount: 60000 });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData[0].month).toBe("Apr");
    expect(chartData[11].month).toBe("Mar");
    expect(chartData[0].nativePlan).toBe(60000);
  });
});

describe("真实场景复现", () => {
  const org = createOrgNode();

  it("5月逾期 → 6月和7月都有滚动", () => {
    const contract = createContract({ id: "c1", contractCode: "C001" });
    const plan = createPlan({ id: "p-d", parentDataId: "c1", plannedDate: "2026-05-01", plannedYearMonth: "2026-05", plannedMonth: "May", plannedAmount: 8475, actualAmount: 0, actualDate: "" });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.find((d) => d.month === "May")!.nativePlan).toBe(8475);
    expect(chartData.find((d) => d.month === "Jun")!.rolledOverdue).toBe(8475);
    expect(chartData.find((d) => d.month === "Jul")!.rolledOverdue).toBe(8475);
  });

  it("6月逾期+部分回款 → 7月滚动余额475", () => {
    const contract = createContract({ id: "c1", contractCode: "C001" });
    const plan = createPlan({ id: "p-p", parentDataId: "c1", plannedDate: "2026-06-04", plannedYearMonth: "2026-06", plannedMonth: "Jun", plannedAmount: 8475, actualAmount: 8000, actualDate: "2026-07-06", actualYearMonth: "2026-07", actualMonth: "Jul" });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([plan]), org, null);
    expect(chartData.find((d) => d.month === "Jun")!.nativePlan).toBe(8475);
    expect(chartData.find((d) => d.month === "Jul")!.rolledOverdue).toBe(475);
  });

  it("两笔合并: 6月 rolledOverdue=8475, 7月 rolledOverdue=8950", () => {
    const contract = createContract({ id: "c1", contractCode: "C001" });
    const p1 = createPlan({ id: "p1", parentDataId: "c1", plannedDate: "2026-06-04", plannedYearMonth: "2026-06", plannedMonth: "Jun", plannedAmount: 8475, actualAmount: 8000, actualDate: "2026-07-06", actualYearMonth: "2026-07", actualMonth: "Jul" });
    const p2 = createPlan({ id: "p2", parentDataId: "c1", plannedDate: "2026-05-01", plannedYearMonth: "2026-05", plannedMonth: "May", plannedAmount: 8475, actualAmount: 0, actualDate: "" });
    const { chartData } = calculateCollectionHealthFromApi(buildContractMap([contract]), buildReceivablePlanMap([p1, p2]), org, null);
    expect(chartData.find((d) => d.month === "Jun")!.rolledOverdue).toBe(8475);
    expect(chartData.find((d) => d.month === "Jul")!.rolledOverdue).toBe(8475 + 475);
  });
});
