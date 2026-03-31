import { useMemo } from "react";
import type { StackedHealthDataPoint } from "@/types";

export function useHealthChartData(
  data?: StackedHealthDataPoint[],
  stages?: string[],
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
    // 根据财年月份顺序，找到当前月在数据中的位置
    const monthAbbrs = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const currentMonthAbbr = monthAbbrs[new Date().getMonth()];
    const currentIndex = healthData.findIndex(
      (d) => d.month === currentMonthAbbr,
    );

    // 累计到当前月（含），如果当前月不在财年范围内则累计全部
    const sliceEnd = currentIndex >= 0 ? currentIndex + 1 : healthData.length;
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
  }, [healthData, stageKeys]);

  return { healthData, stats, stageKeys };
}
