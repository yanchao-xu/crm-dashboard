// Mock data for the Sales Intelligence Dashboard

export interface BilingualText {
  zh: string;
  en: string;
}

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
  productGroup?: string;
  createdMonth?: string; // For month-based filtering
}

export interface HealthDataPoint {
  month: string;
  target: number;
  actual: number;
}

export interface StackedHealthDataPoint {
  month: string;
  target: number;
  Discovery: number;
  Qualification: number;
  Proposal: number;
  Negotiation: number;
  Closing: number;
}

export interface StagnationData {
  stage: string;
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
  count: number;
  value: number;
  targetConversion: number;
  actualConversion: number;
}

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
  type: "company" | "school" | "team" | "person";
  conversionSettings?: ConversionSettings;
  quota?: number;
  fiscalStart?: string;
  children?: OrgNode[];
}

export interface ProductGroup {
  id: string;
  name: BilingualText;
}

// Product groups for filtering
export const productGroups: ProductGroup[] = [
  { id: "enterprise", name: { zh: "企业版", en: "Enterprise" } },
  { id: "professional", name: { zh: "专业版", en: "Professional" } },
  { id: "starter", name: { zh: "入门版", en: "Starter" } },
  { id: "custom", name: { zh: "定制方案", en: "Custom Solutions" } },
];

// Stage translations
export const stageTranslations: Record<string, BilingualText> = {
  Discovery: { zh: "发现", en: "Discovery" },
  Qualification: { zh: "资质确认", en: "Qualification" },
  Proposal: { zh: "提案", en: "Proposal" },
  Negotiation: { zh: "谈判", en: "Negotiation" },
  Closing: { zh: "成交中", en: "Closing" },
  Won: { zh: "已成交", en: "Won" },
};

// Month translations
export const monthTranslations: Record<string, BilingualText> = {
  Jan: { zh: "1月", en: "Jan" },
  Feb: { zh: "2月", en: "Feb" },
  Mar: { zh: "3月", en: "Mar" },
  Apr: { zh: "4月", en: "Apr" },
  May: { zh: "5月", en: "May" },
  Jun: { zh: "6月", en: "Jun" },
  Jul: { zh: "7月", en: "Jul" },
  Aug: { zh: "8月", en: "Aug" },
  Sep: { zh: "9月", en: "Sep" },
  Oct: { zh: "10月", en: "Oct" },
  Nov: { zh: "11月", en: "Nov" },
  Dec: { zh: "12月", en: "Dec" },
};

// Industry translations
export const industryTranslations: Record<string, BilingualText> = {
  科技: { zh: "科技", en: "Technology" },
  软件: { zh: "软件", en: "Software" },
  金融: { zh: "金融", en: "Finance" },
  数据: { zh: "数据", en: "Data" },
};

// Customer status translations
export const customerStatusTranslations: Record<string, BilingualText> = {
  活跃: { zh: "活跃", en: "Active" },
  重点: { zh: "重点", en: "Key" },
  新客户: { zh: "新客户", en: "New" },
};

// Legacy health data for compatibility
export const healthData: HealthDataPoint[] = [
  { month: "Jan", target: 100, actual: 85 },
  { month: "Feb", target: 200, actual: 175 },
  { month: "Mar", target: 300, actual: 260 },
  { month: "Apr", target: 420, actual: 340 },
  { month: "May", target: 550, actual: 420 },
  { month: "Jun", target: 700, actual: 580 },
  { month: "Jul", target: 870, actual: 720 },
  { month: "Aug", target: 1050, actual: 890 },
  { month: "Sep", target: 1250, actual: 1080 },
  { month: "Oct", target: 1470, actual: 1320 },
  { month: "Nov", target: 1700, actual: 1520 },
  { month: "Dec", target: 2000, actual: 1750 },
];

// Stacked health data by stage per month (Y-axis = Amount)
// Realistic pattern: pipeline value fluctuates around target, some months above, some below
// Stage distribution follows realistic funnel: Discovery > Qualification > Proposal > Negotiation > Closing
export const stackedHealthData: StackedHealthDataPoint[] = [
  {
    month: "Jan",
    target: 480000,
    Discovery: 125000,
    Qualification: 95000,
    Proposal: 72000,
    Negotiation: 55000,
    Closing: 38000,
  },
  {
    month: "Feb",
    target: 520000,
    Discovery: 142000,
    Qualification: 108000,
    Proposal: 82000,
    Negotiation: 62000,
    Closing: 45000,
  },
  {
    month: "Mar",
    target: 560000,
    Discovery: 168000,
    Qualification: 128000,
    Proposal: 98000,
    Negotiation: 75000,
    Closing: 52000,
  },
  {
    month: "Apr",
    target: 600000,
    Discovery: 155000,
    Qualification: 118000,
    Proposal: 88000,
    Negotiation: 68000,
    Closing: 48000,
  },
  {
    month: "May",
    target: 650000,
    Discovery: 185000,
    Qualification: 142000,
    Proposal: 108000,
    Negotiation: 82000,
    Closing: 58000,
  },
  {
    month: "Jun",
    target: 700000,
    Discovery: 198000,
    Qualification: 152000,
    Proposal: 115000,
    Negotiation: 88000,
    Closing: 62000,
  },
  {
    month: "Jul",
    target: 720000,
    Discovery: 178000,
    Qualification: 135000,
    Proposal: 102000,
    Negotiation: 78000,
    Closing: 55000,
  },
  {
    month: "Aug",
    target: 680000,
    Discovery: 165000,
    Qualification: 125000,
    Proposal: 95000,
    Negotiation: 72000,
    Closing: 50000,
  },
  {
    month: "Sep",
    target: 750000,
    Discovery: 205000,
    Qualification: 158000,
    Proposal: 120000,
    Negotiation: 92000,
    Closing: 65000,
  },
  {
    month: "Oct",
    target: 800000,
    Discovery: 225000,
    Qualification: 172000,
    Proposal: 130000,
    Negotiation: 100000,
    Closing: 72000,
  },
  {
    month: "Nov",
    target: 850000,
    Discovery: 218000,
    Qualification: 165000,
    Proposal: 125000,
    Negotiation: 95000,
    Closing: 68000,
  },
  {
    month: "Dec",
    target: 900000,
    Discovery: 245000,
    Qualification: 188000,
    Proposal: 142000,
    Negotiation: 108000,
    Closing: 78000,
  },
];

export const stagnationData: StagnationData[] = [
  {
    stage: "Discovery",
    active: 12,
    over30: 5,
    over60: 3,
    zombie: 2,
    activeAmount: 1800000,
    over30Amount: 750000,
    over60Amount: 450000,
    zombieAmount: 300000,
  },
  {
    stage: "Qualification",
    active: 18,
    over30: 8,
    over60: 4,
    zombie: 3,
    activeAmount: 2700000,
    over30Amount: 1200000,
    over60Amount: 600000,
    zombieAmount: 450000,
  },
  {
    stage: "Proposal",
    active: 15,
    over30: 6,
    over60: 5,
    zombie: 4,
    activeAmount: 2250000,
    over30Amount: 900000,
    over60Amount: 750000,
    zombieAmount: 600000,
  },
  {
    stage: "Negotiation",
    active: 10,
    over30: 4,
    over60: 2,
    zombie: 1,
    activeAmount: 1500000,
    over30Amount: 600000,
    over60Amount: 300000,
    zombieAmount: 150000,
  },
  {
    stage: "Closing",
    active: 8,
    over30: 2,
    over60: 1,
    zombie: 0,
    activeAmount: 1200000,
    over30Amount: 300000,
    over60Amount: 150000,
    zombieAmount: 0,
  },
];

// Funnel data with REALISTIC conversion rates (step-by-step decrease)
// Real-world funnels typically have:
// - Discovery → Qualification: 25-35%
// - Qualification → Proposal: 40-50%
// - Proposal → Negotiation: 50-60%
// - Negotiation → Closing: 40-50%
// - Closing → Won: 60-70%
export const funnelData: FunnelStage[] = [
  {
    stage: "Discovery",
    count: 120,
    value: 4800000,
    targetConversion: 30,
    actualConversion: 28,
  },
  {
    stage: "Qualification",
    count: 34,
    value: 1850000,
    targetConversion: 45,
    actualConversion: 42,
  },
  {
    stage: "Proposal",
    count: 14,
    value: 920000,
    targetConversion: 55,
    actualConversion: 50,
  },
  {
    stage: "Negotiation",
    count: 7,
    value: 580000,
    targetConversion: 45,
    actualConversion: 43,
  },
  {
    stage: "Closing",
    count: 3,
    value: 320000,
    targetConversion: 65,
    actualConversion: 60,
  },
];

// Default conversion ratio settings (realistic)
export const defaultConversionSettings: ConversionSettings = {
  discovery_to_qualification: 30,
  qualification_to_proposal: 45,
  proposal_to_negotiation: 55,
  negotiation_to_closing: 45,
  closing_to_won: 65,
};

export const deals: Deal[] = [
  // January deals
  {
    id: "1",
    name: { zh: "企业授权许可协议", en: "Enterprise License Deal" },
    company: { zh: "爱克美公司", en: "Acme Corp" },
    value: 125000,
    stage: "Negotiation",
    lastActivityDays: 2,
    probability: 45,
    owner: "Sarah Chen",
    expectedClose: "2024-02-15",
    productGroup: "enterprise",
    createdMonth: "Jan",
  },
  {
    id: "2",
    name: { zh: "政府合同", en: "Government Contract" },
    company: { zh: "城市服务中心", en: "City Services" },
    value: 450000,
    stage: "Negotiation",
    lastActivityDays: 12,
    probability: 38,
    owner: "Sarah Chen",
    expectedClose: "2024-06-01",
    productGroup: "enterprise",
    createdMonth: "Jan",
  },
  {
    id: "3",
    name: { zh: "金融数据平台", en: "Financial Data Platform" },
    company: { zh: "华信银行", en: "TrustBank Corp" },
    value: 280000,
    stage: "Qualification",
    lastActivityDays: 8,
    probability: 25,
    owner: "Mike Johnson",
    expectedClose: "2024-04-15",
    productGroup: "enterprise",
    createdMonth: "Jan",
  },
  {
    id: "4",
    name: { zh: "零售分析系统", en: "Retail Analytics System" },
    company: { zh: "连锁超市集团", en: "MegaMart Group" },
    value: 95000,
    stage: "Discovery",
    lastActivityDays: 15,
    probability: 12,
    owner: "Alex Rivera",
    expectedClose: "2024-05-01",
    productGroup: "professional",
    createdMonth: "Jan",
  },

  // February deals
  {
    id: "5",
    name: { zh: "平台迁移项目", en: "Platform Migration" },
    company: { zh: "创科科技", en: "TechStart Inc" },
    value: 85000,
    stage: "Proposal",
    lastActivityDays: 45,
    probability: 35,
    owner: "Mike Johnson",
    expectedClose: "2024-03-01",
    productGroup: "professional",
    createdMonth: "Feb",
  },
  {
    id: "6",
    name: { zh: "试点项目", en: "Pilot Program" },
    company: { zh: "创新科技", en: "InnovateTech" },
    value: 15000,
    stage: "Discovery",
    lastActivityDays: 120,
    probability: 8,
    owner: "Alex Rivera",
    expectedClose: "2024-03-15",
    productGroup: "starter",
    createdMonth: "Feb",
  },
  {
    id: "7",
    name: { zh: "供应链优化", en: "Supply Chain Optimization" },
    company: { zh: "环球物流", en: "Global Logistics" },
    value: 175000,
    stage: "Qualification",
    lastActivityDays: 22,
    probability: 28,
    owner: "Emma Wilson",
    expectedClose: "2024-05-20",
    productGroup: "custom",
    createdMonth: "Feb",
  },
  {
    id: "8",
    name: { zh: "ERP集成项目", en: "ERP Integration Project" },
    company: { zh: "制造业巨头", en: "ManufacturePro Ltd" },
    value: 320000,
    stage: "Discovery",
    lastActivityDays: 5,
    probability: 15,
    owner: "James Brown",
    expectedClose: "2024-06-30",
    productGroup: "enterprise",
    createdMonth: "Feb",
  },

  // March deals
  {
    id: "9",
    name: { zh: "年度订阅续约", en: "Annual Subscription Renewal" },
    company: { zh: "环球系统", en: "Global Systems" },
    value: 220000,
    stage: "Closing",
    lastActivityDays: 1,
    probability: 65,
    owner: "Sarah Chen",
    expectedClose: "2024-01-30",
    productGroup: "enterprise",
    createdMonth: "Mar",
  },
  {
    id: "10",
    name: { zh: "云迁移解决方案", en: "Cloud Migration Solution" },
    company: { zh: "传统制造", en: "Legacy Manufacturing" },
    value: 180000,
    stage: "Discovery",
    lastActivityDays: 5,
    probability: 18,
    owner: "Mike Johnson",
    expectedClose: "2024-07-01",
    productGroup: "custom",
    createdMonth: "Mar",
  },
  {
    id: "11",
    name: { zh: "客户服务平台", en: "Customer Service Platform" },
    company: { zh: "电信集团", en: "TelecomOne Group" },
    value: 145000,
    stage: "Proposal",
    lastActivityDays: 18,
    probability: 42,
    owner: "Olivia Zhang",
    expectedClose: "2024-04-25",
    productGroup: "professional",
    createdMonth: "Mar",
  },
  {
    id: "12",
    name: { zh: "人力资源系统", en: "HR Management System" },
    company: { zh: "人才咨询", en: "TalentFirst Consulting" },
    value: 68000,
    stage: "Qualification",
    lastActivityDays: 32,
    probability: 22,
    owner: "Liam Nguyen",
    expectedClose: "2024-05-15",
    productGroup: "professional",
    createdMonth: "Mar",
  },

  // April deals
  {
    id: "13",
    name: { zh: "数据分析套件", en: "Data Analytics Suite" },
    company: { zh: "数据流科技", en: "DataFlow Ltd" },
    value: 67000,
    stage: "Discovery",
    lastActivityDays: 92,
    probability: 12,
    owner: "Alex Rivera",
    expectedClose: "2024-04-15",
    productGroup: "professional",
    createdMonth: "Apr",
  },
  {
    id: "14",
    name: { zh: "安全合规升级", en: "Security Compliance Upgrade" },
    company: { zh: "医疗健康集团", en: "HealthCare Group" },
    value: 95000,
    stage: "Qualification",
    lastActivityDays: 18,
    probability: 28,
    owner: "Sarah Chen",
    expectedClose: "2024-04-30",
    productGroup: "professional",
    createdMonth: "Apr",
  },
  {
    id: "15",
    name: { zh: "智能仓储系统", en: "Smart Warehouse System" },
    company: { zh: "快递物流", en: "ExpressShip Co" },
    value: 238000,
    stage: "Negotiation",
    lastActivityDays: 6,
    probability: 52,
    owner: "Mike Johnson",
    expectedClose: "2024-05-10",
    productGroup: "enterprise",
    createdMonth: "Apr",
  },
  {
    id: "16",
    name: { zh: "营销自动化", en: "Marketing Automation" },
    company: { zh: "品牌推广", en: "BrandBoost Agency" },
    value: 52000,
    stage: "Proposal",
    lastActivityDays: 28,
    probability: 35,
    owner: "Jordan Lee",
    expectedClose: "2024-05-20",
    productGroup: "professional",
    createdMonth: "Apr",
  },

  // May deals
  {
    id: "17",
    name: { zh: "定制集成项目", en: "Custom Integration Project" },
    company: { zh: "金融服务集团", en: "FinServe Group" },
    value: 340000,
    stage: "Qualification",
    lastActivityDays: 35,
    probability: 22,
    owner: "Mike Johnson",
    expectedClose: "2024-05-01",
    productGroup: "custom",
    createdMonth: "May",
  },
  {
    id: "18",
    name: { zh: "物联网平台", en: "IoT Platform" },
    company: { zh: "智能设备公司", en: "SmartDevices Inc" },
    value: 210000,
    stage: "Discovery",
    lastActivityDays: 28,
    probability: 15,
    owner: "Alex Rivera",
    expectedClose: "2024-08-15",
    productGroup: "enterprise",
    createdMonth: "May",
  },
  {
    id: "19",
    name: { zh: "教育管理系统", en: "Education Management System" },
    company: { zh: "在线教育", en: "EduOnline Corp" },
    value: 128000,
    stage: "Proposal",
    lastActivityDays: 12,
    probability: 45,
    owner: "Emma Wilson",
    expectedClose: "2024-06-15",
    productGroup: "professional",
    createdMonth: "May",
  },
  {
    id: "20",
    name: { zh: "区块链解决方案", en: "Blockchain Solution" },
    company: { zh: "数字资产", en: "DigitalAsset Ltd" },
    value: 385000,
    stage: "Qualification",
    lastActivityDays: 42,
    probability: 18,
    owner: "James Brown",
    expectedClose: "2024-07-30",
    productGroup: "custom",
    createdMonth: "May",
  },

  // June deals
  {
    id: "21",
    name: { zh: "中小企业套餐", en: "SMB Package" },
    company: { zh: "创业新星", en: "StartupXYZ" },
    value: 28000,
    stage: "Proposal",
    lastActivityDays: 68,
    probability: 30,
    owner: "Alex Rivera",
    expectedClose: "2024-02-28",
    productGroup: "starter",
    createdMonth: "Jun",
  },
  {
    id: "22",
    name: { zh: "团队协作工具", en: "Team Collaboration Tools" },
    company: { zh: "远程工作解决方案", en: "RemoteWork Solutions" },
    value: 42000,
    stage: "Proposal",
    lastActivityDays: 22,
    probability: 40,
    owner: "Mike Johnson",
    expectedClose: "2024-03-20",
    productGroup: "professional",
    createdMonth: "Jun",
  },
  {
    id: "23",
    name: { zh: "电商平台升级", en: "E-commerce Platform Upgrade" },
    company: { zh: "在线零售", en: "ShopDirect Inc" },
    value: 156000,
    stage: "Negotiation",
    lastActivityDays: 8,
    probability: 48,
    owner: "Olivia Zhang",
    expectedClose: "2024-07-10",
    productGroup: "enterprise",
    createdMonth: "Jun",
  },
  {
    id: "24",
    name: { zh: "项目管理工具", en: "Project Management Tool" },
    company: { zh: "咨询公司", en: "ConsultPro Ltd" },
    value: 38000,
    stage: "Closing",
    lastActivityDays: 3,
    probability: 72,
    owner: "Liam Nguyen",
    expectedClose: "2024-06-25",
    productGroup: "professional",
    createdMonth: "Jun",
  },

  // July deals
  {
    id: "25",
    name: { zh: "大数据分析", en: "Big Data Analytics" },
    company: { zh: "数据科技", en: "DataTech Solutions" },
    value: 275000,
    stage: "Discovery",
    lastActivityDays: 10,
    probability: 15,
    owner: "Sarah Chen",
    expectedClose: "2024-09-15",
    productGroup: "enterprise",
    createdMonth: "Jul",
  },
  {
    id: "26",
    name: { zh: "移动应用开发", en: "Mobile App Development" },
    company: { zh: "移动科技", en: "MobileFirst Tech" },
    value: 89000,
    stage: "Qualification",
    lastActivityDays: 25,
    probability: 28,
    owner: "Jordan Lee",
    expectedClose: "2024-08-20",
    productGroup: "professional",
    createdMonth: "Jul",
  },
  {
    id: "27",
    name: { zh: "网络安全方案", en: "Cybersecurity Solution" },
    company: { zh: "安全科技", en: "SecureNet Corp" },
    value: 198000,
    stage: "Proposal",
    lastActivityDays: 15,
    probability: 38,
    owner: "Mike Johnson",
    expectedClose: "2024-08-30",
    productGroup: "enterprise",
    createdMonth: "Jul",
  },
  {
    id: "28",
    name: { zh: "基础设施升级", en: "Infrastructure Upgrade" },
    company: { zh: "基础设施", en: "InfraCore Ltd" },
    value: 420000,
    stage: "Negotiation",
    lastActivityDays: 5,
    probability: 55,
    owner: "Emma Wilson",
    expectedClose: "2024-08-10",
    productGroup: "custom",
    createdMonth: "Jul",
  },

  // August deals
  {
    id: "29",
    name: { zh: "客户关系管理", en: "CRM Implementation" },
    company: { zh: "销售优化", en: "SalesOptimize Inc" },
    value: 145000,
    stage: "Discovery",
    lastActivityDays: 18,
    probability: 12,
    owner: "Alex Rivera",
    expectedClose: "2024-10-15",
    productGroup: "professional",
    createdMonth: "Aug",
  },
  {
    id: "30",
    name: { zh: "财务系统升级", en: "Finance System Upgrade" },
    company: { zh: "财务顾问", en: "FinanceAdvisors Group" },
    value: 185000,
    stage: "Qualification",
    lastActivityDays: 30,
    probability: 25,
    owner: "James Brown",
    expectedClose: "2024-09-30",
    productGroup: "enterprise",
    createdMonth: "Aug",
  },
  {
    id: "31",
    name: { zh: "库存管理系统", en: "Inventory Management System" },
    company: { zh: "批发商城", en: "WholesaleMart" },
    value: 72000,
    stage: "Proposal",
    lastActivityDays: 45,
    probability: 32,
    owner: "Olivia Zhang",
    expectedClose: "2024-09-20",
    productGroup: "professional",
    createdMonth: "Aug",
  },
  {
    id: "32",
    name: { zh: "入门版试用", en: "Starter Trial" },
    company: { zh: "新创公司", en: "NewVenture Co" },
    value: 18000,
    stage: "Closing",
    lastActivityDays: 2,
    probability: 68,
    owner: "Liam Nguyen",
    expectedClose: "2024-08-25",
    productGroup: "starter",
    createdMonth: "Aug",
  },

  // September deals
  {
    id: "33",
    name: { zh: "企业数字化转型", en: "Enterprise Digital Transformation" },
    company: { zh: "传统企业", en: "LegacyCorp Industries" },
    value: 520000,
    stage: "Discovery",
    lastActivityDays: 8,
    probability: 18,
    owner: "Sarah Chen",
    expectedClose: "2024-12-01",
    productGroup: "enterprise",
    createdMonth: "Sep",
  },
  {
    id: "34",
    name: { zh: "自动化测试平台", en: "Automated Testing Platform" },
    company: { zh: "软件工厂", en: "SoftwareFactory Inc" },
    value: 135000,
    stage: "Qualification",
    lastActivityDays: 20,
    probability: 32,
    owner: "Mike Johnson",
    expectedClose: "2024-10-30",
    productGroup: "professional",
    createdMonth: "Sep",
  },
  {
    id: "35",
    name: { zh: "数据湖建设", en: "Data Lake Construction" },
    company: { zh: "大数据公司", en: "BigData Corp" },
    value: 298000,
    stage: "Proposal",
    lastActivityDays: 12,
    probability: 42,
    owner: "Jordan Lee",
    expectedClose: "2024-10-25",
    productGroup: "custom",
    createdMonth: "Sep",
  },
  {
    id: "36",
    name: { zh: "云原生应用", en: "Cloud Native Application" },
    company: { zh: "云服务商", en: "CloudFirst Services" },
    value: 168000,
    stage: "Negotiation",
    lastActivityDays: 6,
    probability: 52,
    owner: "Emma Wilson",
    expectedClose: "2024-10-15",
    productGroup: "enterprise",
    createdMonth: "Sep",
  },

  // October deals
  {
    id: "37",
    name: { zh: "全渠道营销", en: "Omnichannel Marketing" },
    company: { zh: "营销集团", en: "MarketingPro Group" },
    value: 225000,
    stage: "Discovery",
    lastActivityDays: 15,
    probability: 15,
    owner: "Alex Rivera",
    expectedClose: "2024-12-20",
    productGroup: "enterprise",
    createdMonth: "Oct",
  },
  {
    id: "38",
    name: { zh: "智能客服系统", en: "AI Customer Service" },
    company: { zh: "服务中心", en: "ServiceCenter Corp" },
    value: 142000,
    stage: "Qualification",
    lastActivityDays: 28,
    probability: 28,
    owner: "James Brown",
    expectedClose: "2024-11-30",
    productGroup: "professional",
    createdMonth: "Oct",
  },
  {
    id: "39",
    name: { zh: "合规管理平台", en: "Compliance Management Platform" },
    company: { zh: "法规顾问", en: "RegulatoryAdvisors" },
    value: 188000,
    stage: "Proposal",
    lastActivityDays: 18,
    probability: 38,
    owner: "Olivia Zhang",
    expectedClose: "2024-11-25",
    productGroup: "enterprise",
    createdMonth: "Oct",
  },
  {
    id: "40",
    name: { zh: "业务流程自动化", en: "Business Process Automation" },
    company: { zh: "流程优化", en: "ProcessOptimize Ltd" },
    value: 265000,
    stage: "Negotiation",
    lastActivityDays: 8,
    probability: 48,
    owner: "Sarah Chen",
    expectedClose: "2024-11-15",
    productGroup: "custom",
    createdMonth: "Oct",
  },

  // November deals
  {
    id: "41",
    name: { zh: "预测分析平台", en: "Predictive Analytics Platform" },
    company: { zh: "智能分析", en: "SmartAnalytics Inc" },
    value: 315000,
    stage: "Discovery",
    lastActivityDays: 5,
    probability: 12,
    owner: "Mike Johnson",
    expectedClose: "2025-01-15",
    productGroup: "enterprise",
    createdMonth: "Nov",
  },
  {
    id: "42",
    name: { zh: "文档管理系统", en: "Document Management System" },
    company: { zh: "文件科技", en: "DocuTech Solutions" },
    value: 78000,
    stage: "Qualification",
    lastActivityDays: 22,
    probability: 25,
    owner: "Jordan Lee",
    expectedClose: "2024-12-20",
    productGroup: "professional",
    createdMonth: "Nov",
  },
  {
    id: "43",
    name: { zh: "电子签约平台", en: "E-Signature Platform" },
    company: { zh: "数字签名", en: "DigiSign Corp" },
    value: 95000,
    stage: "Proposal",
    lastActivityDays: 15,
    probability: 42,
    owner: "Emma Wilson",
    expectedClose: "2024-12-15",
    productGroup: "professional",
    createdMonth: "Nov",
  },
  {
    id: "44",
    name: { zh: "混合云方案", en: "Hybrid Cloud Solution" },
    company: { zh: "混合IT", en: "HybridIT Services" },
    value: 458000,
    stage: "Closing",
    lastActivityDays: 3,
    probability: 75,
    owner: "Liam Nguyen",
    expectedClose: "2024-11-30",
    productGroup: "enterprise",
    createdMonth: "Nov",
  },

  // December deals
  {
    id: "45",
    name: { zh: "年终大单", en: "Year-End Enterprise Deal" },
    company: { zh: "全球企业", en: "GlobalEnterprise Corp" },
    value: 680000,
    stage: "Negotiation",
    lastActivityDays: 2,
    probability: 58,
    owner: "Sarah Chen",
    expectedClose: "2024-12-28",
    productGroup: "enterprise",
    createdMonth: "Dec",
  },
  {
    id: "46",
    name: { zh: "续约升级", en: "Renewal & Upgrade" },
    company: { zh: "长期客户", en: "LoyalCustomer Ltd" },
    value: 195000,
    stage: "Closing",
    lastActivityDays: 1,
    probability: 82,
    owner: "Mike Johnson",
    expectedClose: "2024-12-20",
    productGroup: "enterprise",
    createdMonth: "Dec",
  },
  {
    id: "47",
    name: { zh: "新年启动项目", en: "New Year Kickoff Project" },
    company: { zh: "创新企业", en: "InnovationFirst Inc" },
    value: 245000,
    stage: "Qualification",
    lastActivityDays: 12,
    probability: 28,
    owner: "Alex Rivera",
    expectedClose: "2025-02-01",
    productGroup: "custom",
    createdMonth: "Dec",
  },
  {
    id: "48",
    name: { zh: "入门级套餐", en: "Entry Level Package" },
    company: { zh: "初创公司", en: "FreshStart Co" },
    value: 22000,
    stage: "Discovery",
    lastActivityDays: 8,
    probability: 15,
    owner: "Jordan Lee",
    expectedClose: "2025-01-15",
    productGroup: "starter",
    createdMonth: "Dec",
  },
];

export const orgStructure: OrgNode = {
  id: "company-1",
  name: { zh: "速达销售公司", en: "Velocity Sales Corp" },
  type: "company",
  quota: 10000000,
  fiscalStart: "Q1",
  children: [
    {
      id: "school-1",
      name: { zh: "北美区", en: "North America" },
      type: "school",
      quota: 5000000,
      fiscalStart: "Q1",
      children: [
        {
          id: "team-1",
          name: { zh: "东部企业团队", en: "Enterprise East" },
          type: "team",
          quota: 2500000,
          fiscalStart: "Q1",
          children: [
            {
              id: "person-1",
              name: { zh: "陈莎拉", en: "Sarah Chen" },
              type: "person",
              quota: 1200000,
              fiscalStart: "Q1",
            },
            {
              id: "person-2",
              name: { zh: "迈克·约翰逊", en: "Mike Johnson" },
              type: "person",
              quota: 1300000,
              fiscalStart: "Q1",
            },
          ],
        },
        {
          id: "team-2",
          name: { zh: "西部企业团队", en: "Enterprise West" },
          type: "team",
          quota: 2500000,
          fiscalStart: "Q1",
          children: [
            {
              id: "person-3",
              name: { zh: "亚历克斯·里维拉", en: "Alex Rivera" },
              type: "person",
              quota: 1250000,
              fiscalStart: "Q1",
            },
            {
              id: "person-4",
              name: { zh: "乔丹·李", en: "Jordan Lee" },
              type: "person",
              quota: 1250000,
              fiscalStart: "Q1",
            },
          ],
        },
      ],
    },
    {
      id: "school-2",
      name: { zh: "欧洲中东非洲区", en: "EMEA" },
      type: "school",
      quota: 3000000,
      fiscalStart: "Q1",
      children: [
        {
          id: "team-3",
          name: { zh: "英国及爱尔兰团队", en: "UK & Ireland" },
          type: "team",
          quota: 1500000,
          fiscalStart: "Q1",
          children: [
            {
              id: "person-5",
              name: { zh: "艾玛·威尔逊", en: "Emma Wilson" },
              type: "person",
              quota: 750000,
              fiscalStart: "Q1",
            },
            {
              id: "person-6",
              name: { zh: "詹姆斯·布朗", en: "James Brown" },
              type: "person",
              quota: 750000,
              fiscalStart: "Q1",
            },
          ],
        },
      ],
    },
    {
      id: "school-3",
      name: { zh: "亚太区", en: "APAC" },
      type: "school",
      quota: 2000000,
      fiscalStart: "Q2",
      children: [
        {
          id: "team-4",
          name: { zh: "澳新团队", en: "Australia & NZ" },
          type: "team",
          quota: 2000000,
          fiscalStart: "Q2",
          children: [
            {
              id: "person-7",
              name: { zh: "奥利维亚·张", en: "Olivia Zhang" },
              type: "person",
              quota: 1000000,
              fiscalStart: "Q2",
            },
            {
              id: "person-8",
              name: { zh: "利亚姆·阮", en: "Liam Nguyen" },
              type: "person",
              quota: 1000000,
              fiscalStart: "Q2",
            },
          ],
        },
      ],
    },
  ],
};

// Helper function to generate AI suggestions for all deals
function generateAISuggestions(): Record<
  string,
  { action: BilingualText; deadline: string; reasoning: BilingualText }
> {
  const templates = [
    {
      action: {
        zh: "安排与决策者的电话会议，讨论预算和时间表",
        en: "Schedule call with decision maker to discuss budget and timeline",
      },
      reasoning: {
        zh: "决策者参与是推进交易的关键",
        en: "Decision maker engagement is key to advancing the deal",
      },
    },
    {
      action: {
        zh: "发送定制化的ROI分析报告",
        en: "Send customized ROI analysis report",
      },
      reasoning: {
        zh: "ROI证明可以帮助克服预算异议",
        en: "ROI proof can help overcome budget objections",
      },
    },
    {
      action: {
        zh: "准备技术POC演示方案",
        en: "Prepare technical POC demonstration plan",
      },
      reasoning: {
        zh: "技术验证可以增强客户信心",
        en: "Technical validation can build customer confidence",
      },
    },
    {
      action: {
        zh: "安排高管对高管的会议加速决策",
        en: "Arrange executive-to-executive meeting to accelerate decision",
      },
      reasoning: {
        zh: "高层介入可以突破僵局",
        en: "Executive involvement can break deadlocks",
      },
    },
    {
      action: {
        zh: "发送竞品对比分析和差异化价值说明",
        en: "Send competitive analysis and differentiation value statement",
      },
      reasoning: {
        zh: "客户正在评估竞品，需要突出我们的优势",
        en: "Client is evaluating competitors, need to highlight our advantages",
      },
    },
    {
      action: {
        zh: "提供试点项目方案以降低采购风险",
        en: "Offer pilot program to reduce procurement risk",
      },
      reasoning: {
        zh: "试点方式可以帮助客户内部获得批准",
        en: "Pilot approach can help client get internal approval",
      },
    },
    {
      action: {
        zh: "准备合规文档和安全认证材料",
        en: "Prepare compliance documentation and security certifications",
      },
      reasoning: {
        zh: "安全合规是客户的关键考量因素",
        en: "Security compliance is a key concern for the client",
      },
    },
    {
      action: {
        zh: "跟进上次会议的开放问题和行动项",
        en: "Follow up on open questions and action items from last meeting",
      },
      reasoning: {
        zh: "及时跟进显示专业态度",
        en: "Timely follow-up shows professionalism",
      },
    },
  ];

  const suggestions: Record<
    string,
    { action: BilingualText; deadline: string; reasoning: BilingualText }
  > = {};

  deals.forEach((deal, index) => {
    const template = templates[index % templates.length];
    const daysToAdd = Math.floor(Math.random() * 7) + 3;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysToAdd);

    suggestions[deal.id] = {
      action: template.action,
      deadline: deadline.toISOString().split("T")[0],
      reasoning: template.reasoning,
    };
  });

  return suggestions;
}

export const aiSuggestions = generateAISuggestions();

// Collaboration history types
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

// Helper function to generate collaboration history for all deals
function generateCollaborationHistory(): Record<string, CollaborationEntry[]> {
  const history: Record<string, CollaborationEntry[]> = {};

  deals.forEach((deal) => {
    const entries: CollaborationEntry[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - deal.lastActivityDays);

    // AI suggestion entry
    entries.push({
      id: `ai-${deal.id}`,
      dealId: deal.id,
      type: "ai_suggestion",
      author: "AI Assistant",
      authorRole: "ai",
      content: aiSuggestions[deal.id]?.action || {
        zh: "分析商机状态",
        en: "Analyzing deal status",
      },
      timestamp: baseDate.toISOString(),
    });

    // Random additional entries based on deal activity
    if (deal.lastActivityDays < 30) {
      entries.push({
        id: `sales-${deal.id}`,
        dealId: deal.id,
        type: "sales_action",
        author: deal.owner,
        authorRole: "sales",
        content: {
          zh: "已计划执行建议的行动",
          en: "Planned execution of suggested action",
        },
        timestamp: new Date(baseDate.getTime() + 3600000).toISOString(),
        eta: aiSuggestions[deal.id]?.deadline,
      });
    }

    if (deal.probability > 40) {
      entries.push({
        id: `mgr-${deal.id}`,
        dealId: deal.id,
        type: "manager_concur",
        author: "David Wang",
        authorRole: "manager",
        content: { zh: "✓ 同意此方向", en: "✓ Agree with this direction" },
        timestamp: new Date(baseDate.getTime() + 7200000).toISOString(),
      });
    }

    history[deal.id] = entries;
  });

  return history;
}

export const collaborationHistory = generateCollaborationHistory();

// Bilingual text type
export interface BilingualText {
  zh: string;
  en: string;
}

// Mock activities with AI summaries
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

// Helper function to generate activities for all deals
function generateDealActivities(): Record<string, Activity[]> {
  const activityTemplates = {
    call: [
      {
        title: { zh: "需求确认电话", en: "Requirements confirmation call" },
        aiSummary: {
          zh: "客户详细描述了业务需求，对产品功能表示关注。建议准备详细的功能演示。",
          en: "Client detailed their business requirements, showing interest in product features. Recommend preparing detailed feature demo.",
        },
        sentiment: "positive" as const,
        insights: [
          { zh: "需求明确", en: "Clear requirements" },
          { zh: "功能匹配度高", en: "High feature match" },
        ],
      },
      {
        title: { zh: "预算讨论电话", en: "Budget discussion call" },
        aiSummary: {
          zh: "讨论了预算限制和采购流程。客户需要ROI证明来获得内部批准。",
          en: "Discussed budget constraints and procurement process. Client needs ROI proof for internal approval.",
        },
        sentiment: "neutral" as const,
        insights: [
          { zh: "预算有限制", en: "Budget constraints" },
          { zh: "需要ROI证明", en: "ROI proof needed" },
        ],
      },
      {
        title: { zh: "跟进电话", en: "Follow-up call" },
        aiSummary: {
          zh: "客户反馈积极，对下一步计划表示认可。决策时间表已确认。",
          en: "Positive feedback from client, next steps approved. Decision timeline confirmed.",
        },
        sentiment: "positive" as const,
        insights: [{ zh: "进展顺利", en: "Good progress" }],
      },
    ],
    email: [
      {
        title: { zh: "发送产品资料", en: "Sent product materials" },
        aiSummary: {
          zh: "邮件已发送，包含产品介绍和案例研究。等待客户反馈。",
          en: "Email sent with product introduction and case studies. Waiting for client feedback.",
        },
        sentiment: "neutral" as const,
        insights: [{ zh: "资料已送达", en: "Materials delivered" }],
      },
      {
        title: { zh: "方案提交邮件", en: "Proposal submission email" },
        aiSummary: {
          zh: "正式提案已通过邮件发送。邮件已被打开多次，显示客户在认真评估。",
          en: "Formal proposal sent via email. Email opened multiple times, showing client is seriously evaluating.",
        },
        sentiment: "positive" as const,
        insights: [
          { zh: "邮件打开率高", en: "High open rate" },
          { zh: "正在评估中", en: "Under evaluation" },
        ],
      },
    ],
    meeting: [
      {
        title: { zh: "产品演示会议", en: "Product demo meeting" },
        aiSummary: {
          zh: "向关键利益相关者展示了产品功能。反馈积极，客户对集成能力印象深刻。",
          en: "Demonstrated product features to key stakeholders. Positive feedback, client impressed with integration capabilities.",
        },
        sentiment: "positive" as const,
        insights: [
          { zh: "演示效果好", en: "Demo went well" },
          { zh: "集成能力受认可", en: "Integration appreciated" },
        ],
      },
      {
        title: { zh: "需求发现会议", en: "Discovery meeting" },
        aiSummary: {
          zh: "与客户团队进行了深入的需求讨论。识别了关键痛点和优先级。",
          en: "Had in-depth requirements discussion with client team. Identified key pain points and priorities.",
        },
        sentiment: "neutral" as const,
        insights: [
          { zh: "痛点已识别", en: "Pain points identified" },
          { zh: "优先级明确", en: "Priorities clear" },
        ],
      },
    ],
  };

  const activities: Record<string, Activity[]> = {};

  deals.forEach((deal) => {
    const dealActivities: Activity[] = [];
    const activityCount = Math.min(3, Math.floor(Math.random() * 3) + 1);
    const types: Array<"call" | "email" | "meeting"> = [
      "call",
      "email",
      "meeting",
    ];

    for (let i = 0; i < activityCount; i++) {
      const type = types[i % types.length];
      const templates = activityTemplates[type];
      const template = templates[Math.floor(Math.random() * templates.length)];

      const activityDate = new Date();
      activityDate.setDate(
        activityDate.getDate() - deal.lastActivityDays - i * 5,
      );

      dealActivities.push({
        id: `activity-${deal.id}-${i}`,
        dealId: deal.id,
        type,
        title: template.title,
        description: template.title,
        date: activityDate.toISOString().split("T")[0],
        duration:
          type === "call"
            ? `${15 + Math.floor(Math.random() * 30)} min`
            : undefined,
        attendees:
          type === "meeting" ? 2 + Math.floor(Math.random() * 4) : undefined,
        opened: type === "email" ? Math.random() > 0.3 : undefined,
        aiSummary: template.aiSummary,
        sentiment: template.sentiment,
        keyInsights: template.insights,
      });
    }

    activities[deal.id] = dealActivities;
  });

  return activities;
}

export const dealActivities = generateDealActivities();

// Mock contacts with detailed info
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

// Helper function to generate contacts for all deals
function generateDealContacts(): Record<string, Contact[]> {
  const roleTemplates = [
    {
      role: { zh: "CEO", en: "CEO" },
      influence: "high" as const,
      isDecisionMaker: true,
    },
    {
      role: { zh: "CFO", en: "CFO" },
      influence: "high" as const,
      isDecisionMaker: true,
    },
    {
      role: { zh: "CTO", en: "CTO" },
      influence: "high" as const,
      isDecisionMaker: true,
    },
    {
      role: { zh: "IT总监", en: "IT Director" },
      influence: "high" as const,
      isDecisionMaker: false,
    },
    {
      role: { zh: "运营总监", en: "Operations Director" },
      influence: "medium" as const,
      isDecisionMaker: false,
    },
    {
      role: { zh: "采购经理", en: "Procurement Manager" },
      influence: "medium" as const,
      isDecisionMaker: false,
    },
    {
      role: { zh: "项目经理", en: "Project Manager" },
      influence: "medium" as const,
      isDecisionMaker: false,
    },
    {
      role: { zh: "技术负责人", en: "Tech Lead" },
      influence: "medium" as const,
      isDecisionMaker: false,
    },
  ];

  const names = [
    "John Smith",
    "Sarah Lee",
    "Michael Chen",
    "Lisa Wang",
    "David Kim",
    "Jennifer Liu",
    "Robert Brown",
    "Amy Zhang",
    "Tom Wilson",
    "Emily Davis",
  ];
  const relationships: Array<"champion" | "supporter" | "neutral" | "blocker"> =
    ["champion", "supporter", "neutral", "blocker"];

  const contacts: Record<string, Contact[]> = {};

  deals.forEach((deal) => {
    const contactCount = 1 + Math.floor(Math.random() * 3);
    const dealContacts: Contact[] = [];

    for (let i = 0; i < contactCount; i++) {
      const roleTemplate = roleTemplates[i % roleTemplates.length];
      const name = names[(parseInt(deal.id) + i) % names.length];
      const relationship =
        relationships[Math.floor(Math.random() * relationships.length)];

      const lastContactDate = new Date();
      lastContactDate.setDate(
        lastContactDate.getDate() -
          deal.lastActivityDays -
          Math.floor(Math.random() * 10),
      );

      dealContacts.push({
        id: `contact-${deal.id}-${i}`,
        dealId: deal.id,
        name,
        role: roleTemplate.role,
        email: `${name.toLowerCase().replace(" ", ".")}@${deal.company.en.toLowerCase().replace(/[^a-z]/g, "")}.com`,
        phone: `+1 555-0${parseInt(deal.id)}${i}${Math.floor(Math.random() * 10)}`,
        isDecisionMaker: roleTemplate.isDecisionMaker,
        influence: roleTemplate.influence,
        relationship,
        lastContact: lastContactDate.toISOString().split("T")[0],
        notes:
          relationship === "champion"
            ? {
                zh: "积极推动项目，是内部倡导者",
                en: "Actively pushing the project, internal champion",
              }
            : relationship === "blocker"
              ? {
                  zh: "有顾虑需要解决",
                  en: "Has concerns that need to be addressed",
                }
              : {
                  zh: "态度中立，需要更多沟通",
                  en: "Neutral stance, needs more engagement",
                },
      });
    }

    contacts[deal.id] = dealContacts;
  });

  return contacts;
}

export const dealContacts = generateDealContacts();
