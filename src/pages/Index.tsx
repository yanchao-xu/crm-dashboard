import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HealthChart } from "@/components/charts/HealthChart";
import { StagnationChart } from "@/components/charts/StagnationChart";
import { OrgFilter } from "@/components/filters/OrgFilter";
import { ProductTeamFilter } from "@/components/filters/ProductTeamFilter";
import { X, Loader2 } from "lucide-react";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import type { OrgNode } from "@/types";
import type { FilterTag } from "@/components/charts/common/ChartCard";
import {
  filterDealsByOrg,
  filterDealsByProduct,
  filterDealsByMonth,
  filterDealsByQuarter,
  calculateStackedHealthData,
  calculateContractHealthData,
  calculateReceivableHealthData,
  calculateStagnationData,
  calculateFunnelData,
  aggregateHealthDataByQuarter,
  getMonthsForQuarter,
  NO_PRODUCT_LINE_ID,
} from "@/utils/orgFilter";
import {
  useDeals,
  useOrgStructure,
  useProductGroups,
  useOpportunityStages,
  useLeadCount,
  useContracts,
  useReceivablePlans,
  useCurrencies,
  useExchangeRates,
  useExchangeRateService,
} from "@/hooks/useApiData";
import { DealsTable } from "@/components/deals/DealsTable";
import {
  PeriodFilter,
  type PeriodMode,
} from "@/components/filters/PeriodFilter";
import {
  AmountModeFilter,
  type AmountMode,
} from "@/components/filters/AmountModeFilter";
import { CurrencyFilter } from "@/components/filters/CurrencyFilter";

export type ChartFilterContext = {
  type: "health" | "funnel" | "stagnation";
  stage?: string;
  activityStatus?: string;
  month?: string;
} | null;

const Index = () => {
  const { t, getText } = useLanguage();
  const [chartFilter, setChartFilter] = useState<ChartFilterContext>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrgNode | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [amountMode, setAmountMode] = useState<AmountMode>("expectedAmount");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  // 从 API 获取数据（不使用 fallback）
  const { data: deals, loading: dealsLoading, error: dealsError } = useDeals();
  const { data: orgStructure, loading: orgLoading } = useOrgStructure();
  const { data: productGroups, loading: productsLoading } = useProductGroups();
  const { data: opportunityStages, loading: stagesLoading } =
    useOpportunityStages();
  const { data: leadCount } = useLeadCount();
  const { data: currencies, loading: currenciesLoading } = useCurrencies();

  // 获取汇率表
  const { data: exchangeRates } = useExchangeRates();
  const exchangeService = useExchangeRateService(exchangeRates);

  // 根据选中的币种 code 找到对应的 id（用于汇率匹配）
  const selectedCurrencyId = useMemo(() => {
    if (!selectedCurrency || currencies.length === 0) return undefined;
    const found = currencies.find((c) => c.code === selectedCurrency);
    return found?.id;
  }, [selectedCurrency, currencies]);

  // 币种加载完成后，如果还没选择，设置第一个为默认值
  useEffect(() => {
    if (currencies.length > 0 && !selectedCurrency) {
      setSelectedCurrency(currencies[0].code);
    }
  }, [currencies, selectedCurrency]);

  // 获取合同数据（依赖 deals 加载完成）
  const { contracts: contractMap, loading: contractsLoading } = useContracts(deals);

  // 获取应收计划数据（依赖合同数据加载完成）
  const { receivablePlans: receivablePlanMap, loading: receivablesLoading } = useReceivablePlans(contractMap);

  // Calculate filtered data based on selected organization and products
  const filteredDeals = useMemo(() => {
    let result = filterDealsByOrg(deals, selectedOrg);
    result = filterDealsByProduct(result, selectedProducts);
    return result;
  }, [selectedOrg, selectedProducts, deals]);

  // 健康度图表数据
  const filteredStackedHealthData = useMemo(() => {
    const orgForTarget = selectedOrg || (orgStructure.id ? orgStructure : null);
    let monthlyData;

    if (amountMode === "contractAmount") {
      // 合同金额模式：按合同 signingDate 归类月份
      monthlyData = calculateContractHealthData(
        filteredDeals,
        orgForTarget,
        opportunityStages,
        contractMap,
        exchangeService,
        selectedCurrencyId,
      );
    } else if (amountMode === "receivableAmount") {
      // 实际回款金额模式：按应收计划 actualDate 归类月份
      monthlyData = calculateReceivableHealthData(
        filteredDeals,
        orgForTarget,
        opportunityStages,
        contractMap,
        receivablePlanMap,
        exchangeService,
        selectedCurrencyId,
      );
    } else {
      monthlyData = calculateStackedHealthData(
        filteredDeals,
        orgForTarget,
        opportunityStages,
        amountMode,
        exchangeService,
        selectedCurrencyId,
      );
    }

    if (periodMode === "quarter") {
      return aggregateHealthDataByQuarter(monthlyData, orgForTarget);
    }
    return monthlyData;
  }, [
    filteredDeals,
    selectedOrg,
    orgStructure,
    opportunityStages,
    periodMode,
    amountMode,
    contractMap,
    receivablePlanMap,
    exchangeService,
    selectedCurrencyId,
  ]);

  // 点击柱子后过滤 deals（月或季度标签）
  const monthFilteredDeals = useMemo(() => {
    if (chartFilter?.type === "health" && chartFilter.month) {
      const clickedLabel = chartFilter.month;
      if (clickedLabel.startsWith("Q")) {
        const orgForQuarters =
          selectedOrg || (orgStructure.id ? orgStructure : null);
        return filterDealsByQuarter(
          filteredDeals,
          orgForQuarters,
          clickedLabel,
        );
      }
      return filterDealsByMonth(filteredDeals, clickedLabel);
    }
    return filteredDeals;
  }, [filteredDeals, chartFilter, selectedOrg, orgStructure]);

  // 销售漏斗数据
  // target conversion 来自选中的组织节点，未选中时使用根节点
  const selectedMonths = useMemo((): string[] | undefined => {
    if (!chartFilter?.month || chartFilter.type !== "health") return undefined;
    const clickedLabel = chartFilter.month;
    if (clickedLabel.startsWith("Q")) {
      const orgForQuarters = selectedOrg || (orgStructure.id ? orgStructure : null);
      return getMonthsForQuarter(orgForQuarters, clickedLabel);
    }
    return [clickedLabel];
  }, [chartFilter, selectedOrg, orgStructure]);

  const filteredFunnelData = useMemo(() => {
    const orgForConversion =
      selectedOrg || (orgStructure.id ? orgStructure : null);
    const dealsForAmount = (amountMode === "contractAmount" || amountMode === "receivableAmount")
      ? filteredDeals
      : monthFilteredDeals;
    return calculateFunnelData(
      monthFilteredDeals,
      opportunityStages,
      orgForConversion,
      leadCount,
      amountMode,
      contractMap,
      receivablePlanMap,
      selectedMonths,
      dealsForAmount,
      exchangeService,
      selectedCurrencyId,
    );
  }, [
    monthFilteredDeals,
    filteredDeals,
    opportunityStages,
    selectedOrg,
    orgStructure,
    leadCount,
    amountMode,
    contractMap,
    receivablePlanMap,
    selectedMonths,
    exchangeService,
    selectedCurrencyId,
  ]);

  // 商机停滞分析数据
  const filteredStagnationData = useMemo(() => {
    const dealsForAmount = (amountMode === "contractAmount" || amountMode === "receivableAmount")
      ? filteredDeals
      : monthFilteredDeals;
    return calculateStagnationData(
      monthFilteredDeals,
      opportunityStages,
      amountMode,
      contractMap,
      receivablePlanMap,
      selectedMonths,
      dealsForAmount,
      exchangeService,
      selectedCurrencyId,
    );
  }, [monthFilteredDeals, filteredDeals, opportunityStages, amountMode, contractMap, receivablePlanMap, selectedMonths, exchangeService, selectedCurrencyId]);
  const getStageName = (code?: string) => {
    if (!code) return "";
    return opportunityStages.find((s) => s.code === code)?.name ?? code;
  };

  // 构建每个图表的筛选条件标签
  const currentYear = String(new Date().getFullYear());

  const buildCommonTags = useCallback((): FilterTag[] => {
    const tags: FilterTag[] = [{ label: currentYear }];
    if (selectedOrg) {
      tags.push({
        label: getText(selectedOrg.name),
        onRemove: () => setSelectedOrg(null),
      });
    }
    if (selectedProducts.length > 0) {
      const names = selectedProducts
        .map((id) => {
          const pg = productGroups.find((p) => p.id === id);
          return pg ? pg.name : id;
        })
        .join(", ");
      tags.push({
        label: `${t("dashboard>filter>productLine")}: ${names}`,
        onRemove: () => setSelectedProducts([]),
      });
    }
    return tags;
  }, [selectedOrg, selectedProducts, productGroups, getText, t]);

  const healthFilterTags = useMemo((): FilterTag[] => {
    const tags = buildCommonTags();
    if (chartFilter?.type === "health" && chartFilter.month) {
      tags.push({
        label: chartFilter.month,
        onRemove: () => setChartFilter(null),
      });
    }
    return tags;
  }, [buildCommonTags, chartFilter]);

  const funnelFilterTags = useMemo((): FilterTag[] => {
    const tags = buildCommonTags();
    if (chartFilter?.type === "health" && chartFilter.month) {
      tags.push({
        label: chartFilter.month,
        onRemove: () => setChartFilter(null),
      });
    }
    if (chartFilter?.type === "funnel" && chartFilter.stage) {
      tags.push({
        label: `${t("dashboard>filter>stage")}: ${getStageName(chartFilter.stage)}`,
        onRemove: () => setChartFilter(null),
      });
    }
    return tags;
  }, [buildCommonTags, chartFilter, t, opportunityStages]);

  const stagnationFilterTags = useMemo((): FilterTag[] => {
    const tags = buildCommonTags();
    if (chartFilter?.type === "health" && chartFilter.month) {
      tags.push({
        label: chartFilter.month,
        onRemove: () => setChartFilter(null),
      });
    }
    if (chartFilter?.type === "stagnation") {
      if (chartFilter.stage) {
        tags.push({
          label: `${t("dashboard>filter>stage")}: ${getStageName(chartFilter.stage)}`,
          onRemove: () => {
            if (chartFilter.activityStatus) {
              setChartFilter({ ...chartFilter, stage: undefined });
            } else {
              setChartFilter(null);
            }
          },
        });
      }
      if (chartFilter.activityStatus) {
        tags.push({
          label: t(`dashboard>status>${chartFilter.activityStatus}`),
          onRemove: () => {
            if (chartFilter.stage) {
              setChartFilter({ ...chartFilter, activityStatus: undefined });
            } else {
              setChartFilter(null);
            }
          },
        });
      }
    }
    return tags;
  }, [buildCommonTags, chartFilter, t, opportunityStages]);

  const getFilterTitle = () => {
    if (!chartFilter) return "";
    switch (chartFilter.type) {
      case "health":
        return chartFilter.month
          ? t("dashboard>filter>healthMonth", { month: chartFilter.month })
          : t("dashboard>filter>healthDefault");
      case "funnel":
        return chartFilter.stage
          ? t("dashboard>filter>funnelStage", {
            stage: getStageName(chartFilter.stage),
          })
          : t("dashboard>filter>funnelDefault");
      case "stagnation": {
        if (!chartFilter.activityStatus)
          return t("dashboard>filter>stagnationDefault");
        const statusLabel = t(`dashboard>status>${chartFilter.activityStatus}`);
        if (chartFilter.stage) {
          return t("dashboard>filter>stagnationStageStatus", {
            stage: getStageName(chartFilter.stage),
            status: statusLabel,
          });
        }
        return t("dashboard>filter>stagnationStatus", { status: statusLabel });
      }
      default:
        return t("dashboard>filter>dealList");
    }
  };

  return (
    <div>
      <div className="container ">
        {/* 加载状态 */}
        {dealsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              {t("dashboard>status>loading")}
            </span>
          </div>
        )}

        {/* 错误状态 */}
        {dealsError && (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive mb-2">
              {t("dashboard>status>loadFailed")}
            </p>
            <p className="text-sm text-muted-foreground">
              {dealsError.message}
            </p>
          </div>
        )}

        {/* 无数据状态 */}
        {/* {!dealsLoading && !dealsError && deals.length === 0 && (
          <div className="glass-card p-6 text-center">
            <p className="text-muted-foreground">
              {t("dashboard>status>noData")}
            </p>
          </div>
        )} */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <OrgFilter
              selectedOrg={selectedOrg}
              onOrgChange={setSelectedOrg}
              orgStructure={orgStructure}
              loading={orgLoading}
            />
            <ProductTeamFilter
              selectedProducts={selectedProducts}
              onProductsChange={setSelectedProducts}
              productOptions={[
                { id: NO_PRODUCT_LINE_ID, name: t("dashboard>filter>noProductLine") },
                ...productGroups,
              ]}
            />
            <PeriodFilter
              value={periodMode}
              onChange={(mode) => {
                setPeriodMode(mode);
                setChartFilter(null);
              }}
            />
            <AmountModeFilter value={amountMode} onChange={setAmountMode} />
            <CurrencyFilter
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              options={currencies}
              loading={currenciesLoading}
            />
          </div>
          <CurrencyProvider currencyCode={selectedCurrency}>
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
                filterTags={healthFilterTags}
              />
              <FunnelChart
                data={filteredFunnelData}
                onStageClick={(stage) =>
                  setChartFilter({ type: "funnel", stage })
                }
                isActive={chartFilter?.type === "funnel"}
                activeFilter={chartFilter}
                filterTags={funnelFilterTags}
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
                    <div className="bot-dashboard-bg glass-card overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {getFilterTitle()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t("dashboard>filter>clickToSwitch")}
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

                      <DealsTable
                        filterContext={chartFilter}
                        deals={monthFilteredDeals}
                        stages={opportunityStages}
                      />
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
              filterTags={stagnationFilterTags}
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
                  <div className="bot-dashboard-bg glass-card overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {getFilterTitle()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("dashboard>filter>clickToSwitch")}
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
                    <DealsTable
                      filterContext={chartFilter}
                      deals={monthFilteredDeals}
                      stages={opportunityStages}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CurrencyProvider>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
