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
  "dashboard>chart>stagnation": { zh: "商机停滞分析", en: "Deal Stagnation" },
  "dashboard>chart>stagnationDesc": {
    zh: "按最近活动时间分析",
    en: "Deals by Last Activity Age",
  },
  "dashboard>chart>clickToView": {
    zh: "点击图表查看商机",
    en: "Click chart to view deals",
  },
  "dashboard>chart>clickStageToView": {
    zh: "点击阶段查看商机",
    en: "Click stage to view deals",
  },
  "dashboard>chart>clickOrCardToView": {
    zh: "点击图表或状态卡片查看商机",
    en: "Click chart or status cards to view deals",
  },
  "dashboard>chart>healthy": { zh: "健康", en: "HEALTHY" },
  "dashboard>chart>belowTarget": { zh: "低于目标", en: "BELOW TARGET" },
  "dashboard>chart>onTrack": { zh: "正常", en: "ON TRACK" },
  "dashboard>chart>needsAttention": { zh: "需关注", en: "NEEDS ATTENTION" },
  "dashboard>chart>current": { zh: "当前", en: "Current" },
  "dashboard>chart>target": { zh: "目标", en: "Target" },
  "dashboard>chart>attainment": { zh: "达成率", en: "Attainment" },
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
  "dashboard>chart>aboveTarget": { zh: "高于目标", en: "Above Target" },
  "dashboard>chart>belowTargetLegend": { zh: "低于目标", en: "Below Target" },
  "dashboard>chart>zombieDeals": { zh: "僵尸商机", en: "ZOMBIE DEALS" },
  "dashboard>chart>lessThan30": {
    zh: "<30 天 (活跃)",
    en: "<30 days (Active)",
  },
  "dashboard>chart>moreThan30": { zh: ">30 天", en: ">30 days" },
  "dashboard>chart>moreThan60": { zh: ">60 天", en: ">60 days" },
  "dashboard>chart>moreThan90": {
    zh: ">90 天 (僵尸)",
    en: ">90 days (Zombie)",
  },
  "dashboard>chart>gap": { zh: "差额", en: "Gap" },
  "dashboard>chart>clickForDetails": {
    zh: "点击查看详情",
    en: "Click for details",
  },
  "dashboard>chart>deals": { zh: "个商机", en: "deals" },
  "dashboard>chart>total": { zh: "总计", en: "Total" },
  "dashboard>chart>amount": { zh: "金额", en: "Amount" },
  "dashboard>chart>count": { zh: "数量", en: "Count" },

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
  "dashboard>filter>productGroup": { zh: "产品组", en: "Product Group" },
  "dashboard>filter>teamComparison": { zh: "团队对比", en: "Team Comparison" },

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
  "dashboard>deals>amount": { zh: "金额", en: "Amount" },
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
