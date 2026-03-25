// 通用类型定义

export interface BilingualText {
  zh: string;
  en: string;
  ja?: string;
}

// 商机相关类型
export interface Deal {
  id: string;
  name: BilingualText;
  company: BilingualText;
  value: number;
  stage: string;
  lastActivityDays: number;
  probability: number;
  owner: string;
  expectedClose: string;
  productGroup?: string[];
  createdMonth?: string;
}

// 图表数据类型
export interface HealthDataPoint {
  month: string;
  target: number;
  actual: number;
}

export interface StackedHealthDataPoint {
  month: string;
  target: number;
  [key: string]: number | string; // 动态阶段字段
}

export interface StagnationData {
  stage: string;
  stageName?: string;
  active: number;
  over30: number;
  over60: number;
  zombie: number;
  activeAmount: number;
  over30Amount: number;
  over60Amount: number;
  zombieAmount: number;
}

export interface FunnelStage {
  stage: string;
  stageName?: string;
  count: number;
  value: number;
  targetConversion: number;
  actualConversion: number;
}

// 组织相关类型
export interface ConversionSettings {
  discovery_to_qualification: number;
  qualification_to_proposal: number;
  proposal_to_negotiation: number;
  negotiation_to_closing: number;
  closing_to_won: number;
}

export interface OrgNode {
  id: string;
  name: BilingualText;
  type: "company" | "district" | "team" | "person"; //todo 来自于数据字典
  conversionSettings?: ConversionSettings;
  quota?: number;
  fiscalStart?: string;
  children?: OrgNode[];
  janJanuary?: number;
  febFebruary?: number;
  marMarch?: number;
  aprApril?: number;
  mayMay?: number;
  junJune?: number;
  julJuly?: number;
  augAugust?: number;
  sepSeptember?: number;
  octOctober?: number;
  novNovember?: number;
  decDecember?: number;
  leadToQualification?: number;
  qualificationToDiscovery?: number;
  discoveryToProposal?: number;
  proposalToNegotiation?: number;
  negotiationToWin?: number;
  negotiationToLoss?: number;
}

// 产品相关类型
export interface ProductGroup {
  id: string;
  name: BilingualText;
}

// 协作相关类型
export interface CollaborationEntry {
  id: string;
  dealId: string;
  type:
    | "ai_suggestion"
    | "sales_action"
    | "manager_concur"
    | "manager_comment"
    | "status_update";
  author: string;
  authorRole: "ai" | "sales" | "manager";
  content: BilingualText;
  timestamp: string;
  eta?: string;
}

// 活动相关类型
export interface Activity {
  id: string;
  dealId: string;
  type: "call" | "email" | "meeting" | "demo" | "proposal" | "note";
  title: BilingualText;
  description: BilingualText;
  date: string;
  duration?: string;
  attendees?: number;
  opened?: boolean;
  participants?: string[];
  summary?: BilingualText;
  aiSummary: BilingualText;
  sentiment: "positive" | "neutral" | "negative";
  keyInsights: BilingualText[];
}

// 联系人相关类型
export interface Contact {
  id: string;
  dealId: string;
  name: string;
  role: BilingualText;
  email: string;
  phone: string;
  isDecisionMaker: boolean;
  influence: "high" | "medium" | "low";
  relationship: "champion" | "supporter" | "neutral" | "blocker";
  lastContact?: string;
  notes?: BilingualText;
}
