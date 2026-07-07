import { useMemo } from "react";
import type { StackedHealthDataPoint } from "@/types";

const MONTH_ABBRS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * 判断当前月份在数据数组中应截止到哪个索引（含）
 * 支持月模式（Jan~Dec）和季度模式（Q1~Q4）
 *
 * 月模式：直接匹配当前月缩写
 * 季度模式：通过 fiscalMonths 确定当前月属于第几个季度
 */
function findCurrentSliceEnd(
  healthData: StackedHealthDataPoint[],
  fiscalMonths?: string[],
): number {
  if (healthData.length === 0) return 0;

  const currentMonthAbbr = MONTH_ABBRS[new Date().getMonth()];

  // 尝试直接匹配月份（月模式）
  const monthIndex = healthData.findIndex((d) => d.month === currentMonthAbbr);
  if (monthIndex >= 0) {
    return monthIndex + 1;
  }

  // 季度模式：数据的 month 字段为 "Q1"~"Q4"
  const isQuarterMode = healthData.some((d) => d.month.startsWith("Q"));
  if (isQuarterMode && fiscalMonths && fiscalMonths.length === 12) {
    // 当前月在财年月份序列中的位置
    const posInFiscal = fiscalMonths.indexOf(currentMonthAbbr);
    if (posInFiscal >= 0) {
      // 每 3 个月一个季度，当前月所在季度 index（0-based）
      const quarterIndex = Math.floor(posInFiscal / 3);
      return Math.min(quarterIndex + 1, healthData.length);
    }
  }

  // 季度模式但没有 fiscalMonths 信息：用自然年推断
  if (isQuarterMode) {
    const currentMonthIndex = new Date().getMonth();
    const quarterIndex = Math.floor(currentMonthIndex / 3);
    return Math.min(quarterIndex + 1, healthData.length);
  }

  // 无法匹配，返回全部
  return healthData.length;
}

export function useHealthChartData(
  data?: StackedHealthDataPoint[],
  stages?: string[],
  fiscalMonths?: string[],
) {
  const healthData = data || [];

  // 获取动态阶段列表（排除 month 和 target）
  const stageKeys = useMemo(() => {
    if (stages && stages.length > 0) {
      return stages;
    }
    if (healthData.length > 0) {
      return Object.keys(healthData[0]).filter(
        (key) => key !== "month" && key !== "target",
      );
    }
    return [];
  }, [healthData, stages]);

  const stats = useMemo(() => {
    const sliceEnd = findCurrentSliceEnd(healthData, fiscalMonths);
    const dataUpToCurrentMonth = healthData.slice(0, sliceEnd);

    const totalActual = dataUpToCurrentMonth.reduce((total, monthData) => {
      const monthSum = stageKeys.reduce(
        (sum, key) =>
          sum + ((monthData[key as keyof typeof monthData] as number) || 0),
        0,
      );
      return total + monthSum;
    }, 0);

    const totalTarget =
      dataUpToCurrentMonth.reduce(
        (sum, monthData) => sum + (monthData.target || 0),
        0,
      ) || 1;

    const isHealthy = totalActual >= totalTarget * 0.9;
    const attainment = Math.round((totalActual / totalTarget) * 100);

    return {
      latestActual: totalActual,
      latestTarget: totalTarget,
      isHealthy,
      attainment,
    };
  }, [healthData, stageKeys, fiscalMonths]);

  return { healthData, stats, stageKeys };
}
