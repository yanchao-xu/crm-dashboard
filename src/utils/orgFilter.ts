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

// Recalculate stacked health data based on filtered deals
export function calculateStackedHealthData(
  filteredDeals: Deal[],
  selectedOrg: OrgNode | null,
  stages: OpportunityStage[] = [],
): StackedHealthDataPoint[] {
  if (stages.length === 0) {
    return [];
  }
  console.log("selectedOrg", selectedOrg);
  const months = [
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

// Recalculate funnel data based on filtered deals (with realistic conversion rates)
export function calculateFunnelData(
  filteredDeals: Deal[],
  stages: OpportunityStage[] = [],
): FunnelStage[] {
  if (stages.length === 0) {
    return [];
  }

  const targetConversions = [30, 45, 55, 45, 65];
  return stages.map((stage, index) => {
    const stageDeals = filteredDeals.filter((d) => d.stage === stage.code);
    const count = stageDeals.length;
    const value = stageDeals.reduce((sum, d) => sum + d.value, 0);

    // Calculate actual conversion (simplified - based on probability)
    const avgProbability =
      count > 0
        ? stageDeals.reduce((sum, d) => sum + d.probability, 0) / count
        : 0;

    return {
      stage: stage.code,
      stageName: stage.name, // 直接使用 name
      count,
      value,
      targetConversion: targetConversions[index] || 50,
      actualConversion: Math.round(avgProbability),
    };
  });
}
