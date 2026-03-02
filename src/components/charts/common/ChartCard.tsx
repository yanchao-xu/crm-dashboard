import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ChartCardProps {
    title: string;
    description: string;
    status?: {
        label: string;
        variant: "success" | "danger" | "warning";
    };
    isActive?: boolean;
    isOtherChartActive?: boolean;
    children: ReactNode;
    className?: string;
}

export function ChartCard({
    title,
    description,
    status,
    isActive,
    isOtherChartActive,
    children,
    className = "",
}: ChartCardProps) {
    const statusColors = {
        success: "bg-success/20 text-success",
        danger: "bg-danger/20 text-danger",
        warning: "bg-warning/20 text-warning",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`glass-card p-6 transition-all ${isActive
                    ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                    : isOtherChartActive
                        ? "opacity-50 hover:opacity-75"
                        : "hover:ring-2 hover:ring-primary/30"
                } ${className}`}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                {status && (
                    <div
                        className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium ${statusColors[status.variant]}`}
                    >
                        ● {status.label}
                    </div>
                )}
            </div>
            {children}
        </motion.div>
    );
}
