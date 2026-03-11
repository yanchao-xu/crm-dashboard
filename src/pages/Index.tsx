import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HealthChart } from "@/components/charts/HealthChart";
import { StagnationChart } from "@/components/charts/StagnationChart";
import { OrgFilter } from "@/components/filters/OrgFilter";
import { ProductTeamFilter } from "@/components/filters/ProductTeamFilter";
import { X, Loader2 } from "lucide-react";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { OrgNode } from "@/types";
import {
  filterDealsByOrg,
  filterDealsByProduct,
  filterDealsByMonth,
  calculateStackedHealthData,
  calculateStagnationData,
  calculateFunnelData,
} from "@/utils/orgFilter";
import {
  useDeals,
  useOrgStructure,
  useProductGroups,
  useOpportunityStages,
} from "@/hooks/useApiData";

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

  // 从 API 获取数据（不使用 fallback）
  const { data: deals, loading: dealsLoading, error: dealsError } = useDeals();
  const { data: orgStructure, loading: orgLoading } = useOrgStructure();
  const { data: productGroups, loading: productsLoading } = useProductGroups();
  console.log("deals", deals);
  const { data: opportunityStages, loading: stagesLoading } =
    useOpportunityStages();

  // Calculate filtered data based on selected organization and products
  const filteredDeals = useMemo(() => {
    let result = filterDealsByOrg(deals, selectedOrg);
    result = filterDealsByProduct(result, selectedProducts);
    return result;
  }, [selectedOrg, selectedProducts, deals]);

  // 健康度图表数据（始终显示所有月份）
  // target 数据：没有选中组织时使用根节点，选中后使用选中的组织
  const filteredStackedHealthData = useMemo(() => {
    const orgForTarget = selectedOrg || (orgStructure.id ? orgStructure : null);
    return calculateStackedHealthData(
      filteredDeals,
      orgForTarget,
      opportunityStages,
    );
  }, [filteredDeals, selectedOrg, orgStructure, opportunityStages]);
  // 销售漏斗数据（当点击健康度图表时，按月过滤）
  const filteredFunnelData = useMemo(() => {
    let dealsForFunnel = filterDealsByOrg(deals, selectedOrg);
    dealsForFunnel = filterDealsByProduct(dealsForFunnel, selectedProducts);

    // 如果健康度图表有选中的月份，按月过滤
    if (chartFilter?.type === "health" && chartFilter.month) {
      dealsForFunnel = filterDealsByMonth(dealsForFunnel, chartFilter.month);
    }

    return calculateFunnelData(dealsForFunnel, opportunityStages);
  }, [selectedOrg, selectedProducts, chartFilter, deals, opportunityStages]);

  // 商机停滞分析数据（当点击健康度图表时，按月过滤）
  const filteredStagnationData = useMemo(() => {
    let dealsForStagnation = filterDealsByOrg(deals, selectedOrg);
    dealsForStagnation = filterDealsByProduct(
      dealsForStagnation,
      selectedProducts,
    );

    // 如果健康度图表有选中的月份，按月过滤
    if (chartFilter?.type === "health" && chartFilter.month) {
      dealsForStagnation = filterDealsByMonth(
        dealsForStagnation,
        chartFilter.month,
      );
    }

    const result = calculateStagnationData(
      dealsForStagnation,
      opportunityStages,
    );
    return result;
  }, [selectedOrg, selectedProducts, chartFilter, deals, opportunityStages]);

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
        {/* 加载状态 */}
        {dealsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">加载数据中...</span>
          </div>
        )}

        {/* 错误状态 */}
        {dealsError && (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive mb-2">数据加载失败</p>
            <p className="text-sm text-muted-foreground">
              {dealsError.message}
            </p>
          </div>
        )}

        {/* 无数据状态 */}
        {!dealsLoading && !dealsError && deals.length === 0 && (
          <div className="glass-card p-6 text-center">
            <p className="text-muted-foreground">暂无数据</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <OrgFilter selectedOrg={selectedOrg} onOrgChange={setSelectedOrg} />
            <ProductTeamFilter
              selectedProducts={selectedProducts}
              onProductsChange={setSelectedProducts}
              productOptions={productGroups}
            />
          </div>
          {/* Top Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthChart
              data={filteredStackedHealthData}
              stages={opportunityStages}
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
                    >
                      <X className="w-4 h-4" />
                    </Button>
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
                    >
                      <X className="w-4 h-4" />
                    </Button>
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
