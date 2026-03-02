import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartFilterContext } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import { StackedHealthDataPoint } from "@/data/mockData";
import { ChartCard } from "./common/ChartCard";
import { StatCard } from "./common/StatCard";
import { formatCurrency } from "./utils/formatters";
import { stageColors, chartTheme } from "./config/chartColors";
import { chartMargins, chartHeights, axisConfig } from "./config/chartConfig";
import { HealthChartTooltip } from "./HealthChart/HealthChartTooltip";
import { useHealthChartData } from "./HealthChart/useHealthChartData";

interface HealthChartProps {
  data?: StackedHealthDataPoint[];
  onSegmentClick?: (month: string) => void;
  isActive?: boolean;
  activeFilter?: ChartFilterContext;
}

export function HealthChart({
  data,
  onSegmentClick,
  isActive,
  activeFilter,
}: HealthChartProps) {
  const { t, language } = useLanguage();
  const { healthData, stats } = useHealthChartData(data);

  const handleClick = (data: any) => {
    if (data && data.activeLabel && onSegmentClick) {
      onSegmentClick(data.activeLabel);
    }
  };

  const isOtherChartActive = activeFilter && activeFilter.type !== "health";

  const stageLabels: Record<string, string> =
    language === "zh"
      ? {
        Discovery: "发现",
        Qualification: "资质确认",
        Proposal: "提案",
        Negotiation: "谈判",
        Closing: "成交中",
      }
      : {
        Discovery: "Discovery",
        Qualification: "Qualification",
        Proposal: "Proposal",
        Negotiation: "Negotiation",
        Closing: "Closing",
      };

  return (
    <ChartCard
      title={t("chart.health")}
      description={t("chart.healthDesc")}
      status={{
        label: stats.isHealthy
          ? t("chart.healthy")
          : t("chart.belowTarget"),
        variant: stats.isHealthy ? "success" : "danger",
      }}
      isActive={isActive}
      isOtherChartActive={isOtherChartActive}
      className="cursor-pointer"
    >
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label={t("chart.current")}
          value={formatCurrency(stats.latestActual)}
          valueColor="text-chart-actual"
        />
        <StatCard
          label={t("chart.target")}
          value={formatCurrency(stats.latestTarget)}
          valueColor="text-chart-target"
        />
        <StatCard
          label={t("chart.attainment")}
          value={`${stats.attainment}%`}
          valueColor={stats.isHealthy ? "text-success" : "text-danger"}
        />
      </div>

      <div style={{ height: chartHeights.large }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={healthData}
            margin={chartMargins.default}
            onClick={handleClick}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.grid}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              {...axisConfig}
              tick={{ fill: chartTheme.tick, fontSize: axisConfig.fontSize }}
            />
            <YAxis
              {...axisConfig}
              tick={{ fill: chartTheme.tick, fontSize: axisConfig.fontSize }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<HealthChartTooltip t={t} />} />

            <Bar
              dataKey="Discovery"
              stackId="a"
              fill={stageColors.Discovery}
              name={stageLabels.Discovery}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Qualification"
              stackId="a"
              fill={stageColors.Qualification}
              name={stageLabels.Qualification}
            />
            <Bar
              dataKey="Proposal"
              stackId="a"
              fill={stageColors.Proposal}
              name={stageLabels.Proposal}
            />
            <Bar
              dataKey="Negotiation"
              stackId="a"
              fill={stageColors.Negotiation}
              name={stageLabels.Negotiation}
            />
            <Bar
              dataKey="Closing"
              stackId="a"
              fill={stageColors.Closing}
              name={stageLabels.Closing}
              radius={[4, 4, 0, 0]}
            />

            <Line
              type="monotone"
              dataKey="target"
              stroke={chartTheme.target}
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={{ fill: chartTheme.target, strokeWidth: 0, r: 4 }}
              name={t("chart.target")}
            />

            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="square"
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-0.5 border-t-2 border-dashed"
            style={{ borderColor: chartTheme.target }}
          />
          <span className="text-xs text-muted-foreground">
            {t("chart.theoreticalTarget")}
          </span>
        </div>
        <span className="text-xs text-primary ml-auto">
          {t("chart.clickToView")}
        </span>
      </div>
    </ChartCard>
  );
}
