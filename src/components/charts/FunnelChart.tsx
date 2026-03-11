import { ChartFilterContext } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FunnelStage } from "@/types";
import { ChartCard } from "./common/ChartCard";
import { StatCard } from "./common/StatCard";
import { ChartLegend } from "./common/ChartLegend";
import { formatCurrency } from "./utils/formatters";
import { FunnelBar } from "./FunnelChart/FunnelBar";
import { useFunnelChartData } from "./FunnelChart/useFunnelChartData";

interface FunnelChartProps {
  data?: FunnelStage[];
  onStageClick?: (stage: string) => void;
  isActive?: boolean;
  activeFilter?: ChartFilterContext;
}

export function FunnelChart({
  data,
  onStageClick,
  isActive,
  activeFilter,
}: FunnelChartProps) {
  const { t } = useLanguage();
  const { funnelData, stats } = useFunnelChartData(data);

  const isOtherChartActive = activeFilter && activeFilter.type !== "funnel";

  const highlightedStage =
    activeFilter?.type === "funnel"
      ? activeFilter.stage
      : activeFilter?.type === "stagnation"
        ? activeFilter.stage
        : null;

  const legendItems = [
    { color: "hsl(142, 76%, 45%)", label: t("chart.aboveTarget") },
    { color: "hsl(0, 84%, 60%)", label: t("chart.belowTargetLegend") },
  ];

  return (
    <ChartCard
      title={t("chart.funnel")}
      description={t("chart.funnelDesc")}
      status={{
        label: stats.isOverallHealthy
          ? t("chart.onTrack")
          : t("chart.needsAttention"),
        variant: stats.isOverallHealthy ? "success" : "warning",
      }}
      isActive={isActive}
      isOtherChartActive={isOtherChartActive}
    >
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label={t("chart.totalPipeline")}
          value={formatCurrency(stats.totalValue)}
          valueColor="text-primary"
        />
        <StatCard
          label={t("chart.activeDeals")}
          value={stats.totalDeals}
        />
        <StatCard
          label={t("chart.avgConversion")}
          value={`${stats.avgConversion}%`}
          valueColor={stats.isOverallHealthy ? "text-success" : "text-warning"}
        />
      </div>

      <div className="space-y-1">
        {funnelData.map((stage, index) => (
          <FunnelBar
            key={stage.stage}
            stage={stage}
            maxCount={stats.maxCount}
            index={index}
            isLast={index === funnelData.length - 1}
            onClick={() => onStageClick?.(stage.stage)}
            isHighlighted={highlightedStage === stage.stage}
            t={t}
          />
        ))}
      </div>

      <ChartLegend items={legendItems} actionText={t("chart.clickStageToView")} />
    </ChartCard>
  );
}
