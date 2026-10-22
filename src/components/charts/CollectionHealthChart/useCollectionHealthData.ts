import { useMemo } from "react";
import type { OrgNode, Contract, ReceivablePlan } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";
import type { ExchangeRateService } from "@/services/exchangeRate";

export interface CollectionHealthDataPoint {
  month: string;
  target: number; // 应收总额 = nativePlan + rolledOverdue（向后兼容）
  actual: number; // 该月的 actualAmount 累加
  nativePlan: number; // 当月原生计划金额
  rolledOverdue: number; // 滚动逾期累积金额
}

/** 逾期状态 */
export type OverdueStatus = "normal" | "dueSoon" | "overdue" | "completed";

/** 单条合同滚动信息（供 ContractsTable 使用） */
export interface RollingContractInfo {
  contractId: string;
  planId: string;
  contractCode: string;
  isOverdue: boolean;
  rollingSourceMonth: string | null; // "YYYY-MM" 格式，null 表示原生计划
  overdueAmount: number;
  status: OverdueStatus;
}

/** 按月汇总的滚动合同映射 */
export type MonthlyRollingMap = Map<string, RollingContractInfo[]>;

/** calculateCollectionHealthFromApi 返回值 */
export interface CollectionHealthResult {
  chartData: CollectionHealthDataPoint[];
  rollingMap: MonthlyRollingMap;
}

const ALL_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// 财年月份带年份信息的类型
interface FiscalMonthInfo {
  label: string;      // "Apr" — 用于图表显示
  yearMonth: string;  // "2026-04" — 用于数据匹配
}

/**
 * 根据组织树的财年配置，获取 12 个月的月份列表（从财年起始月开始排列）
 */
function getFiscalMonths(orgNode: OrgNode | null): string[] {
  const hasStart = !!orgNode?.theStartDateOfTheFiscalYear;
  const hasEnd = !!orgNode?.theEndDateOfTheFiscalYear;

  if (!hasStart && !hasEnd) {
    return ALL_MONTHS;
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
      result.push(ALL_MONTHS[(startMonth + i) % 12]);
    }
    return result;
  } catch {
    return ALL_MONTHS;
  }
}

/**
 * 根据组织树的财年配置，获取带年份信息的 12 个月份列表
 * selectedYear: 用户选中的年份，用于替代组织配置中的年份部分
 */
function getFiscalYearMonths(orgNode: OrgNode | null, selectedYear?: number): FiscalMonthInfo[] {
  const hasStart = !!orgNode?.theStartDateOfTheFiscalYear;
  const hasEnd = !!orgNode?.theEndDateOfTheFiscalYear;

  if (!hasStart && !hasEnd) {
    const year = selectedYear ?? new Date().getFullYear();
    return ALL_MONTHS.map((m, i) => ({
      label: m,
      yearMonth: `${year}-${String(i + 1).padStart(2, "0")}`,
    }));
  }

  try {
    let startYear: number;
    let startMonth: number;

    if (hasStart) {
      const startDate = new Date(orgNode!.theStartDateOfTheFiscalYear!);
      startMonth = startDate.getMonth();
      startYear = selectedYear ?? startDate.getFullYear();
    } else {
      const endDate = new Date(orgNode!.theEndDateOfTheFiscalYear!);
      const endMonth = endDate.getMonth();
      startMonth = (endMonth - 11 + 12) % 12;
      if (selectedYear != null) {
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
        label: ALL_MONTHS[monthIdx],
        yearMonth: `${year}-${String(monthIdx + 1).padStart(2, "0")}`,
      });
    }
    return result;
  } catch {
    const year = selectedYear ?? new Date().getFullYear();
    return ALL_MONTHS.map((m, i) => ({
      label: m,
      yearMonth: `${year}-${String(i + 1).padStart(2, "0")}`,
    }));
  }
}

// ─── 逾期判定辅助函数 ───────────────────────────────────────

/** 当前状态判定；滚动金额按各月月初余额单独计算。 */
function determineOverdueStatus(plan: ReceivablePlan, now: Date): OverdueStatus {
  if (!plan.plannedDate) return "normal";

  const plannedDate = new Date(plan.plannedDate);
  if (isNaN(plannedDate.getTime())) return "normal";

  if (plan.actualAmount >= plan.plannedAmount) return "completed";

  if (plannedDate >= now) {
    const daysUntilDue = Math.floor(
      (plannedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilDue <= 14 && plan.actualAmount === 0 ? "dueSoon" : "normal";
  }

  return "overdue";
}

/**
 * 计算一笔计划在目标月份月初的逾期余额。
 * actualAmount 视为在 actualYearMonth 一次发生：回款当月仍展示月初余额，
 * 从下个月起才扣除该笔回款，避免回款在当月目标和待收中被重复扣减。
 */
function getOpeningOverdueAmount(plan: ReceivablePlan, targetYearMonth: string): number {
  const plannedAmount = Math.max(plan.plannedAmount, 0);
  if (plan.actualAmount <= 0) return plannedAmount;

  const actualYearMonth = plan.actualYearMonth || plan.actualDate?.slice(0, 7);
  if (!actualYearMonth) {
    return Math.max(plannedAmount - plan.actualAmount, 0);
  }

  const paidBeforeTargetMonth = actualYearMonth < targetYearMonth;
  return Math.max(
    plannedAmount - (paidBeforeTargetMonth ? plan.actualAmount : 0),
    0,
  );
}

// ─── 主计算函数 ───────────────────────────────────────

/** 根据应收计划计算月初滚动逾期、当月原生计划与实际回款。 */
export function calculateCollectionHealthFromApi(
  contractMap: ContractMap,
  receivablePlanMap: ReceivablePlanMap,
  selectedOrg: OrgNode | null,
  exchangeService: ExchangeRateService | null,
  targetCurrencyCode?: string,
  allowedContractNumbers?: Set<string>,
  selectedYear?: number,
): CollectionHealthResult {
  const fiscalYearMonths = getFiscalYearMonths(selectedOrg, selectedYear);
  const now = new Date();
  const monthlyNativePlan: Record<string, number> = {};
  const monthlyRolledOverdue: Record<string, number> = {};
  const monthlyActual: Record<string, number> = {};
  const rollingMap: MonthlyRollingMap = new Map();

  fiscalYearMonths.forEach(({ yearMonth }) => {
    monthlyNativePlan[yearMonth] = 0;
    monthlyRolledOverdue[yearMonth] = 0;
    monthlyActual[yearMonth] = 0;
    rollingMap.set(yearMonth, []);
  });

  const getRate = (currencyCode?: string): number => {
    if (!exchangeService || !targetCurrencyCode || !currencyCode) return 1;
    return exchangeService.getRate(currencyCode, targetCurrencyCode);
  };
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const contractById = new Map<string, Contract>();
  contractMap.forEach((contracts, contractCode) => {
    if (allowedContractNumbers && !allowedContractNumbers.has(contractCode)) return;
    contracts.forEach((contract) => contractById.set(String(contract.id), contract));
  });

  interface PlanInfo {
    plan: ReceivablePlan;
    contractId: string;
    contractCode: string;
    rate: number;
    status: OverdueStatus;
  }
  const allPlanInfos: PlanInfo[] = [];

  receivablePlanMap.forEach((plans, mapContractId) => {
    plans.forEach((plan) => {
      const contractId = String(plan.parentDataId || mapContractId);
      const contract = contractById.get(contractId);
      if (allowedContractNumbers && !contract) return;

      const rate = getRate(plan.currencyCode);
      allPlanInfos.push({
        plan,
        contractId,
        contractCode: contract?.contractCode || "",
        rate,
        status: determineOverdueStatus(plan, now),
      });

      // 当前接口每条计划只有一组 actualAmount/actualDate，按该回款月份一次归集。
      if (plan.actualYearMonth && plan.actualAmount > 0) {
        if (monthlyActual[plan.actualYearMonth] !== undefined) {
          monthlyActual[plan.actualYearMonth] += plan.actualAmount * rate;
        }
      }
    });
  });

  // Step 1: 当月原生计划。
  allPlanInfos.forEach(({ plan, contractId, contractCode, rate, status }) => {
    const ym = plan.plannedYearMonth;
    if (ym && monthlyNativePlan[ym] !== undefined) {
      monthlyNativePlan[ym] += plan.plannedAmount * rate;
      rollingMap.get(ym)?.push({
        contractId,
        planId: plan.id,
        contractCode,
        isOverdue: status === "overdue",
        rollingSourceMonth: null,
        overdueAmount: 0,
        status,
      });
    }
  });

  // Step 2: 每月橙色柱表示该月月初从以前月份结转的逾期余额。
  allPlanInfos.forEach(({ plan, contractId, contractCode, rate, status }) => {
    const sourceYM = plan.plannedYearMonth;
    if (!sourceYM) return;

    const sourceIndex = fiscalYearMonths.findIndex((m) => m.yearMonth === sourceYM);
    if (sourceIndex < 0) return; // 不包含上一财年的期初逾期。

    for (let i = sourceIndex + 1; i < fiscalYearMonths.length; i++) {
      const targetYM = fiscalYearMonths[i].yearMonth;
      if (targetYM > currentYM) break;

      const openingAmount = getOpeningOverdueAmount(plan, targetYM);
      if (openingAmount <= 0) continue;

      const convertedOpeningAmount = openingAmount * rate;
      monthlyRolledOverdue[targetYM] += convertedOpeningAmount;
      rollingMap.get(targetYM)?.push({
        contractId,
        planId: plan.id,
        contractCode,
        isOverdue: true,
        rollingSourceMonth: sourceYM,
        overdueAmount: convertedOpeningAmount,
        status: "overdue",
      });
    }
  });

  const chartData = fiscalYearMonths.map(({ label, yearMonth }) => {
    const nativePlan = Math.round(monthlyNativePlan[yearMonth]);
    const rolledOverdue = Math.round(monthlyRolledOverdue[yearMonth]);
    const actual = Math.round(monthlyActual[yearMonth]);
    return {
      month: label,
      nativePlan,
      rolledOverdue,
      target: nativePlan + rolledOverdue,
      actual,
    };
  });

  return { chartData, rollingMap };
}

export interface CollectionHealthMetrics {
  target: number;
  pending: number;
  rate: number;
  isHealthy: boolean;
}

/** 统一月度与汇总卡片使用的应收、待收、回款率公式。 */
export function calculateCollectionHealthMetrics(
  nativePlan: number,
  openingRolledOverdue: number,
  actual: number,
): CollectionHealthMetrics {
  const target = nativePlan + openingRolledOverdue;
  return {
    target,
    pending: Math.max(target - actual, 0),
    rate: target > 0 ? Math.round((actual / target) * 100) : 0,
    isHealthy: actual >= target * 0.9,
  };
}

/** 统计期间只计一次期初逾期，避免逐月重复累计同一笔结转。 */
export function useCollectionHealthData(data: CollectionHealthDataPoint[], fiscalMonths?: string[]) {
  return useMemo(() => {
    const currentMonthAbbr = ALL_MONTHS[new Date().getMonth()];
    let sliceEnd = data.length;
    const monthIndex = data.findIndex((d) => d.month === currentMonthAbbr);

    if (monthIndex >= 0) {
      sliceEnd = monthIndex + 1;
    } else {
      const isQuarterMode = data.some((d) => d.month.startsWith("Q"));
      if (isQuarterMode && fiscalMonths && fiscalMonths.length === 12) {
        const posInFiscal = fiscalMonths.indexOf(currentMonthAbbr);
        if (posInFiscal >= 0) {
          sliceEnd = Math.min(Math.floor(posInFiscal / 3) + 1, data.length);
        }
      } else if (isQuarterMode) {
        sliceEnd = Math.min(Math.floor(new Date().getMonth() / 3) + 1, data.length);
      }
    }

    const dataUpToCurrent = data.slice(0, sliceEnd);
    const totalNativePlan = dataUpToCurrent.reduce(
      (sum, d) => sum + (d.nativePlan || 0),
      0,
    );
    const totalRolledOverdue = dataUpToCurrent[0]?.rolledOverdue || 0;
    const totalActual = dataUpToCurrent.reduce((sum, d) => sum + d.actual, 0);
    const metrics = calculateCollectionHealthMetrics(
      totalNativePlan,
      totalRolledOverdue,
      totalActual,
    );

    return {
      totalTarget: metrics.target,
      totalActual,
      totalNativePlan,
      totalRolledOverdue,
      totalPending: metrics.pending,
      rate: metrics.rate,
      isHealthy: metrics.isHealthy,
    };
  }, [data, fiscalMonths]);
}

/** 每季度只取首月的期初逾期，加上季度内原生计划，避免重复累计结转。 */
export function aggregateCollectionHealthByQuarter(
  monthlyData: CollectionHealthDataPoint[],
  orgNode: OrgNode | null,
): CollectionHealthDataPoint[] {
  const fiscalMonths = getFiscalMonths(orgNode);
  const quarters: { label: string; months: string[] }[] = [];

  for (let i = 0; i < fiscalMonths.length; i += 3) {
    const qMonths = fiscalMonths.slice(i, i + 3);
    if (qMonths.length > 0) {
      quarters.push({ label: `Q${quarters.length + 1}`, months: qMonths });
    }
  }

  return quarters.map((q) => {
    const qMonthData = monthlyData.filter((d) => q.months.includes(d.month));
    const nativePlan = qMonthData.reduce(
      (sum, d) => sum + (d.nativePlan || 0),
      0,
    );
    const rolledOverdue = qMonthData[0]?.rolledOverdue || 0;
    const actual = qMonthData.reduce((sum, d) => sum + d.actual, 0);
    return {
      month: q.label,
      nativePlan,
      rolledOverdue,
      target: nativePlan + rolledOverdue,
      actual,
    };
  });
}
