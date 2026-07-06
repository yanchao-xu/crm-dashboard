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
  contractMap.forEach((contracts) => {
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
export function useCollectionHealthData(data: CollectionHealthDataPoint[]) {
  return useMemo(() => {
    const totalTarget = data.reduce((sum, d) => sum + d.target, 0);
    const totalActual = data.reduce((sum, d) => sum + d.actual, 0);
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
  }, [data]);
}
