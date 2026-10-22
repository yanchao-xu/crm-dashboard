import { formatCurrency } from "../utils/formatters";
import { calculateCollectionHealthMetrics } from "./useCollectionHealthData";

const nativePlanColor = "hsl(217, 91%, 60%)";
const rolledOverdueColor = "hsl(25, 95%, 53%)";
const actualColor = "hsl(252, 87%, 67%)";

interface CollectionHealthTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    t: (key: string, params?: Record<string, string | number>) => string;
    currencyCode?: string;
}

export function CollectionHealthTooltip({
    active,
    payload,
    label,
    t,
    currencyCode,
}: CollectionHealthTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    const nativePlan = payload.find((p: any) => p.dataKey === "nativePlan")?.value || 0;
    const rolledOverdue = payload.find((p: any) => p.dataKey === "rolledOverdue")?.value || 0;
    const actual = payload.find((p: any) => p.dataKey === "actual")?.value || 0;
    const { target, rate, pending, isHealthy } = calculateCollectionHealthMetrics(
        nativePlan,
        rolledOverdue,
        actual,
    );

    return (
        <div className="glass-card p-3 border border-border min-w-[220px]">
            <p className="font-mono text-sm text-muted-foreground mb-2">{label}</p>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: nativePlanColor }}
                    />
                    <span className="text-xs text-muted-foreground flex-1">
                        {t("dashboard>collection>nativePlan")}:
                    </span>
                    <span className="font-mono text-xs">
                        {formatCurrency(nativePlan, currencyCode)}
                    </span>
                </div>
                {rolledOverdue > 0 && (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: rolledOverdueColor }}
                        />
                        <span className="text-xs text-muted-foreground flex-1">
                            {t("dashboard>collection>rolledOverdue")}:
                        </span>
                        <span className="font-mono text-xs text-warning">
                            {formatCurrency(rolledOverdue, currencyCode)}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground flex-1">
                        {t("dashboard>collection>target")}:
                    </span>
                    <span className="font-mono text-xs font-medium">
                        {formatCurrency(target, currencyCode)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: actualColor }}
                    />
                    <span className="text-xs text-muted-foreground flex-1">
                        {t("dashboard>collection>actual")}:
                    </span>
                    <span className="font-mono text-xs">
                        {formatCurrency(actual, currencyCode)}
                    </span>
                </div>
            </div>
            <div className="pt-2 mt-2 border-t border-border space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex-1">
                        {t("dashboard>collection>rate")}:
                    </span>
                    <span
                        className={`font-mono text-sm font-semibold ${isHealthy ? "text-success" : "text-danger"}`}
                    >
                        {rate}%
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex-1">
                        {t("dashboard>collection>pending")}:
                    </span>
                    <span className="font-mono text-xs">
                        {formatCurrency(pending, currencyCode)}
                    </span>
                </div>
            </div>
        </div>
    );
}
