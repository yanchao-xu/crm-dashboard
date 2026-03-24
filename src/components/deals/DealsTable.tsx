import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Deal } from "@/types";
import { DealFilters, FilterState } from "./DealFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChartFilterContext } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/components/charts/utils/formatters";
import type { OpportunityStage } from "@/services/api";

interface DealsTableProps {
  filterContext?: ChartFilterContext;
  deals?: Deal[];
  stages?: OpportunityStage[];
}

export function DealsTable({
  filterContext,
  deals: propDeals,
  stages = [],
}: DealsTableProps) {
  const { t, getText, language } = useLanguage();
  const allDeals = propDeals || [];
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    stages: [],
    owners: [],
    activityStatus: [],
    probabilityRange: [0, 100],
    valueRange: [0, 1000000],
    searchQuery: "",
  });

  // 构建 stage code 到 name 的映射
  const stageTranslations = useMemo(() => {
    const mapping: Record<string, string> = {};
    stages.forEach((stage) => {
      mapping[stage.code] = stage.name;
    });
    return mapping;
  }, [stages]);

  const getActivityStatus = (days: number) => {
    if (days >= 90)
      return {
        label: t("dashboard>status>zombie"),
        color: "bg-danger/20 text-danger border-danger/30",
        key: "zombie",
      };
    if (days >= 60)
      return {
        label: t("dashboard>status>over60"),
        color: "bg-danger/20 text-danger border-danger/30",
        key: "over60",
      };
    if (days >= 30)
      return {
        label: t("dashboard>status>over30"),
        color: "bg-warning/20 text-warning border-warning/30",
        key: "over30",
      };
    return {
      label: t("dashboard>status>active"),
      color: "bg-success/20 text-success border-success/30",
      key: "active",
    };
  };

  // Derive filter options from data
  const stageOptions = useMemo(() => {
    const stageSet = [...new Set(allDeals.map((d) => d.stage))];
    return stageSet.map((stage) => ({
      value: stage,
      label: stageTranslations[stage] || stage,
      count: allDeals.filter((d) => d.stage === stage).length,
    }));
  }, [allDeals, stageTranslations]);

  const ownerOptions = useMemo(() => {
    const owners = [...new Set(allDeals.map((d) => d.owner))];
    return owners.map((owner) => ({
      value: owner,
      label: owner,
      count: allDeals.filter((d) => d.owner === owner).length,
    }));
  }, [allDeals]);

  // Filter deals based on chart context and manual filters
  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => {
      // Apply chart filter context first
      if (filterContext) {
        if (filterContext.type === "funnel" && filterContext.stage) {
          if (deal.stage !== filterContext.stage) return false;
        }
        if (filterContext.type === "stagnation") {
          // Filter by activity status if specified
          if (filterContext.activityStatus) {
            const status = getActivityStatus(deal.lastActivityDays);
            if (status.key !== filterContext.activityStatus) return false;
          }
          // Filter by stage only if specified and not empty
          if (filterContext.stage && filterContext.stage.trim() !== "") {
            if (deal.stage !== filterContext.stage) return false;
          }
        }
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const dealName = getText(deal.name).toLowerCase();
        const companyName = getText(deal.company).toLowerCase();
        if (!dealName.includes(query) && !companyName.includes(query)) {
          return false;
        }
      }

      // Stage filter (manual)
      if (filters.stages.length > 0 && !filters.stages.includes(deal.stage)) {
        return false;
      }

      // Owner filter
      if (filters.owners.length > 0 && !filters.owners.includes(deal.owner)) {
        return false;
      }

      // Activity status filter (manual)
      if (filters.activityStatus.length > 0) {
        const status = getActivityStatus(deal.lastActivityDays);
        if (!filters.activityStatus.includes(status.key)) {
          return false;
        }
      }

      // Probability filter
      if (
        deal.probability < filters.probabilityRange[0] ||
        deal.probability > filters.probabilityRange[1]
      ) {
        return false;
      }

      return true;
    });
  }, [filters, filterContext, getText]);

  const handleApprove = (action: string, eta: string) => {
    toast.success(t("dashboard>toast>executionPlanned"), {
      description: t("dashboard>toast>nextActionScheduled", {
        name: getText(selectedDeal?.name || ""),
        date: eta,
      }),
    });
  };

  return (
    <div className="flex h-[600px]">
      {/* Left: Table */}
      <div
        className={`flex-1 overflow-hidden flex flex-col transition-all ${selectedDeal ? "border-r border-border" : ""}`}
      >
        {/* Filters */}
        <DealFilters
          filters={filters}
          onFiltersChange={setFilters}
          stageOptions={stageOptions}
          ownerOptions={ownerOptions}
        />

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground font-mono text-xs">
                  {t("dashboard>deals>deal")}
                </TableHead>
                <TableHead className="text-muted-foreground font-mono text-xs">
                  {t("dashboard>deals>amount")}
                </TableHead>
                <TableHead className="text-muted-foreground font-mono text-xs">
                  {t("dashboard>deals>stage")}
                </TableHead>
                <TableHead className="text-muted-foreground font-mono text-xs">
                  {t("dashboard>deals>activityStatus")}
                </TableHead>
                <TableHead className="text-muted-foreground font-mono text-xs">
                  {t("dashboard>deals>successRate")}
                </TableHead>
                <TableHead className="text-muted-foreground font-mono text-xs">
                  {t("dashboard>deals>owner")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal, index) => {
                const status = getActivityStatus(deal.lastActivityDays);
                const isSelected = selectedDeal?.id === deal.id;
                const stageLabel = stageTranslations[deal.stage] || deal.stage;

                return (
                  <motion.tr
                    key={deal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedDeal(isSelected ? null : deal)}
                    className={`cursor-pointer transition-colors border-border ${isSelected ? "bg-primary/10" : "hover:bg-secondary/50"
                      }`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {getText(deal.name)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getText(deal.company)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {formatCurrency(deal.value, language)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {stageLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`font-mono text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${deal.probability >= 70
                              ? "bg-success"
                              : deal.probability >= 40
                                ? "bg-warning"
                                : "bg-danger"
                              }`}
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {deal.probability}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {deal.owner}
                      </span>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>

          {filteredDeals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {t("dashboard>deals>noDeals")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
