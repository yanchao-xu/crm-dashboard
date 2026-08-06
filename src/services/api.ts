import type { RestApi } from "../../icp-extension.types";
import type {
  Deal,
  OrgNode,
  ProductGroup,
  Contract,
  ReceivablePlan,
  CurrencyItem,
  ExchangeRate,
} from "@/types";
import { toLocale } from "@/lib/language";
import type { Language } from "@/lib/language";

// 商机原始数据类型（从 API 返回）
interface LeadRawData {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  lastActivityDays: number;
  probability: number;
  owner: string;
  productGroup?: string;
  createdMonth?: string;
  createdDate?: string;
  [key: string]: any;
}

// 组织原始数据类型
interface OrgRawData {
  id: string;
  name: string;
  type: "company" | "school" | "team" | "person";
  parentId?: string;
  [key: string]: any;
}

// 产品原始数据类型
interface ProductRawData {
  id: string;
  name: string;
  [key: string]: any;
}

// 数据字典原始数据类型（商机阶段配置）
interface DataDictionaryRawData {
  code: string;
  codeName: string;
  enable: string;
  handle: string;
  parentHandle: string;
  sorting?: number | string;
  [key: string]: any;
}

// 商机阶段配置类型
export interface OpportunityStage {
  code: string;
  name: string; // 直接使用 codeName，已经是当前语言的值
  sorting?: number; // 数字越小，阶段越靠前
}

// API 服务类
export class DashboardApiService {
  private restApi: RestApi;
  private language: Language;

  constructor(restApi: RestApi, language: string = "zh") {
    this.restApi = restApi;
    this.language = language as Language;
  }

  // 根据当前语言获取 i18n 字段值
  // API 返回的字段格式: fieldName_i18n_zh-CN, fieldName_i18n_en-US, fieldName_i18n_ja-JP
  private getI18nValue(item: Record<string, any>, fieldName: string): string {
    const locale = toLocale(this.language);
    const i18nKey = `${fieldName}_i18n_${locale}`;
    return item[i18nKey] || item[fieldName] || "";
  }

  // 获取商机数据（所有图表的数据源头）
  // dateFrom/dateTo 为财年范围，未传入时使用当前自然年
  async getOpportunity(dateFrom?: string, dateTo?: string): Promise<Deal[]> {
    try {
      const currentYear = new Date().getFullYear();
      const from = dateFrom || `${currentYear}-01-01`;
      const to = dateTo || `${currentYear}-12-31`;
      const response = await this.restApi.get(
        "/form/api/v2/form-entity-data/opportunity-management/opportunity-management-form/list",
        {
          params: {
            payload: JSON.stringify({
              filterModel: [
                {
                  colId: "expectedDealTime",
                  filterType: "date",
                  type: "inRange",
                  dateFrom: from,
                  dateTo: to,
                },
                // {
                //   colId: "Status",
                //   filterType: "set",
                //   type: "notIn",
                //   values: ["草稿"],
                // },
              ],
              selectColId: [
                "expectedDealTime",
                "creationTime",
                "opportunityName",
                "customerName",
                "expectedTransactionAmount",
                "opportunityStage",
                "eventDate",
                "winRate",
                "opportunityOwner",
                "productLine",
                "businessAmount",
                "contractNumber",
                "settlementCurrency",
              ],
            }),
          },
        },
      );

      // 转换 API 数据为应用数据格式
      return await this.transformOpportunityData(response.results || response);
    } catch (error) {
      console.error("Failed to fetch opportunity:", error);
      throw error;
    }
  }

  // 获取组织数据
  async getOrganizations(): Promise<OrgNode> {
    try {
      const response = await this.restApi.get(
        "/form/api/v2/form-entity-data/basic-system-setting/self-organization-info-form/list",
        {
          params: {
            payload: JSON.stringify({
              selectColId: [
                "name",
                "organizationType",
                "organizationId",
                "memberName",
                "janJanuary",
                "febFebruary",
                "marMarch",
                "aprApril",
                "mayMay",
                "junJune",
                "julJuly",
                "augAugust",
                "sepSeptember",
                "octOctober",
                "novNovember",
                "decDecember",
                "leadToQualification",
                "qualificationToDiscovery",
                "discoveryToProposal",
                "proposalToNegotiation",
                "negotiationToWin",
                "negotiationToLoss",
                "theStartDateOfTheFiscalYear",
                "theEndDateOfTheFiscalYear",
                "settlementCurrency",
              ],
            }),
          },
        },
      );

      // 尝试多种可能的数据路径
      const rawData = response.results || response;

      // 转换 API 数据为组织树结构
      return this.transformOrgData(rawData);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      throw error;
    }
  }

  // 获取产品线数据（数据字典）
  async getProducts(): Promise<ProductGroup[]> {
    try {
      const response = await this.restApi.post(
        "/form/api/v3/form-entity-data/basic-system-setting/data-dictionary/list",
        {
          filterModel: [
            {
              colId: "parentHandle",
              filterType: "text",
              type: "equals",
              filter: "productSeries",
            },
          ],
          needCount: false,
          selectColId: ["code", "codeName"],
        },
      );

      // 转换 API 数据为产品线格式
      return this.transformProductsData(response.results || response);
    } catch (error) {
      console.error("Failed to fetch product lines:", error);
      throw error;
    }
  }

  // 获取商机阶段配置（数据字典）
  async getOpportunityStages(): Promise<OpportunityStage[]> {
    try {
      const response = await this.restApi.get(
        "/form/api/v2/form-entity-data/basic-system-setting/data-dictionary/list",
        {
          params: {
            payload: JSON.stringify({
              filterModel: [
                {
                  colId: "parentHandle",
                  filterType: "text",
                  type: "equals",
                  filter: "opportunityStage",
                },
                {
                  colId: "label",
                  filterType: "text",
                  type: "contains",
                  filter: "CRM",
                },
              ],
              needCount: false,
              selectColId: ["code", "codeName", "sorting"],
            }),
          },
        },
      );

      const rawData = response.results || response;
      return this.transformStagesData(rawData);
    } catch (error) {
      console.error("Failed to fetch opportunity stages:", error);
      throw error;
    }
  }
  // 获取线索总数（用于漏斗图第一阶段转化率计算）
  async getLeadCount(dateFrom?: string, dateTo?: string): Promise<number> {
    try {
      const currentYear = new Date().getFullYear();
      const from = dateFrom || `${currentYear}-01-01`;
      const to = dateTo || `${currentYear}-12-31`;
      const response = await this.restApi.get(
        "/form/api/v2/form-entity-data/lead-management/lead-management-form/list",
        {
          params: {
            payload: JSON.stringify({
              filterModel: [
                {
                  colId: "createdTime",
                  filterType: "date",
                  type: "inRange",
                  dateFrom: from,
                  dateTo: to,
                },
              ],
              selectColId: ["createdTime"],
            }),
          },
        },
      );
      const result = response.count || 0;
      return result;
    } catch (error) {
      console.error("Failed to fetch lead count:", error);
      return 0;
    }
  }

  // 根据合同编号批量获取合同数据
  async getContracts(contractNumbers: string[]): Promise<Contract[]> {
    if (contractNumbers.length === 0) return [];

    try {
      const response = await this.restApi.post(
        "/form/api/v3/form-entity-data/contract-management/contract-management-form/list",
        {
          filterModel: [
            {
              colId: "contractCode",
              filterType: "set",
              values: contractNumbers,
            },
          ],
          selectColId: [
            "contractCode",
            "contractName",
            "customer",
            "contractOwner",
            "totalAmountWithTax",
            "signingDate",
            "expiryDate",
            "settlementCurrency",
          ],
        },
      );
      const rawData = response.results || response;
      if (Array.isArray(rawData)) {
        return rawData.map((item: any) => this.transformContractData(item));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      return [];
    }
  }

  // 根据签约日期范围获取合同数据（用于回款健康度，独立于商机）
  async getContractsByDateRange(
    dateFrom: string,
    dateTo: string,
  ): Promise<Contract[]> {
    try {
      const response = await this.restApi.post(
        "/form/api/v3/form-entity-data/contract-management/contract-management-form/list",
        {
          filterModel: [
            {
              colId: "signingDate",
              filterType: "date",
              type: "inRange",
              dateFrom,
              dateTo,
            },
          ],
          selectColId: [
            "contractCode",
            "contractName",
            "customer",
            "contractOwner",
            "totalAmountWithTax",
            "signingDate",
            "expiryDate",
            "settlementCurrency",
          ],
        },
      );
      const rawData = response.results || response;
      if (Array.isArray(rawData)) {
        return rawData.map((item: any) => this.transformContractData(item));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch contracts by date range:", error);
      return [];
    }
  }

  // 根据合同ID批量获取合同数据（用于应收计划反查合同）
  async getContractsByIds(contractIds: string[]): Promise<Contract[]> {
    const uniqueIds = [...new Set(contractIds.map(String).filter(Boolean))];
    if (uniqueIds.length === 0) return [];

    const contracts: Contract[] = [];
    const batchSize = 500;

    try {
      for (let i = 0; i < uniqueIds.length; i += batchSize) {
        const ids = uniqueIds.slice(i, i + batchSize);
        const response = await this.restApi.post(
          "/form/api/v3/form-entity-data/contract-management/contract-management-form/list",
          {
            startRow: 0,
            endRow: ids.length,
            filterModel: [
              {
                colId: "id",
                filterType: "set",
                values: ids,
              },
            ],
            selectColId: [
              "contractCode",
              "contractName",
              "customer",
              "contractOwner",
              "totalAmountWithTax",
              "signingDate",
              "expiryDate",
              "settlementCurrency",
            ],
          },
        );
        const rawData = response.results || response;
        if (Array.isArray(rawData)) {
          contracts.push(
            ...rawData.map((item: any) => this.transformContractData(item)),
          );
        }
      }
      return contracts;
    } catch (error) {
      console.error("Failed to fetch contracts by ids:", error);
      return [];
    }
  }

  // 转换合同数据
  private transformContractData(item: any): Contract {
    const signingDate = item.signingDate || "";
    return {
      id: String(item.id),
      contractCode: item.contractCode || "",
      contractName: item.contractName || "",
      customer: item.customer?.[0]?.label || "",
      owner: this.extractOwnerKey(item.contractOwner),
      ownerName: this.extractOwnerName(item.contractOwner),
      totalAmountWithTax: Number(item.totalAmountWithTax) || 0,
      signingDate,
      expiryDate: item.expiryDate || "",
      signingMonth: signingDate
        ? this.getMonthFromDate(signingDate)
        : undefined,
      signingYearMonth: signingDate
        ? this.getYearMonthFromDate(signingDate)
        : undefined,
      currencyCode: this.extractCurrencyCode(item.settlementCurrency),
    };
  }

  // 根据计划收款日期范围分页获取应收计划（用于回款模块）
  async getReceivablePlansByDateRange(
    dateFrom: string,
    dateTo: string,
  ): Promise<ReceivablePlan[]> {
    const rawPlans: any[] = [];
    const pageSize = 1000;
    let startRow = 0;

    try {
      while (true) {
        const response = await this.restApi.post(
          "/form/api/v3/form-entity-data/contract-management/receivable-plan-form/list",
          {
            startRow,
            endRow: startRow + pageSize,
            filterModel: [
              {
                colId: "plannedDate",
                filterType: "date",
                type: "inRange",
                dateFrom,
                dateTo,
              },
            ],
            selectColId: [
              "parentDataId",
              "actualAmount",
              "actualDate",
              "plannedAmount",
              "plannedDate",
              "paymentStage",
              "paymentOwner",
              "settlementCurrency",
            ],
          },
        );

        const page = response.results || response;
        if (!Array.isArray(page) || page.length === 0) break;
        rawPlans.push(...page);

        const total =
          typeof response.count === "number" ? response.count : undefined;
        if (
          page.length < pageSize ||
          (total !== undefined && rawPlans.length >= total)
        ) {
          break;
        }
        startRow += page.length;
      }

      return rawPlans
        .map((item: any) => this.transformReceivablePlanData(item))
        .filter((plan) => plan.plannedAmount > 0 && !!plan.plannedDate);
    } catch (error) {
      console.error("Failed to fetch receivable plans by date range:", error);
      return [];
    }
  }

  // 根据合同ID批量获取应收计划数据
  async getReceivablePlans(contractIds: string[]): Promise<ReceivablePlan[]> {
    if (contractIds.length === 0) return [];

    try {
      const response = await this.restApi.post(
        "/form/api/v3/form-entity-data/contract-management/receivable-plan-form/list",
        {
          filterModel: [
            {
              colId: "parentDataId",
              filterType: "set",
              values: contractIds,
            },
          ],
          selectColId: [
            "parentDataId",
            "actualAmount",
            "actualDate",
            "plannedAmount",
            "plannedDate",
            "paymentStage",
            "paymentOwner",
            "settlementCurrency",
          ],
        },
      );
      const rawData = response.results || response;
      if (Array.isArray(rawData)) {
        return rawData
          .map((item: any) => this.transformReceivablePlanData(item))
          .filter(
            (rp) =>
              (rp.actualAmount > 0 && rp.actualDate) ||
              (rp.plannedAmount > 0 && rp.plannedDate),
          );
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch receivable plans:", error);
      return [];
    }
  }

  // 获取公司基础配置中的默认结算币种 code
  async getCompanyDefaultCurrency(): Promise<string | null> {
    try {
      const response = await this.restApi.post(
        "/form/api/v3/form-entity-data/basic-system-setting/company-basic-config/list",
        {
          selectColId: ["settlementCurrency"],
        },
      );

      const results = response.results || response;
      if (Array.isArray(results) && results.length > 0) {
        const currencyCode = results[0].settlementCurrency?.[0]?.code;
        return currencyCode || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch company default currency:", error);
      return null;
    }
  }

  // 获取币种列表（数据字典）
  async getCurrencies(): Promise<CurrencyItem[]> {
    try {
      const response = await this.restApi.post(
        "/form/api/v3/form-entity-data/basic-system-setting/data-dictionary/list",
        {
          filterModel: [
            {
              colId: "parentHandle",
              filterType: "text",
              type: "equals",
              filter: "settlementCurrency",
            },
          ],
          needCount: false,
          selectColId: ["code", "codeName"],
        },
      );

      const rawData = response.results || response;
      return this.transformCurrencyData(rawData);
    } catch (error) {
      console.error("Failed to fetch currencies:", error);
      throw error;
    }
  }

  // 获取汇率表
  async getExchangeRates(currencies?: CurrencyItem[]): Promise<ExchangeRate[]> {
    try {
      // 如果没传入币种列表，内部自行获取
      const currencyList =
        currencies && currencies.length > 0
          ? currencies
          : await this.getCurrencies();

      const response = await this.restApi.post(
        "/form/api/v3/form-entity-data/basic-system-setting/exchange-rate-management-form/list",
        {
          selectColId: ["fromCurrency", "toCurrency", "rate"],
        },
      );

      const rawData = response.results || response;
      return this.transformExchangeRateData(rawData, currencyList);
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      return [];
    }
  }

  // 解析 settlementCurrency 字段的币种 code
  // 优先取 code 字段（新数据），fallback 取 value（可能是 code 也可能是 id）
  private extractCurrencyCode(
    settlementCurrency: any[] | undefined,
  ): string | undefined {
    if (!settlementCurrency || settlementCurrency.length === 0)
      return undefined;
    const item = settlementCurrency[0];
    if (item.code) return item.code;
    if (item.value != null) return String(item.value);
    return undefined;
  }

  // 解析汇率表中的币种 value：可能是 id("25887") 也可能是 code("CNY")
  // 通过币种字典统一转成 code
  private resolveCurrencyCode(
    value: string | number,
    currencies: CurrencyItem[],
  ): string | undefined {
    const strValue = String(value);
    // 先当 code 找
    const byCode = currencies.find((c) => c.code === strValue);
    if (byCode) return byCode.code;
    // 找不到就当 id 找（兼容 id 可能是数字或字符串）
    const byId = currencies.find((c) => String(c.id) === strValue);
    return byId?.code;
  }

  // 转换汇率数据
  private transformExchangeRateData(
    rawData: any[],
    currencies: CurrencyItem[],
  ): ExchangeRate[] {
    if (!Array.isArray(rawData)) {
      return [];
    }
    return rawData
      .filter(
        (item: any) =>
          item.fromCurrency?.[0] && item.toCurrency?.[0] && item.rate,
      )
      .map((item: any) => ({
        fromCurrencyCode:
          this.resolveCurrencyCode(item.fromCurrency[0].value, currencies) ||
          "",
        toCurrencyCode:
          this.resolveCurrencyCode(item.toCurrency[0].value, currencies) || "",
        rate: Number(item.rate) || 0,
      }))
      .filter((r) => r.fromCurrencyCode && r.toCurrencyCode);
  }

  // 转换币种数据
  private transformCurrencyData(rawData: any[]): CurrencyItem[] {
    if (!Array.isArray(rawData)) {
      return [];
    }
    return rawData.map((item: any) => ({
      id: String(item.id),
      code: item.code,
      name: this.getI18nValue(item, "codeName"),
    }));
  }

  // 转换应收计划数据
  private transformReceivablePlanData(item: any): ReceivablePlan {
    const actualDate = item.actualDate || "";
    const plannedDate = item.plannedDate || "";
    const paymentOwnerKeys = this.extractOwnerKeys(item.paymentOwner);
    return {
      id: String(item.id),
      parentDataId: String(item.parentDataId || ""),
      actualAmount: Number(item.actualAmount) || 0,
      actualDate,
      actualMonth: actualDate ? this.getMonthFromDate(actualDate) : undefined,
      actualYearMonth: actualDate
        ? this.getYearMonthFromDate(actualDate)
        : undefined,
      plannedAmount: Number(item.plannedAmount) || 0,
      plannedDate,
      plannedMonth: plannedDate
        ? this.getMonthFromDate(plannedDate)
        : undefined,
      plannedYearMonth: plannedDate
        ? this.getYearMonthFromDate(plannedDate)
        : undefined,
      paymentStage: item.paymentStage || "",
      paymentOwner: paymentOwnerKeys[0] || "",
      paymentOwnerName: this.extractOwnerName(item.paymentOwner),
      paymentOwnerKeys,
      currencyCode: this.extractCurrencyCode(item.settlementCurrency),
    };
  }

  // 转换商机数据
  private async transformOpportunityData(rawData: any[]): Promise<Deal[]> {
    if (!Array.isArray(rawData)) {
      return [];
    }

    const results = rawData.map((item: LeadRawData) => {
      // 计算创建月份
      // important: 我们按照了expectedDealTime 而没有按照创建时间
      const createdDate =
        item.expectedDealTime || item.creationTime || item.createdDate;
      const month = createdDate
        ? this.getMonthFromDate(createdDate)
        : undefined;
      const yearMonth = createdDate
        ? this.getYearMonthFromDate(createdDate)
        : undefined;

      // 从 productLine 字段提取产品线 ID 列表
      // productLine 格式: [{id: 16700, value: "16700", label: "CRM", ...}] 或 []
      const productLineArr: string[] = Array.isArray(item.productLine)
        ? item.productLine.map((pl: any) => String(pl.value)).filter(Boolean)
        : [];

      // 计算最后活跃天数
      const lastActivityDays = item.eventDate
        ? Math.floor(
            (Date.now() -
              new Date(item.eventDate.replace(/\//g, "-")).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;
      return {
        id: item.id,
        name: {
          zh: item.opportunityName || "",
          en: item.opportunityName || "",
        },
        company: {
          zh: item.customerName?.[0]?.label || "",
          en: item.customerName?.[0]?.label || "",
        },
        value: Number(item.expectedTransactionAmount) || 0,
        stage: item.opportunityStage?.[0]?.code,
        lastActivityDays,
        probability: Number(item.winRate) || 0,
        owner: this.extractOwnerKey(item.opportunityOwner),
        ownerName: this.extractOwnerName(item.opportunityOwner),
        productLine: productLineArr,
        createdMonth: month,
        createdYearMonth: yearMonth,
        businessAmount: Number(item.businessAmount) || 0,
        contractNumber: item.contractNumber || undefined,
        currencyCode: this.extractCurrencyCode(item.settlementCurrency),
      };
    });

    return results;
  }

  // 转换组织数据为树结构
  private transformOrgData(rawData: any): OrgNode {
    const types = ["company", "team", "person", "district"];
    // 如果不是数组，尝试提取数组
    let dataArray: any[] = [];
    if (Array.isArray(rawData)) {
      dataArray = rawData;
    } else if (rawData && typeof rawData === "object") {
      // 尝试从对象中提取数组
      dataArray = rawData.results || rawData.data || rawData.list || [];
    }

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      // 返回默认根节点
      return {
        id: "root",
        name: { zh: "组织", en: "Organization" },
        type: "company",
        children: [],
      };
    }

    // 构建组织树
    const orgMap = new Map<string, OrgNode>();
    const rootNodes: OrgNode[] = [];

    // 第一遍：创建所有节点
    dataArray.forEach((item: OrgRawData) => {
      const itemType = item.organizationType?.[0]?.code;
      const node: OrgNode = {
        id: item.id,
        name: {
          zh: item.name || "",
          en: item.name || "",
        },
        type: types.includes(itemType) ? itemType : "person",
        children: [],
        memberEmail: item.memberName?.[0]?.email || undefined,
        memberId:
          item.memberName?.[0]?.value !== undefined &&
          item.memberName?.[0]?.value !== null
            ? String(item.memberName[0].value)
            : item.memberName?.[0]?.id !== undefined &&
                item.memberName?.[0]?.id !== null
              ? String(item.memberName[0].id)
              : undefined,
        currencyCode: this.extractCurrencyCode(item.settlementCurrency),
        janJanuary: item.janJanuary,
        febFebruary: item.febFebruary,
        marMarch: item.marMarch,
        aprApril: item.aprApril,
        mayMay: item.mayMay,
        junJune: item.junJune,
        julJuly: item.julJuly,
        augAugust: item.augAugust,
        sepSeptember: item.sepSeptember,
        octOctober: item.octOctober,
        novNovember: item.novNovember,
        decDecember: item.decDecember,
        leadToQualification: item.leadToQualification,
        qualificationToDiscovery: item.qualificationToDiscovery,
        discoveryToProposal: item.discoveryToProposal,
        proposalToNegotiation: item.proposalToNegotiation,
        negotiationToWin: item.negotiationToWin,
        negotiationToLoss: item.negotiationToLoss,
        theStartDateOfTheFiscalYear: item.theStartDateOfTheFiscalYear,
        theEndDateOfTheFiscalYear: item.theEndDateOfTheFiscalYear,
      };
      orgMap.set(item.id?.toString(), node);
    });

    // 第二遍：建立父子关系
    dataArray.forEach((item: OrgRawData) => {
      const node = orgMap.get(item.id?.toString());
      if (!node) return;

      if (item.organizationId) {
        const parent = orgMap.get(item.organizationId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // 返回第一个根节点，或创建一个包含所有根节点的虚拟根节点
    if (rootNodes.length === 1) {
      return rootNodes[0];
    } else {
      return {
        id: "root",
        name: { zh: "组织", en: "Organization" },
        type: "company",
        children: rootNodes,
      };
    }
  }

  // 转换产品线数据
  private transformProductsData(rawData: any[]): ProductGroup[] {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((item: any) => ({
      id: String(item.id),
      name: this.getI18nValue(item, "codeName"),
    }));
  }
  // 转换商机阶段数据
  private transformStagesData(
    rawData: DataDictionaryRawData[],
  ): OpportunityStage[] {
    if (!Array.isArray(rawData)) {
      return [];
    }

    const stages = rawData.map((item, index) => {
      const hasSorting =
        item.sorting !== undefined &&
        item.sorting !== null &&
        String(item.sorting).trim() !== "";
      const numericSorting = hasSorting ? Number(item.sorting) : Number.NaN;
      const sorting = Number.isFinite(numericSorting)
        ? numericSorting
        : undefined;
      const name = this.getI18nValue(item, "codeName");
      return {
        code: item.code,
        name,
        sorting,
        index,
      };
    });

    // 未配置 sorting 时保留接口原始顺序（接口默认按时间排序）。
    return stages
      .sort((a, b) => {
        if (a.sorting !== undefined && b.sorting !== undefined) {
          return a.sorting - b.sorting;
        }
        if (a.sorting !== undefined) return -1;
        if (b.sorting !== undefined) return 1;
        return a.index - b.index;
      })
      .map(({ index: _index, ...stage }) => stage);
  }

  // 提取负责人匹配键（用于组织筛选，统一转字符串，兼容 id 数字/字符串、email 两种 value 格式）
  private extractOwnerKey(
    ownerArr?: { value?: string | number; label?: string }[],
  ): string {
    const item = ownerArr?.[0];
    if (!item) return "";
    if (item.value !== undefined && item.value !== null && item.value !== "") {
      return String(item.value);
    }
    return item.label || "";
  }

  // 提取负责人的全部稳定标识；paymentOwner.value 在真实数据中可能是 email。
  private extractOwnerKeys(
    ownerArr?: Array<{
      id?: string | number;
      uid?: string | number;
      value?: string | number;
      email?: string;
    }>,
  ): string[] {
    const keys = new Set<string>();
    ownerArr?.forEach((owner) => {
      [owner.id, owner.value, owner.email, owner.uid].forEach((value) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          keys.add(String(value).trim());
        }
      });
    });
    return [...keys];
  }

  // 提取负责人显示名（用于表格展示，直接取 label，不依赖组织树覆盖范围）
  private extractOwnerName(
    ownerArr?: { value?: string | number; label?: string }[],
  ): string {
    const item = ownerArr?.[0];
    if (!item) return "";
    return item.label || (item.value !== undefined ? String(item.value) : "");
  }

  // 从日期字符串获取月份
  private getMonthFromDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months[date.getMonth()];
    } catch {
      return "Jan";
    }
  }

  // 从日期字符串获取 "YYYY-MM" 格式的年月标识，用于跨年财年匹配
  private getYearMonthFromDate(dateStr: string): string | undefined {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return undefined;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    } catch {
      return undefined;
    }
  }
}
