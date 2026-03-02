interface LegendItem {
    color: string;
    label: string;
}

interface ChartLegendProps {
    items: LegendItem[];
    actionText?: string;
}

export function ChartLegend({ items, actionText }: ChartLegendProps) {
    return (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-6">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                ))}
            </div>
            {actionText && (
                <span className="text-xs text-primary ml-auto">{actionText}</span>
            )}
        </div>
    );
}
