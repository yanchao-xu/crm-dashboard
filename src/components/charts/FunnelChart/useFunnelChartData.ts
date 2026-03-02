import { useMemo } from "react";
import { FunnelStage } from "@/data/mockData";

//TODO default data
export function useFunnelChartData(data?: FunnelStage[]) {
  const defaultData: FunnelStage[] = useMemo(
    () => [
      {
        stage: "Discovery",
        count: 120,
        value: 4800000,
        targetConversion: 30,
        actualConversion: 28,
      },
      {
        stage: "Qualification",
        count: 34,
        value: 1850000,
        targetConversion: 45,
        actualConversion: 42,
      },
      {
        stage: "Proposal",
        count: 14,
        value: 920000,
        targetConversion: 55,
        actualConversion: 50,
      },
      {
        stage: "Negotiation",
        count: 7,
        value: 580000,
        targetConversion: 45,
        actualConversion: 43,
      },
      {
        stage: "Closing",
        count: 3,
        value: 320000,
        targetConversion: 65,
        actualConversion: 60,
      },
    ],
    [],
  );

  const funnelData = data || defaultData;

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
