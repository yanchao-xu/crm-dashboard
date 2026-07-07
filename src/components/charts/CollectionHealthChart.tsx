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
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ChartCard, type FilterTag } from "./common/ChartCard";
import { StatCard } from "./common/StatCard";
import { formatCurrency, formatMonth } from "./utils/formatters";
import { chartTheme } from "./config/chartColors";
import { chartMargins, chartHeights, axisConfig } from "./config/chartConfig";
import { CollectionHealthTooltip } from "./CollectionHealthChart/CollectionHealthTooltip";
import {
    useCollectionHealthData,
    type CollectionHealthDataPoint,
} from "./CollectionHealthChart/useCollectionHealthData";
import type { ChartFilterContext } from "@/pages/Index";

const targetColor = "hsl(217, 91%, 60%)";
const actualColor = "hsl(252, 87%, 67%)";

interface CollectionHealthChartProps {
    data: CollectionHealthDataPoint[];
    onMonthClick?: (month: string) => void;
    isActive?: boolean;
    activeFilter?: ChartFilterContext;
    filterTags?: FilterTag[];
    fiscalMonths?: string[];
}

export function CollectionHealthChart({
    data,
    onMonthClick,
    isActive,
    activeFilter,
    filterTags,
    fiscalMonths,
}: CollectionHealthChartProps) {
    const { t, language } = useLanguage();
    const { currencyCode } = useCurrency();

    const { totalTarget, totalActual, rate, isHealthy } =
        useCollectionHealthData(data, fiscalMonths);

    const isOtherChartActive = !!(
        activeFilter && activeFilter.type !== "collection"
    );
    const selectedMonth =
        activeFilter?.type === "collection" ? activeFilter.month : null;

    const handleClick = (e: any) => {
        if (e && e.activeLabel && onMonthClick) {
            onMonthClick(e.activeLabel);
        }
    };

    return (
        <ChartCard
            title={t("dashboard>collection>title")}
            description={t("dashboard>collection>desc")}
            status={{
                label: isHealthy
                    ? t("dashboard>chart>healthy")
                    : t("dashboard>chart>belowTarget"),
                variant: isHealthy ? "success" : "danger",
            }}
            filterTags={filterTags}
            isActive={isActive}
            isOtherChartActive={isOtherChartActive}
            className="cursor-pointer"
        >
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard
                    label={t("dashboard>collection>actual")}
                    value={formatCurrency(totalActual, currencyCode)}
                    valueColor="text-chart-actual"
                />
                <StatCard
                    label={t("dashboard>collection>target")}
                    value={formatCurrency(totalTarget, currencyCode)}
                    valueColor="text-chart-target"
                />
                <StatCard
                    label={t("dashboard>collection>rate")}
                    value={`${rate}%`}
                    valueColor={isHealthy ? "text-success" : "text-danger"}
                />
            </div>

            {/* Chart */}
            <div style={{ height: chartHeights.large }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={chartMargins.default}
                        onClick={handleClick}
                        barGap={4}
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
                            tickFormatter={(value) => formatMonth(value, language)}
                        />
                        <YAxis
                            {...axisConfig}
                            tick={{ fill: chartTheme.tick, fontSize: axisConfig.fontSize }}
                            tickFormatter={(value) => formatCurrency(value, currencyCode)}
                        />
                        <Tooltip
                            content={
                                <CollectionHealthTooltip t={t} currencyCode={currencyCode} />
                            }
                            cursor={{ fill: chartTheme.cursor }}
                        />

                        <Bar
                            dataKey="target"
                            name={t("dashboard>collection>target")}
                            radius={[4, 4, 0, 0]}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`target-${index}`}
                                    fill={targetColor}
                                    opacity={
                                        selectedMonth && selectedMonth !== entry.month ? 0.3 : 1
                                    }
                                />
                            ))}
                        </Bar>
                        <Bar
                            dataKey="actual"
                            name={t("dashboard>collection>actual")}
                            radius={[4, 4, 0, 0]}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`actual-${index}`}
                                    fill={actualColor}
                                    opacity={
                                        selectedMonth && selectedMonth !== entry.month ? 0.3 : 1
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: targetColor }}
                    />
                    <span className="text-xs text-muted-foreground">
                        {t("dashboard>collection>target")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: actualColor }}
                    />
                    <span className="text-xs text-muted-foreground">
                        {t("dashboard>collection>actual")}
                    </span>
                </div>
            </div>
        </ChartCard>
    );
}
