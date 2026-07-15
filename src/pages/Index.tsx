import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HealthChart } from "@/components/charts/HealthChart";
import { StagnationChart } from "@/components/charts/StagnationChart";
import { OrgFilter } from "@/components/filters/OrgFilter";
import { ProductTeamFilter } from "@/components/filters/ProductTeamFilter";
import { YearFilter } from "@/components/filters/YearFilter";
import { X, Loader2, Info } from "lucide-react";
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
  getFiscalMonths,
  getFiscalYearMonths,
  getOwnersInOrg,
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
  useContractsByFiscalYear,
  useCompanyDefaultCurrency,
} from "@/hooks/useApiData";
import { DealsTable } from "@/components/deals/DealsTable";
import { ContractsTable } from "@/components/deals/ContractsTable";
import { CollectionHealthChart, type HiddenSeries } from "@/components/charts/CollectionHealthChart";
import { calculateCollectionHealthFromApi, aggregateCollectionHealthByQuarter } from "@/components/charts/CollectionHealthChart/useCollectionHealthData";
import type { MonthlyRollingMap } from "@/components/charts/CollectionHealthChart/useCollectionHealthData";
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
  type: "health" | "funnel" | "stagnation" | "collection";
  stage?: string;
  activityStatus?: string;
  month?: string;
  segment?: "native" | "overdue" | "all"; // 回款图表分段筛选
} | null;

const Index = () => {
  const { t, getText } = useLanguage();
  const [chartFilter, setChartFilter] = useState<ChartFilterContext>(null);
  const [hiddenSeries, setHiddenSeries] = useState<HiddenSeries>(new Set());
  const [selectedOrg, setSelectedOrg] = useState<OrgNode | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [amountMode, setAmountMode] = useState<AmountMode>("expectedAmount");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // 从 API 获取数据（不使用 fallback）
  const { data: orgStructure, loading: orgLoading } = useOrgStructure();
  // 商机数据依赖组织树（需要财年范围）+ 用户选中的年份
  const { data: deals, loading: dealsLoading, error: dealsError } = useDeals(orgStructure, selectedYear);
  const { data: productGroups, loading: productsLoading } = useProductGroups();
  const { data: opportunityStages, loading: stagesLoading } =
    useOpportunityStages();
  const { data: leadCount } = useLeadCount(orgStructure, selectedYear);
  const { data: currencies, loading: currenciesLoading } = useCurrencies();
  const { data: companyDefaultCurrency, loading: companyDefaultCurrencyLoading } = useCompanyDefaultCurrency();

  // 获取汇率表
  const { data: exchangeRates } = useExchangeRates();
  const exchangeService = useExchangeRateService(exchangeRates);

  // 根据选中的币种 code 找到对应的 id（用于汇率匹配）
  const selectedCurrencyId = useMemo(() => {
    if (!selectedCurrency || currencies.length === 0) return undefined;
    const found = currencies.find((c) => c.code === selectedCurrency);
    return found?.id;
  }, [selectedCurrency, currencies]);

  // 币种加载完成后，设置默认值：优先使用公司配置的结算币种，否则用列表第一项
  useEffect(() => {
    if (currencies.length > 0 && !companyDefaultCurrencyLoading && !selectedCurrency) {
      if (companyDefaultCurrency && currencies.some((c) => c.code === companyDefaultCurrency)) {
        setSelectedCurrency(companyDefaultCurrency);
      } else {
        setSelectedCurrency(currencies[0].code);
      }
    }
  }, [currencies, selectedCurrency, companyDefaultCurrency, companyDefaultCurrencyLoading]);

  // 获取合同数据（依赖 deals 加载完成）
  const { contracts: contractMap, loading: contractsLoading } = useContracts(deals);

  // 获取应收计划数据（依赖合同数据加载完成）
  const { receivablePlans: receivablePlanMap, loading: receivablesLoading } = useReceivablePlans(contractMap);

  // 回款健康度独立数据源：按财年 signingDate 范围获取合同（不依赖商机）
  const { contracts: collectionContractMap, loading: collectionContractsLoading } = useContractsByFiscalYear(orgStructure, selectedYear);
  const { receivablePlans: collectionReceivablePlanMap, loading: collectionReceivablesLoading } = useReceivablePlans(collectionContractMap);

  // 按组织过滤回款合同
  const filteredCollectionContractMap = useMemo(() => {
    if (!selectedOrg) return collectionContractMap;
    const owners = getOwnersInOrg(selectedOrg);
    const filtered = new Map() as typeof collectionContractMap;
    collectionContractMap.forEach((contracts, code) => {
      const matched = contracts.filter((c) => owners.includes(c.owner));
      if (matched.length > 0) {
        filtered.set(code, matched);
      }
    });
    return filtered;
  }, [collectionContractMap, selectedOrg]);

  // Calculate filtered data based on selected organization and products
  const filteredDeals = useMemo(() => {
    let result = filterDealsByOrg(deals, selectedOrg);
    result = filterDealsByProduct(result, selectedProducts);
    return result;
  }, [selectedOrg, selectedProducts, deals]);

  // 财年月份列表（供图表截止计算使用）
  const fiscalMonths = useMemo(() => {
    const orgForFiscal = selectedOrg || (orgStructure.id ? orgStructure : null);
    return getFiscalMonths(orgForFiscal);
  }, [selectedOrg, orgStructure]);

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
        selectedYear,
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
        selectedYear,
      );
    } else {
      monthlyData = calculateStackedHealthData(
        filteredDeals,
        orgForTarget,
        opportunityStages,
        amountMode,
        exchangeService,
        selectedCurrencyId,
        selectedYear,
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
    selectedYear,
  ]);

  // 点击柱子后过滤 deals（月或季度标签）
  const monthFilteredDeals = useMemo(() => {
    if (chartFilter?.type === "health" && chartFilter.month) {
      const clickedLabel = chartFilter.month;
      const orgForFiscal = selectedOrg || (orgStructure.id ? orgStructure : null);
      const fiscalYearMonths = getFiscalYearMonths(orgForFiscal, selectedYear);

      if (clickedLabel.startsWith("Q")) {
        // 季度模式：找到该季度对应的 yearMonth 列表，按 yearMonth 过滤
        const quarterIdx = parseInt(clickedLabel.replace("Q", ""), 10) - 1;
        const startIdx = quarterIdx * 3;
        const yearMonths = fiscalYearMonths.slice(startIdx, startIdx + 3).map((m) => m.yearMonth);
        return filteredDeals.filter((deal) => deal.createdYearMonth && yearMonths.includes(deal.createdYearMonth));
      }
      // 月模式：根据标签找到 yearMonth
      const found = fiscalYearMonths.find((m) => m.label === clickedLabel);
      if (found) {
        return filterDealsByMonth(filteredDeals, found.yearMonth);
      }
      return filterDealsByMonth(filteredDeals, clickedLabel);
    }
    return filteredDeals;
  }, [filteredDeals, chartFilter, selectedOrg, orgStructure, selectedYear]);

  // 销售漏斗数据
  // target conversion 来自选中的组织节点，未选中时使用根节点
  const selectedMonths = useMemo((): string[] | undefined => {
    if (!chartFilter?.month || chartFilter.type !== "health") return undefined;
    const clickedLabel = chartFilter.month;
    const orgForFiscal = selectedOrg || (orgStructure.id ? orgStructure : null);
    const fiscalYearMonths = getFiscalYearMonths(orgForFiscal, selectedYear);

    if (clickedLabel.startsWith("Q")) {
      // 季度模式：找到该季度对应的所有 yearMonth
      const quarterIdx = parseInt(clickedLabel.replace("Q", ""), 10) - 1;
      const startIdx = quarterIdx * 3;
      return fiscalYearMonths.slice(startIdx, startIdx + 3).map((m) => m.yearMonth);
    }
    // 月模式：根据点击的月份标签找到对应的 yearMonth
    const found = fiscalYearMonths.find((m) => m.label === clickedLabel);
    return found ? [found.yearMonth] : [clickedLabel];
  }, [chartFilter, selectedOrg, orgStructure, selectedYear]);

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

  // 回款健康度图表数据（独立于商机，直接使用按财年 signingDate 过滤的合同）
  const { chartData: collectionHealthData, rollingMap } = useMemo(() => {
    const orgForFiscal = selectedOrg || (orgStructure.id ? orgStructure : null);
    const result = calculateCollectionHealthFromApi(
      filteredCollectionContractMap,
      collectionReceivablePlanMap,
      orgForFiscal,
      exchangeService,
      selectedCurrencyId,
      undefined, // 不再需要 allowedContractNumbers
      selectedYear,
    );

    let chartData = result.chartData;
    if (periodMode === "quarter") {
      chartData = aggregateCollectionHealthByQuarter(chartData, orgForFiscal);
    }
    return { chartData, rollingMap: result.rollingMap };
  }, [filteredCollectionContractMap, collectionReceivablePlanMap, selectedOrg, orgStructure, exchangeService, selectedCurrencyId, periodMode, selectedYear]);

  // 从 filteredDeals 提取关联的 contractNumber 白名单（供其他图表使用）
  const allowedContractNumbers = useMemo(() => {
    return new Set(
      filteredDeals
        .map((d) => d.contractNumber)
        .filter((cn): cn is string => !!cn && cn.trim() !== ""),
    );
  }, [filteredDeals]);
  const getStageName = (code?: string) => {
    if (!code) return "";
    return opportunityStages.find((s) => s.code === code)?.name ?? code;
  };

  // 构建每个图表的筛选条件标签
  const currentYear = String(selectedYear);

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
  }, [selectedOrg, selectedProducts, productGroups, getText, t, currentYear]);

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
      case "collection":
        return chartFilter.month
          ? t("dashboard>filter>collectionMonth", { month: chartFilter.month })
          : t("dashboard>filter>collectionDefault");
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
            <YearFilter
              value={selectedYear}
              onChange={(year) => {
                setSelectedYear(year);
                setChartFilter(null);
              }}
            />
            <OrgFilter
              selectedOrg={selectedOrg}
              onOrgChange={setSelectedOrg}
              orgStructure={orgStructure}
              loading={orgLoading}
            />
            <PeriodFilter
              value={periodMode}
              onChange={(mode) => {
                setPeriodMode(mode);
                setChartFilter(null);
              }}
            />
            <CurrencyFilter
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              options={currencies}
              loading={currenciesLoading}
            />
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <ProductTeamFilter
                selectedProducts={selectedProducts}
                onProductsChange={setSelectedProducts}
                productOptions={[
                  { id: NO_PRODUCT_LINE_ID, name: t("dashboard>filter>noProductLine") },
                  ...productGroups,
                ]}
              />
              <AmountModeFilter value={amountMode} onChange={setAmountMode} />
              <div
                className="relative inline-flex"
                onMouseEnter={(e) => {
                  const target = e.currentTarget.querySelector("[data-tooltip]");
                  if (target) (target as HTMLElement).style.display = "block";
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget.querySelector("[data-tooltip]");
                  if (target) (target as HTMLElement).style.display = "none";
                }}
              >
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                <div
                  data-tooltip=""
                  className="absolute left-0 top-full mt-2 z-50 w-56 p-2.5 rounded-lg bg-popover border border-border shadow-lg text-xs text-popover-foreground whitespace-pre-line"
                  style={{ display: "none" }}
                >
                  {t("dashboard>filter>amountCurrencyInfo")}
                </div>
              </div>
            </div>
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
                fiscalMonths={fiscalMonths}
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
                        exchangeService={exchangeService}
                        targetCurrencyId={selectedCurrencyId}
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
                      exchangeService={exchangeService}
                      targetCurrencyId={selectedCurrencyId}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collection Health Chart - Full Width */}
            <CollectionHealthChart
              data={collectionHealthData}
              onMonthClick={(month, segment) =>
                setChartFilter({ type: "collection", month, segment: segment || "all" })
              }
              onHiddenSeriesChange={setHiddenSeries}
              isActive={chartFilter?.type === "collection"}
              activeFilter={chartFilter}
              filterTags={buildCommonTags()}
              fiscalMonths={fiscalMonths}
            />

            {/* Contracts Table for Collection - Full Width */}
            <AnimatePresence>
              {chartFilter?.type === "collection" && (
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
                    <ContractsTable
                      contractMap={filteredCollectionContractMap}
                      receivablePlanMap={collectionReceivablePlanMap}
                      filterContext={chartFilter}
                      exchangeService={exchangeService}
                      targetCurrencyId={selectedCurrencyId}
                      selectedOrg={selectedOrg}
                      rollingMap={rollingMap}
                      hiddenSeries={hiddenSeries}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 底部间距 */}
            <div className="h-6" />
          </CurrencyProvider>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
