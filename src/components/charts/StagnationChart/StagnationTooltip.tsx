import { formatCurrencyWithSymbol, type Language } from "../utils/formatters";
import { DisplayMode } from "./useStagnationChartData";

interface StagnationTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    t: (key: string, params?: Record<string, string | number>) => string;
    displayMode: DisplayMode;
    language: Language;
}

export function StagnationTooltip({
    active,
    payload,
    label,
    t,
    displayMode,
    language,
}: StagnationTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const total = payload.reduce(
        (sum: number, p: any) => sum + (p.value || 0),
        0,
    );
    const unit = displayMode === "amount" ? "" : ` ${t("dashboard>chart>deals")}`;

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
                                ? formatCurrencyWithSymbol(entry.value, language)
                                : entry.value}
                            {unit}
                        </span>
                    </div>
                ))}
                <div className="pt-1 border-t border-border mt-2">
                    <span className="text-xs text-muted-foreground">
                        {t("dashboard>chart>total")}:{" "}
                    </span>
                    <span className="font-mono text-sm font-semibold">
                        {displayMode === "amount"
                            ? formatCurrencyWithSymbol(total, language)
                            : total}
                        {unit}
                    </span>
                </div>
            </div>
            <p className="text-xs text-primary mt-2 pt-2 border-t border-border">
                {t("dashboard>chart>clickForDetails")}
            </p>
        </div>
    );
}
