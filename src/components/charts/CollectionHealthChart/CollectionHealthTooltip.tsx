import { formatCurrency } from "../utils/formatters";

const targetColor = "hsl(217, 91%, 60%)";
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

    const target = payload.find((p: any) => p.dataKey === "target")?.value || 0;
    const actual = payload.find((p: any) => p.dataKey === "actual")?.value || 0;
    const rate = target > 0 ? Math.round((actual / target) * 100) : 0;
    const pending = Math.max(target - actual, 0);
    const isHealthy = actual >= target * 0.9;

    return (
        <div className="glass-card p-3 border border-border min-w-[200px]">
            <p className="font-mono text-sm text-muted-foreground mb-2">{label}</p>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: targetColor }}
                    />
                    <span className="text-xs text-muted-foreground flex-1">
                        {t("dashboard>collection>target")}:
                    </span>
                    <span className="font-mono text-xs">
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
