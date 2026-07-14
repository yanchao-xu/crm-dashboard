import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { BilingualText } from "@/types";
import { toLanguage } from "@/lib/language";
import type { Language } from "@/lib/language";

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

export const translations: Translations = {
  // Charts
  "dashboard>chart>health": { zh: "商机健康度", en: "Pipeline Health" },
  "dashboard>chart>healthDesc": {
    zh: "实际 vs 目标业绩",
    en: "Actual vs Target Performance",
  },
  "dashboard>chart>funnel": { zh: "销售漏斗", en: "Sales Funnel" },
  "dashboard>chart>funnelDesc": {
    zh: "阶段转化 vs 目标",
    en: "Stage Conversion vs Target",
  },
  "dashboard>chart>funnelTooltip": {
    zh: "计算逻辑：\n1. 每个阶段显示当前商机数量和金额\n2. 实际转化率计算：\n   · 第一个阶段：该阶段商机数 ÷ 线索总数\n   · 中间阶段：该阶段商机数 ÷ 从第一个到当前阶段（含）的商机数之和\n   · 最后两个阶段：该阶段商机数 ÷ 全部阶段商机数之和\n3. 目标转化率来自组织节点配置（未配置则为0%）\n4. 绿色+上升箭头：实际转化率 ≥ 目标\n   红色+下降箭头：实际转化率 < 目标",
    en: "Calculation logic:\n1. Each stage shows deal count and value\n2. Actual conversion rate:\n   · First stage: stage count ÷ total leads\n   · Middle stages: stage count ÷ sum of counts from first to current stage (inclusive)\n   · Last 2 stages: stage count ÷ sum of all stage counts\n3. Target conversion from org node config (0% if not set)\n4. Green + up arrow: actual ≥ target\n   Red + down arrow: actual < target",
  },
  "dashboard>chart>stagnation": { zh: "商机停滞分析", en: "Deal Stagnation" },
  "dashboard>chart>stagnationDesc": {
    zh: "按最近活动时间分析",
    en: "Deals by Last Activity Age",
  },
  // "dashboard>chart>clickToView": {
  //   zh: "点击图表查看商机",
  //   en: "Click chart to view deals",
  // },
  // "dashboard>chart>clickStageToView": {
  //   zh: "点击阶段查看商机",
  //   en: "Click stage to view deals",
  // },
  // "dashboard>chart>clickOrCardToView": {
  //   zh: "点击图表或状态卡片查看商机",
  //   en: "Click chart or status cards to view deals",
  // },
  "dashboard>chart>healthy": { zh: "健康", en: "HEALTHY" },
  "dashboard>chart>belowTarget": { zh: "低于目标", en: "BELOW TARGET" },
  "dashboard>chart>onTrack": { zh: "正常", en: "ON TRACK" },
  "dashboard>chart>needsAttention": { zh: "需关注", en: "NEEDS ATTENTION" },
  "dashboard>chart>current": { zh: "当前", en: "Current" },
  "dashboard>chart>currentInfo": {
    zh: "从财年起始月到当前月（含），各月所有阶段商机金额的累加汇总。财年起始月由组织设置决定，未配置则为1月。\n· 预期金额模式：按商机创建月归类\n· 商业金额模式：按商机创建月归类\n· 合同金额模式：按合同签约日期(signingDate)归类\n· 实际回款模式：按应收计划实际回款日期(actualDate)归类",
    en: "Sum of deal amounts across all stages from fiscal year start to current month (inclusive). Fiscal start is set by org config, defaults to Jan.\n· Expected/Business: by deal created month\n· Contract: by contract signing date\n· Receivable: by actual payment date",
  },
  "dashboard>chart>target": { zh: "目标", en: "Target" },
  "dashboard>chart>targetInfo": {
    zh: "从财年起始月到当前月（含），各月目标业绩的累加汇总。目标值来自组织节点的月度配额设置，财年起始月由组织设置决定",
    en: "Sum of monthly target values from fiscal year start to current month (inclusive). Targets from org monthly quotas, fiscal start set by org config",
  },
  "dashboard>chart>attainment": { zh: "达成率", en: "Attainment" },
  "dashboard>chart>attainmentInfo": {
    zh: "达成率 = 当前值 ÷ 目标值 × 100%。≥90% 显示绿色（健康），<90% 显示红色（低于目标）",
    en: "Attainment = Current ÷ Target × 100%. ≥90% shown green (healthy), <90% shown red (below target)",
  },
  "dashboard>chart>theoreticalTarget": {
    zh: "理论目标",
    en: "Theoretical Target",
  },
  "dashboard>chart>actualPerformance": {
    zh: "实际业绩",
    en: "Actual Performance",
  },
  "dashboard>chart>totalPipeline": { zh: "总商机金额", en: "Total Pipeline" },
  "dashboard>chart>activeDeals": { zh: "活跃商机", en: "Active Deals" },
  "dashboard>chart>avgConversion": { zh: "平均转化", en: "Avg Conversion" },
  "dashboard>chart>avgConversionInfo": {
    zh: "所有阶段实际转化率的平均值。与目标差值 ≥ -5% 为正常（绿色），否则需关注（黄色）",
    en: "Average of actual conversion rates across all stages. Gap ≥ -5% is on track (green), otherwise needs attention (yellow)",
  },
  "dashboard>chart>aboveTarget": { zh: "高于目标", en: "Above Target" },
  "dashboard>chart>belowTargetLegend": { zh: "低于目标", en: "Below Target" },
  "dashboard>chart>zombieDeals": { zh: "僵尸商机", en: "ZOMBIE DEALS" },
  "dashboard>chart>lessThan30": {
    zh: "<30 天 (活跃)",
    en: "<30 days (Active)",
  },
  "dashboard>chart>stagnationInfo": {
    zh: "按最近活动时间分类：活跃 <30天 | >30天 30~59天 | >60天 60~89天 | 僵尸 ≥90天",
    en: "By last activity: Active <30d | >30d 30-59d | >60d 60-89d | Zombie ≥90d",
  },
  "dashboard>chart>moreThan30": { zh: ">30 天", en: ">30 days" },
  "dashboard>chart>moreThan60": { zh: ">60 天", en: ">60 days" },
  "dashboard>chart>moreThan90": {
    zh: ">90 天 (僵尸)",
    en: ">90 days (Zombie)",
  },
  "dashboard>chart>gap": { zh: "差额", en: "Gap" },
  // "dashboard>chart>clickForDetails": {
  //   zh: "点击查看详情",
  //   en: "Click for details",
  // },
  "dashboard>chart>deals": { zh: "个商机", en: "deals" },
  "dashboard>chart>total": { zh: "总计", en: "Total" },
  "dashboard>chart>amount": { zh: "金额", en: "Amount" },
  "dashboard>chart>count": { zh: "数量", en: "Count" },

  // Collection Health (回款健康度)
  "dashboard>collection>title": { zh: "回款健康度", en: "Collection Health" },
  "dashboard>collection>desc": {
    zh: "应收 vs 实际回款",
    en: "Target vs Actual Collection",
  },
  "dashboard>collection>target": { zh: "应收金额", en: "Target Collection" },
  "dashboard>collection>targetInfo": {
    zh: "从财年起始月到当前月（含），各月应收计划中 plannedAmount（计划回款金额）的累加汇总。财年起始月由组织设置决定",
    en: "Sum of plannedAmount from receivable plans, from fiscal year start to current month (inclusive). Fiscal start set by org config",
  },
  "dashboard>collection>actual": { zh: "实际回款", en: "Actual Collection" },
  "dashboard>collection>actualInfo": {
    zh: "从财年起始月到当前月（含），各月应收计划中 actualAmount（实际回款金额）的累加汇总。财年起始月由组织设置决定",
    en: "Sum of actualAmount from receivable plans, from fiscal year start to current month (inclusive). Fiscal start set by org config",
  },
  "dashboard>collection>rate": { zh: "回款率", en: "Collection Rate" },
  "dashboard>collection>pending": { zh: "待收金额", en: "Pending Collection" },
  "dashboard>collection>empty": {
    zh: "没有符合条件的回款合同",
    en: "No contracts match the filter criteria",
  },
  "opportunity-management|>opportunity-management-form|>contract-number": {
    zh: "合同编号",
    en: "Contract Code",
  },
  "contract-management|>contract-management|>contract-name": {
    zh: "合同名称",
    en: "Contract Name",
  },
  "contract-management|>contract-management-form|>customer": {
    zh: "客户",
    en: "Customer",
  },
  "contract-management|>contract-management-form|>contract-amount-excluding-tax":
  {
    zh: "合同金额",
    en: "Contract Value",
  },
  "dashboard>collection>collected": { zh: "已回款", en: "Collected" },
  "dashboard>collection>pendingAmount": { zh: "待回款", en: "Pending" },
  "contract-management|>contract-management|>expiration-date": {
    zh: "到期日期",
    en: "Expiry Date",
  },
  "contract-management|>contract-management-form|>contract-manager": {
    zh: "合同负责人",
    en: "Owner",
  },
  "dashboard>collection>signingDate": { zh: "签约日期", en: "Signing Date" },
  "dashboard>collection>status": { zh: "状态", en: "Status" },
  "dashboard>collection>status>completed": { zh: "已完成", en: "Completed" },
  "dashboard>collection>status>onTime": { zh: "正常", en: "On Time" },
  "dashboard>collection>status>dueSoon": { zh: "即将到期", en: "Due Soon" },
  "dashboard>collection>status>overdue": { zh: "逾期", en: "Overdue" },
  "dashboard>collection>statusLegendTitle": {
    zh: "状态判断规则",
    en: "Status Rules",
  },
  "dashboard>collection>statusLegend>completed": {
    zh: "实际回款 ≥ 计划回款",
    en: "Actual collection ≥ planned amount",
  },
  "dashboard>collection>statusLegend>onTime": {
    zh: "未到期且距到期日 >14 天",
    en: "Not due and >14 days until due date",
  },
  "dashboard>collection>statusLegend>dueSoon": {
    zh: "距到期日 ≤14 天，尚未回款",
    en: "≤14 days until due, not yet collected",
  },
  "dashboard>collection>statusLegend>overdue": {
    zh: "已过到期日，尚未回款",
    en: "Past due date, not yet collected",
  },
  "dashboard>collection>plan": { zh: "计划", en: "Plan" },
  "dashboard>collection>actualLabel": { zh: "实际", en: "Actual" },
  "dashboard>collection>notCollected": { zh: "未回款", en: "Not collected" },
  "dashboard>collection>onTimeLabel": { zh: "准时", en: "On time" },
  "dashboard>collection>delayed": { zh: "延迟{days}天", en: "Delayed {days}d" },
  "dashboard>collection>nativePlan": { zh: "当月原生计划", en: "Native Plan" },
  "dashboard>collection>rolledOverdue": { zh: "滚动逾期", en: "Rolled Overdue" },
  "dashboard>collection>totalReceivable": { zh: "应收总额", en: "Total Receivable" },
  "dashboard>collection>rollingSource": { zh: "滚动来源", en: "Rolling Source" },
  "dashboard>collection>rollingFrom": { zh: "来自 {month}", en: "From {month}" },
  "dashboard>collection>chartTooltip": {
    zh: "计算逻辑：\n蓝色柱（当月原生计划）：该月 plannedDate 对应的应收计划 plannedAmount 之和\n橙色柱（滚动逾期）：前期逾期未回款金额逐月累积滚入（逾期金额 = plannedAmount - actualAmount）\n紫色柱（实际回款）：该月 actualDate 对应的 actualAmount 之和\n\n逾期判定：当前日期 > plannedDate 且未全额回款\n滚动规则：月底仍未回款则从下月起逐月累加，直到当前月",
    en: "Calculation:\\nBlue (Native Plan): Sum of plannedAmount for plans with plannedDate in this month\\nOrange (Rolled Overdue): Accumulated overdue from prior months (overdue = plannedAmount - actualAmount)\\nPurple (Actual): Sum of actualAmount for plans with actualDate in this month\\n\\nOverdue: current date > plannedDate and not fully collected\\nRolling: If not collected by month-end, rolls forward each month until current month",
  },
  "dashboard>filter>collectionMonth": {
    zh: "{month} 月回款合同",
    en: "Contracts for {month}",
  },
  "dashboard>filter>collectionDefault": {
    zh: "回款相关合同",
    en: "Collection related contracts",
  },

  // Filter labels
  "dashboard>filter>searchPlaceholder": {
    zh: "搜索商机名称或公司...",
    en: "Search deals or companies...",
  },
  "dashboard>filter>stage": { zh: "阶段", en: "Stage" },
  "dashboard>filter>owner": { zh: "负责人", en: "Owner" },
  "dashboard>filter>activity": { zh: "活动状态", en: "Activity" },
  "dashboard>filter>probability": { zh: "成功率", en: "Probability" },
  "dashboard>filter>clear": { zh: "清除", en: "Clear" },
  "dashboard>filter>activeRange": { zh: "活跃 (<30天)", en: "Active (<30d)" },
  "dashboard>filter>stagnantRange": {
    zh: "停滞 (30-60天)",
    en: "Stagnant (30-60d)",
  },
  "dashboard>filter>riskRange": {
    zh: "风险 (60-90天)",
    en: "At Risk (60-90d)",
  },
  "dashboard>filter>zombieRange": { zh: "僵尸 (>90天)", en: "Zombie (>90d)" },

  // Filter titles
  "dashboard>filter>healthMonth": {
    zh: "{month} 月相关商机",
    en: "Deals for {month}",
  },
  "dashboard>filter>healthDefault": {
    zh: "健康度相关商机",
    en: "Health related deals",
  },
  "dashboard>filter>funnelStage": {
    zh: "{stage} 阶段商机",
    en: "{stage} stage deals",
  },
  "dashboard>filter>funnelDefault": {
    zh: "漏斗相关商机",
    en: "Funnel related deals",
  },
  "dashboard>filter>stagnationStageStatus": {
    zh: "{stage} - {status} 商机",
    en: "{stage} - {status} deals",
  },
  "dashboard>filter>stagnationDefault": {
    zh: "停滞相关商机",
    en: "Stagnation related deals",
  },
  "dashboard>filter>dealList": { zh: "商机列表", en: "Deal List" },
  "dashboard>filter>allOrgs": { zh: "全部组织", en: "All Organizations" },
  "dashboard>filter>orgFilter": { zh: "组织筛选", en: "Organization Filter" },
  "dashboard>filter>clickToSwitch": {
    zh: "点击图表其他区域切换筛选，或关闭此表格",
    en: "Click other chart areas to filter, or close this table",
  },
  "dashboard>filter>productLine": { zh: "产品线", en: "Product Line" },
  "dashboard>filter>noProductLine": { zh: "无产品线", en: "No Product Line" },
  "dashboard>filter>teamComparison": { zh: "团队对比", en: "Team Comparison" },
  "dashboard>filter>byMonth": { zh: "按月", en: "By Month" },
  "dashboard>filter>byQuarter": { zh: "按季度", en: "By Quarter" },
  "dashboard>filter>expectedAmount": {
    zh: "预计交易金额",
    en: "Expected Amount",
  },
  "dashboard>filter>businessAmount": { zh: "商机金额", en: "Business Amount" },
  "dashboard>filter>contractAmount": {
    zh: "合同总金额(含税)",
    en: "Contract Amount (Tax Incl.)",
  },
  "dashboard>filter>receivableAmount": {
    zh: "实际回款金额",
    en: "Actual Payment",
  },

  // Deals
  "dashboard>deals>responsible": {
    zh: "{name} 负责的商机",
    en: "Deals owned by {name}",
  },
  "dashboard>deals>relatedList": {
    zh: "相关商机列表",
    en: "Related deals list",
  },
  "dashboard>deals>count": { zh: "{count} 个商机", en: "{count} deals" },
  "dashboard>deals>totalValue": { zh: "商机总价值", en: "Total Deal Value" },
  "dashboard>deals>avgProbability": { zh: "平均概率", en: "Avg Probability" },
  "dashboard>deals>deal": { zh: "商机", en: "Deal" },
  "dashboard>deals>expectedTransactionAmount": { zh: "金额", en: "Amount" },
  "dashboard>deals>businessAmount": { zh: "商机金额", en: "Business Amount" },
  "dashboard>deals>stage": { zh: "阶段", en: "Stage" },
  "dashboard>deals>activityStatus": { zh: "活动状态", en: "Activity" },
  "dashboard>deals>successRate": { zh: "成功率", en: "Probability" },
  "dashboard>deals>owner": { zh: "负责人", en: "Owner" },
  "dashboard>deals>noDeals": {
    zh: "没有符合筛选条件的商机",
    en: "No deals match the filter criteria",
  },

  // Activity Status
  "dashboard>status>active": { zh: "活跃", en: "Active" },
  "status.over7": { zh: ">7天", en: ">7 days" },
  "status.over30": { zh: ">30天", en: ">30 days" },
  "status.over60": { zh: ">60天", en: ">60 days" },
  "dashboard>status>zombie": { zh: "僵尸", en: "Zombie" },
};

interface LanguageContextType {
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  getText: (text: BilingualText | string) => string;
}

interface I18nApi {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({
  children,
  i18nApi,
}: {
  children: ReactNode;
  i18nApi: I18nApi;
}) {
  // const t = (key: string, params?: Record<string, string | number>): string => {
  //   const translation = translations[key];
  //   if (!translation) return key;

  //   let result = translation[language] || translation.zh || key;

  //   if (params) {
  //     Object.entries(params).forEach(([paramKey, value]) => {
  //       result = result.replace(`{${paramKey}}`, String(value));
  //     });
  //   }

  //   return result;
  // };

  const t = i18nApi.t.bind(i18nApi);
  const language = toLanguage(i18nApi.language);

  // Helper to get bilingual text value
  const getText = (text: BilingualText | string): string => {
    if (typeof text === "string") return text;
    if (language === "ja") return text.ja || text.en || text.zh || "";
    return text[language] || text.zh || "";
  };

  return (
    <LanguageContext.Provider value={{ language, t, getText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
