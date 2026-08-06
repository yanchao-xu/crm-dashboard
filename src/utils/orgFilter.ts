import type {
  OrgNode,
  Deal,
  StagnationData,
  FunnelStage,
  StackedHealthDataPoint,
} from "@/types";
import { OpportunityStage } from "@/services/api";
import type { AmountMode } from "@/components/filters/AmountModeFilter";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";
import type { ExchangeRateService } from "@/services/exchangeRate";

// 月份缩写到 OrgNode 属性的映射（共用常量）
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

// 根据 amountMode 获取商机的金额值（含汇率转换）
export function getDealAmount(
  deal: Deal,
  amountMode: AmountMode = "expectedAmount",
  exchangeService?: ExchangeRateService | null,
  targetCurrencyCode?: string,
): number {
  let amount: number;
  if (amountMode === "businessAmount") {
    amount = deal.businessAmount ?? 0;
  } else {
    // contractAmount / receivableAmount 模式在漏斗/停滞图表中 fallback 到 expectedAmount
    amount = deal.value;
  }
  // 汇率转换
  if (exchangeService && targetCurrencyCode && deal.currencyCode) {
    return exchangeService.convert(amount, deal.currencyCode, targetCurrencyCode);
  }
  return amount;
}

// Get all person identifiers (email + id) under an organization node,
// 用于匹配 deal.owner / contract.owner / receivablePlan.paymentOwner
export function getOwnersInOrg(node: OrgNode): string[] {
  const owners: string[] = [];

  function collectOwners(n: OrgNode) {
    if (n.type === "person") {
      if (n.memberEmail) owners.push(n.memberEmail);
      if (n.memberId) owners.push(n.memberId);
    }
    if (n.children) {
      n.children.forEach(collectOwners);
    }
  }

  collectOwners(node);
  return owners;
}

/**
 * 按应收计划的回款负责人过滤。
 * 未选择组织时保留所有计划；选择组织后，无负责人或负责人不匹配的计划会被排除。
 */
export function filterReceivablePlansByOrg(
  allPlans: ReceivablePlanMap,
  selectedOrg: OrgNode | null,
): ReceivablePlanMap {
  if (!selectedOrg) return allPlans;

  const orgOwnerKeys = new Set(
    getOwnersInOrg(selectedOrg).map((key) => key.trim().toLowerCase()),
  );
  const filtered: ReceivablePlanMap = new Map();

  allPlans.forEach((plans, contractId) => {
    const matched = plans.filter((plan) => {
      const keys = plan.paymentOwnerKeys?.length
        ? plan.paymentOwnerKeys
        : plan.paymentOwner
          ? [plan.paymentOwner]
          : [];
      return keys.some((key) =>
        orgOwnerKeys.has(String(key).trim().toLowerCase()),
      );
    });

    if (matched.length > 0) {
      filtered.set(contractId, matched);
    }
  });

  return filtered;
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

// 特殊标识：用于筛选无产品线的商机
export const NO_PRODUCT_LINE_ID = "__no_product_line__";

// Filter deals by product line
export function filterDealsByProduct(
  allDeals: Deal[],
  selectedProducts: string[],
): Deal[] {
  if (selectedProducts.length === 0) {
    return allDeals;
  }

  const includeNoProduct = selectedProducts.includes(NO_PRODUCT_LINE_ID);
  const productIds = selectedProducts.filter((id) => id !== NO_PRODUCT_LINE_ID);

  return allDeals.filter((deal) => {
    const hasProductLine = deal.productLine && deal.productLine.length > 0;

    if (includeNoProduct && !hasProductLine) {
      return true;
    }

    if (productIds.length > 0 && hasProductLine) {
      return deal.productLine!.some((pl) => productIds.includes(pl));
    }

    return false;
  });
}

// Filter deals by month (for health chart click)
// 支持月份标签 ("Apr") 或 yearMonth ("2026-04") 格式
export function filterDealsByMonth(
  allDeals: Deal[],
  month: string | undefined,
): Deal[] {
  if (!month) {
    return allDeals;
  }
  // 如果是 yearMonth 格式 (YYYY-MM)，按 createdYearMonth 匹配
  if (/^\d{4}-\d{2}$/.test(month)) {
    return allDeals.filter((deal) => deal.createdYearMonth === month);
  }
  // 兼容旧的月份标签格式
  return allDeals.filter((deal) => deal.createdMonth === month);
}

// 根据财年起止日期生成月份列表
export function getFiscalMonths(orgNode: OrgNode | null): string[] {
  const allMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const hasStart = !!orgNode?.theStartDateOfTheFiscalYear;
  const hasEnd = !!orgNode?.theEndDateOfTheFiscalYear;

  if (!hasStart && !hasEnd) {
    return allMonths;
  }

  try {
    let startMonth: number;

    if (hasStart) {
      startMonth = new Date(orgNode!.theStartDateOfTheFiscalYear!).getMonth();
    } else {
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

// 财年月份带年份信息的类型
export interface FiscalMonthInfo {
  label: string;      // "Apr" — 用于图表显示
  yearMonth: string;  // "2026-04" — 用于数据匹配
}

// 根据财年起止日期生成带年份信息的月份列表，用于跨年财年的精确匹配
// selectedYear: 用户选中的年份，用于替代组织配置中的年份部分
export function getFiscalYearMonths(orgNode: OrgNode | null, selectedYear?: number): FiscalMonthInfo[] {
  const allMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const hasStart = !!orgNode?.theStartDateOfTheFiscalYear;
  const hasEnd = !!orgNode?.theEndDateOfTheFiscalYear;

  if (!hasStart && !hasEnd) {
    // 没有财年配置时，使用 selectedYear 或当前自然年 Jan~Dec
    const year = selectedYear ?? new Date().getFullYear();
    return allMonths.map((m, i) => ({
      label: m,
      yearMonth: `${year}-${String(i + 1).padStart(2, "0")}`,
    }));
  }

  try {
    let startYear: number;
    let startMonth: number; // 0-based

    if (hasStart) {
      const startDate = new Date(orgNode!.theStartDateOfTheFiscalYear!);
      startMonth = startDate.getMonth();
      // 使用 selectedYear 替代配置中的年份
      startYear = selectedYear ?? startDate.getFullYear();
    } else {
      const endDate = new Date(orgNode!.theEndDateOfTheFiscalYear!);
      const endMonth = endDate.getMonth();
      startMonth = (endMonth - 11 + 12) % 12;
      if (selectedYear != null) {
        // 开始月 > 结束月 表示跨年，开始年份就是 selectedYear
        startYear = selectedYear;
      } else {
        startYear = startMonth > endMonth ? endDate.getFullYear() - 1 : endDate.getFullYear();
      }
    }

    const result: FiscalMonthInfo[] = [];
    for (let i = 0; i < 12; i++) {
      const monthIdx = (startMonth + i) % 12;
      const year = startYear + Math.floor((startMonth + i) / 12);
      result.push({
        label: allMonths[monthIdx],
        yearMonth: `${year}-${String(monthIdx + 1).padStart(2, "0")}`,
      });
    }
    return result;
  } catch {
    const year = selectedYear ?? new Date().getFullYear();
    return allMonths.map((m, i) => ({
      label: m,
      yearMonth: `${year}-${String(i + 1).padStart(2, "0")}`,
    }));
  }
}

/**
 * 将按月份/阶段聚合好的金额数据转换为图表数据点数组
 * 共用逻辑：monthlyData → StackedHealthDataPoint[]
 * key 使用 yearMonth ("2026-04") 格式进行精确匹配，避免跨年数据错位
 */
function buildHealthDataPoints(
  monthlyData: Map<string, Map<string, number>>,
  selectedOrg: OrgNode | null,
  stages: OpportunityStage[],
  exchangeService?: ExchangeRateService | null,
  targetCurrencyCode?: string,
  selectedYear?: number,
): StackedHealthDataPoint[] {
  const fiscalYearMonths = getFiscalYearMonths(selectedOrg, selectedYear);

  return fiscalYearMonths.map(({ label, yearMonth }) => {
    const stageData = monthlyData.get(yearMonth) || new Map();

    let target = 0;
    if (selectedOrg) {
      const monthField = monthFieldMap[label];
      const monthValue = selectedOrg[monthField];
      target = typeof monthValue === "number" ? monthValue : 0;
      // 对组织目标金额做汇率转换
      if (exchangeService && targetCurrencyCode && selectedOrg.currencyCode) {
        target = exchangeService.convert(target, selectedOrg.currencyCode, targetCurrencyCode);
      }
    }

    const dataPoint: any = { month: label, target };

    stages.forEach((stage) => {
      dataPoint[stage.code] = stageData.get(stage.code) || 0;
    });

    return dataPoint as StackedHealthDataPoint;
  });
}

/**
 * 向 monthlyData 中累加金额
 * key 为 yearMonth 格式 ("2026-04")，确保跨年时数据不会错位
 */
function addToMonthlyData(
  monthlyData: Map<string, Map<string, number>>,
  yearMonth: string,
  stage: string,
  amount: number,
) {
  if (!yearMonth) return;
  if (!monthlyData.has(yearMonth)) {
    monthlyData.set(yearMonth, new Map());
  }
  const stageData = monthlyData.get(yearMonth)!;
  stageData.set(stage, (stageData.get(stage) || 0) + amount);
}

// Recalculate stacked health data based on filtered deals
export function calculateStackedHealthData(
  filteredDeals: Deal[],
  selectedOrg: OrgNode | null,
  stages: OpportunityStage[] = [],
  amountMode: AmountMode = "expectedAmount",
  exchangeService?: ExchangeRateService | null,
  targetCurrencyCode?: string,
  selectedYear?: number,
): StackedHealthDataPoint[] {
  if (stages.length === 0) return [];

  const monthlyData = new Map<string, Map<string, number>>();

  filteredDeals.forEach((deal) => {
    const yearMonth = deal.createdYearMonth;
    if (!yearMonth) return;
    addToMonthlyData(monthlyData, yearMonth, deal.stage, getDealAmount(deal, amountMode, exchangeService, targetCurrencyCode));
  });

  return buildHealthDataPoints(monthlyData, selectedOrg, stages, exchangeService, targetCurrencyCode, selectedYear);
}

// 计算合同金额模式下的健康度图表数据
export function calculateContractHealthData(
  filteredDeals: Deal[],
  selectedOrg: OrgNode | null,
  stages: OpportunityStage[] = [],
  contractMap: ContractMap,
  exchangeService?: ExchangeRateService | null,
  targetCurrencyCode?: string,
  selectedYear?: number,
): StackedHealthDataPoint[] {
  if (stages.length === 0) return [];

  const monthlyData = new Map<string, Map<string, number>>();

  filteredDeals.forEach((deal) => {
    if (!deal.contractNumber) return;

    const contracts = contractMap.get(deal.contractNumber);
    if (!contracts || contracts.length === 0) return;

    contracts.forEach((contract) => {
      const yearMonth = contract.signingYearMonth || deal.createdYearMonth;
      if (!yearMonth) return;
      let amount = contract.totalAmountWithTax;
      // 汇率转换：使用合同自身的 currencyCode
      if (exchangeService && targetCurrencyCode && contract.currencyCode) {
        amount = exchangeService.convert(amount, contract.currencyCode, targetCurrencyCode);
      }
      addToMonthlyData(monthlyData, yearMonth, deal.stage, amount);
    });
  });

  return buildHealthDataPoints(monthlyData, selectedOrg, stages, exchangeService, targetCurrencyCode, selectedYear);
}

// 计算实际回款金额模式下的健康度图表数据
export function calculateReceivableHealthData(
  filteredDeals: Deal[],
  selectedOrg: OrgNode | null,
  stages: OpportunityStage[] = [],
  contractMap: ContractMap,
  receivablePlanMap: ReceivablePlanMap,
  exchangeService?: ExchangeRateService | null,
  targetCurrencyCode?: string,
  selectedYear?: number,
): StackedHealthDataPoint[] {
  if (stages.length === 0) return [];

  const monthlyData = new Map<string, Map<string, number>>();

  filteredDeals.forEach((deal) => {
    if (!deal.contractNumber) return;

    const contracts = contractMap.get(deal.contractNumber);
    if (!contracts || contracts.length === 0) return;

    contracts.forEach((contract) => {
      const plans = receivablePlanMap.get(String(contract.id));
      if (!plans || plans.length === 0) return;

      plans.forEach((plan) => {
        const yearMonth = plan.actualYearMonth || deal.createdYearMonth;
        if (!yearMonth) return;
        let amount = plan.actualAmount;
        // 汇率转换：使用应收计划自身的 currencyCode
        if (exchangeService && targetCurrencyCode && plan.currencyCode) {
          amount = exchangeService.convert(amount, plan.currencyCode, targetCurrencyCode);
        }
        addToMonthlyData(monthlyData, yearMonth, deal.stage, amount);
      });
    });
  });

  return buildHealthDataPoints(monthlyData, selectedOrg, stages, exchangeService, targetCurrencyCode, selectedYear);
}

// Recalculate stagnation data based on filtered deals
export function calculateStagnationData(
  filteredDeals: Deal[],
  stages: OpportunityStage[] = [],
  amountMode: AmountMode = "expectedAmount",
  contractMap?: ContractMap,
  receivablePlanMap?: ReceivablePlanMap,
  selectedMonths?: string[],
  dealsForAmount?: Deal[],
  exchangeService?: ExchangeRateService | null,
  targetCurrencyCode?: string,
): StagnationData[] {
  if (stages.length === 0) return [];

  const useContractAmounts = amountMode === "contractAmount" && contractMap;
  const useReceivableAmounts = amountMode === "receivableAmount" && contractMap && receivablePlanMap;

  // 金额按时间维度独立计算：遍历全量 deals，找时间匹配的合同/回款，按商机 stage+activityStatus 归类
  let amountByStageAndStatus: Map<string, { active: number; over30: number; over60: number; zombie: number }> | undefined;

  if (useContractAmounts || useReceivableAmounts) {
    amountByStageAndStatus = new Map();
    const amountDeals = dealsForAmount || filteredDeals;
    amountDeals.forEach((deal) => {
      if (!deal.contractNumber || !contractMap) return;
      const contracts = contractMap.get(deal.contractNumber);
      if (!contracts || contracts.length === 0) return;

      const statusKey = deal.lastActivityDays >= 90 ? "zombie"
        : deal.lastActivityDays >= 60 ? "over60"
        : deal.lastActivityDays >= 30 ? "over30"
        : "active";

      contracts.forEach((contract) => {
        if (useReceivableAmounts && receivablePlanMap) {
          const plans = receivablePlanMap.get(String(contract.id));
          if (!plans) return;
          plans.forEach((plan) => {
            const yearMonth = plan.actualYearMonth;
            if (selectedMonths && selectedMonths.length > 0 && yearMonth && !selectedMonths.includes(yearMonth)) return;
            let amount = plan.actualAmount;
            if (exchangeService && targetCurrencyCode && plan.currencyCode) {
              amount = exchangeService.convert(amount, plan.currencyCode, targetCurrencyCode);
            }
            if (!amountByStageAndStatus!.has(deal.stage)) {
              amountByStageAndStatus!.set(deal.stage, { active: 0, over30: 0, over60: 0, zombie: 0 });
            }
            amountByStageAndStatus!.get(deal.stage)![statusKey] += amount;
          });
        } else {
          const yearMonth = contract.signingYearMonth;
          if (selectedMonths && selectedMonths.length > 0 && yearMonth && !selectedMonths.includes(yearMonth)) return;
          let amount = contract.totalAmountWithTax;
          if (exchangeService && targetCurrencyCode && contract.currencyCode) {
            amount = exchangeService.convert(amount, contract.currencyCode, targetCurrencyCode);
          }
          if (!amountByStageAndStatus!.has(deal.stage)) {
            amountByStageAndStatus!.set(deal.stage, { active: 0, over30: 0, over60: 0, zombie: 0 });
          }
          amountByStageAndStatus!.get(deal.stage)![statusKey] += amount;
        }
      });
    });
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

    let activeAmount: number;
    let over30Amount: number;
    let over60Amount: number;
    let zombieAmount: number;

    if (amountByStageAndStatus) {
      const stageAmounts = amountByStageAndStatus.get(stage.code) || { active: 0, over30: 0, over60: 0, zombie: 0 };
      activeAmount = stageAmounts.active;
      over30Amount = stageAmounts.over30;
      over60Amount = stageAmounts.over60;
      zombieAmount = stageAmounts.zombie;
    } else {
      activeAmount = activeDeals.reduce((sum, d) => sum + getDealAmount(d, amountMode, exchangeService, targetCurrencyCode), 0);
      over30Amount = over30Deals.reduce((sum, d) => sum + getDealAmount(d, amountMode, exchangeService, targetCurrencyCode), 0);
      over60Amount = over60Deals.reduce((sum, d) => sum + getDealAmount(d, amountMode, exchangeService, targetCurrencyCode), 0);
      zombieAmount = zombieDeals.reduce((sum, d) => sum + getDealAmount(d, amountMode, exchangeService, targetCurrencyCode), 0);
    }

    return {
      stage: stage.code,
      stageName: stage.name,
      active: activeDeals.length,
      over30: over30Deals.length,
      over60: over60Deals.length,
      zombie: zombieDeals.length,
      activeAmount,
      over30Amount,
      over60Amount,
      zombieAmount,
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

// Recalculate funnel data based on filtered deals
export function calculateFunnelData(
  filteredDeals: Deal[],
  stages: OpportunityStage[] = [],
  selectedOrg: OrgNode | null = null,
  leadCount: number = 0,
  amountMode: AmountMode = "expectedAmount",
  contractMap?: ContractMap,
  receivablePlanMap?: ReceivablePlanMap,
  selectedMonths?: string[],
  dealsForAmount?: Deal[],
  exchangeService?: ExchangeRateService | null,
  targetCurrencyCode?: string,
): FunnelStage[] {
  if (stages.length === 0) return [];

  const useContractAmounts = amountMode === "contractAmount" && contractMap;
  const useReceivableAmounts = amountMode === "receivableAmount" && contractMap && receivablePlanMap;

  // 金额按时间维度独立计算：遍历全量 deals，找时间匹配的合同/回款，按商机 stage 归类
  let amountByStage: Map<string, number> | undefined;

  if (useContractAmounts || useReceivableAmounts) {
    amountByStage = new Map();
    const amountDeals = dealsForAmount || filteredDeals;
    amountDeals.forEach((deal) => {
      if (!deal.contractNumber || !contractMap) return;
      const contracts = contractMap.get(deal.contractNumber);
      if (!contracts || contracts.length === 0) return;

      contracts.forEach((contract) => {
        if (useReceivableAmounts && receivablePlanMap) {
          const plans = receivablePlanMap.get(String(contract.id));
          if (!plans) return;
          plans.forEach((plan) => {
            const yearMonth = plan.actualYearMonth;
            if (selectedMonths && selectedMonths.length > 0 && yearMonth && !selectedMonths.includes(yearMonth)) return;
            let amount = plan.actualAmount;
            if (exchangeService && targetCurrencyCode && plan.currencyCode) {
              amount = exchangeService.convert(amount, plan.currencyCode, targetCurrencyCode);
            }
            amountByStage!.set(deal.stage, (amountByStage!.get(deal.stage) || 0) + amount);
          });
        } else {
          const yearMonth = contract.signingYearMonth;
          if (selectedMonths && selectedMonths.length > 0 && yearMonth && !selectedMonths.includes(yearMonth)) return;
          let amount = contract.totalAmountWithTax;
          if (exchangeService && targetCurrencyCode && contract.currencyCode) {
            amount = exchangeService.convert(amount, contract.currencyCode, targetCurrencyCode);
          }
          amountByStage!.set(deal.stage, (amountByStage!.get(deal.stage) || 0) + amount);
        }
      });
    });
  }

  const stageCounts = stages.map((stage) => {
    const stageDeals = filteredDeals.filter((d) => d.stage === stage.code);
    let value: number;
    if (amountByStage) {
      value = amountByStage.get(stage.code) || 0;
    } else {
      value = stageDeals.reduce((sum, d) => sum + getDealAmount(d, amountMode, exchangeService, targetCurrencyCode), 0);
    }
    return {
      stage,
      count: stageDeals.length,
      value,
    };
  });

  return stageCounts.map((item, index) => {
    let targetConversion = 0;
    if (selectedOrg) {
      const field = stageToConversionField[item.stage.code];
      if (field) {
        const val = selectedOrg[field];
        targetConversion = typeof val === "number" ? val : 0;
      }
    }

    let actualConversion = 100;

    if (index === 0) {
      actualConversion =
        leadCount > 0 ? Math.round((item.count / leadCount) * 100) : 0;
    } else if (index < stageCounts.length - 2) {
      const denominator = stageCounts
        .slice(0, index + 1)
        .reduce((sum, s) => sum + s.count, 0);
      actualConversion =
        denominator > 0 ? Math.round((item.count / denominator) * 100) : 0;
    } else {
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

// 获取季度标签列表
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
