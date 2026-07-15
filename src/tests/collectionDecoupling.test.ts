import { describe, it, expect } from "vitest";
import { getOwnersInOrg, filterDealsByOrg } from "@/utils/orgFilter";
import { calculateCollectionHealthFromApi } from "@/components/charts/CollectionHealthChart/useCollectionHealthData";
import { buildContractRows } from "@/components/deals/ContractsTable";
import type { OrgNode, Deal, Contract, ReceivablePlan } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";

// ─── 基于 testData.md 真实数据的 Mock 工厂 ─────────────────

/** 组织树：模拟真实结构 */
function createRealOrgTree(): OrgNode {
  // 福兰德科技 (company)
  //   ├── 总经理办公室 (team)
  //   │   ├── 王晗丞 (person, email: hc.wang@forlandholding.com)
  //   │   └── 王文毅 (person, email: wwy@forlandholding.com)
  //   └── 市场部 (team)
  //       ├── 胡剑飞 (person, email: jeff.hu@forlandholding.com)
  //       ├── 汤宝茹 (person, email: polina.tang@forlandholding.com)
  //       └── 薛培锋 (person, email: xpf@forlandholding.com)
  return {
    id: "23409",
    name: { zh: "福兰德科技", en: "福兰德科技" },
    type: "company",
    theStartDateOfTheFiscalYear: "2026-01-01",
    theEndDateOfTheFiscalYear: "2026-12-31",
    children: [
      {
        id: "23412",
        name: { zh: "总经理办公室", en: "总经理办公室" },
        type: "team",
        theStartDateOfTheFiscalYear: "2026-01-01",
        theEndDateOfTheFiscalYear: "2026-12-31",
        children: [
          {
            id: "23413",
            name: { zh: "王晗丞", en: "王晗丞" },
            type: "person",
            memberEmail: "hc.wang@forlandholding.com",
            theStartDateOfTheFiscalYear: "2026-01-01",
            theEndDateOfTheFiscalYear: "2026-12-31",
          },
          {
            id: "23410",
            name: { zh: "王文毅", en: "王文毅" },
            type: "person",
            memberEmail: "wwy@forlandholding.com",
            theStartDateOfTheFiscalYear: "2026-01-01",
            theEndDateOfTheFiscalYear: "2026-12-31",
          },
        ],
      },
      {
        id: "23414",
        name: { zh: "市场部", en: "市场部" },
        type: "team",
        theStartDateOfTheFiscalYear: "2026-01-01",
        theEndDateOfTheFiscalYear: "2026-12-31",
        children: [
          {
            id: "23418",
            name: { zh: "胡剑飞", en: "胡剑飞" },
            type: "person",
            memberEmail: "jeff.hu@forlandholding.com",
            theStartDateOfTheFiscalYear: "2026-01-01",
            theEndDateOfTheFiscalYear: "2026-12-31",
          },
          {
            id: "23417",
            name: { zh: "汤宝茹", en: "汤宝茹" },
            type: "person",
            memberEmail: "polina.tang@forlandholding.com",
            theStartDateOfTheFiscalYear: "2026-01-01",
            theEndDateOfTheFiscalYear: "2026-12-31",
          },
          {
            id: "23415",
            name: { zh: "薛培锋", en: "薛培锋" },
            type: "person",
            memberEmail: "xpf@forlandholding.com",
            theStartDateOfTheFiscalYear: "2026-01-01",
            theEndDateOfTheFiscalYear: "2026-12-31",
          },
        ],
      },
    ],
  };
}

/** 模拟真实商机数据（opportunityOwner[0].value = email） */
function createRealDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "32031",
    name: { zh: "测试", en: "测试" },
    company: { zh: "Indus Ideas Distributor", en: "Indus Ideas Distributor" },
    value: 1000000,
    stage: "Intentional Communication",
    lastActivityDays: 0,
    probability: 50,
    owner: "jeff.hu@forlandholding.com", // 来自 opportunityOwner[0].value
    createdYearMonth: "2026-07",
    contractNumber: "20260706-1529",
    currencyId: "25887",
    ...overrides,
  };
}

/** 模拟真实合同数据（contractOwner[0].value = email） */
function createRealContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "27790",
    contractCode: "20260706-1529",
    contractName: "Opporunity from lead1528",
    customer: "这是一条测试数据！！",
    owner: "Admin@fld.com", // 来自 contractOwner[0].value
    totalAmountWithTax: 28250,
    signingDate: "2026-07-16",
    expiryDate: "2026-08-31",
    signingMonth: "Jul",
    signingYearMonth: "2026-07",
    currencyId: "25887",
    ...overrides,
  };
}

/** 模拟真实应收计划数据 */
function createRealPlan(overrides: Partial<ReceivablePlan> = {}): ReceivablePlan {
  return {
    id: "32601",
    parentDataId: "27790",
    actualAmount: 8000,
    actualDate: "2026-07-06",
    actualMonth: "Jul",
    actualYearMonth: "2026-07",
    plannedAmount: 8475,
    plannedDate: "2026-06-04",
    plannedMonth: "Jun",
    plannedYearMonth: "2026-06",
    paymentStage: "预付款(30%)",
    paymentOwner: "胡剑飞",
    currencyId: "25887",
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

/** 模拟按组织过滤合同的逻辑（与 Index.tsx 中一致） */
function filterContractMapByOrg(
  contractMap: ContractMap,
  selectedOrg: OrgNode | null,
): ContractMap {
  if (!selectedOrg) return contractMap;
  const owners = getOwnersInOrg(selectedOrg);
  const filtered: ContractMap = new Map();
  contractMap.forEach((contracts, code) => {
    const matched = contracts.filter((c) => owners.includes(c.owner));
    if (matched.length > 0) {
      filtered.set(code, matched);
    }
  });
  return filtered;
}

// ─── 一、Email 匹配键改动测试 ────────────────────────────────

describe("getOwnersInOrg - 使用 memberEmail 收集", () => {
  const orgTree = createRealOrgTree();

  it("从根节点收集所有 person 的 email", () => {
    const owners = getOwnersInOrg(orgTree);
    expect(owners).toContain("hc.wang@forlandholding.com");
    expect(owners).toContain("wwy@forlandholding.com");
    expect(owners).toContain("jeff.hu@forlandholding.com");
    expect(owners).toContain("polina.tang@forlandholding.com");
    expect(owners).toContain("xpf@forlandholding.com");
    expect(owners.length).toBe(5);
  });

  it("从子部门节点只收集该部门下的 email", () => {
    const marketDept = orgTree.children![1]; // 市场部
    const owners = getOwnersInOrg(marketDept);
    expect(owners).toContain("jeff.hu@forlandholding.com");
    expect(owners).toContain("polina.tang@forlandholding.com");
    expect(owners).toContain("xpf@forlandholding.com");
    expect(owners.length).toBe(3);
    // 不应包含总经理办公室的人
    expect(owners).not.toContain("hc.wang@forlandholding.com");
  });

  it("team 类型节点无 memberEmail 不会被收集", () => {
    const owners = getOwnersInOrg(orgTree);
    // team 节点的 name（如"市场部"）不应出现
    expect(owners).not.toContain("市场部");
    expect(owners).not.toContain("总经理办公室");
  });

  it("没有 memberEmail 的 person 节点被跳过", () => {
    const orgWithMissing: OrgNode = {
      id: "root",
      name: { zh: "根", en: "Root" },
      type: "company",
      children: [
        {
          id: "p1",
          name: { zh: "有邮箱", en: "有邮箱" },
          type: "person",
          memberEmail: "test@example.com",
        },
        {
          id: "p2",
          name: { zh: "无邮箱", en: "无邮箱" },
          type: "person",
          // 没有 memberEmail
        },
      ],
    };
    const owners = getOwnersInOrg(orgWithMissing);
    expect(owners).toEqual(["test@example.com"]);
  });
});

describe("filterDealsByOrg - 使用 email 匹配 deal.owner", () => {
  const orgTree = createRealOrgTree();

  it("选中市场部 → 只保留市场部人员的商机", () => {
    const marketDept = orgTree.children![1]; // 市场部
    const deals: Deal[] = [
      createRealDeal({ id: "d1", owner: "jeff.hu@forlandholding.com" }),
      createRealDeal({ id: "d2", owner: "hc.wang@forlandholding.com" }),
      createRealDeal({ id: "d3", owner: "polina.tang@forlandholding.com" }),
    ];

    const filtered = filterDealsByOrg(deals, marketDept);
    expect(filtered.length).toBe(2);
    expect(filtered.map((d) => d.id).sort()).toEqual(["d1", "d3"]);
  });

  it("不选组织 → 返回全部商机", () => {
    const deals: Deal[] = [
      createRealDeal({ id: "d1", owner: "jeff.hu@forlandholding.com" }),
      createRealDeal({ id: "d2", owner: "unknown@example.com" }),
    ];

    const filtered = filterDealsByOrg(deals, null);
    expect(filtered.length).toBe(2);
  });

  it("选中根节点 → 返回所有组织内的商机", () => {
    const deals: Deal[] = [
      createRealDeal({ id: "d1", owner: "jeff.hu@forlandholding.com" }),
      createRealDeal({ id: "d2", owner: "hc.wang@forlandholding.com" }),
      createRealDeal({ id: "d3", owner: "outsider@other.com" }),
    ];

    const filtered = filterDealsByOrg(deals, orgTree);
    expect(filtered.length).toBe(2); // outsider 被过滤掉
  });
});

// ─── 二、回款健康度脱离商机测试 ────────────────────────────────

describe("回款健康度 - 独立于商机，按 signingDate 过滤合同", () => {
  const org = createRealOrgTree();

  it("合同 signingDate 在财年范围内 → 参与回款计算（不需要关联商机）", () => {
    // 合同不关联任何商机，但 signingDate 在 2026 财年内
    const contract = createRealContract({
      id: "standalone",
      contractCode: "STANDALONE-001",
      signingDate: "2026-03-15",
      signingYearMonth: "2026-03",
    });
    const plan = createRealPlan({
      parentDataId: "standalone",
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedAmount: 50000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    // 不传 allowedContractNumbers → 不过滤
    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, undefined, 2026
    );

    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.nativePlan).toBe(50000);
  });

  it("合同 signingDate 不在财年范围 → 不参与计算（模拟上游过滤）", () => {
    // 这个场景模拟 useContractsByFiscalYear 不会返回超范围的合同
    // signingDate 在 2025 年，不会被 2026 财年查询返回
    const contractInRange = createRealContract({
      id: "c-in",
      contractCode: "IN-RANGE",
      signingDate: "2026-07-16",
    });
    const contractOutRange = createRealContract({
      id: "c-out",
      contractCode: "OUT-RANGE",
      signingDate: "2025-05-01",
    });

    const planIn = createRealPlan({
      id: "pin",
      parentDataId: "c-in",
      plannedDate: "2026-08-01",
      plannedYearMonth: "2026-08",
      plannedAmount: 30000,
      actualAmount: 0,
      actualDate: "",
    });
    const planOut = createRealPlan({
      id: "pout",
      parentDataId: "c-out",
      plannedDate: "2026-03-01",
      plannedYearMonth: "2026-03",
      plannedAmount: 99999,
      actualAmount: 0,
      actualDate: "",
    });

    // 只包含范围内的合同（模拟 useContractsByFiscalYear 的行为）
    const contractMap = buildContractMap([contractInRange]);
    const planMap = buildPlanMap([planIn]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, undefined, 2026
    );

    const aug = chartData.find((d) => d.month === "Aug")!;
    expect(aug.nativePlan).toBe(30000);
    // 超范围合同的数据不存在
    const mar = chartData.find((d) => d.month === "Mar")!;
    expect(mar.nativePlan).toBe(0);
  });

  it("不传 allowedContractNumbers 时，所有合同都参与计算", () => {
    const c1 = createRealContract({ id: "c1", contractCode: "C001" });
    const c2 = createRealContract({ id: "c2", contractCode: "C002" });

    const p1 = createRealPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-04-01",
      plannedYearMonth: "2026-04",
      plannedAmount: 10000,
      actualAmount: 0,
      actualDate: "",
    });
    const p2 = createRealPlan({
      id: "p2",
      parentDataId: "c2",
      plannedDate: "2026-04-01",
      plannedYearMonth: "2026-04",
      plannedAmount: 20000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([c1, c2]);
    const planMap = buildPlanMap([p1, p2]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, undefined, 2026
    );

    const apr = chartData.find((d) => d.month === "Apr")!;
    expect(apr.nativePlan).toBe(30000); // 两个合同都参与
  });
});

describe("回款健康度 - 组织过滤合同（用 email 匹配 contract.owner）", () => {
  const orgTree = createRealOrgTree();

  it("选中市场部 → 只有市场部人员负责的合同参与计算", () => {
    const marketDept = orgTree.children![1]; // 市场部

    const c1 = createRealContract({
      id: "c1",
      contractCode: "C001",
      owner: "jeff.hu@forlandholding.com", // 市场部
    });
    const c2 = createRealContract({
      id: "c2",
      contractCode: "C002",
      owner: "hc.wang@forlandholding.com", // 总经理办公室
    });

    const p1 = createRealPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-05-01",
      plannedYearMonth: "2026-05",
      plannedAmount: 10000,
      actualAmount: 0,
      actualDate: "",
    });
    const p2 = createRealPlan({
      id: "p2",
      parentDataId: "c2",
      plannedDate: "2026-05-01",
      plannedYearMonth: "2026-05",
      plannedAmount: 20000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([c1, c2]);
    const planMap = buildPlanMap([p1, p2]);

    // 模拟 Index.tsx 中的组织过滤逻辑
    const filteredMap = filterContractMapByOrg(contractMap, marketDept);

    const { chartData } = calculateCollectionHealthFromApi(
      filteredMap, planMap, orgTree, null, undefined, undefined, 2026
    );

    const may = chartData.find((d) => d.month === "May")!;
    expect(may.nativePlan).toBe(10000); // 只有 c1（市场部胡剑飞）
  });

  it("不选组织 → 所有合同参与计算", () => {
    const c1 = createRealContract({
      id: "c1",
      contractCode: "C001",
      owner: "jeff.hu@forlandholding.com",
    });
    const c2 = createRealContract({
      id: "c2",
      contractCode: "C002",
      owner: "hc.wang@forlandholding.com",
    });

    const p1 = createRealPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-05-01",
      plannedYearMonth: "2026-05",
      plannedAmount: 10000,
      actualAmount: 0,
      actualDate: "",
    });
    const p2 = createRealPlan({
      id: "p2",
      parentDataId: "c2",
      plannedDate: "2026-05-01",
      plannedYearMonth: "2026-05",
      plannedAmount: 20000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([c1, c2]);
    const planMap = buildPlanMap([p1, p2]);

    // 不选组织，不过滤
    const filteredMap = filterContractMapByOrg(contractMap, null);

    const { chartData } = calculateCollectionHealthFromApi(
      filteredMap, planMap, orgTree, null, undefined, undefined, 2026
    );

    const may = chartData.find((d) => d.month === "May")!;
    expect(may.nativePlan).toBe(30000); // 两个合同都参与
  });

  it("合同 owner 不在任何组织节点中 → 选中任何子组织都不会显示该合同", () => {
    const marketDept = orgTree.children![1];

    const c1 = createRealContract({
      id: "c1",
      contractCode: "C001",
      owner: "outsider@other.com", // 不在组织树中
    });

    const p1 = createRealPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedAmount: 50000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([c1]);
    const planMap = buildPlanMap([p1]);

    const filteredMap = filterContractMapByOrg(contractMap, marketDept);

    const { chartData } = calculateCollectionHealthFromApi(
      filteredMap, planMap, orgTree, null, undefined, undefined, 2026
    );

    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.nativePlan).toBe(0); // 被过滤掉了
  });
});

describe("回款健康度 - 财年范围正确性", () => {
  it("自然年财年（1月~12月）生成正确的12个月数据", () => {
    const org: OrgNode = {
      id: "org1",
      name: { zh: "公司", en: "Company" },
      type: "company",
      theStartDateOfTheFiscalYear: "2026-01-01",
      theEndDateOfTheFiscalYear: "2026-12-31",
    };

    const contractMap: ContractMap = new Map();
    const planMap: ReceivablePlanMap = new Map();

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, undefined, 2026
    );

    expect(chartData.length).toBe(12);
    expect(chartData[0].month).toBe("Jan");
    expect(chartData[11].month).toBe("Dec");
  });

  it("跨年财年（4月~次年3月）生成正确排列的12个月", () => {
    const org: OrgNode = {
      id: "org1",
      name: { zh: "公司", en: "Company" },
      type: "company",
      theStartDateOfTheFiscalYear: "2026-04-01",
      theEndDateOfTheFiscalYear: "2027-03-31",
    };

    const contract = createRealContract({
      id: "c1",
      contractCode: "C001",
      signingDate: "2026-11-15",
    });
    const plan = createRealPlan({
      parentDataId: "c1",
      plannedDate: "2026-11-01",
      plannedYearMonth: "2026-11",
      plannedAmount: 40000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, undefined, 2026
    );

    expect(chartData[0].month).toBe("Apr");
    expect(chartData[11].month).toBe("Mar");
    // Nov 是第8个月（Apr=0, May=1, ..., Nov=7）
    const nov = chartData.find((d) => d.month === "Nov")!;
    expect(nov.nativePlan).toBe(40000);
  });
});

// ─── 三、ContractsTable 不再依赖 allowedContractNumbers ────────

describe("buildContractRows - 无 allowedContractNumbers 时显示全部合同", () => {
  it("不传白名单 → 所有合同都出现在表格中", () => {
    const c1 = createRealContract({ id: "c1", contractCode: "C001" });
    const c2 = createRealContract({ id: "c2", contractCode: "C002" });

    const p1 = createRealPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedMonth: "Jun",
      plannedAmount: 10000,
      actualAmount: 0,
      actualDate: "",
    });
    const p2 = createRealPlan({
      id: "p2",
      parentDataId: "c2",
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedMonth: "Jun",
      plannedAmount: 20000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([c1, c2]);
    const planMap = buildPlanMap([p1, p2]);

    // allowedContractNumbers = undefined
    const rows = buildContractRows(
      contractMap, planMap, "Jun", null, undefined, undefined
    );
    expect(rows.length).toBe(2);
  });

  it("传了白名单 → 仍然只显示白名单中的合同（向后兼容）", () => {
    const c1 = createRealContract({ id: "c1", contractCode: "C001" });
    const c2 = createRealContract({ id: "c2", contractCode: "C002" });

    const p1 = createRealPlan({
      id: "p1",
      parentDataId: "c1",
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedMonth: "Jun",
      plannedAmount: 10000,
      actualAmount: 0,
      actualDate: "",
    });
    const p2 = createRealPlan({
      id: "p2",
      parentDataId: "c2",
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedMonth: "Jun",
      plannedAmount: 20000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([c1, c2]);
    const planMap = buildPlanMap([p1, p2]);

    const allowed = new Set(["C001"]);
    const rows = buildContractRows(
      contractMap, planMap, "Jun", null, undefined, allowed
    );
    expect(rows.length).toBe(1);
    expect(rows[0].contract.contractCode).toBe("C001");
  });
});

// ─── 四、真实数据端到端场景 ────────────────────────────────────

describe("真实数据场景 - 基于 testData.md 的合同和应收计划", () => {
  const orgTree = createRealOrgTree();

  it("真实合同 + 应收计划 → 回款图表数据正确", () => {
    // 合同: 20260706-1529, owner: Admin@fld.com, total: 28250
    const contract = createRealContract();

    // 应收计划（基于 testData.md rest9）
    const plans: ReceivablePlan[] = [
      // 预付款: 计划 6/4, 实际回款 8000 (7/6)
      createRealPlan({
        id: "32601",
        parentDataId: "27790",
        plannedDate: "2026-06-04",
        plannedYearMonth: "2026-06",
        plannedMonth: "Jun",
        plannedAmount: 8475,
        actualAmount: 8000,
        actualDate: "2026-07-06",
        actualYearMonth: "2026-07",
        actualMonth: "Jul",
        paymentStage: "预付款(30%)",
      }),
      // 发货款: 计划 5/1, 未回款
      createRealPlan({
        id: "32602",
        parentDataId: "27790",
        plannedDate: "2026-05-01",
        plannedYearMonth: "2026-05",
        plannedMonth: "May",
        plannedAmount: 5000,
        actualAmount: 0,
        actualDate: "",
        actualYearMonth: undefined,
        actualMonth: undefined,
        paymentStage: "发货款(30%)",
      }),
      // 验收款: 无计划日期
      createRealPlan({
        id: "32603",
        parentDataId: "27790",
        plannedDate: "",
        plannedYearMonth: undefined,
        plannedMonth: undefined,
        plannedAmount: 8475,
        actualAmount: 0,
        actualDate: "",
        actualYearMonth: undefined,
        actualMonth: undefined,
        paymentStage: "验收款(30%)",
      }),
      // 质保金: 无计划日期
      createRealPlan({
        id: "32604",
        parentDataId: "27790",
        plannedDate: "",
        plannedYearMonth: undefined,
        plannedMonth: undefined,
        plannedAmount: 2825,
        actualAmount: 0,
        actualDate: "",
        actualYearMonth: undefined,
        actualMonth: undefined,
        paymentStage: "质保金(10%)",
      }),
    ];

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap(plans);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, orgTree, null, undefined, undefined, 2026
    );

    // 5月: 原生计划 = 5000 (发货款)
    const may = chartData.find((d) => d.month === "May")!;
    expect(may.nativePlan).toBe(5000);

    // 6月: 原生计划 = 8475 (预付款) + 滚动逾期 = 5000 (发货款从5月滚来)
    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.nativePlan).toBe(8475);
    expect(jun.rolledOverdue).toBe(5000);

    // 7月: 实收 = 8000 (预付款7/6回款)
    const jul = chartData.find((d) => d.month === "Jul")!;
    expect(jul.actual).toBe(8000);
    // 7月滚动: 发货款继续滚动 5000 + 预付款余额 475
    expect(jul.rolledOverdue).toBe(5000 + 475);
  });

  it("组织过滤：Admin@fld.com 不在组织树中 → 选市场部时无数据", () => {
    const marketDept = orgTree.children![1];
    const contract = createRealContract(); // owner: Admin@fld.com

    const plan = createRealPlan({
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedAmount: 10000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    // 按组织过滤
    const filteredMap = filterContractMapByOrg(contractMap, marketDept);

    const { chartData } = calculateCollectionHealthFromApi(
      filteredMap, planMap, orgTree, null, undefined, undefined, 2026
    );

    // Admin@fld.com 不在市场部，所以被过滤掉
    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.nativePlan).toBe(0);
  });

  it("组织过滤：胡剑飞的合同 → 选市场部时有数据", () => {
    const marketDept = orgTree.children![1];
    const contract = createRealContract({
      owner: "jeff.hu@forlandholding.com", // 胡剑飞，市场部
    });

    const plan = createRealPlan({
      plannedDate: "2026-06-01",
      plannedYearMonth: "2026-06",
      plannedAmount: 10000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    const filteredMap = filterContractMapByOrg(contractMap, marketDept);

    const { chartData } = calculateCollectionHealthFromApi(
      filteredMap, planMap, orgTree, null, undefined, undefined, 2026
    );

    const jun = chartData.find((d) => d.month === "Jun")!;
    expect(jun.nativePlan).toBe(10000);
  });
});

// ─── 五、computeFiscalRange 测试 ────────────────────────────────

describe("computeFiscalRange - 财年范围计算", () => {
  // 导入放在文件顶部更合适，但这里作为内联测试
  // computeFiscalRange 已在 useApiData.ts 中导出

  it("自然年财年：2026-01-01 ~ 2026-12-31", () => {
    // 这里不直接测试 computeFiscalRange（需要额外 import），
    // 但验证 calculateCollectionHealthFromApi 使用正确财年范围
    const org: OrgNode = {
      id: "org1",
      name: { zh: "公司", en: "Company" },
      type: "company",
      theStartDateOfTheFiscalYear: "2026-01-01",
      theEndDateOfTheFiscalYear: "2026-12-31",
    };

    const contract = createRealContract();
    // 2月的计划
    const plan = createRealPlan({
      plannedDate: "2026-02-15",
      plannedYearMonth: "2026-02",
      plannedMonth: "Feb",
      plannedAmount: 25000,
      actualAmount: 0,
      actualDate: "",
    });

    const contractMap = buildContractMap([contract]);
    const planMap = buildPlanMap([plan]);

    const { chartData } = calculateCollectionHealthFromApi(
      contractMap, planMap, org, null, undefined, undefined, 2026
    );

    const feb = chartData.find((d) => d.month === "Feb")!;
    expect(feb.nativePlan).toBe(25000);
  });
});
