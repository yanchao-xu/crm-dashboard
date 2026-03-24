import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
  onClick?: () => void;
  isHighlighted?: boolean;
  variant?: "default" | "success" | "warning" | "danger" | "custom";
  customColors?: {
    bg: string;
    border: string;
    text: string;
  };
}

export function StatCard({
  label,
  value,
  valueColor,
  onClick,
  isHighlighted,
  variant = "default",
  customColors,
}: StatCardProps) {
  const variantClasses = {
    default: "bg-secondary/50",
    success: "bg-success/10 border border-success/20 hover:ring-success/30",
    warning: "bg-warning/10 border border-warning/20 hover:ring-warning/30",
    danger: "bg-danger/10 border border-danger/20 hover:ring-danger/30",
    custom: "",
  };

  const variantTextColors = {
    default: "",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    custom: "",
  };

  const baseClasses = `p-3 rounded-xl ${variantClasses[variant]} ${onClick ? "cursor-pointer hover:ring-2 transition-all" : ""
    } ${isHighlighted ? "ring-2 ring-primary scale-105" : ""}`;

  const style = customColors
    ? {
      backgroundColor: customColors.bg,
      borderColor: customColors.border,
    }
    : undefined;

  const textColor =
    variant === "custom" && customColors
      ? customColors.text
      : variantTextColors[variant] || valueColor;

  return (
    <div className={baseClasses} onClick={onClick} style={style}>
      <p className="data-label mb-1">{label}</p>
      <p className={`data-value ${textColor}`}>{value}</p>
    </div>
  );
}
