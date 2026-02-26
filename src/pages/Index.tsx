import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HealthChart } from "@/components/charts/HealthChart";
import { StagnationChart } from "@/components/charts/StagnationChart";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { OrgNode, deals, productGroups, orgStructure } from "@/data/mockData";
import {
  filterDealsByOrg,
  filterDealsByProduct,
  filterDealsByMonth,
  calculateStackedHealthData,
  calculateStagnationData,
  calculateFunnelData,
  getTeamsFromOrg,
} from "@/utils/orgFilter";

export type ChartFilterContext = {
  type: "health" | "funnel" | "stagnation";
  stage?: string;
  activityStatus?: string;
  month?: string;
} | null;

const Index = () => {
  const { t } = useLanguage();
  const [chartFilter, setChartFilter] = useState<ChartFilterContext>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrgNode | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Get team options from org structure
  const teamOptions = useMemo(() => getTeamsFromOrg(orgStructure), []);

  // Calculate filtered data based on selected organization and products
  const filteredDeals = useMemo(() => {
    let result = filterDealsByOrg(deals, selectedOrg);
    result = filterDealsByProduct(result, selectedProducts);

    // Filter by month if health chart is active
    if (chartFilter?.type === "health" && chartFilter.month) {
      result = filterDealsByMonth(result, chartFilter.month);
    }

    return result;
  }, [selectedOrg, selectedProducts, chartFilter]);

  // Deals for funnel chart (filtered by month if health chart is active)
  const funnelDeals = useMemo(() => {
    let result = filterDealsByOrg(deals, selectedOrg);
    result = filterDealsByProduct(result, selectedProducts);

    // If health chart has month selected, filter funnel data to that month
    if (chartFilter?.type === "health" && chartFilter.month) {
      result = filterDealsByMonth(result, chartFilter.month);
    }

    return result;
  }, [selectedOrg, selectedProducts, chartFilter]);

  const filteredStackedHealthData = useMemo(
    () => calculateStackedHealthData(filteredDeals, selectedOrg),
    [filteredDeals, selectedOrg],
  );
  const filteredStagnationData = useMemo(
    () => calculateStagnationData(filteredDeals),
    [filteredDeals],
  );
  const filteredFunnelData = useMemo(
    () => calculateFunnelData(funnelDeals),
    [funnelDeals],
  );

  const getFilterTitle = () => {
    if (!chartFilter) return "";
    switch (chartFilter.type) {
      case "health":
        return chartFilter.month
          ? t("filter.healthMonth", { month: chartFilter.month })
          : t("filter.healthDefault");
      case "funnel":
        return chartFilter.stage
          ? t("filter.funnelStage", { stage: chartFilter.stage })
          : t("filter.funnelDefault");
      case "stagnation":
        if (chartFilter.stage && chartFilter.activityStatus) {
          const statusLabel = t(
            `status.${
              chartFilter.activityStatus === "over30"
                ? "over30"
                : chartFilter.activityStatus === "over60"
                  ? "over60"
                  : chartFilter.activityStatus === "zombie"
                    ? "zombie"
                    : "active"
            }`,
          );
          return t("filter.stagnationStageStatus", {
            stage: chartFilter.stage,
            status: statusLabel,
          });
        }
        if (chartFilter.activityStatus) {
          const statusLabel = t(`status.${chartFilter.activityStatus}`);
          return t("filter.stagnationStageStatus", {
            stage: "",
            status: statusLabel,
          }).replace(" - ", "");
        }
        return t("filter.stagnationDefault");
      default:
        return t("filter.dealList");
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Filters Row */}

          {/* Top Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthChart
              data={filteredStackedHealthData}
              onSegmentClick={(month) =>
                setChartFilter({ type: "health", month })
              }
              isActive={chartFilter?.type === "health"}
              activeFilter={chartFilter}
            />
            <FunnelChart
              data={filteredFunnelData}
              onStageClick={(stage) =>
                setChartFilter({ type: "funnel", stage })
              }
              isActive={chartFilter?.type === "funnel"}
              activeFilter={chartFilter}
            />
          </div>

          {/* Deals Table for Health/Funnel - Full Width */}
          <AnimatePresence>
            {(chartFilter?.type === "health" ||
              chartFilter?.type === "funnel") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {getFilterTitle()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("filter.clickToSwitch")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setChartFilter(null)}
                    ></Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stagnation Chart - Full Width */}
          <StagnationChart
            data={filteredStagnationData}
            onBarClick={(stage, status) =>
              setChartFilter({
                type: "stagnation",
                stage,
                activityStatus: status,
              })
            }
            isActive={chartFilter?.type === "stagnation"}
            activeFilter={chartFilter}
          />

          {/* Deals Table for Stagnation - Full Width */}
          <AnimatePresence>
            {chartFilter?.type === "stagnation" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {getFilterTitle()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("filter.clickToSwitch")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setChartFilter(null)}
                    ></Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
