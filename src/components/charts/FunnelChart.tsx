import { motion } from "framer-motion";
import { funnelData as defaultFunnelData, FunnelStage } from "@/data/mockData";
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { ChartFilterContext } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

interface FunnelChartProps {
  data?: FunnelStage[];
  onStageClick?: (stage: string) => void;
  isActive?: boolean;
  activeFilter?: ChartFilterContext;
}

interface FunnelBarProps {
  stage: FunnelStage;
  maxCount: number;
  index: number;
  isLast: boolean;
  onClick?: () => void;
  isHighlighted?: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function FunnelBar({
  stage,
  maxCount,
  index,
  isLast,
  onClick,
  isHighlighted,
  t,
}: FunnelBarProps) {
  const widthPercent = (stage.count / maxCount) * 100;
  const conversionGap = stage.actualConversion - stage.targetConversion;
  const isHealthy = conversionGap >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative cursor-pointer group transition-all ${
        isHighlighted ? "scale-[1.02]" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Stage label */}
        <div className="w-28 flex-shrink-0 text-right">
          <p
            className={`text-sm font-medium group-hover:text-primary transition-colors ${
              isHighlighted ? "text-primary" : ""
            }`}
          >
            {stage.stage}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {stage.count} {t("chart.deals")}
          </p>
        </div>

        {/* Funnel bar */}
        <div className="flex-1 relative">
          <div
            className={`h-12 bg-secondary/30 rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-primary/30 transition-all ${
              isHighlighted ? "ring-2 ring-primary" : ""
            }`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${widthPercent}%` }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              className={`h-full rounded-lg relative overflow-hidden group-hover:brightness-110 transition-all ${
                isHighlighted ? "brightness-125" : ""
              }`}
              style={{
                background: `linear-gradient(90deg, 
                  hsl(217, 91%, 60%) 0%, 
                  hsl(280, 100%, 70%) 100%)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-mono font-semibold text-primary-foreground drop-shadow">
                  {formatCurrency(stage.value)}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Conversion rate */}
        <div className="w-32 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono ${
                isHealthy
                  ? "bg-success/20 text-success"
                  : "bg-danger/20 text-danger"
              }`}
            >
              {isHealthy ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {stage.actualConversion}%
            </div>
            <span className="text-xs text-muted-foreground">
              / {stage.targetConversion}%
            </span>
          </div>
        </div>
      </div>

      {/* Conversion arrow between stages */}
      {!isLast && (
        <div className="flex items-center justify-center py-1 ml-32">
          <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
        </div>
      )}
    </motion.div>
  );
}

export function FunnelChart({
  data,
  onStageClick,
  isActive,
  activeFilter,
}: FunnelChartProps) {
  const { t } = useLanguage();
  const funnelData = data || defaultFunnelData;
  const maxCount = Math.max(...funnelData.map((s) => s.count), 1);
  const totalValue = funnelData.reduce((sum, s) => sum + s.value, 0);
  const totalDeals = funnelData.reduce((sum, s) => sum + s.count, 0);

  // Calculate overall conversion health
  const avgConversionGap =
    funnelData.length > 0
      ? funnelData.reduce(
          (sum, s) => sum + (s.actualConversion - s.targetConversion),
          0,
        ) / funnelData.length
      : 0;
  const isOverallHealthy = avgConversionGap >= -5;

  // Check if other charts have active filters (for dimming effect)
  const isOtherChartActive = activeFilter && activeFilter.type !== "funnel";

  // Get highlighted stage from filter
  const highlightedStage =
    activeFilter?.type === "funnel"
      ? activeFilter.stage
      : activeFilter?.type === "stagnation"
        ? activeFilter.stage
        : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={`glass-card p-6 transition-all ${
        isActive
          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
          : isOtherChartActive
            ? "opacity-50 hover:opacity-75"
            : ""
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{t("chart.funnel")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("chart.funnelDesc")}
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium ${
            isOverallHealthy
              ? "bg-success/20 text-success"
              : "bg-warning/20 text-warning"
          }`}
        >
          {isOverallHealthy
            ? `● ${t("chart.onTrack")}`
            : `● ${t("chart.needsAttention")}`}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="data-label mb-1">{t("chart.totalPipeline")}</p>
          <p className="data-value text-primary">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="data-label mb-1">{t("chart.activeDeals")}</p>
          <p className="data-value">{totalDeals}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="data-label mb-1">{t("chart.avgConversion")}</p>
          <p
            className={`data-value ${isOverallHealthy ? "text-success" : "text-warning"}`}
          >
            {Math.round(
              funnelData.reduce((sum, s) => sum + s.actualConversion, 0) /
                funnelData.length,
            )}
            %
          </p>
        </div>
      </div>

      {/* Funnel visualization */}
      <div className="space-y-1">
        {funnelData.map((stage, index) => (
          <FunnelBar
            key={stage.stage}
            stage={stage}
            maxCount={maxCount}
            index={index}
            isLast={index === funnelData.length - 1}
            onClick={() => onStageClick?.(stage.stage)}
            isHighlighted={highlightedStage === stage.stage}
            t={t}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success" />
          <span className="text-xs text-muted-foreground">
            {t("chart.aboveTarget")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-danger" />
          <span className="text-xs text-muted-foreground">
            {t("chart.belowTargetLegend")}
          </span>
        </div>
        <span className="text-xs text-primary ml-auto">
          {t("chart.clickStageToView")}
        </span>
      </div>
    </motion.div>
  );
}
