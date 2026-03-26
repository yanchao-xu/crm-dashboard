import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import type { FunnelStage } from "@/types";
import { formatCurrency, type Language } from "../utils/formatters";

interface FunnelBarProps {
    stage: FunnelStage;
    maxCount: number;
    index: number;
    isLast: boolean;
    onClick?: () => void;
    isHighlighted?: boolean;
    t: (key: string, params?: Record<string, string | number>) => string;
    language: Language;
}

export function FunnelBar({
    stage,
    maxCount,
    index,
    isLast,
    onClick,
    isHighlighted,
    t,
    language,
}: FunnelBarProps) {
    const widthPercent = (stage.count / maxCount) * 100;
    const conversionGap = stage.actualConversion - stage.targetConversion;
    const isHealthy = conversionGap >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative cursor-pointer group transition-all ${isHighlighted ? "scale-[1.02]" : ""
                }`}
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                <div className="w-28 flex-shrink-0 text-right">
                    <p
                        className={`text-sm font-medium group-hover:text-primary transition-colors ${isHighlighted ? "text-primary" : ""
                            }`}
                    >
                        {stage.stageName || stage.stage}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                        {stage.count} {t("dashboard>chart>deals")}
                    </p>
                </div>

                <div className="flex-1 relative">
                    <div
                        className={`h-12 bg-secondary/30 rounded-xl overflow-hidden group-hover:ring-2 group-hover:ring-primary/30 transition-all ${isHighlighted ? "ring-2 ring-primary" : ""
                            }`}
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                            className={`h-full rounded-xl relative overflow-hidden group-hover:brightness-110 transition-all ${isHighlighted ? "brightness-125" : ""
                                }`}
                            style={{
                                background: `linear-gradient(90deg, 
                  hsl(217, 91%, 60%) 0%, 
                  hsl(280, 100%, 70%) 100%)`,
                            }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-mono font-semibold text-primary-foreground drop-shadow">
                                    {formatCurrency(stage.value, language)}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="w-32 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono ${isHealthy
                                ? "bg-success/20 text-success"
                                : "bg-danger/20 text-danger"
                                }`}
                        >
                            {isHealthy ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            {stage.actualConversion}%
                        </div>
                        <span className="text-xs text-muted-foreground">
                            / {stage.targetConversion}%
                        </span>
                    </div>
                </div>
            </div>

            {!isLast && (
                <div className="flex items-center justify-center py-1 ml-32">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                </div>
            )}
        </motion.div>
    );
}
