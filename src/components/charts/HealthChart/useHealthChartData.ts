import { useMemo } from "react";
import { StackedHealthDataPoint } from "@/data/mockData";

export function useHealthChartData(data?: StackedHealthDataPoint[]) {
  const defaultData: StackedHealthDataPoint[] = useMemo(
    () => [
      {
        month: "Jan",
        target: 500000,
        Discovery: 85000,
        Qualification: 120000,
        Proposal: 95000,
        Negotiation: 75000,
        Closing: 45000,
      },
      {
        month: "Feb",
        target: 550000,
        Discovery: 95000,
        Qualification: 140000,
        Proposal: 110000,
        Negotiation: 85000,
        Closing: 55000,
      },
      {
        month: "Mar",
        target: 600000,
        Discovery: 105000,
        Qualification: 155000,
        Proposal: 125000,
        Negotiation: 95000,
        Closing: 65000,
      },
      {
        month: "Apr",
        target: 650000,
        Discovery: 90000,
        Qualification: 130000,
        Proposal: 115000,
        Negotiation: 100000,
        Closing: 75000,
      },
      {
        month: "May",
        target: 700000,
        Discovery: 110000,
        Qualification: 160000,
        Proposal: 135000,
        Negotiation: 105000,
        Closing: 80000,
      },
      {
        month: "Jun",
        target: 750000,
        Discovery: 125000,
        Qualification: 175000,
        Proposal: 150000,
        Negotiation: 115000,
        Closing: 90000,
      },
    ],
    [],
  );

  const healthData = data || defaultData;

  const stats = useMemo(() => {
    const latestData = healthData[healthData.length - 1];
    const latestActual = latestData
      ? latestData.Discovery +
        latestData.Qualification +
        latestData.Proposal +
        latestData.Negotiation +
        latestData.Closing
      : 0;
    const latestTarget = latestData?.target || 1;
    const isHealthy = latestActual >= latestTarget * 0.9;
    const attainment = Math.round((latestActual / latestTarget) * 100);

    return {
      latestActual,
      latestTarget,
      isHealthy,
      attainment,
    };
  }, [healthData]);

  return { healthData, stats };
}
