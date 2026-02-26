import {
  OrgNode,
  Deal,
  deals,
  healthData,
  stagnationData,
  funnelData,
  HealthDataPoint,
  StagnationData,
  FunnelStage,
  stackedHealthData,
  StackedHealthDataPoint,
  productGroups,
} from "@/data/mockData";

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
    (deal) => deal.productGroup && selectedProducts.includes(deal.productGroup),
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
): StackedHealthDataPoint[] {
  if (!selectedOrg) {
    return stackedHealthData;
  }

  // Calculate ratio based on org quota vs total quota
  const orgQuota = selectedOrg.quota || 0;
  const totalQuota = 10000000; // From mock data company node
  const ratio = orgQuota / totalQuota || 0.1;

  return stackedHealthData.map((point) => ({
    ...point,
    target: Math.round(point.target * ratio),
    Discovery: Math.round(point.Discovery * ratio),
    Qualification: Math.round(point.Qualification * ratio),
    Proposal: Math.round(point.Proposal * ratio),
    Negotiation: Math.round(point.Negotiation * ratio),
    Closing: Math.round(point.Closing * ratio),
  }));
}

// Legacy: Recalculate health data based on filtered deals
export function calculateHealthData(
  filteredDeals: Deal[],
  selectedOrg: OrgNode | null,
): HealthDataPoint[] {
  if (!selectedOrg) {
    return healthData;
  }

  // Calculate ratio based on org quota vs total quota
  const orgQuota = selectedOrg.quota || 0;
  const totalQuota = 10000000; // From mock data company node
  const ratio = orgQuota / totalQuota || 0.1;

  return healthData.map((point) => ({
    ...point,
    target: Math.round(point.target * ratio),
    actual: Math.round(point.actual * ratio),
  }));
}

// Recalculate stagnation data based on filtered deals
export function calculateStagnationData(
  filteredDeals: Deal[],
): StagnationData[] {
  const stages = [
    "Discovery",
    "Qualification",
    "Proposal",
    "Negotiation",
    "Closing",
  ];

  return stages.map((stage) => {
    const stageDeals = filteredDeals.filter((d) => d.stage === stage);

    const activeDeals = stageDeals.filter((d) => d.lastActivityDays < 30);
    const over30Deals = stageDeals.filter(
      (d) => d.lastActivityDays >= 30 && d.lastActivityDays < 60,
    );
    const over60Deals = stageDeals.filter(
      (d) => d.lastActivityDays >= 60 && d.lastActivityDays < 90,
    );
    const zombieDeals = stageDeals.filter((d) => d.lastActivityDays >= 90);

    return {
      stage,
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
export function calculateFunnelData(filteredDeals: Deal[]): FunnelStage[] {
  const stages = [
    "Discovery",
    "Qualification",
    "Proposal",
    "Negotiation",
    "Closing",
  ];
  // Realistic target conversions (step-by-step decrease typical of real funnels)
  const targetConversions = [30, 45, 55, 45, 65];

  return stages.map((stage, index) => {
    const stageDeals = filteredDeals.filter((d) => d.stage === stage);
    const count = stageDeals.length;
    const value = stageDeals.reduce((sum, d) => sum + d.value, 0);

    // Calculate actual conversion (simplified - based on probability)
    const avgProbability =
      count > 0
        ? stageDeals.reduce((sum, d) => sum + d.probability, 0) / count
        : 0;

    return {
      stage,
      count,
      value,
      targetConversion: targetConversions[index],
      actualConversion: Math.round(avgProbability),
    };
  });
}

// Get teams from org structure for comparison filter
export function getTeamsFromOrg(
  org: OrgNode,
): { id: string; name: { zh: string; en: string } }[] {
  const teams: { id: string; name: { zh: string; en: string } }[] = [];

  function collectTeams(node: OrgNode) {
    if (node.type === "team") {
      teams.push({ id: node.id, name: node.name });
    }
    if (node.children) {
      node.children.forEach(collectTeams);
    }
  }

  collectTeams(org);
  return teams;
}
