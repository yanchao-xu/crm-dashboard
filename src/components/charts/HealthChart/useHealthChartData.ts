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
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // 只累计到当前自然月的数据
    const dataUpToCurrentMonth = healthData.slice(0, currentMonth);

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
