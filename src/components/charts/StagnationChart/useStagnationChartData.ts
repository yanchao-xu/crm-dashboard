import { useMemo } from "react";
import type { StagnationData } from "@/types";

export type DisplayMode = "amount" | "count";

export function useStagnationChartData(
  data?: StagnationData[],
  displayMode: DisplayMode = "amount",
) {
  const stagnationData = data || [];

  const stats = useMemo(() => {
    const totalZombie =
      displayMode === "amount"
        ? stagnationData.reduce((sum, d) => sum + d.zombieAmount, 0)
        : stagnationData.reduce((sum, d) => sum + d.zombie, 0);
    const totalDeals =
      displayMode === "amount"
        ? stagnationData.reduce(
            (sum, d) =>
              sum +
              d.activeAmount +
              d.over30Amount +
              d.over60Amount +
              d.zombieAmount,
            0,
          )
        : stagnationData.reduce(
            (sum, d) => sum + d.active + d.over30 + d.over60 + d.zombie,
            0,
          );
    const zombiePercentage =
      totalDeals > 0 ? Math.round((totalZombie / totalDeals) * 100) : 0;

    const totalActive =
      displayMode === "amount"
        ? stagnationData.reduce((sum, d) => sum + d.activeAmount, 0)
        : stagnationData.reduce((sum, d) => sum + d.active, 0);
    const totalOver30 =
      displayMode === "amount"
        ? stagnationData.reduce((sum, d) => sum + d.over30Amount, 0)
        : stagnationData.reduce((sum, d) => sum + d.over30, 0);
    const totalOver60 =
      displayMode === "amount"
        ? stagnationData.reduce((sum, d) => sum + d.over60Amount, 0)
        : stagnationData.reduce((sum, d) => sum + d.over60, 0);

    return {
      totalZombie,
      totalDeals,
      zombiePercentage,
      totalActive,
      totalOver30,
      totalOver60,
    };
  }, [stagnationData, displayMode]);

  const chartData = useMemo(
    () =>
      stagnationData.map((d) => ({
        stage: d.stage,
        stageName: d.stageName,
        active: displayMode === "amount" ? d.activeAmount : d.active,
        over30: displayMode === "amount" ? d.over30Amount : d.over30,
        over60: displayMode === "amount" ? d.over60Amount : d.over60,
        zombie: displayMode === "amount" ? d.zombieAmount : d.zombie,
      })),
    [stagnationData, displayMode],
  );

  return { stagnationData, chartData, stats };
}
