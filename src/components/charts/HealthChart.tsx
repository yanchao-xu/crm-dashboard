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
import { motion } from "framer-motion";
import { ChartFilterContext } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";

// Data structure for stacked bar chart by stage
export interface StackedHealthDataPoint {
  month: string;
  target: number;
  Discovery: number;
  Qualification: number;
  Proposal: number;
  Negotiation: number;
  Closing: number;
}

interface HealthChartProps {
  data?: StackedHealthDataPoint[];
  onSegmentClick?: (month: string) => void;
  isActive?: boolean;
  activeFilter?: ChartFilterContext;
}

// Stage colors for the stacked bars
const stageColors = {
  Discovery: "hsl(217, 91%, 60%)",
  Qualification: "hsl(252, 87%, 67%)",
  Proposal: "hsl(280, 100%, 70%)",
  Negotiation: "hsl(330, 85%, 65%)",
  Closing: "hsl(142, 76%, 45%)",
};

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    const targetEntry = payload.find((p: any) => p.dataKey === "target");
    const target = targetEntry?.value || 0;
    const stageEntries = payload.filter((p: any) => p.dataKey !== "target");
    const actual = stageEntries.reduce(
      (sum: number, p: any) => sum + (p.value || 0),
      0,
    );
    const gap = actual - target;
    const isHealthy = gap >= 0;

    return (
      <div className="glass-card p-3 border border-border min-w-[200px]">
        <p className="font-mono text-sm text-muted-foreground mb-2">{label}</p>

        {/* Stage breakdown */}
        <div className="space-y-1 mb-2">
          {stageEntries.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground flex-1">
                {entry.dataKey}:
              </span>
              <span className="font-mono text-xs">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("chart.total")}:
            </span>
            <span className="font-mono text-sm font-semibold">
              {formatCurrency(actual)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-0.5 border-t-2 border-dashed border-chart-target" />
            <span className="text-xs text-muted-foreground">
              {t("chart.target")}:
            </span>
            <span className="font-mono text-sm">{formatCurrency(target)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("chart.gap")}:
            </span>
            <span
              className={`font-mono text-sm font-semibold ${isHealthy ? "text-success" : "text-danger"}`}
            >
              {gap >= 0 ? "+" : ""}
              {formatCurrency(gap)}
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

export function HealthChart({
  data,
  onSegmentClick,
  isActive,
  activeFilter,
}: HealthChartProps) {
  const { t, language } = useLanguage();

  // Default stacked data if none provided
  const defaultStackedData: StackedHealthDataPoint[] = [
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
  ];

  const healthData = data || defaultStackedData;

  // Calculate totals for stats
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

  const handleClick = (data: any) => {
    if (data && data.activeLabel && onSegmentClick) {
      onSegmentClick(data.activeLabel);
    }
  };

  // Check if other charts have active filters (for dimming effect)
  const isOtherChartActive = activeFilter && activeFilter.type !== "health";

  // Check if current month is selected
  const selectedMonth =
    activeFilter?.type === "health" ? activeFilter.month : null;

  // Stage labels based on language
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card p-6 cursor-pointer transition-all ${
        isActive
          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
          : isOtherChartActive
            ? "opacity-50 hover:opacity-75"
            : "hover:ring-2 hover:ring-primary/30"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{t("chart.health")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("chart.healthDesc")}
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium ${
            isHealthy
              ? "bg-success/20 text-success"
              : "bg-danger/20 text-danger"
          }`}
        >
          {isHealthy
            ? `● ${t("chart.healthy")}`
            : `● ${t("chart.belowTarget")}`}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="data-label mb-1">{t("chart.current")}</p>
          <p className="data-value text-chart-actual">
            {formatCurrency(latestActual)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="data-label mb-1">{t("chart.target")}</p>
          <p className="data-value text-chart-target">
            {formatCurrency(latestTarget)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="data-label mb-1">{t("chart.attainment")}</p>
          <p
            className={`data-value ${isHealthy ? "text-success" : "text-danger"}`}
          >
            {Math.round((latestActual / latestTarget) * 100)}%
          </p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={healthData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={handleClick}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 47%, 16%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip t={t} />} />

            {/* Stacked bars by stage */}
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

            {/* Target line - dotted line showing monthly targets */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="hsl(45, 93%, 58%)"
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={{ fill: "hsl(45, 93%, 58%)", strokeWidth: 0, r: 4 }}
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
            style={{ borderColor: "hsl(45, 93%, 58%)" }}
          />
          <span className="text-xs text-muted-foreground">
            {t("chart.theoreticalTarget")}
          </span>
        </div>
        <span className="text-xs text-primary ml-auto">
          {t("chart.clickToView")}
        </span>
      </div>
    </motion.div>
  );
}
