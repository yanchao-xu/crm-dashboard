import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { StagnationData } from "@/types";
import { ChartFilterContext } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DollarSign, Hash } from "lucide-react";
import { ChartCard } from "./common/ChartCard";
import { StatCard } from "./common/StatCard";
import { ChartLegend } from "./common/ChartLegend";
import { formatCurrencyWithSymbol } from "./utils/formatters";
import { activityColors, chartTheme } from "./config/chartColors";
import { chartMargins, chartHeights, axisConfig } from "./config/chartConfig";
import { StagnationTooltip } from "./StagnationChart/StagnationTooltip";
import {
  useStagnationChartData,
  DisplayMode,
} from "./StagnationChart/useStagnationChartData";

interface StagnationChartProps {
  data?: StagnationData[];
  onBarClick?: (stage: string, activityStatus: string) => void;
  isActive?: boolean;
  activeFilter?: ChartFilterContext;
}

export function StagnationChart({
  data,
  onBarClick,
  isActive,
  activeFilter,
}: StagnationChartProps) {
  const { t } = useLanguage();
  const [displayMode, setDisplayMode] = useState<DisplayMode>("amount");
  const { chartData, stats } = useStagnationChartData(data, displayMode);

  const isOtherChartActive = !!(activeFilter && activeFilter.type !== "stagnation");
  const highlightedStatus =
    activeFilter?.type === "stagnation" ? activeFilter.activityStatus : null;

  // 创建阶段名称映射函数（stageName 已经是当前语言）
  const getStageName = (stageData: any) => {
    return stageData.stageName || stageData.stage;
  };

  const handleClick = (data: any) => {
    if (data && data.stage) {
      const segments = [
        { key: "active", value: data.active },
        { key: "over30", value: data.over30 },
        { key: "over60", value: data.over60 },
        { key: "zombie", value: data.zombie },
      ];
      const largestSegment = segments.reduce((a, b) =>
        a.value > b.value ? a : b,
      );
      onBarClick?.(data.stage, largestSegment.key);
    }
  };

  const handleStatClick = (status: string) => {
    onBarClick?.(undefined as any, status);
  };

  const formatValue = (value: number): string => {
    return displayMode === "amount"
      ? formatCurrencyWithSymbol(value)
      : String(value);
  };

  const legendItems = [
    { color: activityColors.active, label: t("dashboard>chart>lessThan30") },
    { color: activityColors.over30, label: t("dashboard>chart>moreThan30") },
    { color: activityColors.over60, label: t("dashboard>chart>moreThan60") },
    { color: activityColors.zombie, label: t("dashboard>chart>moreThan90") },
  ];

  const zombieStatusVariant =
    stats.zombiePercentage > 15
      ? "danger"
      : stats.zombiePercentage > 10
        ? "warning"
        : "success";

  return (
    <ChartCard
      title={t("dashboard>chart>stagnation")}
      description={t("dashboard>chart>stagnationDesc")}
      isActive={isActive}
      isOtherChartActive={isOtherChartActive}
    >
      <div className="flex items-center justify-between mb-6">
        <ToggleGroup
          type="single"
          value={displayMode}
          onValueChange={(value) =>
            value && setDisplayMode(value as DisplayMode)
          }
          className="bg-muted/50 p-1 rounded-lg"
        >
          <ToggleGroupItem
            value="amount"
            aria-label={t("dashboard>chart>amount")}
            className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <DollarSign className="w-3.5 h-3.5 mr-1" />
            {t("dashboard>chart>amount")}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="count"
            aria-label={t("dashboard>chart>count")}
            className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <Hash className="w-3.5 h-3.5 mr-1" />
            {t("dashboard>chart>count")}
          </ToggleGroupItem>
        </ToggleGroup>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium ${zombieStatusVariant === "danger"
            ? "bg-danger/20 text-danger"
            : zombieStatusVariant === "warning"
              ? "bg-warning/20 text-warning"
              : "bg-success/20 text-success"
            }`}
        >
          {formatValue(stats.totalZombie)} {t("dashboard>chart>zombieDeals")} (
          {stats.zombiePercentage}%)
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t("dashboard>status>active")}
          value={formatValue(stats.totalActive)}
          onClick={() => handleStatClick("active")}
          isHighlighted={highlightedStatus === "active"}
          variant="success"
        />
        <StatCard
          label={t("dashboard>status>over30")}
          value={formatValue(stats.totalOver30)}
          onClick={() => handleStatClick("over30")}
          isHighlighted={highlightedStatus === "over30"}
          variant="warning"
        />
        <StatCard
          label={t("dashboard>status>over60")}
          value={formatValue(stats.totalOver60)}
          onClick={() => handleStatClick("over60")}
          isHighlighted={highlightedStatus === "over60"}
          variant="danger"
        />
        <StatCard
          label={t("dashboard>status>zombie")}
          value={formatValue(stats.totalZombie)}
          onClick={() => handleStatClick("zombie")}
          isHighlighted={highlightedStatus === "zombie"}
          variant="custom"
          customColors={{
            bg: "hsl(0, 72%, 40%, 0.1)",
            border: "hsl(0, 72%, 40%, 0.2)",
            text: "hsl(0, 72%, 55%)",
          }}
        />
      </div>

      <div style={{ height: chartHeights.medium }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={
              displayMode === "amount"
                ? chartMargins.withLeftPadding
                : chartMargins.default
            }
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                const payload = data.activePayload[0].payload;
                handleClick(payload);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.grid}
              vertical={false}
            />
            <XAxis
              dataKey="stage"
              {...axisConfig}
              tick={{ fill: chartTheme.tick, fontSize: axisConfig.fontSize }}
              tickFormatter={(value) => {
                const stageData = chartData.find(d => d.stage === value);
                return stageData ? getStageName(stageData) : value;
              }}
            />
            <YAxis
              {...axisConfig}
              tick={{ fill: chartTheme.tick, fontSize: axisConfig.fontSize }}
              tickFormatter={(value) =>
                displayMode === "amount"
                  ? formatCurrencyWithSymbol(value)
                  : String(value)
              }
            />
            <Tooltip
              content={<StagnationTooltip t={t} displayMode={displayMode} />}
              cursor={{ fill: chartTheme.cursor }}
            />

            <Bar
              dataKey="active"
              name={t("dashboard>chart>lessThan30")}
              stackId="a"
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`active-${index}`}
                  fill={
                    highlightedStatus === "active"
                      ? activityColors.activeHighlight
                      : activityColors.active
                  }
                  opacity={
                    highlightedStatus && highlightedStatus !== "active"
                      ? 0.3
                      : 1
                  }
                />
              ))}
            </Bar>
            <Bar
              dataKey="over30"
              name={t("dashboard>chart>moreThan30")}
              stackId="a"
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`over30-${index}`}
                  fill={
                    highlightedStatus === "over30"
                      ? activityColors.over30Highlight
                      : activityColors.over30
                  }
                  opacity={
                    highlightedStatus && highlightedStatus !== "over30"
                      ? 0.3
                      : 1
                  }
                />
              ))}
            </Bar>
            <Bar
              dataKey="over60"
              name={t("dashboard>chart>moreThan60")}
              stackId="a"
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`over60-${index}`}
                  fill={
                    highlightedStatus === "over60"
                      ? activityColors.over60Highlight
                      : activityColors.over60
                  }
                  opacity={
                    highlightedStatus && highlightedStatus !== "over60"
                      ? 0.3
                      : 1
                  }
                />
              ))}
            </Bar>
            <Bar
              dataKey="zombie"
              name={t("dashboard>chart>moreThan90")}
              stackId="a"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`zombie-${index}`}
                  fill={
                    highlightedStatus === "zombie"
                      ? activityColors.zombieHighlight
                      : activityColors.zombie
                  }
                  opacity={
                    highlightedStatus && highlightedStatus !== "zombie"
                      ? 0.3
                      : 1
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ChartLegend
        items={legendItems}
        actionText={t("dashboard>chart>clickOrCardToView")}
      />
    </ChartCard>
  );
}
