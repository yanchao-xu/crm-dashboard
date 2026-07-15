import { describe, it, expect } from "vitest";
import { computeFiscalRange } from "@/hooks/useApiData";
import {
  getFiscalYearMonths,
  calculateStackedHealthData,
  calculateContractHealthData,
  calculateReceivableHealthData,
} from "@/utils/orgFilter";
import { calculateCollectionHealthFromApi } from "@/components/charts/CollectionHealthChart/useCollectionHealthData";
import type { OrgNode, Deal, Contract, ReceivablePlan } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";

// ─── Mock 数据工厂 ───────────────────────────────────────

function createOrgNode(overrides: Partial<OrgNode> = {}): OrgNode {
  return {
    id: "org-1",
    name: { zh: "测试组织", en: "Test Org" },
    type: "company",
    theStartDateOfTheFiscalYear: "2026-04-01",
    theEndDateOfTheFiscalYear: "2027-03-31",
    janJanuary: 10000,
    febFebruary: 10000,
    marMarch: 10000,
    aprApril: 20000,
    mayMay: 20000,
    junJune: 20000,
    julJuly: 20000,
    augAugust: 20000,
    sepSeptember: 20000,
    octOctober: 20000,
    novNovember: 20000,
    decDecember: 20000,
    ...overrides,
  };
}

function createDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "deal-1",
    name: { zh: "商机1", en: "Deal 1" },
    company: { zh: "客户A", en: "Customer A" },
    value: 50000,
    stage: "negotiation",
    lastActivityDays: 5,
    probability: 60,
    owner: "张三",
    createdMonth: "Apr",
    createdYearMonth: "2024-04",
    ...overrides,
  };
}

function createContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "c1",
    contractCode: "C001",
    contractName: "合同1",
    customer: "客户A",
    owner: "张三",
    totalAmountWithTax: 100000,
    signingDate: "2024-04-15",
    expiryDate: "2025-03-31",
    signingMonth: "Apr",
    signingYearMonth: "2024-04",
    ...overrides,
  };
}

function createPlan(overrides: Partial<ReceivablePlan> = {}): ReceivablePlan {
  return {
    id: "p1",
    parentDataId: "c1",
    actualAmount: 0,
    actualDate: "",
    plannedAmount: 50000,
    plannedDate: "2024-06-01",
    plannedMonth: "Jun",
    plannedYearMonth: "2024-06",
    paymentStage: "首款",
    paymentOwner: "张三",
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

// ─── computeFiscalRange 测试 ───────────────────────────────────────

describe("computeFiscalRange", () => {
  it("自然年财年（1月~12月）+ selectedYear=2024", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-01-01",
      theEndDateOfTheFiscalYear: "2026-12-31",
    });
    const result = computeFiscalRange(org, 2024);
    expect(result.dateFrom).toBe("2024-01-01");
    expect(result.dateTo).toBe("2024-12-31");
  });

  it("跨年财年（4月~次年3月）+ selectedYear=2024", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const result = computeFiscalRange(org, 2024);
    expect(result.dateFrom).toBe("2024-04-01");
    expect(result.dateTo).toBe("2025-03-31");
  });

  it("跨年财年 + selectedYear=2030", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const result = computeFiscalRange(org, 2030);
    expect(result.dateFrom).toBe("2030-04-01");
    expect(result.dateTo).toBe("2031-03-31");
  });

  it("仅有开始日期 + selectedYear=2024", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-07-01",
      theEndDateOfTheFiscalYear: undefined,
    });
    const result = computeFiscalRange(org, 2024);
    expect(result.dateFrom).toBe("2024-07-01");
    // 开始 + 12 个月 - 1 天 = 2025-06-30
    expect(result.dateTo).toBe("2025-06-30");
  });

  it("仅有结束日期 + selectedYear=2025", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: undefined,
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const result = computeFiscalRange(org, 2025);
    // 结束月=3(Mar), 开始月=(3-11+12)%12=4(Apr)，开始>结束 → 跨年
    expect(result.dateFrom).toBe("2025-04-01");
    expect(result.dateTo).toBe("2026-03-31");
  });

  it("都没有配置 → fallback 到 selectedYear 自然年", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: undefined,
      theEndDateOfTheFiscalYear: undefined,
    });
    const result = computeFiscalRange(org, 2020);
    expect(result.dateFrom).toBe("2020-01-01");
    expect(result.dateTo).toBe("2020-12-31");
  });

  it("虚拟根节点（从第一个子节点获取财年）", () => {
    const org: OrgNode = {
      id: "root",
      name: { zh: "组织", en: "Organization" },
      type: "company",
      children: [
        createOrgNode({
          id: "child-1",
          theStartDateOfTheFiscalYear: "2026-04-01",
          theEndDateOfTheFiscalYear: "2027-03-31",
        }),
      ],
    };
    const result = computeFiscalRange(org, 2023);
    expect(result.dateFrom).toBe("2023-04-01");
    expect(result.dateTo).toBe("2024-03-31");
  });

  it("selectedYear 在远未来（2036）正常计算", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const result = computeFiscalRange(org, 2036);
    expect(result.dateFrom).toBe("2036-04-01");
    expect(result.dateTo).toBe("2037-03-31");
  });

  it("selectedYear 在远过去（1996）正常计算", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-01-01",
      theEndDateOfTheFiscalYear: "2026-12-31",
    });
    const result = computeFiscalRange(org, 1996);
    expect(result.dateFrom).toBe("1996-01-01");
    expect(result.dateTo).toBe("1996-12-31");
  });
});

// ─── getFiscalYearMonths + selectedYear 测试 ───────────────────────────────────────

describe("getFiscalYearMonths with selectedYear", () => {
  it("自然年 + selectedYear=2024 → yearMonth 使用 2024", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-01-01",
      theEndDateOfTheFiscalYear: "2026-12-31",
    });
    const months = getFiscalYearMonths(org, 2024);
    expect(months[0]).toEqual({ label: "Jan", yearMonth: "2024-01" });
    expect(months[11]).toEqual({ label: "Dec", yearMonth: "2024-12" });
  });

  it("跨年财年（4月~次年3月）+ selectedYear=2024", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const months = getFiscalYearMonths(org, 2024);
    expect(months[0]).toEqual({ label: "Apr", yearMonth: "2024-04" });
    expect(months[8]).toEqual({ label: "Dec", yearMonth: "2024-12" });
    expect(months[9]).toEqual({ label: "Jan", yearMonth: "2025-01" });
    expect(months[11]).toEqual({ label: "Mar", yearMonth: "2025-03" });
  });

  it("无财年配置 + selectedYear=2020 → 使用 2020 自然年", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: undefined,
      theEndDateOfTheFiscalYear: undefined,
    });
    const months = getFiscalYearMonths(org, 2020);
    expect(months[0]).toEqual({ label: "Jan", yearMonth: "2020-01" });
    expect(months[11]).toEqual({ label: "Dec", yearMonth: "2020-12" });
  });

  it("无 selectedYear → 使用配置中的年份（向后兼容）", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const months = getFiscalYearMonths(org);
    expect(months[0]).toEqual({ label: "Apr", yearMonth: "2026-04" });
    expect(months[11]).toEqual({ label: "Mar", yearMonth: "2027-03" });
  });

  it("月份标签顺序不受 selectedYear 影响", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-07-01",
      theEndDateOfTheFiscalYear: "2027-06-30",
    });
    const months = getFiscalYearMonths(org, 2025);
    const labels = months.map((m) => m.label);
    expect(labels).toEqual(["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
    expect(months[0].yearMonth).toBe("2025-07");
    expect(months[6].yearMonth).toBe("2026-01");
    expect(months[11].yearMonth).toBe("2026-06");
  });

  it("12 个月数量始终正确", () => {
    const org = createOrgNode();
    const months = getFiscalYearMonths(org, 2000);
    expect(months.length).toBe(12);
  });
});

// ─── calculateStackedHealthData + selectedYear 测试 ───────────────────────────────────────

describe("calculateStackedHealthData with selectedYear", () => {
  const stages = [
    { code: "negotiation", name: "谈判" },
    { code: "proposal", name: "方案" },
  ];

  it("商机按 selectedYear 对应的 yearMonth 正确归入图表", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const deals: Deal[] = [
      createDeal({ createdYearMonth: "2024-04", stage: "negotiation", value: 30000 }),
      createDeal({ id: "d2", createdYearMonth: "2024-05", stage: "proposal", value: 20000 }),
      createDeal({ id: "d3", createdYearMonth: "2025-01", stage: "negotiation", value: 10000 }),
    ];

    const result = calculateStackedHealthData(deals, org, stages, "expectedAmount", null, undefined, 2024);

    // 应该返回 12 个月的数据点，从 Apr 开始
    expect(result.length).toBe(12);
    expect(result[0].month).toBe("Apr");
    expect(result[11].month).toBe("Mar");

    // Apr 应该有 negotiation=30000
    expect(result[0]["negotiation"]).toBe(30000);
    // May 应该有 proposal=20000
    expect(result[1]["proposal"]).toBe(20000);
    // Jan (index 9) 应该有 negotiation=10000
    expect(result[9]["negotiation"]).toBe(10000);
  });

  it("不在 selectedYear 范围内的商机不会出现在图表中", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-01-01",
      theEndDateOfTheFiscalYear: "2026-12-31",
    });
    const deals: Deal[] = [
      createDeal({ createdYearMonth: "2024-06", stage: "negotiation", value: 50000 }),
      createDeal({ id: "d2", createdYearMonth: "2025-06", stage: "negotiation", value: 30000 }),
    ];

    // selectedYear=2024，只有 2024-06 匹配
    const result = calculateStackedHealthData(deals, org, stages, "expectedAmount", null, undefined, 2024);
    const junData = result.find((d) => d.month === "Jun");
    expect(junData!["negotiation"]).toBe(50000);

    // 2025-06 的数据不会出现在 2024 年图表的 Jun 里
    // （因为 yearMonth 精确匹配 "2024-06"，不是 "2025-06"）
    const totalNeg = result.reduce((sum, d) => sum + ((d["negotiation"] as number) || 0), 0);
    expect(totalNeg).toBe(50000);
  });

  it("target 始终来自组织配置，不受 selectedYear 影响", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
      aprApril: 50000,
    });

    const result = calculateStackedHealthData([], org, stages, "expectedAmount", null, undefined, 2024);
    // Apr 的 target 应为 50000
    expect(result[0].target).toBe(50000);
  });
});

// ─── calculateContractHealthData + selectedYear 测试 ───────────────────────────────────────

describe("calculateContractHealthData with selectedYear", () => {
  const stages = [{ code: "negotiation", name: "谈判" }];

  it("合同按 signingYearMonth 归入 selectedYear 图表", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const deals: Deal[] = [
      createDeal({ contractNumber: "C001", createdYearMonth: "2024-04", stage: "negotiation" }),
    ];
    const contracts = [createContract({ signingYearMonth: "2024-05" })];
    const contractMap = buildContractMap(contracts);

    const result = calculateContractHealthData(
      deals, org, stages, contractMap, null, undefined, 2024
    );
    // 合同 signingYearMonth=2024-05，应归入 May
    const may = result.find((d) => d.month === "May");
    expect(may!["negotiation"]).toBe(100000);
  });
});

// ─── calculateReceivableHealthData + selectedYear 测试 ───────────────────────────────────────

describe("calculateReceivableHealthData with selectedYear", () => {
  const stages = [{ code: "negotiation", name: "谈判" }];

  it("应收计划按 actualYearMonth 归入 selectedYear 图表", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const deals: Deal[] = [
      createDeal({ contractNumber: "C001", createdYearMonth: "2024-04", stage: "negotiation" }),
    ];
    const contracts = [createContract()];
    const plans = [createPlan({
      parentDataId: "c1",
      actualAmount: 30000,
      actualDate: "2024-07-10",
      actualYearMonth: "2024-07",
    })];
    const contractMap = buildContractMap(contracts);
    const planMap = buildReceivablePlanMap(plans);

    const result = calculateReceivableHealthData(
      deals, org, stages, contractMap, planMap, null, undefined, 2024
    );
    // actualYearMonth=2024-07 → Jul
    const jul = result.find((d) => d.month === "Jul");
    expect(jul!["negotiation"]).toBe(30000);
  });
});

// ─── calculateCollectionHealthFromApi + selectedYear 测试 ───────────────────────────────────────

describe("calculateCollectionHealthFromApi with selectedYear", () => {
  it("使用 selectedYear 确定月份范围", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });
    const contracts = [createContract()];
    const plans = [createPlan({
      plannedDate: "2024-06-01",
      plannedYearMonth: "2024-06",
      plannedMonth: "Jun",
      plannedAmount: 40000,
    })];
    const contractMap = buildContractMap(contracts);
    const planMap = buildReceivablePlanMap(plans);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, undefined, 2024
    );

    // 图表从 Apr 开始（跨年财年）
    expect(chartData[0].month).toBe("Apr");
    expect(chartData[11].month).toBe("Mar");
    // Jun 有原生计划 40000
    const jun = chartData.find((d) => d.month === "Jun");
    expect(jun!.nativePlan).toBe(40000);
  });

  it("selectedYear 不同 → 数据不会跨年错位", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-01-01",
      theEndDateOfTheFiscalYear: "2026-12-31",
    });
    const contracts = [createContract()];
    const plans = [createPlan({
      plannedDate: "2024-06-01",
      plannedYearMonth: "2024-06",
      plannedMonth: "Jun",
      plannedAmount: 60000,
    })];
    const contractMap = buildContractMap(contracts);
    const planMap = buildReceivablePlanMap(plans);

    // selectedYear=2025 → 月份范围 2025-01~2025-12
    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, undefined, 2025
    );
    // 2024-06 的数据不应该出现在 2025 年图表的 Jun 中
    const jun = chartData.find((d) => d.month === "Jun");
    expect(jun!.nativePlan).toBe(0);
  });

  it("向后兼容：不传 selectedYear 使用配置中的年份", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-01-01",
      theEndDateOfTheFiscalYear: "2026-12-31",
    });
    const contracts = [createContract()];
    const plans = [createPlan({
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedMonth: "Jun",
      plannedAmount: 70000,
    })];
    const contractMap = buildContractMap(contracts);
    const planMap = buildReceivablePlanMap(plans);

    // 不传 selectedYear → 使用 org 中的 2026
    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );
    const jun = chartData.find((d) => d.month === "Jun");
    expect(jun!.nativePlan).toBe(70000);
  });
});
