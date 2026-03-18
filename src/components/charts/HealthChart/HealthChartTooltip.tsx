import { formatCurrency } from "../utils/formatters";

interface HealthChartTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    t: (key: string, params?: Record<string, string | number>) => string;
}

export function HealthChartTooltip({
    active,
    payload,
    label,
    t,
}: HealthChartTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

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
                        {t("dashboard>chart>total")}:
                    </span>
                    <span className="font-mono text-sm font-semibold">
                        {formatCurrency(actual)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-0.5 border-t-2 border-dashed border-chart-target" />
                    <span className="text-xs text-muted-foreground">
                        {t("dashboard>chart>target")}:
                    </span>
                    <span className="font-mono text-sm">{formatCurrency(target)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {t("dashboard>chart>gap")}:
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
                {t("dashboard>chart>clickForDetails")}
            </p>
        </div>
    );
}
