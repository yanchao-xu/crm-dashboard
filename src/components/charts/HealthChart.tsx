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
import type { StackedHealthDataPoint } from "@/types";
import { ChartCard } from "./common/ChartCard";
import { StatCard } from "./common/StatCard";
import { formatCurrency } from "./utils/formatters";
import { stageColors, chartTheme } from "./config/chartColors";
import { chartMargins, chartHeights, axisConfig } from "./config/chartConfig";
import { HealthChartTooltip } from "./HealthChart/HealthChartTooltip";
import { useHealthChartData } from "./HealthChart/useHealthChartData";

interface HealthChartProps {
  data?: StackedHealthDataPoint[];
  stages?: { code: string; name: string }[]; // 简化类型
  onSegmentClick?: (month: string) => void;
  isActive?: boolean;
  activeFilter?: ChartFilterContext;
}

export function HealthChart({
  data,
  stages = [],
  onSegmentClick,
  isActive,
  activeFilter,
}: HealthChartProps) {
  const { t, language } = useLanguage();

  // 提取阶段代码列表
  const stageCodes = stages.map((s) => s.code);
  const { healthData, stats, stageKeys } = useHealthChartData(data, stageCodes);

  const handleClick = (data: any) => {
    if (data && data.activeLabel && onSegmentClick) {
      onSegmentClick(data.activeLabel);
    }
  };

  const isOtherChartActive = !!(activeFilter && activeFilter.type !== "health");

  // 动态生成阶段标签映射（name 已经是当前语言）
  const stageLabels: Record<string, string> = {};
  stages.forEach((stage) => {
    stageLabels[stage.code] = stage.name;
  });

  // 如果没有阶段配置，使用默认标签
  if (stages.length === 0) {
    const defaultLabels = {
      Discovery: "Discovery",
      Qualification: "Qualification",
      Proposal: "Proposal",
      Negotiation: "Negotiation",
      Closing: "Closing",
    };
    Object.assign(stageLabels, defaultLabels);
  }

  // 动态生成颜色（如果阶段超过预定义颜色，使用默认颜色）
  const defaultColors = [
    "hsl(217, 91%, 60%)",
    "hsl(252, 87%, 67%)",
    "hsl(280, 100%, 70%)",
    "hsl(330, 85%, 65%)",
    "hsl(142, 76%, 45%)",
  ];
  const getStageColor = (index: number) => {
    return defaultColors[index % defaultColors.length];
  };

  return (
    <ChartCard
      title={t("dashboard>chart>health")}
      description={t("dashboard>chart>healthDesc")}
      status={{
        label: stats.isHealthy
          ? t("dashboard>chart>healthy")
          : t("dashboard>chart>belowTarget"),
        variant: stats.isHealthy ? "success" : "danger",
      }}
      isActive={isActive}
      isOtherChartActive={isOtherChartActive}
      className="cursor-pointer"
    >
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label={t("dashboard>chart>current")}
          value={formatCurrency(stats.latestActual, language)}
          valueColor="text-chart-actual"
        />
        <StatCard
          label={t("dashboard>chart>target")}
          value={formatCurrency(stats.latestTarget, language)}
          valueColor="text-chart-target"
        />
        <StatCard
          label={t("dashboard>chart>attainment")}
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
              tickFormatter={(value) => formatCurrency(value, language)}
            />
            <Tooltip
              content={<HealthChartTooltip t={t} language={language} />}
            />

            {stageKeys.map((stageKey, index) => (
              <Bar
                key={stageKey}
                dataKey={stageKey}
                stackId="a"
                fill={getStageColor(index)}
                name={stageLabels[stageKey] || stageKey}
                radius={
                  index === stageKeys.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]
                }
              />
            ))}

            <Line
              type="monotone"
              dataKey="target"
              stroke={chartTheme.target}
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={{ fill: chartTheme.target, strokeWidth: 0, r: 4 }}
              name={t("dashboard>chart>target")}
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
            {t("dashboard>chart>theoreticalTarget")}
          </span>
        </div>
      </div>
    </ChartCard>
  );
}
