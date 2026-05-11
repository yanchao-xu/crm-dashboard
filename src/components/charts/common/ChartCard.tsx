import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { X, Info } from "lucide-react";

export interface FilterTag {
  label: string;
  onRemove?: () => void;
}

interface ChartCardProps {
  title: string;
  description: string;
  titleTooltip?: string;
  status?: {
    label: string;
    variant: "success" | "danger" | "warning";
  };
  filterTags?: FilterTag[];
  isActive?: boolean;
  isOtherChartActive?: boolean;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  titleTooltip,
  status,
  filterTags,
  isActive,
  isOtherChartActive,
  children,
  className = "",
}: ChartCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
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
      className={`bot-dashboard-bg glass-card p-6 transition-all ${isActive
          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
          : isOtherChartActive
            ? "opacity-50 hover:opacity-75"
            : "hover:ring-2 hover:ring-primary/30"
        } ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-semibold">{title}</h3>
            {titleTooltip && (
              <div
                className="relative inline-flex"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 p-3 rounded-lg bg-popover border border-border shadow-lg text-xs text-popover-foreground whitespace-pre-line">
                    {titleTooltip.replace(/\\n/g, "\n")}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {filterTags?.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-muted/60 text-muted-foreground"
            >
              {tag.label}
              {tag.onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    tag.onRemove!();
                  }}
                  className="ml-0.5 hover:text-foreground transition-colors rounded-full"
                  aria-label={`Remove filter: ${tag.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          {status && (
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium ${statusColors[status.variant]}`}
            >
              ● {status.label}
            </div>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
