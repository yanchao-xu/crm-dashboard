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
import {
  stagnationData as defaultStagnationData,
  StagnationData,
} from "@/data/mockData";
import { motion } from "framer-motion";
import { ChartFilterContext } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DollarSign, Hash } from "lucide-react";

type DisplayMode = "amount" | "count";

interface StagnationChartProps {
  data?: StagnationData[];
  onBarClick?: (stage: string, activityStatus: string) => void;
  isActive?: boolean;
  activeFilter?: ChartFilterContext;
}

const formatValue = (value: number, mode: DisplayMode): string => {
  if (mode === "amount") {
    if (value >= 1000000) {
      return `¥${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `¥${(value / 1000).toFixed(0)}K`;
    }
    return `¥${value}`;
  }
  return String(value);
};

const CustomTooltip = ({ active, payload, label, t, displayMode }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (sum: number, p: any) => sum + (p.value || 0),
      0,
    );
    const unit = displayMode === "amount" ? "" : ` ${t("chart.deals")}`;

    return (
      <div className="glass-card p-3 border border-border">
        <p className="font-mono text-sm text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">
                {entry.name}:
              </span>
              <span className="font-mono text-sm">
                {displayMode === "amount"
                  ? formatValue(entry.value, displayMode)
                  : entry.value}
                {unit}
              </span>
            </div>
          ))}
          <div className="pt-1 border-t border-border mt-2">
            <span className="text-xs text-muted-foreground">
              {t("chart.total")}:{" "}
            </span>
            <span className="font-mono text-sm font-semibold">
              {displayMode === "amount"
                ? formatValue(total, displayMode)
                : total}
              {unit}
            </span>
          </div>
        </div>
        <p className="text-xs text-primary mt-2 pt-2 border-t border-border">
          {t("chart.clickForDetails")}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ t }: { t: (key: string) => string }) => (
  <div className="flex items-center justify-center gap-6 mt-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-success" />
      <span className="text-xs text-muted-foreground">
        {t("chart.lessThan30")}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-warning" />
      <span className="text-xs text-muted-foreground">
        {t("chart.moreThan30")}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-danger" />
      <span className="text-xs text-muted-foreground">
        {t("chart.moreThan60")}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-sm"
        style={{ backgroundColor: "hsl(0, 72%, 40%)" }}
      />
      <span className="text-xs text-muted-foreground">
        {t("chart.moreThan90")}
      </span>
    </div>
  </div>
);

export function StagnationChart({
  data,
  onBarClick,
  isActive,
  activeFilter,
}: StagnationChartProps) {
  const { t } = useLanguage();
  const [displayMode, setDisplayMode] = useState<DisplayMode>("amount");
  const stagnationData = data || defaultStagnationData;

  // Calculate totals based on display mode
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

  // Transform data based on display mode
  const chartData = stagnationData.map((d) => ({
    stage: d.stage,
    active: displayMode === "amount" ? d.activeAmount : d.active,
    over30: displayMode === "amount" ? d.over30Amount : d.over30,
    over60: displayMode === "amount" ? d.over60Amount : d.over60,
    zombie: displayMode === "amount" ? d.zombieAmount : d.zombie,
  }));

  // Check if other charts have active filters (for dimming effect)
  const isOtherChartActive = activeFilter && activeFilter.type !== "stagnation";

  // Get highlighted status from filter
  const highlightedStatus =
    activeFilter?.type === "stagnation" ? activeFilter.activityStatus : null;

  const handleClick = (data: any, _index: number, event: any) => {
    if (data && data.tooltipPayload && data.tooltipPayload.length > 0) {
      const stage = data.stage;
      // Find which segment was clicked based on the click position
      // This is a simplified approach - we'll use the largest segment
      const segments = [
        { key: "active", value: data.active },
        { key: "over30", value: data.over30 },
        { key: "over60", value: data.over60 },
        { key: "zombie", value: data.zombie },
      ];
      const largestSegment = segments.reduce((a, b) =>
        a.value > b.value ? a : b,
      );
      onBarClick?.(stage, largestSegment.key);
    }
  };

  // Create clickable stat cards - pass undefined for stage to indicate all stages
  const handleStatClick = (status: string) => {
    onBarClick?.(undefined as any, status);
  };

  const getStatCardClasses = (status: string, baseClasses: string) => {
    const isHighlighted = highlightedStatus === status;
    return `${baseClasses} ${isHighlighted ? "ring-2 ring-primary scale-105" : ""}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
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
          <h3 className="text-lg font-semibold">{t("chart.stagnation")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("chart.stagnationDesc")}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
              aria-label={t("chart.amount")}
              className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <DollarSign className="w-3.5 h-3.5 mr-1" />
              {t("chart.amount")}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="count"
              aria-label={t("chart.count")}
              className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Hash className="w-3.5 h-3.5 mr-1" />
              {t("chart.count")}
            </ToggleGroupItem>
          </ToggleGroup>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium ${
              zombiePercentage > 15
                ? "bg-danger/20 text-danger"
                : zombiePercentage > 10
                  ? "bg-warning/20 text-warning"
                  : "bg-success/20 text-success"
            }`}
          >
            {displayMode === "amount"
              ? formatValue(totalZombie, displayMode)
              : totalZombie}{" "}
            {t("chart.zombieDeals")} ({zombiePercentage}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div
          className={getStatCardClasses(
            "active",
            "p-3 rounded-lg bg-success/10 border border-success/20 cursor-pointer hover:ring-2 hover:ring-success/30 transition-all",
          )}
          onClick={() => handleStatClick("active")}
        >
          <p className="data-label mb-1">{t("status.active")}</p>
          <p className="data-value text-success">
            {displayMode === "amount"
              ? formatValue(
                  stagnationData.reduce((sum, d) => sum + d.activeAmount, 0),
                  displayMode,
                )
              : stagnationData.reduce((sum, d) => sum + d.active, 0)}
          </p>
        </div>
        <div
          className={getStatCardClasses(
            "over30",
            "p-3 rounded-lg bg-warning/10 border border-warning/20 cursor-pointer hover:ring-2 hover:ring-warning/30 transition-all",
          )}
          onClick={() => handleStatClick("over30")}
        >
          <p className="data-label mb-1">{t("status.over30")}</p>
          <p className="data-value text-warning">
            {displayMode === "amount"
              ? formatValue(
                  stagnationData.reduce((sum, d) => sum + d.over30Amount, 0),
                  displayMode,
                )
              : stagnationData.reduce((sum, d) => sum + d.over30, 0)}
          </p>
        </div>
        <div
          className={getStatCardClasses(
            "over60",
            "p-3 rounded-lg bg-danger/10 border border-danger/20 cursor-pointer hover:ring-2 hover:ring-danger/30 transition-all",
          )}
          onClick={() => handleStatClick("over60")}
        >
          <p className="data-label mb-1">{t("status.over60")}</p>
          <p className="data-value text-danger">
            {displayMode === "amount"
              ? formatValue(
                  stagnationData.reduce((sum, d) => sum + d.over60Amount, 0),
                  displayMode,
                )
              : stagnationData.reduce((sum, d) => sum + d.over60, 0)}
          </p>
        </div>
        <div
          className={getStatCardClasses(
            "zombie",
            "p-3 rounded-lg border cursor-pointer hover:ring-2 hover:ring-danger/50 transition-all",
          )}
          style={{
            backgroundColor: "hsl(0, 72%, 40%, 0.1)",
            borderColor: "hsl(0, 72%, 40%, 0.2)",
          }}
          onClick={() => handleStatClick("zombie")}
        >
          <p className="data-label mb-1">{t("status.zombie")}</p>
          <p className="data-value" style={{ color: "hsl(0, 72%, 55%)" }}>
            {displayMode === "amount"
              ? formatValue(totalZombie, displayMode)
              : stagnationData.reduce((sum, d) => sum + d.zombie, 0)}
          </p>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: displayMode === "amount" ? 20 : 0,
              bottom: 0,
            }}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                const payload = data.activePayload[0].payload;
                handleClick(payload, 0, null);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 47%, 16%)"
              vertical={false}
            />
            <XAxis
              dataKey="stage"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              tickFormatter={(value) =>
                displayMode === "amount"
                  ? formatValue(value, displayMode)
                  : String(value)
              }
            />
            <Tooltip
              content={<CustomTooltip t={t} displayMode={displayMode} />}
              cursor={{ fill: "hsl(222, 47%, 12%)" }}
            />

            <Bar
              dataKey="active"
              name={t("chart.lessThan30")}
              stackId="a"
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`active-${index}`}
                  fill={
                    highlightedStatus === "active"
                      ? "hsl(142, 71%, 55%)"
                      : "hsl(142, 71%, 45%)"
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
              name={t("chart.moreThan30")}
              stackId="a"
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`over30-${index}`}
                  fill={
                    highlightedStatus === "over30"
                      ? "hsl(45, 93%, 57%)"
                      : "hsl(45, 93%, 47%)"
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
              name={t("chart.moreThan60")}
              stackId="a"
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`over60-${index}`}
                  fill={
                    highlightedStatus === "over60"
                      ? "hsl(0, 84%, 70%)"
                      : "hsl(0, 84%, 60%)"
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
              name={t("chart.moreThan90")}
              stackId="a"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`zombie-${index}`}
                  fill={
                    highlightedStatus === "zombie"
                      ? "hsl(0, 72%, 50%)"
                      : "hsl(0, 72%, 40%)"
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

      <div className="flex items-center justify-between mt-4">
        <CustomLegend t={t} />
        <span className="text-xs text-primary">
          {t("chart.clickOrCardToView")}
        </span>
      </div>
    </motion.div>
  );
}
