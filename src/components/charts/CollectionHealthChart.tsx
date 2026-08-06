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

const nativePlanColor = "hsl(217, 91%, 60%)";
const rolledOverdueColor = "hsl(25, 95%, 53%)";
const actualColor = "hsl(252, 87%, 67%)";

export type HiddenSeries = Set<"nativePlan" | "rolledOverdue" | "actual">;

interface CollectionHealthChartProps {
    data: CollectionHealthDataPoint[];
    onMonthClick?: (month: string, segment?: "native" | "overdue") => void;
    onHiddenSeriesChange?: (hidden: HiddenSeries) => void;
    isActive?: boolean;
    activeFilter?: ChartFilterContext;
    filterTags?: FilterTag[];
    fiscalMonths?: string[];
}

export function CollectionHealthChart({
    data,
    onMonthClick,
    onHiddenSeriesChange,
    isActive,
    activeFilter,
    filterTags,
    fiscalMonths,
}: CollectionHealthChartProps) {
    const { t, language } = useLanguage();
    const { currencyCode } = useCurrency();
    const [hiddenSeries, setHiddenSeries] = useState<HiddenSeries>(new Set());

    const { totalTarget, totalActual, rate, isHealthy } =
        useCollectionHealthData(data, fiscalMonths);

    const isOtherChartActive = !!(
        activeFilter && activeFilter.type !== "collection"
    );
    const selectedMonth =
        activeFilter?.type === "collection" ? activeFilter.month : null;

    const handleChartClick = (e: any) => {
        if (e && e.activeLabel && onMonthClick) {
            onMonthClick(e.activeLabel);
        }
    };

    const toggleSeries = (series: "nativePlan" | "rolledOverdue" | "actual") => {
        setHiddenSeries((prev) => {
            const next = new Set(prev);
            if (next.has(series)) {
                next.delete(series);
            } else {
                next.add(series);
            }
            onHiddenSeriesChange?.(next);
            return next;
        });
    };

    return (
        <ChartCard
            title={t("dashboard>collection>title")}
            description={t("dashboard>collection>desc")}
            titleTooltip={t("dashboard>collection>chartTooltip")}
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
                    infoText={t("dashboard>collection>actualInfo")}
                />
                <StatCard
                    label={t("dashboard>collection>target")}
                    value={formatCurrency(totalTarget, currencyCode)}
                    valueColor="text-chart-target"
                    infoText={t("dashboard>collection>targetInfo")}
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
                        onClick={handleChartClick}
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

                        {/* 原生计划（蓝色底部） */}
                        {!hiddenSeries.has("nativePlan") && (
                            <Bar
                                dataKey="nativePlan"
                                stackId="target"
                                name={t("dashboard>collection>nativePlan")}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`native-${index}`}
                                        fill={nativePlanColor}
                                        opacity={
                                            selectedMonth && selectedMonth !== entry.month ? 0.3 : 1
                                        }
                                        cursor="pointer"
                                    />
                                ))}
                            </Bar>
                        )}

                        {/* 滚动逾期（橙色顶部） */}
                        {!hiddenSeries.has("rolledOverdue") && (
                            <Bar
                                dataKey="rolledOverdue"
                                stackId="target"
                                name={t("dashboard>collection>rolledOverdue")}
                                radius={[4, 4, 0, 0]}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`overdue-${index}`}
                                        fill={rolledOverdueColor}
                                        opacity={
                                            selectedMonth && selectedMonth !== entry.month ? 0.3 : 1
                                        }
                                        cursor="pointer"
                                    />
                                ))}
                            </Bar>
                        )}

                        {/* 实际回款（紫色独立柱） */}
                        {!hiddenSeries.has("actual") && (
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
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend - clickable */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                <button
                    type="button"
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleSeries("nativePlan")}
                >
                    <div
                        className="w-3 h-3 rounded-sm transition-opacity"
                        style={{
                            backgroundColor: nativePlanColor,
                            opacity: hiddenSeries.has("nativePlan") ? 0.3 : 1,
                        }}
                    />
                    <span className={`text-xs transition-opacity ${hiddenSeries.has("nativePlan") ? "line-through text-muted-foreground/50" : "text-muted-foreground"}`}>
                        {t("dashboard>collection>nativePlan")}
                    </span>
                </button>
                <button
                    type="button"
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleSeries("rolledOverdue")}
                >
                    <div
                        className="w-3 h-3 rounded-sm transition-opacity"
                        style={{
                            backgroundColor: rolledOverdueColor,
                            opacity: hiddenSeries.has("rolledOverdue") ? 0.3 : 1,
                        }}
                    />
                    <span className={`text-xs transition-opacity ${hiddenSeries.has("rolledOverdue") ? "line-through text-muted-foreground/50" : "text-muted-foreground"}`}>
                        {t("dashboard>collection>rolledOverdue")}
                    </span>
                </button>
                <button
                    type="button"
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleSeries("actual")}
                >
                    <div
                        className="w-3 h-3 rounded-sm transition-opacity"
                        style={{
                            backgroundColor: actualColor,
                            opacity: hiddenSeries.has("actual") ? 0.3 : 1,
                        }}
                    />
                    <span className={`text-xs transition-opacity ${hiddenSeries.has("actual") ? "line-through text-muted-foreground/50" : "text-muted-foreground"}`}>
                        {t("dashboard>collection>actual")}
                    </span>
                </button>
            </div>
        </ChartCard>
    );
}
