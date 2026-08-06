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

/** 获取某月最后一天 */
function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

/** 判断两个日期是否为同一年月 */
function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** 逾期判定 */
function determineOverdueStatus(plan: ReceivablePlan, now: Date): {
  status: OverdueStatus;
  overdueAmount: number;
  shouldRoll: boolean;
} {
  // 无计划日期，视为正常
  if (!plan.plannedDate) {
    return { status: "normal", overdueAmount: 0, shouldRoll: false };
  }

  const plannedDate = new Date(plan.plannedDate);
  if (isNaN(plannedDate.getTime())) {
    return { status: "normal", overdueAmount: 0, shouldRoll: false };
  }

  const remainingAmount = Math.max(plan.plannedAmount - plan.actualAmount, 0);

  // 已全额回款
  if (plan.actualAmount >= plan.plannedAmount) {
    return { status: "completed", overdueAmount: 0, shouldRoll: false };
  }

  // 未到期：计划日期 >= 当前日期
  if (plannedDate >= now) {
    const daysUntilDue = Math.floor(
      (plannedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue <= 14 && plan.actualAmount === 0) {
      return { status: "dueSoon", overdueAmount: 0, shouldRoll: false };
    }
    return { status: "normal", overdueAmount: 0, shouldRoll: false };
  }

  // 已逾期：当前日期 > 计划日期
  const plannedEndOfMonth = getEndOfMonth(plannedDate);

  // 同月回款 → 不滚动
  if (plan.actualDate) {
    const actualDate = new Date(plan.actualDate);
    if (!isNaN(actualDate.getTime()) && isSameMonth(actualDate, plannedDate)) {
      return { status: "overdue", overdueAmount: remainingAmount, shouldRoll: false };
    }
  }

  // 月底已过且未全额回款 → 需要滚动
  if (now > plannedEndOfMonth && remainingAmount > 0) {
    return { status: "overdue", overdueAmount: remainingAmount, shouldRoll: true };
  }

  // 当月内逾期但当月未结束 → 不滚动
  return { status: "overdue", overdueAmount: remainingAmount, shouldRoll: false };
}

// ─── 主计算函数 ───────────────────────────────────────

/**
 * 根据合同和应收计划数据，计算回款健康度图表数据（含滚动逾期逻辑）
 *
 * 改造点：
 * - target 柱拆为 nativePlan（蓝色）+ rolledOverdue（橙色）
 * - target = nativePlan + rolledOverdue（向后兼容）
 * - 新增 rollingMap 供 ContractsTable 使用
 */
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

  // 初始化每月数据
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

  // 合同只提供 rollingMap/明细展示所需的元数据，金额计算以应收计划为准。
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
    overdueAmount: number;
    shouldRoll: boolean;
  }
  const allPlanInfos: PlanInfo[] = [];

  receivablePlanMap.forEach((plans, mapContractId) => {
    plans.forEach((plan) => {
      const contractId = String(plan.parentDataId || mapContractId);
      const contract = contractById.get(contractId);

      // 仅为旧调用方保留合同编号白名单兼容；正常回款链路不传该参数。
      if (allowedContractNumbers && !contract) return;

      const rate = getRate(plan.currencyCode);
      const { status, overdueAmount, shouldRoll } = determineOverdueStatus(plan, now);

      allPlanInfos.push({
        plan,
        contractId,
        contractCode: contract?.contractCode || "",
        rate,
        status,
        overdueAmount,
        shouldRoll,
      });

      // 实际回款严格按 actualDate 所在年月归类。
      if (plan.actualYearMonth && plan.actualAmount > 0) {
        if (monthlyActual[plan.actualYearMonth] !== undefined) {
          monthlyActual[plan.actualYearMonth] += plan.actualAmount * rate;
        }
      }
    });
  });

  // Step 1: 归类原生计划 (nativePlan)
  allPlanInfos.forEach(({ plan, contractId, contractCode, rate, status }) => {
    const ym = plan.plannedYearMonth;
    if (ym && monthlyNativePlan[ym] !== undefined) {
      monthlyNativePlan[ym] += plan.plannedAmount * rate;

      // 将原生计划应收记录到 rollingMap，供月回款合同下钻。
      const entries = rollingMap.get(ym);
      if (entries) {
        entries.push({
          contractId,
          planId: plan.id,
          contractCode,
          isOverdue: status === "overdue",
          rollingSourceMonth: null,
          overdueAmount: 0,
          status,
        });
      }
    }
  });

  // Step 2: 计算滚动逾期
  // 逐月展示滚动轨迹：逾期金额从源月的下一月开始，每个经过的月份都累加该笔逾期
  // 直到当前月（含），让用户能看到每月承担的滚动逾期总额
  allPlanInfos
    .filter((p) => p.shouldRoll && p.overdueAmount > 0)
    .forEach(({ plan, contractId, contractCode, rate, overdueAmount, status }) => {
      const sourceYM = plan.plannedYearMonth;
      if (!sourceYM) return;

      const sourceIndex = fiscalYearMonths.findIndex((m) => m.yearMonth === sourceYM);
      // 不把上一财年的应收滚入本财年。
      if (sourceIndex < 0) return;

      // 从逾期月的下一月开始，到当前月（含）的每个月都加上逾期金额
      for (let i = sourceIndex + 1; i < fiscalYearMonths.length; i++) {
        const targetYM = fiscalYearMonths[i].yearMonth;
        // 只滚动到当前月（不滚动到未来月份）
        if (targetYM > currentYM) break;

        if (monthlyRolledOverdue[targetYM] !== undefined) {
          monthlyRolledOverdue[targetYM] += overdueAmount * rate;
        }

        // 记录滚动应收到 rollingMap
        const entries = rollingMap.get(targetYM);
        if (entries) {
          entries.push({
            contractId,
            planId: plan.id,
            contractCode,
            isOverdue: true,
            rollingSourceMonth: sourceYM,
            overdueAmount: overdueAmount * rate,
            status,
          });
        }
      }
    });

  // 构建输出
  const chartData = fiscalYearMonths.map(({ label, yearMonth }) => {
    const nativePlan = Math.round(monthlyNativePlan[yearMonth]);
    const rolledOverdue = Math.round(monthlyRolledOverdue[yearMonth]);
    return {
      month: label,
      nativePlan,
      rolledOverdue,
      target: nativePlan + rolledOverdue, // 向后兼容
      actual: Math.round(monthlyActual[yearMonth]),
    };
  });

  return { chartData, rollingMap };
}

/**
 * Hook: 计算回款健康度图表的统计摘要
 * totalTarget / totalActual 为 12 个月的累加汇总
 */
export function useCollectionHealthData(data: CollectionHealthDataPoint[], fiscalMonths?: string[]) {
  return useMemo(() => {
    const MONTH_ABBRS = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const currentMonthAbbr = MONTH_ABBRS[new Date().getMonth()];

    // 找到截止位置
    let sliceEnd = data.length;

    const monthIndex = data.findIndex((d) => d.month === currentMonthAbbr);
    if (monthIndex >= 0) {
      sliceEnd = monthIndex + 1;
    } else {
      const isQuarterMode = data.some((d) => d.month.startsWith("Q"));
      if (isQuarterMode && fiscalMonths && fiscalMonths.length === 12) {
        const posInFiscal = fiscalMonths.indexOf(currentMonthAbbr);
        if (posInFiscal >= 0) {
          const quarterIndex = Math.floor(posInFiscal / 3);
          sliceEnd = Math.min(quarterIndex + 1, data.length);
        }
      } else if (isQuarterMode) {
        const currentMonthIndex = new Date().getMonth();
        const quarterIndex = Math.floor(currentMonthIndex / 3);
        sliceEnd = Math.min(quarterIndex + 1, data.length);
      }
    }

    const dataUpToCurrent = data.slice(0, sliceEnd);

    const totalTarget = dataUpToCurrent.reduce((sum, d) => sum + d.target, 0);
    const totalActual = dataUpToCurrent.reduce((sum, d) => sum + d.actual, 0);
    const totalNativePlan = dataUpToCurrent.reduce((sum, d) => sum + (d.nativePlan || 0), 0);
    const totalRolledOverdue = dataUpToCurrent.reduce((sum, d) => sum + (d.rolledOverdue || 0), 0);
    const totalPending = Math.max(totalTarget - totalActual, 0);
    const rate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
    const isHealthy = totalActual >= totalTarget * 0.9;

    return {
      totalTarget,
      totalActual,
      totalNativePlan,
      totalRolledOverdue,
      totalPending,
      rate,
      isHealthy,
    };
  }, [data, fiscalMonths]);
}

/**
 * 按季度聚合回款健康度月度数据
 */
export function aggregateCollectionHealthByQuarter(
  monthlyData: CollectionHealthDataPoint[],
  orgNode: OrgNode | null,
): CollectionHealthDataPoint[] {
  const fiscalMonths = getFiscalMonths(orgNode);
  const quarters: { label: string; months: string[] }[] = [];

  for (let i = 0; i < fiscalMonths.length; i += 3) {
    const qMonths = fiscalMonths.slice(i, i + 3);
    if (qMonths.length > 0) {
      quarters.push({
        label: `Q${quarters.length + 1}`,
        months: qMonths,
      });
    }
  }

  return quarters.map((q) => {
    const qMonthData = monthlyData.filter((d) => q.months.includes(d.month));
    return {
      month: q.label,
      nativePlan: qMonthData.reduce((sum, d) => sum + (d.nativePlan || 0), 0),
      rolledOverdue: qMonthData.reduce((sum, d) => sum + (d.rolledOverdue || 0), 0),
      target: qMonthData.reduce((sum, d) => sum + d.target, 0),
      actual: qMonthData.reduce((sum, d) => sum + d.actual, 0),
    };
  });
}
