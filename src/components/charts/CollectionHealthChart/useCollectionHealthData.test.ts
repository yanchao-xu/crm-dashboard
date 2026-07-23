import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateCollectionHealthFromApi,
  type CollectionHealthDataPoint,
  type MonthlyRollingMap,
} from "./useCollectionHealthData";
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
    const code = c.contractCode;
    if (!map.has(code)) map.set(code, []);
    map.get(code)!.push(c);
  });
  return map;
}

function buildReceivablePlanMap(plans: ReceivablePlan[]): ReceivablePlanMap {
  const map: ReceivablePlanMap = new Map();
  plans.forEach((p) => {
    const key = p.parentDataId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  });
  return map;
}

// ─── 测试用例 ───────────────────────────────────────

describe("calculateCollectionHealthFromApi - 逾期判定", () => {
  const org = createOrgNode();

  it("未到期的应收计划应归入 nativePlan，不产生 rolledOverdue", () => {
    // 计划日期在未来
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-12-01",
      plannedYearMonth: "2026-12",
      plannedMonth: "Dec",
      plannedAmount: 30000,
      actualAmount: 0,
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    const dec = chartData.find((d) => d.month === "Dec")!;
    expect(dec.nativePlan).toBe(30000);
    expect(dec.rolledOverdue).toBe(0);
    expect(dec.target).toBe(30000);
  });

  it("已全额回款的应收计划不产生逾期或滚动", () => {
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-03-01",
      plannedYearMonth: "2026-03",
      plannedMonth: "Mar",
      plannedAmount: 50000,
      actualAmount: 50000,
      actualDate: "2026-03-15",
      actualYearMonth: "2026-03",
      actualMonth: "Mar",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData, rollingMap } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 没有滚动逾期
    const totalRolled = chartData.reduce((sum, d) => sum + d.rolledOverdue, 0);
    expect(totalRolled).toBe(0);

    // rollingMap 中没有逾期合同
    const allRollingEntries = Array.from(rollingMap.values()).flat();
    const overdueEntries = allRollingEntries.filter((e) => e.rollingSourceMonth !== null);
    expect(overdueEntries.length).toBe(0);
  });

  it("逾期但同月回款 → 保留在原月，不滚动", () => {
    // 计划 6月1日，实际 6月20日回款（同月内）
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedMonth: "Jun",
      plannedAmount: 40000,
      actualAmount: 40000,
      actualDate: "2026-06-20",
      actualYearMonth: "2026-06",
      actualMonth: "Jun",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 原生计划在6月
    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.nativePlan).toBe(40000);

    // 没有任何滚动逾期
    const totalRolled = chartData.reduce((sum, d) => sum + d.rolledOverdue, 0);
    expect(totalRolled).toBe(0);
  });
});

describe("calculateCollectionHealthFromApi - 滚动机制", () => {
  const org = createOrgNode();

  it("月底未回款 → 从下一月到当前月逐月展示滚动", () => {
    // 计划 2026-01-15，至今未回款
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-01-15",
      plannedYearMonth: "2026-01",
      plannedMonth: "Jan",
      plannedAmount: 20000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData, rollingMap } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 原生计划在1月
    const jan = chartData.find((d) => d.month === "Jan")!;
    expect(jan.nativePlan).toBe(20000);

    // 从2月到当前月（含），每个月都应该有滚动逾期
    const now = new Date();
    const currentMonthIndex = now.getMonth(); // 0-based (July = 6)
    // 从 Feb(index 1) 到当前月(index currentMonthIndex), 每个月都有 20000
    let rolledMonthCount = 0;
    chartData.forEach((d) => {
      if (d.rolledOverdue > 0) rolledMonthCount++;
    });
    // 至少有从2月到当前月的滚动（currentMonthIndex - 1 个月, 最少 >= 1）
    expect(rolledMonthCount).toBeGreaterThanOrEqual(1);

    // rollingMap 中有逾期记录（在多个月份）
    const allEntries = Array.from(rollingMap.values()).flat();
    const overdueEntries = allEntries.filter((e) => e.rollingSourceMonth === "2026-01");
    expect(overdueEntries.length).toBeGreaterThanOrEqual(1);
    expect(overdueEntries[0].overdueAmount).toBe(20000);
    expect(overdueEntries[0].isOverdue).toBe(true);
  });

  it("部分回款 → 仅滚动未回款余额（逐月展示）", () => {
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-02-01",
      plannedYearMonth: "2026-02",
      plannedMonth: "Feb",
      plannedAmount: 100000,
      actualAmount: 60000,
      actualDate: "2026-03-15", // 非同月回款
      actualYearMonth: "2026-03",
      actualMonth: "Mar",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 原生计划在2月
    const feb = chartData.find((d) => d.month === "Feb")!;
    expect(feb.nativePlan).toBe(100000);

    // 滚动逾期 = 100000 - 60000 = 40000，从3月到当前月每月都有
    // 验证至少有一个月有 40000
    const rolledMonths = chartData.filter((d) => d.rolledOverdue === 40000);
    expect(rolledMonths.length).toBeGreaterThanOrEqual(1);
  });

  it("多笔逾期各自独立滚动（每月累加所有未回款）", () => {
    const contract1 = createContract({ id: "c1", contractCode: "C001" });
    const contract2 = createContract({ id: "c2", contractCode: "C002" });

    const plan1 = createPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-01-10",
      plannedYearMonth: "2026-01",
      plannedMonth: "Jan",
      plannedAmount: 10000,
      actualAmount: 0,
    });
    const plan2 = createPlan({
      id: "p2",
      parentDataId: "c2",
      plannedDate: "2026-02-10",
      plannedYearMonth: "2026-02",
      plannedMonth: "Feb",
      plannedAmount: 25000,
      actualAmount: 0,
    });

    const contractMap = buildContractMap([contract1, contract2]);
    const planMap = buildReceivablePlanMap([plan1, plan2]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 在当前月，两笔逾期都应该存在
    const now = new Date();
    const currentMonthAbbrs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthLabel = currentMonthAbbrs[now.getMonth()];
    const currentMonth = chartData.find((d) => d.month === currentMonthLabel);
    if (currentMonth) {
      // 当前月的 rolledOverdue 应该包含两笔：10000 + 25000 = 35000
      expect(currentMonth.rolledOverdue).toBe(35000);
    }
  });

  it("全额回款后不产生滚动逾期", () => {
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-01-15",
      plannedYearMonth: "2026-01",
      plannedMonth: "Jan",
      plannedAmount: 50000,
      actualAmount: 50000,
      actualDate: "2026-01-20",
      actualYearMonth: "2026-01",
      actualMonth: "Jan",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    const totalRolled = chartData.reduce((sum, d) => sum + d.rolledOverdue, 0);
    expect(totalRolled).toBe(0);
  });
});

describe("calculateCollectionHealthFromApi - 数据一致性", () => {
  const org = createOrgNode();

  it("target 始终等于 nativePlan + rolledOverdue", () => {
    const contract = createContract();
    const plans = [
      createPlan({
        id: "p1",
        plannedDate: "2026-01-01",
        plannedYearMonth: "2026-01",
        plannedMonth: "Jan",
        plannedAmount: 30000,
        actualAmount: 0,
      }),
      createPlan({
        id: "p2",
        plannedDate: "2026-06-01",
        plannedYearMonth: "2026-06",
        plannedMonth: "Jun",
        plannedAmount: 50000,
        actualAmount: 0,
      }),
    ];

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap(plans);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 每个月 target = nativePlan + rolledOverdue
    chartData.forEach((d) => {
      expect(d.target).toBe(d.nativePlan + d.rolledOverdue);
    });
  });

  it("actual 字段保持原有逻辑不受影响", () => {
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-04-01",
      plannedYearMonth: "2026-04",
      plannedMonth: "Apr",
      plannedAmount: 80000,
      actualAmount: 50000,
      actualDate: "2026-05-10",
      actualYearMonth: "2026-05",
      actualMonth: "May",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // actual 按 actualDate 的 yearMonth 归类
    const may = chartData.find((d) => d.month === "May")!;
    expect(may.actual).toBe(50000);

    // 而不是按 plannedDate 归类
    const apr = chartData.find((d) => d.month === "Apr")!;
    expect(apr.actual).toBe(0);
  });

  it("空数据返回12个月全零数据", () => {
    const contractMap: ContractMap = new Map();
    const planMap: ReceivablePlanMap = new Map();

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    expect(chartData.length).toBe(12);
    chartData.forEach((d) => {
      expect(d.nativePlan).toBe(0);
      expect(d.rolledOverdue).toBe(0);
      expect(d.target).toBe(0);
      expect(d.actual).toBe(0);
    });
  });

  it("无效 plannedDate 不参与滚动计算", () => {
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "", // 无效日期
      plannedYearMonth: undefined,
      plannedMonth: undefined,
      plannedAmount: 50000,
      actualAmount: 0,
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    const totalNative = chartData.reduce((sum, d) => sum + d.nativePlan, 0);
    const totalRolled = chartData.reduce((sum, d) => sum + d.rolledOverdue, 0);
    expect(totalNative).toBe(0);
    expect(totalRolled).toBe(0);
  });
});

describe("calculateCollectionHealthFromApi - rollingMap", () => {
  const org = createOrgNode();

  it("原生计划合同在 rollingMap 中 rollingSourceMonth 为 null", () => {
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-12-01",
      plannedYearMonth: "2026-12",
      plannedMonth: "Dec",
      plannedAmount: 10000,
      actualAmount: 0,
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { rollingMap } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    const decEntries = rollingMap.get("2026-12") || [];
    expect(decEntries.length).toBe(1);
    expect(decEntries[0].rollingSourceMonth).toBeNull();
    expect(decEntries[0].contractCode).toBe("C001");
  });

  it("滚动合同在 rollingMap 中带有正确的 rollingSourceMonth", () => {
    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-01-15",
      plannedYearMonth: "2026-01",
      plannedMonth: "Jan",
      plannedAmount: 15000,
      actualAmount: 0,
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { rollingMap } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 找到带有 rollingSourceMonth 的条目（逐月都有）
    const allEntries = Array.from(rollingMap.values()).flat();
    const rolledEntries = allEntries.filter((e) => e.rollingSourceMonth !== null);
    // 从2月到当前月，每月都有一条
    expect(rolledEntries.length).toBeGreaterThanOrEqual(1);
    expect(rolledEntries[0].rollingSourceMonth).toBe("2026-01");
    expect(rolledEntries[0].isOverdue).toBe(true);
    expect(rolledEntries[0].overdueAmount).toBe(15000);
  });

  it("contractCode白名单正确过滤合同", () => {
    const contract1 = createContract({ id: "c1", contractCode: "C001" });
    const contract2 = createContract({ id: "c2", contractCode: "C002" });

    const plan1 = createPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedAmount: 10000,
    });
    const plan2 = createPlan({
      id: "p2",
      parentDataId: "c2",
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedAmount: 20000,
    });

    const contractMap = buildContractMap([contract1, contract2]);
    const planMap = buildReceivablePlanMap([plan1, plan2]);

    // 只允许 C001
    const allowed = new Set(["C001"]);
    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, allowed
    );

    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.nativePlan).toBe(10000); // 只有 C001 的 10000
  });
});

describe("calculateCollectionHealthFromApi - 财年适配", () => {
  it("非自然年财年（4月~3月）正确排列月份", () => {
    const org = createOrgNode({
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    });

    const contract = createContract();
    const plan = createPlan({
      plannedDate: "2026-04-15",
      plannedYearMonth: "2026-04",
      plannedMonth: "Apr",
      plannedAmount: 60000,
      actualAmount: 0,
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 第一个月应该是 Apr
    expect(chartData[0].month).toBe("Apr");
    // 最后一个月应该是 Mar
    expect(chartData[11].month).toBe("Mar");
    // Apr 有数据
    expect(chartData[0].nativePlan).toBe(60000);
  });
});

describe("calculateCollectionHealthFromApi - 真实场景：截图数据复现", () => {
  const org = createOrgNode();

  it("5月逾期未回款 → 6月和7月都应显示滚动逾期", () => {
    // 模拟截图中的第2笔：发货款 计划5/1，未回款
    const contract = createContract({ id: "c1", contractCode: "C001" });
    const plan = createPlan({
      id: "p-delivery",
      parentDataId: "c1",
      plannedDate: "2026-05-01",
      plannedYearMonth: "2026-05",
      plannedMonth: "May",
      plannedAmount: 8475,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 原生计划在5月
    const may = chartData.find((d) => d.month === "May")!;
    expect(may.nativePlan).toBe(8475);

    // 6月和7月都应有滚动逾期 8475
    const jun = chartData.find((d) => d.month === "Jun")!;
    const jul = chartData.find((d) => d.month === "Jul")!;
    expect(jun.rolledOverdue).toBe(8475);
    expect(jul.rolledOverdue).toBe(8475);
  });

  it("6月逾期+部分回款(7月收到8000/8475) → 6月无滚动, 7月有滚动余额475", () => {
    // 模拟截图中的第1笔：预付款 计划6/4，实际7/6收到8000
    const contract = createContract({ id: "c1", contractCode: "C001" });
    const plan = createPlan({
      id: "p-prepay",
      parentDataId: "c1",
      plannedDate: "2026-06-04",
      plannedYearMonth: "2026-06",
      plannedMonth: "Jun",
      plannedAmount: 8475,
      actualAmount: 8000,
      actualDate: "2026-07-06",
      actualYearMonth: "2026-07",
      actualMonth: "Jul",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 原生计划在6月
    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.nativePlan).toBe(8475);

    // 逾期余额 = 8475 - 8000 = 475，滚动到7月
    const jul = chartData.find((d) => d.month === "Jul")!;
    expect(jul.rolledOverdue).toBe(475);
  });

  it("完整截图场景：两笔逾期合并后6月和7月都有滚动", () => {
    const contract = createContract({ id: "c1", contractCode: "C001" });

    // 第1笔: 预付款 计划6/4，7/6回款8000（未全额）
    const plan1 = createPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-06-04",
      plannedYearMonth: "2026-06",
      plannedMonth: "Jun",
      plannedAmount: 8475,
      actualAmount: 8000,
      actualDate: "2026-07-06",
      actualYearMonth: "2026-07",
      actualMonth: "Jul",
    });

    // 第2笔: 发货款 计划5/1，未回款
    const plan2 = createPlan({
      id: "p2",
      parentDataId: "c1",
      plannedDate: "2026-05-01",
      plannedYearMonth: "2026-05",
      plannedMonth: "May",
      plannedAmount: 8475,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildReceivablePlanMap([plan1, plan2]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null
    );

    // 6月: 第2笔的逾期滚动 8475（从5月滚来）
    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.rolledOverdue).toBe(8475);
    expect(jun.nativePlan).toBe(8475); // 第1笔的原生计划

    // 7月: 第2笔继续滚动 8475 + 第1笔逾期余额 475 = 8950
    const jul = chartData.find((d) => d.month === "Jul")!;
    expect(jul.rolledOverdue).toBe(8475 + 475);
  });
});


describe("calculateCollectionHealthFromApi - 应收优先", () => {
  it("合同元数据缺失时仍按应收计划的 plannedDate 和 actualDate 统计金额", () => {
    const org = createOrgNode();
    const plan = createPlan({
      id: "orphan-plan",
      parentDataId: "missing-contract",
      plannedAmount: 10000,
      plannedDate: "2026-04-10",
      plannedMonth: "Apr",
      plannedYearMonth: "2026-04",
      actualAmount: 8000,
      actualDate: "2026-05-06",
      actualMonth: "May",
      actualYearMonth: "2026-05",
    });

    const { chartData, rollingMap } = calculateCollectionHealthFromApi(
      new Map(),
      buildReceivablePlanMap([plan]),
      org,
      null,
      undefined,
      undefined,
      2026,
    );

    expect(chartData.find((point) => point.month === "Apr")!)
      .toMatchObject({ nativePlan: 10000, actual: 0 });
    expect(chartData.find((point) => point.month === "May")!)
      .toMatchObject({ nativePlan: 0, actual: 8000 });
    expect(rollingMap.get("2026-04")?.[0])
      .toMatchObject({ contractId: "missing-contract", contractCode: "" });
  });
});
