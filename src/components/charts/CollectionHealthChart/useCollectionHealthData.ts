import { useMemo } from "react";
import type { OrgNode } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";
import type { ExchangeRateService } from "@/services/exchangeRate";

export interface CollectionHealthDataPoint {
  month: string;
  target: number; // 该月的 plannedAmount 累加
  actual: number; // 该月的 actualAmount 累加
}

const ALL_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * 根据组织树的财年配置，获取 12 个月的月份列表（从财年起始月开始排列）
 * 与 orgFilter.ts 中 getFiscalMonths 完全一致的逻辑
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
 * 根据合同和应收计划数据，计算回款健康度图表数据
 *
 * 横坐标：始终12个月，按组织财年的月份排列（与商机健康度一致）
 * target: 每根柱子的值 = 该月份所有应收计划的 plannedAmount 累加
 * actual: 每根柱子的值 = 该月份所有应收计划的 actualAmount 累加
 */
export function calculateCollectionHealthFromApi(
  contractMap: ContractMap,
  receivablePlanMap: ReceivablePlanMap,
  selectedOrg: OrgNode | null,
  exchangeService: ExchangeRateService | null,
  targetCurrencyId?: string,
  allowedContractNumbers?: Set<string>,
): CollectionHealthDataPoint[] {
  // 按财年获取 12 个月份列表
  const fiscalMonths = getFiscalMonths(selectedOrg);

  // 统计每月的 target（plannedAmount）和 actual（actualAmount）
  const monthlyTarget: Record<string, number> = {};
  const monthlyActual: Record<string, number> = {};
  fiscalMonths.forEach((m) => {
    monthlyTarget[m] = 0;
    monthlyActual[m] = 0;
  });

  // 遍历所有合同中的应收计划
  contractMap.forEach((contracts, contractCode) => {
    // 如果指定了白名单，只处理匹配的合同
    if (allowedContractNumbers && !allowedContractNumbers.has(contractCode)) {
      return;
    }

    contracts.forEach((contract) => {
      const plans = receivablePlanMap.get(String(contract.id)) || [];
      plans.forEach((plan) => {
        // 汇率转换
        const rate =
          exchangeService && targetCurrencyId && plan.currencyId
            ? exchangeService.getRate(plan.currencyId, targetCurrencyId)
            : 1;

        // target: 按 plannedDate 的月份归类 plannedAmount
        if (plan.plannedMonth && plan.plannedAmount > 0) {
          if (monthlyTarget[plan.plannedMonth] !== undefined) {
            monthlyTarget[plan.plannedMonth] += plan.plannedAmount * rate;
          }
        }

        // actual: 按 actualDate 的月份归类 actualAmount
        if (plan.actualMonth && plan.actualAmount > 0) {
          if (monthlyActual[plan.actualMonth] !== undefined) {
            monthlyActual[plan.actualMonth] += plan.actualAmount * rate;
          }
        }
      });
    });
  });

  return fiscalMonths.map((month) => ({
    month,
    target: Math.round(monthlyTarget[month]),
    actual: Math.round(monthlyActual[month]),
  }));
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

    // 找到截止位置（与商机健康度逻辑一致）
    let sliceEnd = data.length;

    // 尝试直接匹配月份（月模式）
    const monthIndex = data.findIndex((d) => d.month === currentMonthAbbr);
    if (monthIndex >= 0) {
      sliceEnd = monthIndex + 1;
    } else {
      // 季度模式
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
    const totalPending = Math.max(totalTarget - totalActual, 0);
    const rate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
    const isHealthy = totalActual >= totalTarget * 0.9;

    return {
      totalTarget,
      totalActual,
      totalPending,
      rate,
      isHealthy,
    };
  }, [data, fiscalMonths]);
}

/**
 * 按季度聚合回款健康度月度数据
 * 将 12 个月的数据按财年季度分组，合并为 4 个季度（Q1~Q4）
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
      target: qMonthData.reduce((sum, d) => sum + d.target, 0),
      actual: qMonthData.reduce((sum, d) => sum + d.actual, 0),
    };
  });
}
