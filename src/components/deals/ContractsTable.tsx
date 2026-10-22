import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Contract, ReceivablePlan, OrgNode } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";
import type { ChartFilterContext } from "@/pages/Index";
import { formatAmountNumber, getCurrencySymbol } from "@/components/charts/utils/formatters";
import type { ExchangeRateService } from "@/services/exchangeRate";
import type {
  MonthlyRollingMap,
  RollingContractInfo,
} from "@/components/charts/CollectionHealthChart/useCollectionHealthData";
import type { HiddenSeries } from "@/components/charts/CollectionHealthChart";
import { getMonthsForQuarter } from "@/utils/orgFilter";
import {
  ChevronRight,
  ChevronDown,
  Check,
  Info,
} from "lucide-react";

type CollectionStatus = "completed" | "onTime" | "dueSoon" | "overdue";

const statusStyles: Record<CollectionStatus, string> = {
  completed: "bg-success/20 text-success border-success/30",
  onTime: "bg-primary/20 text-primary border-primary/30",
  dueSoon: "bg-warning/20 text-warning border-warning/30",
  overdue: "bg-danger/20 text-danger border-danger/30",
};

const MONTH_ABBR_TO_NUM: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

function getFilterMonthLabels(
  filterMonth?: string,
  selectedOrg?: OrgNode | null,
): string[] | undefined {
  if (!filterMonth) return undefined;
  return filterMonth.startsWith("Q")
    ? getMonthsForQuarter(selectedOrg || null, filterMonth)
    : [filterMonth];
}

/** 将显示标签（Aug/Q2）解析为当前财年滚动映射中的精确 YYYY-MM。 */
function getTargetYearMonths(
  filterMonths: string[] | undefined,
  rollingMap?: MonthlyRollingMap,
): Set<string> | undefined {
  if (!filterMonths || !rollingMap) return undefined;
  const monthNumbers = new Set(
    filterMonths.map((month) => MONTH_ABBR_TO_NUM[month]).filter(Boolean),
  );
  return new Set(
    Array.from(rollingMap.keys()).filter(
      (yearMonth) => monthNumbers.has(yearMonth.split("-")[1]),
    ),
  );
}

function getTargetRollingEntries(
  rollingMap: MonthlyRollingMap | undefined,
  targetYearMonths: Set<string> | undefined,
): RollingContractInfo[] {
  if (!rollingMap || !targetYearMonths) return [];
  return Array.from(targetYearMonths).flatMap(
    (yearMonth) => rollingMap.get(yearMonth) || [],
  );
}

interface ContractRowData {
  contract: Contract;
  plans: ReceivablePlan[];
  collectedAmount: number;
  pendingAmount: number;
  status: CollectionStatus;
  rollingSourceMonth?: string | null; // 滚动来源月份
}

/**
 * 从合同和应收计划数据中构建表格行数据
 */
export function buildContractRows(
  contractMap: ContractMap,
  receivablePlanMap: ReceivablePlanMap,
  filterMonth?: string,
  exchangeService?: ExchangeRateService | null,
  targetCurrencyCode?: string,
  allowedContractNumbers?: Set<string>,
  selectedOrg?: OrgNode | null,
  rollingMap?: MonthlyRollingMap,
  filterSegment?: "native" | "overdue" | "all",
  hiddenSeries?: HiddenSeries,
): ContractRowData[] {
  const rows: ContractRowData[] = [];

  const convert = (amount: number, fromCurrencyCode?: string): number => {
    if (!exchangeService || !targetCurrencyCode || !fromCurrencyCode) return amount;
    return exchangeService.convert(amount, fromCurrencyCode, targetCurrencyCode);
  };

  const filterMonths = getFilterMonthLabels(filterMonth, selectedOrg);
  const targetYearMonths = getTargetYearMonths(filterMonths, rollingMap);
  const targetRollingEntries = getTargetRollingEntries(
    rollingMap,
    targetYearMonths,
  );
  const useExactYearMonth = !!targetYearMonths?.size;

  contractMap.forEach((contracts, contractCode) => {
    // 如果指定了白名单，只处理匹配的合同
    if (allowedContractNumbers && !allowedContractNumbers.has(contractCode)) {
      return;
    }

    contracts.forEach((contract) => {
      const allPlans = receivablePlanMap.get(String(contract.id)) || [];

      // 精确年月筛选：图表仍显示 Aug/Q2，但使用 YYYY-MM 匹配计划、实际和滚动数据。
      let matchedPlans: ReceivablePlan[];
      if (filterMonths) {
        const rolledPlanIds = new Set(
          targetRollingEntries
            .filter(
              (entry) =>
                entry.contractId === contract.id &&
                entry.rollingSourceMonth !== null,
            )
            .map((entry) => entry.planId),
        );

        matchedPlans = allPlans.filter((plan) => {
          const plannedMatches = useExactYearMonth
            ? !!plan.plannedYearMonth && targetYearMonths!.has(plan.plannedYearMonth)
            : !!plan.plannedMonth && filterMonths.includes(plan.plannedMonth);
          const actualMatches = useExactYearMonth
            ? !!plan.actualYearMonth && targetYearMonths!.has(plan.actualYearMonth)
            : !!plan.actualMonth && filterMonths.includes(plan.actualMonth);
          return plannedMatches || actualMatches || rolledPlanIds.has(plan.id);
        });
      } else {
        matchedPlans = allPlans;
      }

      // 如果该合同在当前月份没有匹配的应收计划，跳过
      if (filterMonths && matchedPlans.length === 0) return;

      // 按 segment 筛选，仅使用当前点击的精确目标年月。
      if (filterSegment && filterSegment !== "all" && rollingMap && filterMonth) {
        const contractRollingInfos = targetRollingEntries.filter(
          (info) => info.contractId === contract.id,
        );

        if (filterSegment === "overdue") {
          // 仅展示滚动逾期合同
          const hasOverdueRolling = contractRollingInfos.some(
            (info) => info.isOverdue && info.rollingSourceMonth !== null,
          );
          if (!hasOverdueRolling) return;
        } else if (filterSegment === "native") {
          // 仅展示原生计划合同（非滚动）
          const isOnlyRolledIn = contractRollingInfos.length > 0 &&
            contractRollingInfos.every((info) => info.rollingSourceMonth !== null);
          if (isOnlyRolledIn) return;
        }
      }

      // 按 hiddenSeries 过滤：同样只判断当前目标年月。
      if (hiddenSeries && hiddenSeries.size > 0 && rollingMap) {
        const contractInfos = targetRollingEntries.filter(
          (info) => info.contractId === contract.id,
        );
        const hasNative = contractInfos.some((info) => info.rollingSourceMonth === null);
        const hasRolled = contractInfos.some((info) => info.rollingSourceMonth !== null);

        // 如果原生计划和逾期都被隐藏了，跳过该合同
        if (hiddenSeries.has("nativePlan") && hiddenSeries.has("rolledOverdue")) return;
        // 如果只隐藏了原生计划，且该合同只有原生计划（无滚动），跳过
        if (hiddenSeries.has("nativePlan") && !hiddenSeries.has("rolledOverdue") && hasNative && !hasRolled) return;
        // 如果只隐藏了逾期，且该合同只有滚动逾期（无原生计划），跳过
        if (hiddenSeries.has("rolledOverdue") && !hiddenSeries.has("nativePlan") && !hasNative && hasRolled) return;
      }

      // 合同级别的汇总数据（带汇率转换）
      let collectedAmount: number;
      let pendingAmount: number;

      if (filterMonths) {
        // 选中月份/季度时：已回款/待回款基于匹配的应收计划
        collectedAmount = matchedPlans.reduce(
          (sum, p) => sum + convert(p.actualAmount || 0, p.currencyCode),
          0,
        );
        const plannedTotal = matchedPlans.reduce(
          (sum, p) => sum + convert(p.plannedAmount || 0, p.currencyCode),
          0,
        );
        pendingAmount = Math.max(plannedTotal - collectedAmount, 0);
      } else {
        // 未选月份/季度时：已回款基于全部应收计划，待回款 = 合同总额 - 已回款
        collectedAmount = allPlans.reduce(
          (sum, p) => sum + convert(p.actualAmount || 0, p.currencyCode),
          0,
        );
        pendingAmount = Math.max(
          convert(contract.totalAmountWithTax, contract.currencyCode) - collectedAmount,
          0,
        );
      }

      // 判断回款状态（基于匹配的应收计划）
      const plansForStatus = filterMonths ? matchedPlans : allPlans;
      let status: CollectionStatus = "onTime";
      const plansWithAmount = plansForStatus.filter(
        (p) => (p.plannedAmount || 0) > 0,
      );
      const allCompleted =
        plansWithAmount.length > 0 &&
        plansWithAmount.every(
          (p) => (p.actualAmount || 0) >= (p.plannedAmount || 0),
        );

      if (allCompleted) {
        status = "completed";
      } else {
        const now = Date.now();
        const hasOverdue = plansForStatus.some((p) => {
          if (
            !p.plannedDate ||
            (p.actualAmount || 0) >= (p.plannedAmount || 0)
          ) {
            return false;
          }
          const planned = new Date(p.plannedDate).getTime();
          return now > planned;
        });
        const hasDueSoon = plansForStatus.some((p) => {
          if (!p.plannedDate || p.actualAmount > 0) return false;
          const planned = new Date(p.plannedDate).getTime();
          const daysUntilDue = (planned - now) / (1000 * 60 * 60 * 24);
          return daysUntilDue >= 0 && daysUntilDue <= 14;
        });
        if (hasOverdue) {
          status = "overdue";
        } else if (hasDueSoon) {
          status = "dueSoon";
        }
      }

      // 查找当前目标年月中的滚动来源信息。
      let rollingSourceMonth: string | null = null;
      if (rollingMap) {
        const contractEntry = targetRollingEntries.find(
          (info) => info.contractId === contract.id && info.rollingSourceMonth !== null,
        );
        if (contractEntry) {
          rollingSourceMonth = contractEntry.rollingSourceMonth;
        }
      }

      rows.push({
        contract,
        plans: matchedPlans,
        collectedAmount,
        pendingAmount,
        status,
        rollingSourceMonth,
      });
    });
  });

  return rows;
}

/**
 * 获取单条应收计划的回款状态
 */
function getPlanStatus(plan: ReceivablePlan): CollectionStatus {
  if (plan.actualAmount > 0 && plan.actualAmount >= plan.plannedAmount) {
    return "completed";
  }
  if (plan.plannedDate) {
    const now = Date.now();
    const planned = new Date(plan.plannedDate).getTime();
    if (now > planned && plan.actualAmount < plan.plannedAmount) {
      return "overdue";
    }
    const daysUntilDue = (planned - now) / (1000 * 60 * 60 * 24);
    if (daysUntilDue >= 0 && daysUntilDue <= 14 && plan.actualAmount <= 0) {
      return "dueSoon";
    }
  }
  return "onTime";
}

interface ContractsTableProps {
  contractMap: ContractMap;
  receivablePlanMap: ReceivablePlanMap;
  filterContext?: ChartFilterContext;
  exchangeService?: ExchangeRateService | null;
  targetCurrencyCode?: string;
  allowedContractNumbers?: Set<string>;
  selectedOrg?: OrgNode | null;
  rollingMap?: MonthlyRollingMap;
  hiddenSeries?: HiddenSeries;
}

export function ContractsTable({
  contractMap,
  receivablePlanMap,
  filterContext,
  exchangeService,
  targetCurrencyCode,
  allowedContractNumbers,
  selectedOrg,
  rollingMap,
  hiddenSeries,
}: ContractsTableProps) {
  const { t } = useLanguage();
  const { currencyCode } = useCurrency();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 汇率转换辅助
  const convertAmount = (amount: number, fromCurrencyCode?: string): number => {
    if (!exchangeService || !targetCurrencyCode || !fromCurrencyCode) return amount;
    return exchangeService.convert(amount, fromCurrencyCode, targetCurrencyCode);
  };

  const filterMonth =
    filterContext?.type === "collection" ? filterContext.month : undefined;
  const filterSegment =
    filterContext?.type === "collection" ? filterContext.segment : undefined;
  const targetRollingEntries = useMemo(() => {
    const filterMonths = getFilterMonthLabels(filterMonth, selectedOrg);
    const targetYearMonths = getTargetYearMonths(filterMonths, rollingMap);
    return getTargetRollingEntries(rollingMap, targetYearMonths);
  }, [filterMonth, selectedOrg, rollingMap]);

  const rows = useMemo(
    () => buildContractRows(contractMap, receivablePlanMap, filterMonth, exchangeService, targetCurrencyCode, allowedContractNumbers, selectedOrg, rollingMap, filterSegment, hiddenSeries),
    [contractMap, receivablePlanMap, filterMonth, exchangeService, targetCurrencyCode, allowedContractNumbers, selectedOrg, rollingMap, filterSegment, hiddenSeries],
  );

  const toggleRow = (contractId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) {
        next.delete(contractId);
      } else {
        next.add(contractId);
      }
      return next;
    });
  };

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        {t("dashboard>collection>empty")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>
              {t(
                "opportunity-management|>opportunity-management-form|>contract-number",
              )}
            </TableHead>
            <TableHead>
              {t("contract-management|>contract-management|>contract-name")}
            </TableHead>
            <TableHead>
              {t("contract-management|>contract-management-form|>customer")}
            </TableHead>
            <TableHead className="text-right">
              {t(
                "contract-management|>contract-management-form|>contract-amount-excluding-tax",
              )}({getCurrencySymbol(currencyCode)})
            </TableHead>
            <TableHead className="min-w-[180px]">
              {t("dashboard>collection>collected")}({getCurrencySymbol(currencyCode)})
            </TableHead>
            <TableHead className="text-right">
              {t("dashboard>collection>pendingAmount")}({getCurrencySymbol(currencyCode)})
            </TableHead>
            <TableHead>
              {t(
                "contract-management|>contract-management-form|>contract-manager",
              )}
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                {t("dashboard>collection>status")}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-muted transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 text-xs space-y-2">
                    <p className="font-medium text-sm">{t("dashboard>collection>statusLegendTitle")}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className={`${statusStyles.completed} shrink-0 text-[10px] px-1.5 py-0`}>
                          {t("dashboard>collection>status>completed")}
                        </Badge>
                        <span className="text-muted-foreground">{t("dashboard>collection>statusLegend>completed")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className={`${statusStyles.onTime} shrink-0 text-[10px] px-1.5 py-0`}>
                          {t("dashboard>collection>status>onTime")}
                        </Badge>
                        <span className="text-muted-foreground">{t("dashboard>collection>statusLegend>onTime")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className={`${statusStyles.dueSoon} shrink-0 text-[10px] px-1.5 py-0`}>
                          {t("dashboard>collection>status>dueSoon")}
                        </Badge>
                        <span className="text-muted-foreground">{t("dashboard>collection>statusLegend>dueSoon")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className={`${statusStyles.overdue} shrink-0 text-[10px] px-1.5 py-0`}>
                          {t("dashboard>collection>status>overdue")}
                        </Badge>
                        <span className="text-muted-foreground">{t("dashboard>collection>statusLegend>overdue")}</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </TableHead>
            <TableHead>{t("dashboard>collection>rollingSource")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isExpanded = expandedRows.has(row.contract.id);
            const pct =
              row.contract.totalAmountWithTax > 0
                ? Math.round(
                  (row.collectedAmount / row.contract.totalAmountWithTax) *
                  100,
                )
                : 0;

            return (
              <>
                {/* 合同行 */}
                <TableRow
                  key={row.contract.id}
                  className="hover:bg-secondary/40 cursor-pointer"
                  onClick={() => toggleRow(row.contract.id)}
                >
                  <TableCell className="px-2">
                    {row.plans.length > 0 &&
                      (isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      ))}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <a
                      href={`/ui/contract-management/form/contract-management-form/layout/edit/${row.contract.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.contract.contractCode}
                    </a>
                  </TableCell>
                  <TableCell className="font-medium">
                    <a
                      href={`/ui/contract-management/form/contract-management-form/layout/edit/${row.contract.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.contract.contractName}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.contract.customer}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatAmountNumber(convertAmount(row.contract.totalAmountWithTax, row.contract.currencyCode))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs whitespace-nowrap">
                        {formatAmountNumber(row.collectedAmount)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {formatAmountNumber(row.pendingAmount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.contract.ownerName || row.contract.owner}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[row.status]}
                    >
                      {t(`dashboard>collection>status>${row.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">—</span>
                  </TableCell>
                </TableRow>

                {/* 展开的应收计划明细行 */}
                {isExpanded &&
                  row.plans.map((plan) => {
                    const planPending = Math.max(plan.plannedAmount - plan.actualAmount, 0);
                    const planStatus = getPlanStatus(plan);

                    // 查找该计划在当前点击的精确 YYYY-MM 中的滚动来源。
                    const planRollingSource = targetRollingEntries.find(
                      (info) =>
                        info.planId === plan.id &&
                        info.rollingSourceMonth !== null,
                    )?.rollingSourceMonth || null;

                    // 按 hiddenSeries 过滤应收计划行
                    if (hiddenSeries && hiddenSeries.size > 0) {
                      if (hiddenSeries.has("rolledOverdue") && planRollingSource) return null;
                      if (hiddenSeries.has("nativePlan") && !planRollingSource) return null;
                    }

                    return (
                      <TableRow
                        key={`plan-${plan.id}`}
                        className={`hover:bg-muted/50 ${planRollingSource ? "bg-warning/5" : "bg-muted/30"}`}
                      >
                        <TableCell />
                        {/* 款项阶段 */}
                        <TableCell className="pl-8 text-xs text-muted-foreground">
                          {plan.paymentStage || "—"}
                        </TableCell>
                        {/* 合同名称 - 空 */}
                        <TableCell />
                        {/* 客户 - 空 */}
                        <TableCell />
                        {/* 合同金额 - 空 */}
                        <TableCell />
                        {/* 已回款 */}
                        <TableCell>
                          {plan.actualDate && plan.actualAmount > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                              <span className="font-mono text-xs">{plan.actualDate}</span>
                              <span className="font-mono text-xs text-success">
                                {formatAmountNumber(convertAmount(plan.actualAmount, plan.currencyCode))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              {t("dashboard>collection>notCollected")}
                            </span>
                          )}
                        </TableCell>
                        {/* 待回款 */}
                        <TableCell className="text-right">
                          {planPending > 0 ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="font-mono text-xs">{plan.plannedDate}</span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {formatAmountNumber(convertAmount(planPending, plan.currencyCode))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        {/* 负责人 */}
                        <TableCell className="text-xs">
                          {plan.paymentOwnerName || plan.paymentOwner || "—"}
                        </TableCell>
                        {/* 状态 */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusStyles[planStatus]}
                          >
                            {t(`dashboard>collection>status>${planStatus}`)}
                          </Badge>
                        </TableCell>
                        {/* 滚动来源 */}
                        <TableCell>
                          {planRollingSource ? (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                              ← {planRollingSource}
                            </Badge>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}


