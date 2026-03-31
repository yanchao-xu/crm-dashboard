import type {
  OrgNode,
  Deal,
  HealthDataPoint,
  StagnationData,
  FunnelStage,
  StackedHealthDataPoint,
} from "@/types";
import { OpportunityStage } from "@/services/api";

// Get all person names (owners) under an organization node
export function getOwnersInOrg(node: OrgNode): string[] {
  const owners: string[] = [];

  function collectOwners(n: OrgNode) {
    if (n.type === "person") {
      // Use English name since deal owners are stored in English
      owners.push(n.name.en);
    }
    if (n.children) {
      n.children.forEach(collectOwners);
    }
  }

  collectOwners(node);
  return owners;
}

// Filter deals by organization
export function filterDealsByOrg(
  allDeals: Deal[],
  selectedOrg: OrgNode | null,
): Deal[] {
  if (!selectedOrg) {
    return allDeals;
  }

  const owners = getOwnersInOrg(selectedOrg);
  return allDeals.filter((deal) => owners.includes(deal.owner));
}

// Filter deals by product groups
export function filterDealsByProduct(
  allDeals: Deal[],
  selectedProducts: string[],
): Deal[] {
  if (selectedProducts.length === 0) {
    return allDeals;
  }
  return allDeals.filter(
    (deal) =>
      deal.productGroup &&
      deal.productGroup.some((pg) => selectedProducts.includes(pg)),
  );
}

// Filter deals by month (for health chart click)
export function filterDealsByMonth(
  allDeals: Deal[],
  month: string | undefined,
): Deal[] {
  if (!month) {
    return allDeals;
  }
  return allDeals.filter((deal) => deal.createdMonth === month);
}

// 根据财年起止日期生成月份列表
// 有开始时间：从开始月起 12 个月
// 只有结束时间：结束月往前推 12 个月
// 都没有：自然年 Jan-Dec
function getFiscalMonths(orgNode: OrgNode | null): string[] {
  const allMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const hasStart = !!orgNode?.theStartDateOfTheFiscalYear;
  const hasEnd = !!orgNode?.theEndDateOfTheFiscalYear;

  if (!hasStart && !hasEnd) {
    return allMonths;
  }

  try {
    let startMonth: number; // 0-11

    if (hasStart) {
      startMonth = new Date(orgNode!.theStartDateOfTheFiscalYear!).getMonth();
    } else {
      // 只有结束时间，往前推 12 个月（结束月 - 11）
      const endMonth = new Date(orgNode!.theEndDateOfTheFiscalYear!).getMonth();
      startMonth = (endMonth - 11 + 12) % 12;
    }

    const result: string[] = [];
    for (let i = 0; i < 12; i++) {
      result.push(allMonths[(startMonth + i) % 12]);
    }
    return result;
  } catch {
    return allMonths;
  }
}

// Recalculate stacked health data based on filtered deals
export function calculateStackedHealthData(
  filteredDeals: Deal[],
  selectedOrg: OrgNode | null,
  stages: OpportunityStage[] = [],
): StackedHealthDataPoint[] {
  if (stages.length === 0) {
    return [];
  }
  const months = getFiscalMonths(selectedOrg);

  // 月份缩写到 OrgNode 属性的映射
  const monthFieldMap: Record<string, keyof OrgNode> = {
    Jan: "janJanuary",
    Feb: "febFebruary",
    Mar: "marMarch",
    Apr: "aprApril",
    May: "mayMay",
    Jun: "junJune",
    Jul: "julJuly",
    Aug: "augAugust",
    Sep: "sepSeptember",
    Oct: "octOctober",
    Nov: "novNovember",
    Dec: "decDecember",
  };

  const monthlyData = new Map<string, Map<string, number>>();

  filteredDeals.forEach((deal) => {
    const month = deal.createdMonth || "Jan";

    if (!monthlyData.has(month)) {
      monthlyData.set(month, new Map());
    }

    const stageData = monthlyData.get(month)!;
    const currentValue = stageData.get(deal.stage) || 0;
    stageData.set(deal.stage, currentValue + deal.value);
  });

  return months.map((month) => {
    const stageData = monthlyData.get(month) || new Map();

    // 从 selectedOrg 获取对应月份的 target 值
    let target = 0;
    if (selectedOrg) {
      const monthField = monthFieldMap[month];
      const monthValue = selectedOrg[monthField];
      target = typeof monthValue === "number" ? monthValue : 0;
    }

    const dataPoint: any = {
      month,
      target,
    };

    stages.forEach((stage) => {
      dataPoint[stage.code] = stageData.get(stage.code) || 0;
    });

    return dataPoint as StackedHealthDataPoint;
  });
}

// Recalculate stagnation data based on filtered deals
export function calculateStagnationData(
  filteredDeals: Deal[],
  stages: OpportunityStage[] = [],
): StagnationData[] {
  if (stages.length === 0) {
    return [];
  }

  return stages.map((stage) => {
    const stageDeals = filteredDeals.filter((d) => d.stage === stage.code);

    const activeDeals = stageDeals.filter((d) => d.lastActivityDays < 30);
    const over30Deals = stageDeals.filter(
      (d) => d.lastActivityDays >= 30 && d.lastActivityDays < 60,
    );
    const over60Deals = stageDeals.filter(
      (d) => d.lastActivityDays >= 60 && d.lastActivityDays < 90,
    );
    const zombieDeals = stageDeals.filter((d) => d.lastActivityDays >= 90);

    return {
      stage: stage.code,
      stageName: stage.name, // 直接使用 name
      active: activeDeals.length,
      over30: over30Deals.length,
      over60: over60Deals.length,
      zombie: zombieDeals.length,
      activeAmount: activeDeals.reduce((sum, d) => sum + d.value, 0),
      over30Amount: over30Deals.reduce((sum, d) => sum + d.value, 0),
      over60Amount: over60Deals.reduce((sum, d) => sum + d.value, 0),
      zombieAmount: zombieDeals.reduce((sum, d) => sum + d.value, 0),
    };
  });
}

// Stage code 到 OrgNode 转化率字段的映射
const stageToConversionField: Record<string, keyof OrgNode> = {
  "Intentional Communication": "leadToQualification",
  "Requirements Determination": "qualificationToDiscovery",
  proposal: "discoveryToProposal",
  negotiation: "proposalToNegotiation",
  "Winning Orders": "negotiationToWin",
  "Single Loss": "negotiationToLoss",
};

// Recalculate funnel data based on filtered deals (with realistic conversion rates)
export function calculateFunnelData(
  filteredDeals: Deal[],
  stages: OpportunityStage[] = [],
  selectedOrg: OrgNode | null = null,
  leadCount: number = 0,
): FunnelStage[] {
  if (stages.length === 0) {
    return [];
  }

  // 先计算每个 stage 的 count
  const stageCounts = stages.map((stage) => {
    const stageDeals = filteredDeals.filter((d) => d.stage === stage.code);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + d.value, 0),
    };
  });

  return stageCounts.map((item, index) => {
    // 从选中的组织节点获取 targetConversion
    let targetConversion = 0;
    if (selectedOrg) {
      const field = stageToConversionField[item.stage.code];
      if (field) {
        const val = selectedOrg[field];
        targetConversion = typeof val === "number" ? val : 0;
      }
    }

    // actualConversion 计算逻辑：
    // 第一个 stage 固定 100%
    // 从第二个到倒数第二个：当前 count / 前面所有 stage count 之和
    // 最后两个（Winning Orders 和 Single Loss）：Winning Orders count / 前面所有 count 之和
    let actualConversion = 100;

    if (index === 0) {
      // 第一个 stage：分子是当前 count，分母是线索总数（leadCount）
      actualConversion =
        leadCount > 0 ? Math.round((item.count / leadCount) * 100) : 0;
    } else if (index < stageCounts.length - 2) {
      // 第二个到倒数第三个：分子是当前 count，分母是从第一个到当前（含）的 count 之和
      const denominator = stageCounts
        .slice(0, index + 1)
        .reduce((sum, s) => sum + s.count, 0);
      actualConversion =
        denominator > 0 ? Math.round((item.count / denominator) * 100) : 0;
    } else {
      // 倒数第二个（Winning Orders）和倒数第一个（Single Loss）：分子是各自的 count，分母是全部 count 之和
      const denominator = stageCounts.reduce((sum, s) => sum + s.count, 0);
      actualConversion =
        denominator > 0 ? Math.round((item.count / denominator) * 100) : 0;
    }

    return {
      stage: item.stage.code,
      stageName: item.stage.name,
      count: item.count,
      value: item.value,
      targetConversion,
      actualConversion,
    };
  });
}

// 根据财年月份生成季度列表
export function getFiscalQuarters(orgNode: OrgNode | null): { label: string; months: string[] }[] {
  const months = getFiscalMonths(orgNode);
  const quarters: { label: string; months: string[] }[] = [];

  for (let i = 0; i < months.length; i += 3) {
    const qMonths = months.slice(i, i + 3);
    if (qMonths.length > 0) {
      quarters.push({
        label: `Q${quarters.length + 1}`,
        months: qMonths,
      });
    }
  }

  return quarters;
}

// 获取季度标签列表 ["Q1", "Q2", ...]
export function getQuarterLabels(orgNode: OrgNode | null): string[] {
  return getFiscalQuarters(orgNode).map((q) => q.label);
}

// 根据季度获取对应的月份列表
export function getMonthsForQuarter(orgNode: OrgNode | null, quarter: string): string[] {
  const quarters = getFiscalQuarters(orgNode);
  const found = quarters.find((q) => q.label === quarter);
  return found ? found.months : [];
}

// 按季度过滤 deals
export function filterDealsByQuarter(
  allDeals: Deal[],
  orgNode: OrgNode | null,
  quarter: string | undefined,
): Deal[] {
  if (!quarter) return allDeals;
  const months = getMonthsForQuarter(orgNode, quarter);
  if (months.length === 0) return allDeals;
  return allDeals.filter((deal) => deal.createdMonth && months.includes(deal.createdMonth));
}

// 按季度聚合 StackedHealthData
export function aggregateHealthDataByQuarter(
  monthlyData: StackedHealthDataPoint[],
  orgNode: OrgNode | null,
): StackedHealthDataPoint[] {
  const quarters = getFiscalQuarters(orgNode);

  return quarters.map((q) => {
    const qMonthData = monthlyData.filter((d) => q.months.includes(d.month));

    const aggregated: any = { month: q.label, target: 0 };

    qMonthData.forEach((md) => {
      aggregated.target += md.target || 0;
      Object.keys(md).forEach((key) => {
        if (key !== "month" && key !== "target") {
          aggregated[key] = (aggregated[key] || 0) + ((md[key] as number) || 0);
        }
      });
    });

    return aggregated as StackedHealthDataPoint;
  });
}
