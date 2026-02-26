import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { BilingualText } from "@/data/mockData";

type Language = "zh" | "en";

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation
  "nav.main": { zh: "主菜单", en: "Main Menu" },
  "nav.dashboard": { zh: "仪表盘", en: "Dashboard" },
  "nav.leads": { zh: "线索管理", en: "Leads" },
  "nav.customers": { zh: "客户管理", en: "Customers" },
  "nav.contacts": { zh: "联系人管理", en: "Contacts" },
  "nav.deals": { zh: "商机管理", en: "Deals" },
  "nav.products": { zh: "产品管理", en: "Products" },
  "nav.quotes": { zh: "报价管理", en: "Quotes" },

  // Header
  "header.dashboard": { zh: "仪表盘", en: "Dashboard" },
  "header.orgStructure": { zh: "销售组织架构", en: "Sales Organization" },
  "header.subtitle": { zh: "智能销售管理", en: "Smart Sales Management" },
  "header.daysRemaining": { zh: "天剩余", en: "days remaining" },

  // Organization
  "org.title": { zh: "销售组织架构", en: "Sales Organization" },
  "org.subtitle": {
    zh: "配置各层级指标与转化率目标",
    en: "Configure targets and conversion goals",
  },
  "org.addOrg": { zh: "添加组织", en: "Add Organization" },
  "org.company": { zh: "公司", en: "Company" },
  "org.region": { zh: "区域", en: "Region" },
  "org.team": { zh: "团队", en: "Team" },
  "org.sales": { zh: "销售", en: "Sales" },
  "org.selectNode": {
    zh: "选择节点进行配置",
    en: "Select a node to configure",
  },
  "org.selectNodeDesc": {
    zh: "在任意层级设置指标与转化率目标",
    en: "Set targets and conversion goals at any level",
  },

  // Tabs
  "tab.basicInfo": { zh: "基础信息", en: "Basic Info" },
  "tab.deals": { zh: "商机", en: "Deals" },
  "tab.customers": { zh: "客户", en: "Customers" },
  "tab.target": { zh: "指标", en: "Target" },
  "tab.conversion": { zh: "转化率", en: "Conversion" },

  // Basic Info
  "info.name": { zh: "名称", en: "Name" },
  "info.type": { zh: "类型", en: "Type" },
  "info.levelId": { zh: "层级 ID", en: "Level ID" },
  "info.subOrgs": { zh: "下级组织", en: "Sub Organizations" },
  "info.fiscalYear": { zh: "财年设置", en: "Fiscal Year Settings" },
  "info.fiscalStart": { zh: "财年开始日期", en: "Fiscal Start Date" },
  "info.fiscalEnd": { zh: "财年结束日期", en: "Fiscal End Date" },
  "info.fiscalPeriod": { zh: "财年周期", en: "Fiscal Period" },
  "info.totalDays": { zh: "共 {days} 天", en: "{days} days total" },
  "info.config": { zh: "配置", en: "Configuration" },

  // Deals
  "deals.responsible": { zh: "{name} 负责的商机", en: "Deals owned by {name}" },
  "deals.relatedList": { zh: "相关商机列表", en: "Related deals list" },
  "deals.count": { zh: "{count} 个商机", en: "{count} deals" },
  "deals.totalValue": { zh: "商机总价值", en: "Total Deal Value" },
  "deals.avgProbability": { zh: "平均概率", en: "Avg Probability" },
  "deals.deal": { zh: "商机", en: "Deal" },
  "deals.amount": { zh: "金额", en: "Amount" },
  "deals.stage": { zh: "阶段", en: "Stage" },
  "deals.activityStatus": { zh: "活动状态", en: "Activity" },
  "deals.successRate": { zh: "成功率", en: "Probability" },
  "deals.owner": { zh: "负责人", en: "Owner" },
  "deals.noDeals": {
    zh: "没有符合筛选条件的商机",
    en: "No deals match the filter criteria",
  },

  // Activity Status
  "status.active": { zh: "活跃", en: "Active" },
  "status.over7": { zh: ">7天", en: ">7 days" },
  "status.over30": { zh: ">30天", en: ">30 days" },
  "status.over60": { zh: ">60天", en: ">60 days" },
  "status.zombie": { zh: "僵尸", en: "Zombie" },

  // Customers
  "customers.list": { zh: "客户列表", en: "Customer List" },
  "customers.count": { zh: "{count} 个客户", en: "{count} customers" },
  "customers.totalValue": { zh: "客户总价值", en: "Total Customer Value" },
  "customers.historyValue": { zh: "历史价值", en: "Historical Value" },
  "customers.active": { zh: "活跃", en: "Active" },
  "customers.key": { zh: "重点", en: "Key" },
  "customers.new": { zh: "新客户", en: "New" },

  // Target (formerly Quota)
  "target.annual": { zh: "年度指标", en: "Annual Target" },
  "target.inputPlaceholder": {
    zh: "输入年度指标金额",
    en: "Enter annual target amount",
  },
  "target.perYear": { zh: "/ 年", en: "/ year" },
  "target.quarterly": { zh: "季度指标", en: "Quarterly Target" },
  "target.monthly": { zh: "月度指标", en: "Monthly Target" },
  "target.breakdown": { zh: "指标分解", en: "Target Breakdown" },
  "target.seasonality": { zh: "季节性分配", en: "Seasonality Distribution" },
  "target.seasonalityDesc": {
    zh: "业务有季节性波动，请根据实际情况分配各季度/月度占比",
    en: "Business has seasonal fluctuations, allocate quarterly/monthly percentages accordingly",
  },
  "target.distributionMode": { zh: "分配模式", en: "Distribution Mode" },
  "target.byQuarter": { zh: "按季度", en: "By Quarter" },
  "target.byMonth": { zh: "按月度", en: "By Month" },
  "target.inputMode": { zh: "输入方式", en: "Input Mode" },
  "target.percentage": { zh: "百分比", en: "Percentage" },
  "target.absolute": { zh: "绝对值", en: "Absolute" },
  "target.percentageMode": { zh: "按百分比分配", en: "Percentage Mode" },
  "target.absoluteMode": { zh: "按金额分配", en: "Absolute Mode" },
  "target.total": { zh: "合计", en: "Total" },
  "target.percentageError": {
    zh: "百分比总和必须等于 100%",
    en: "Percentages must sum to 100%",
  },
  "target.absoluteError": {
    zh: "数值总和必须等于年度指标",
    en: "Values must sum to annual target",
  },
  "target.validationSuccess": {
    zh: "✓ 分配校验通过",
    en: "✓ Distribution validated",
  },

  // Conversion
  "conversion.description": {
    zh: "设置各销售阶段的目标转化率，用于计算理论商机曲线",
    en: "Set target conversion rates for each sales stage",
  },
  "conversion.overall": {
    zh: "理论整体转化率",
    en: "Overall Theoretical Conversion",
  },
  "conversion.expectedConversion": {
    zh: "从 Discovery 到 Won 的预期转化",
    en: "Expected conversion from Discovery to Won",
  },
  "conversion.targetRate": { zh: "目标转化率", en: "Target Rate" },
  "conversion.historicalRate": { zh: "历史转化率", en: "Historical Rate" },
  "conversion.historicalDesc": {
    zh: "基于历史数据计算的实际转化率",
    en: "Actual rate calculated from historical data",
  },
  "conversion.noHistory": { zh: "暂无历史数据", en: "No historical data" },
  "conversion.newCustomer": {
    zh: "新客户，暂无历史记录",
    en: "New customer, no history yet",
  },
  "conversion.unrealistic": {
    zh: "⚠️ 目标与历史差距较大",
    en: "⚠️ Target differs significantly from history",
  },

  // Actions
  "action.save": { zh: "保存配置", en: "Save Configuration" },
  "action.saved": { zh: "配置已保存", en: "Configuration saved" },
  "action.savedDesc": {
    zh: "{name} 的设置已更新",
    en: "{name} settings updated",
  },
  "action.cancel": { zh: "取消", en: "Cancel" },
  "action.add": { zh: "添加", en: "Add" },
  "action.planExecution": { zh: "计划执行", en: "Plan Execution" },
  "action.modify": { zh: "修改", en: "Modify" },
  "action.doNotExecute": { zh: "不执行", en: "Skip" },

  // Add Organization Dialog
  "addOrg.title": { zh: "添加组织层级", en: "Add Organization Level" },
  "addOrg.description": {
    zh: "选择组织类型和上级，配置基础信息",
    en: "Select type and parent, configure basic info",
  },
  "addOrg.type": { zh: "组织类型", en: "Organization Type" },
  "addOrg.parent": { zh: "上级组织", en: "Parent Organization" },
  "addOrg.name": { zh: "名称", en: "Name" },
  "addOrg.namePlaceholder": { zh: "输入{type}名称", en: "Enter {type} name" },
  "addOrg.noParent": {
    zh: "没有可用的上级组织",
    en: "No available parent organizations",
  },
  "addOrg.success": {
    zh: "组织添加成功",
    en: "Organization added successfully",
  },
  "addOrg.successDesc": {
    zh: "已添加 {type}: {name}",
    en: "Added {type}: {name}",
  },
  "addOrg.enterName": {
    zh: "请输入组织名称",
    en: "Please enter organization name",
  },
  "addOrg.selectParent": {
    zh: "请选择上级组织",
    en: "Please select parent organization",
  },

  // Charts
  "chart.health": { zh: "商机健康度", en: "Pipeline Health" },
  "chart.healthDesc": {
    zh: "实际 vs 目标业绩",
    en: "Actual vs Target Performance",
  },
  "chart.funnel": { zh: "销售漏斗", en: "Sales Funnel" },
  "chart.funnelDesc": {
    zh: "阶段转化 vs 目标",
    en: "Stage Conversion vs Target",
  },
  "chart.stagnation": { zh: "商机停滞分析", en: "Deal Stagnation" },
  "chart.stagnationDesc": {
    zh: "按最近活动时间分析",
    en: "Deals by Last Activity Age",
  },
  "chart.clickToView": {
    zh: "点击图表查看商机",
    en: "Click chart to view deals",
  },
  "chart.clickStageToView": {
    zh: "点击阶段查看商机",
    en: "Click stage to view deals",
  },
  "chart.clickOrCardToView": {
    zh: "点击图表或状态卡片查看商机",
    en: "Click chart or status cards to view deals",
  },
  "chart.healthy": { zh: "健康", en: "HEALTHY" },
  "chart.belowTarget": { zh: "低于目标", en: "BELOW TARGET" },
  "chart.onTrack": { zh: "正常", en: "ON TRACK" },
  "chart.needsAttention": { zh: "需关注", en: "NEEDS ATTENTION" },
  "chart.current": { zh: "当前", en: "Current" },
  "chart.target": { zh: "目标", en: "Target" },
  "chart.attainment": { zh: "达成率", en: "Attainment" },
  "chart.theoreticalTarget": { zh: "理论目标", en: "Theoretical Target" },
  "chart.actualPerformance": { zh: "实际业绩", en: "Actual Performance" },
  "chart.totalPipeline": { zh: "总商机金额", en: "Total Pipeline" },
  "chart.activeDeals": { zh: "活跃商机", en: "Active Deals" },
  "chart.avgConversion": { zh: "平均转化", en: "Avg Conversion" },
  "chart.aboveTarget": { zh: "高于目标", en: "Above Target" },
  "chart.belowTargetLegend": { zh: "低于目标", en: "Below Target" },
  "chart.zombieDeals": { zh: "僵尸商机", en: "ZOMBIE DEALS" },
  "chart.lessThan30": { zh: "<30 天 (活跃)", en: "<30 days (Active)" },
  "chart.moreThan30": { zh: ">30 天", en: ">30 days" },
  "chart.moreThan60": { zh: ">60 天", en: ">60 days" },
  "chart.moreThan90": { zh: ">90 天 (僵尸)", en: ">90 days (Zombie)" },
  "chart.gap": { zh: "差额", en: "Gap" },
  "chart.clickForDetails": { zh: "点击查看详情", en: "Click for details" },
  "chart.deals": { zh: "个商机", en: "deals" },
  "chart.total": { zh: "总计", en: "Total" },
  "chart.amount": { zh: "金额", en: "Amount" },
  "chart.count": { zh: "数量", en: "Count" },

  // Filter labels
  "filter.searchPlaceholder": {
    zh: "搜索商机名称或公司...",
    en: "Search deals or companies...",
  },
  "filter.stage": { zh: "阶段", en: "Stage" },
  "filter.owner": { zh: "负责人", en: "Owner" },
  "filter.activity": { zh: "活动状态", en: "Activity" },
  "filter.probability": { zh: "成功率", en: "Probability" },
  "filter.clear": { zh: "清除", en: "Clear" },
  "filter.activeRange": { zh: "活跃 (<30天)", en: "Active (<30d)" },
  "filter.stagnantRange": { zh: "停滞 (30-60天)", en: "Stagnant (30-60d)" },
  "filter.riskRange": { zh: "风险 (60-90天)", en: "At Risk (60-90d)" },
  "filter.zombieRange": { zh: "僵尸 (>90天)", en: "Zombie (>90d)" },

  // Filter titles
  "filter.healthMonth": { zh: "{month} 月相关商机", en: "Deals for {month}" },
  "filter.healthDefault": { zh: "健康度相关商机", en: "Health related deals" },
  "filter.funnelStage": { zh: "{stage} 阶段商机", en: "{stage} stage deals" },
  "filter.funnelDefault": { zh: "漏斗相关商机", en: "Funnel related deals" },
  "filter.stagnationStageStatus": {
    zh: "{stage} - {status} 商机",
    en: "{stage} - {status} deals",
  },
  "filter.stagnationDefault": {
    zh: "停滞相关商机",
    en: "Stagnation related deals",
  },
  "filter.dealList": { zh: "商机列表", en: "Deal List" },
  "filter.allOrgs": { zh: "全部组织", en: "All Organizations" },
  "filter.orgFilter": { zh: "组织筛选", en: "Organization Filter" },
  "filter.clickToSwitch": {
    zh: "点击图表其他区域切换筛选，或关闭此表格",
    en: "Click other chart areas to filter, or close this table",
  },
  "filter.productGroup": { zh: "产品组", en: "Product Group" },
  "filter.teamComparison": { zh: "团队对比", en: "Team Comparison" },

  // AI Action Card
  "ai.suggestedAction": {
    zh: "AI 建议下一步行动",
    en: "AI Suggested Next Action",
  },
  "ai.zombieWarning": {
    zh: "僵尸商机警告: {days} 天无活动",
    en: "Zombie deal warning: {days} days inactive",
  },
  "ai.suggestedActionLabel": { zh: "建议行动", en: "Suggested Action" },
  "ai.eta": { zh: "预计完成时间 (ETA)", en: "Expected Completion (ETA)" },
  "ai.reasoning": { zh: "AI 推理依据", en: "AI Reasoning" },
  "ai.managerCollab": { zh: "Manager 协同", en: "Manager Collaboration" },
  "ai.addComment": { zh: "添加评论", en: "Add Comment" },
  "ai.inputComment": {
    zh: "输入修改建议或评论...",
    en: "Enter suggestions or comments...",
  },
  "ai.concur": { zh: "同意 (Concur)", en: "Concur" },
  "ai.sendComment": { zh: "发送评论", en: "Send Comment" },
  "ai.collabHistory": { zh: "协作历史", en: "Collaboration History" },
  "ai.noCollab": { zh: "暂无协作记录", en: "No collaboration history" },
  "ai.planned": { zh: "已计划执行", en: "Planned for execution" },
  "ai.managerConcurred": { zh: "Manager 已同意", en: "Manager approved" },
  "ai.collabUpdated": { zh: "协同记录已更新", en: "Collaboration updated" },
  "ai.commentAdded": { zh: "Manager 评论已添加", en: "Manager comment added" },
  "ai.salesNotified": { zh: "销售将收到通知", en: "Sales will be notified" },
  "ai.agreedSuggestion": {
    zh: "✓ 同意此建议",
    en: "✓ Approved this suggestion",
  },

  // Roles
  "role.ai": { zh: "AI", en: "AI" },
  "role.sales": { zh: "销售", en: "Sales" },
  "role.manager": { zh: "经理", en: "Manager" },

  // Deal Detail Panel
  "detail.aiSuggestion": { zh: "AI建议", en: "AI Suggestion" },
  "detail.activities": { zh: "活动", en: "Activities" },
  "detail.contacts": { zh: "联系人", en: "Contacts" },
  "detail.collaboration": { zh: "协作", en: "Collaboration" },
  "detail.details": { zh: "详情", en: "Details" },
  "detail.zombie": { zh: "僵尸", en: "Zombie" },
  "detail.zombieDeal": {
    zh: "僵尸商机: {days}天无活动",
    en: "Zombie deal: {days} days inactive",
  },
  "detail.aiReasoning": { zh: "AI推理", en: "AI Reasoning" },
  "detail.comment": { zh: "评论", en: "Comment" },
  "detail.inputComment": { zh: "输入评论...", en: "Enter comment..." },
  "detail.agree": { zh: "同意", en: "Agree" },
  "detail.send": { zh: "发送", en: "Send" },
  "detail.noCollabHistory": {
    zh: "暂无协作历史",
    en: "No collaboration history",
  },
  "detail.dealValue": { zh: "商机价值", en: "Deal Value" },
  "detail.currentStage": { zh: "当前阶段", en: "Current Stage" },
  "detail.probability": { zh: "成功概率", en: "Probability" },
  "detail.lastActivity": { zh: "最近活动", en: "Last Activity" },
  "detail.daysAgo": { zh: "天前", en: "days ago" },
  "detail.expectedClose": { zh: "预计成交", en: "Expected Close" },
  "detail.decisionMaker": { zh: "决策者", en: "Decision Maker" },
  "detail.attendees": { zh: "人", en: "attendees" },
  "detail.noActivities": { zh: "暂无活动记录", en: "No activities recorded" },
  "detail.noContacts": { zh: "暂无联系人", en: "No contacts" },

  // Activity AI Summary
  "activity.aiSummary": { zh: "AI 总结", en: "AI Summary" },
  "activity.keyInsights": { zh: "关键洞察", en: "Key Insights" },
  "activity.positive": { zh: "积极", en: "Positive" },
  "activity.neutral": { zh: "中性", en: "Neutral" },
  "activity.negative": { zh: "消极", en: "Negative" },

  // Contact details
  "contact.influence": { zh: "影响力", en: "Influence" },
  "contact.relationship": { zh: "关系", en: "Relationship" },
  "contact.champion": { zh: "拥护者", en: "Champion" },
  "contact.supporter": { zh: "支持者", en: "Supporter" },
  "contact.neutral": { zh: "中立", en: "Neutral" },
  "contact.blocker": { zh: "阻碍者", en: "Blocker" },
  "contact.lastContact": { zh: "最近联系", en: "Last Contact" },
  "contact.notes": { zh: "备注", en: "Notes" },

  // Toast messages
  "toast.executionPlanned": { zh: "已计划执行!", en: "Execution planned!" },
  "toast.nextActionScheduled": {
    zh: "{name} 的下一步行动已安排于 {date}",
    en: "Next action for {name} scheduled for {date}",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getText: (text: BilingualText | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh");

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[key];
    if (!translation) return key;

    let result = translation[language] || translation.zh || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        result = result.replace(`{${paramKey}}`, String(value));
      });
    }

    return result;
  };

  // Helper to get bilingual text value
  const getText = (text: BilingualText | string): string => {
    if (typeof text === "string") return text;
    return text[language] || text.zh || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getText }}>
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
