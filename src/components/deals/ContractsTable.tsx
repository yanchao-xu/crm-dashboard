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
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Contract, ReceivablePlan, OrgNode } from "@/types";
import type { ContractMap, ReceivablePlanMap } from "@/hooks/useApiData";
import type { ChartFilterContext } from "@/pages/Index";
import { formatAmountNumber, getCurrencySymbol } from "@/components/charts/utils/formatters";
import type { ExchangeRateService } from "@/services/exchangeRate";
import { getMonthsForQuarter } from "@/utils/orgFilter";
import {
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";

type CollectionStatus = "completed" | "onTime" | "dueSoon" | "overdue";

const statusStyles: Record<CollectionStatus, string> = {
  completed: "bg-success/20 text-success border-success/30",
  onTime: "bg-primary/20 text-primary border-primary/30",
  dueSoon: "bg-warning/20 text-warning border-warning/30",
  overdue: "bg-danger/20 text-danger border-danger/30",
};

interface ContractRowData {
  contract: Contract;
  plans: ReceivablePlan[];
  collectedAmount: number;
  pendingAmount: number;
  status: CollectionStatus;
}

/**
 * 从合同和应收计划数据中构建表格行数据
 */
function buildContractRows(
  contractMap: ContractMap,
  receivablePlanMap: ReceivablePlanMap,
  filterMonth?: string,
  exchangeService?: ExchangeRateService | null,
  targetCurrencyId?: string,
  allowedContractNumbers?: Set<string>,
  selectedOrg?: OrgNode | null,
): ContractRowData[] {
  const rows: ContractRowData[] = [];

  const convert = (amount: number, fromCurrencyId?: string): number => {
    if (!exchangeService || !targetCurrencyId || !fromCurrencyId) return amount;
    return exchangeService.convert(amount, fromCurrencyId, targetCurrencyId);
  };

  // 如果 filterMonth 是季度标签（Q1~Q4），展开为对应的月份列表
  let filterMonths: string[] | undefined;
  if (filterMonth) {
    if (filterMonth.startsWith("Q")) {
      filterMonths = getMonthsForQuarter(selectedOrg || null, filterMonth);
    } else {
      filterMonths = [filterMonth];
    }
  }

  contractMap.forEach((contracts, contractCode) => {
    // 如果指定了白名单，只处理匹配的合同
    if (allowedContractNumbers && !allowedContractNumbers.has(contractCode)) {
      return;
    }

    contracts.forEach((contract) => {
      const allPlans = receivablePlanMap.get(String(contract.id)) || [];

      // 筛选：只保留 plannedMonth 或 actualMonth 与点击月份匹配的应收计划
      let matchedPlans: ReceivablePlan[];
      if (filterMonths) {
        matchedPlans = allPlans.filter(
          (p) =>
            (p.plannedMonth && filterMonths!.includes(p.plannedMonth)) ||
            (p.actualMonth && filterMonths!.includes(p.actualMonth)),
        );
      } else {
        matchedPlans = allPlans;
      }

      // 如果该合同在当前月份没有匹配的应收计划，跳过
      if (filterMonths && matchedPlans.length === 0) return;

      // 合同级别的汇总数据（带汇率转换）
      let collectedAmount: number;
      let pendingAmount: number;

      if (filterMonths) {
        // 选中月份/季度时：已回款/待回款基于匹配的应收计划
        collectedAmount = matchedPlans.reduce(
          (sum, p) => sum + convert(p.actualAmount || 0, p.currencyId),
          0,
        );
        const plannedTotal = matchedPlans.reduce(
          (sum, p) => sum + convert(p.plannedAmount || 0, p.currencyId),
          0,
        );
        pendingAmount = Math.max(plannedTotal - collectedAmount, 0);
      } else {
        // 未选月份/季度时：已回款基于全部应收计划，待回款 = 合同总额 - 已回款
        collectedAmount = allPlans.reduce(
          (sum, p) => sum + convert(p.actualAmount || 0, p.currencyId),
          0,
        );
        pendingAmount = Math.max(
          convert(contract.totalAmountWithTax, contract.currencyId) - collectedAmount,
          0,
        );
      }

      // 判断回款状态（基于匹配的应收计划）
      const plansForStatus = filterMonths ? matchedPlans : allPlans;
      let status: CollectionStatus = "onTime";

      const planPlannedTotal = plansForStatus.reduce(
        (sum, p) => sum + (p.plannedAmount || 0),
        0,
      );
      const planActualTotal = plansForStatus.reduce(
        (sum, p) => sum + (p.actualAmount || 0),
        0,
      );

      if (planPlannedTotal > 0 && planActualTotal >= planPlannedTotal) {
        status = "completed";
      } else {
        const now = Date.now();
        const hasOverdue = plansForStatus.some((p) => {
          if (!p.plannedDate || p.actualAmount > 0) return false;
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

      rows.push({
        contract,
        plans: matchedPlans,
        collectedAmount,
        pendingAmount,
        status,
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
    if (now > planned && plan.actualAmount <= 0) {
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
  targetCurrencyId?: string;
  allowedContractNumbers?: Set<string>;
  selectedOrg?: OrgNode | null;
}

export function ContractsTable({
  contractMap,
  receivablePlanMap,
  filterContext,
  exchangeService,
  targetCurrencyId,
  allowedContractNumbers,
  selectedOrg,
}: ContractsTableProps) {
  const { t } = useLanguage();
  const { currencyCode } = useCurrency();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 汇率转换辅助
  const convertAmount = (amount: number, fromCurrencyId?: string): number => {
    if (!exchangeService || !targetCurrencyId || !fromCurrencyId) return amount;
    return exchangeService.convert(amount, fromCurrencyId, targetCurrencyId);
  };

  const filterMonth =
    filterContext?.type === "collection" ? filterContext.month : undefined;

  const rows = useMemo(
    () => buildContractRows(contractMap, receivablePlanMap, filterMonth, exchangeService, targetCurrencyId, allowedContractNumbers, selectedOrg),
    [contractMap, receivablePlanMap, filterMonth, exchangeService, targetCurrencyId, allowedContractNumbers, selectedOrg],
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
              {t("contract-management|>contract-management|>expiration-date")}
            </TableHead>
            <TableHead>
              {t(
                "contract-management|>contract-management-form|>contract-manager",
              )}
            </TableHead>
            <TableHead>{t("dashboard>collection>status")}</TableHead>
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
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.contract.contractCode}
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.contract.contractName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.contract.customer}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatAmountNumber(convertAmount(row.contract.totalAmountWithTax, row.contract.currencyId))}
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
                  <TableCell className="font-mono text-xs">
                    {row.contract.expiryDate}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.contract.owner}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[row.status]}
                    >
                      {t(`dashboard>collection>status>${row.status}`)}
                    </Badge>
                  </TableCell>
                </TableRow>

                {/* 展开的应收计划明细行 */}
                {isExpanded &&
                  row.plans.map((plan) => {
                    const planPending = Math.max(plan.plannedAmount - plan.actualAmount, 0);
                    const planStatus = getPlanStatus(plan);
                    return (
                      <TableRow
                        key={`plan-${plan.id}`}
                        className="bg-muted/30 hover:bg-muted/50"
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
                                {formatAmountNumber(convertAmount(plan.actualAmount, plan.currencyId))}
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
                                {formatAmountNumber(convertAmount(planPending, plan.currencyId))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        {/* 到期日期 - 空 */}
                        <TableCell />
                        {/* 负责人 */}
                        <TableCell className="text-xs">
                          {plan.paymentOwner || "—"}
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


