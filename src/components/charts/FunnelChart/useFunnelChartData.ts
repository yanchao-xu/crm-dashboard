import { useMemo } from "react";
import type { FunnelStage } from "@/types";

export function useFunnelChartData(data?: FunnelStage[]) {
  const funnelData = data || [];

  const stats = useMemo(() => {
    const maxCount = Math.max(...funnelData.map((s) => s.count), 1);
    const totalValue = funnelData.reduce((sum, s) => sum + s.value, 0);
    const totalDeals = funnelData.reduce((sum, s) => sum + s.count, 0);
    const avgConversionGap =
      funnelData.length > 0
        ? funnelData.reduce(
            (sum, s) => sum + (s.actualConversion - s.targetConversion),
            0,
          ) / funnelData.length
        : 0;
    const isOverallHealthy = avgConversionGap >= -5;
    const avgConversion = Math.round(
      funnelData.reduce((sum, s) => sum + s.actualConversion, 0) /
        funnelData.length,
    );

    return {
      maxCount,
      totalValue,
      totalDeals,
      isOverallHealthy,
      avgConversion,
    };
  }, [funnelData]);

  return { funnelData, stats };
}
