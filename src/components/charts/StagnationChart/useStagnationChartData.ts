import { useMemo } from "react";
import { StagnationData } from "@/data/mockData";

export type DisplayMode = "amount" | "count";

export function useStagnationChartData(
  data?: StagnationData[],
  displayMode: DisplayMode = "amount",
) {
  const defaultData: StagnationData[] = useMemo(
    () => [
      {
        stage: "Discovery",
        active: 12,
        over30: 5,
        over60: 3,
        zombie: 2,
        activeAmount: 1800000,
        over30Amount: 750000,
        over60Amount: 450000,
        zombieAmount: 300000,
      },
      {
        stage: "Qualification",
        active: 18,
        over30: 8,
        over60: 4,
        zombie: 3,
        activeAmount: 2700000,
        over30Amount: 1200000,
        over60Amount: 600000,
        zombieAmount: 450000,
      },
      {
        stage: "Proposal",
        active: 15,
        over30: 6,
        over60: 5,
        zombie: 4,
        activeAmount: 2250000,
        over30Amount: 900000,
        over60Amount: 750000,
        zombieAmount: 600000,
      },
      {
        stage: "Negotiation",
        active: 10,
        over30: 4,
        over60: 2,
        zombie: 1,
        activeAmount: 1500000,
        over30Amount: 600000,
        over60Amount: 300000,
        zombieAmount: 150000,
      },
      {
        stage: "Closing",
        active: 8,
        over30: 2,
        over60: 1,
        zombie: 0,
        activeAmount: 1200000,
        over30Amount: 300000,
        over60Amount: 150000,
        zombieAmount: 0,
      },
    ],
    [],
  );

  const stagnationData = data || defaultData;

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
        active: displayMode === "amount" ? d.activeAmount : d.active,
        over30: displayMode === "amount" ? d.over30Amount : d.over30,
        over60: displayMode === "amount" ? d.over60Amount : d.over60,
        zombie: displayMode === "amount" ? d.zombieAmount : d.zombie,
      })),
    [stagnationData, displayMode],
  );

  return { stagnationData, chartData, stats };
}
