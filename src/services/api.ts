import type { RestApi } from "../../icp-extension.types";
import type { Deal, OrgNode, ProductGroup } from "@/types";

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
  expectedClose: string;
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
  quota?: number;
  fiscalStart?: string;
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
  rank: number;
  handle: string;
  parentHandle: string;
  [key: string]: any;
}

// 商机阶段配置类型
export interface OpportunityStage {
  code: string;
  name: string; // 直接使用 codeName，已经是当前语言的值
  rank: number;
}

// API 服务类
export class DashboardApiService {
  private restApi: RestApi;

  constructor(restApi: RestApi) {
    this.restApi = restApi;
  }

  // 获取商机数据（所有图表的数据源头）
  async getOpportunity(): Promise<Deal[]> {
    try {
      const response = await this.restApi.get(
        "/form/api/v2/form-entity-data/opportunity-management/opportunity-management-form/list",
      );

      // 转换 API 数据为应用数据格式
      return await this.transformOpportunityData(response.results || response);
    } catch (error) {
      console.error("Failed to fetch opportunity:", error);
      throw error;
    }
  }

  // 获取商机产品子表数据
  async getOpportunityProducts(parentDataIds: string[]): Promise<any[]> {
    try {
      const response = await this.restApi.get(
        "/form/api/v2/form-entity-data/opportunity-management/opportunity-product-management-subform-form/list",
        {
          params: {
            payload: JSON.stringify({
              filterModel: [
                {
                  colId: "parentDataId",
                  filterType: "set",
                  values: parentDataIds,
                },
              ],
              needCount: false,
            }),
          },
        },
      );

      return response.results || response || [];
    } catch (error) {
      console.error("Failed to fetch opportunity products:", error);
      return [];
    }
  }

  // 获取组织数据
  async getOrganizations(): Promise<OrgNode> {
    try {
      const response = await this.restApi.get(
        "/form/api/v2/form-entity-data/basic-system-setting/self-organization-info-form/list",
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

  // 获取产品数据
  async getProducts(): Promise<ProductGroup[]> {
    try {
      const response = await this.restApi.get(
        "/form/api/v2/form-entity-data/product-management/product-management-form/list",
      );

      // 转换 API 数据为产品组格式
      return this.transformProductsData(response.results || response);
    } catch (error) {
      console.error("Failed to fetch products:", error);
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

  // 转换商机数据
  private async transformOpportunityData(rawData: any[]): Promise<Deal[]> {
    if (!Array.isArray(rawData)) {
      return [];
    }

    const parentDataIds = rawData.map((item) => item.id);
    // 获取商机产品数据
    const productData = await this.getOpportunityProducts(parentDataIds);

    // 构建商机ID到产品ID数组的映射
    const opportunityProductMap = new Map<string, string[]>();

    productData.forEach((product: any) => {
      const parentDataId = product.parentDataId;
      if (
        parentDataId &&
        product.productName &&
        Array.isArray(product.productName) &&
        product.productName.length > 0
      ) {
        const productId = product.productName[0]?.id;
        if (productId) {
          if (!opportunityProductMap.has(parentDataId)) {
            opportunityProductMap.set(parentDataId, []);
          }
          opportunityProductMap.get(parentDataId)!.push(productId);
        }
      }
    });
    return rawData.map((item: LeadRawData) => {
      // 计算创建月份
      const createdDate =
        item.creationTime || item.createdDate || item.expectedClose;
      const month = createdDate
        ? this.getMonthFromDate(createdDate)
        : undefined;

      // 使用 code 字段（用于数据聚合），如果没有则使用 label
      const stageValue =
        item.opportunityStage?.[0]?.label ||
        item.opportunityStage?.[0]?.code ||
        "";

      // 获取该商机的产品ID数组

      const productIds = opportunityProductMap.get(item.id?.toString()) || [];

      // 计算最后活跃天数
      const lastActivityDays = item.lastUpdate
        ? Math.floor(
            (Date.now() -
              new Date(item.lastUpdate.replace(/\//g, "-")).getTime()) /
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
        stage: stageValue,
        lastActivityDays,
        probability: Number(item.aiWinRatePrediction) || 0,
        owner: item.opportunityOwner?.[0]?.label || "",
        expectedClose: item.expectedDealTime || "",
        productGroup: productIds.length > 0 ? productIds : undefined,
        createdMonth: month,
      };
    });
  }

  // 转换组织数据为树结构
  private transformOrgData(rawData: any): OrgNode {
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
      const node: OrgNode = {
        id: item.id,
        name: {
          zh: item.name || "",
          en: item.name || "",
        },
        type: item.type || "team",
        quota: item.quota,
        fiscalStart: item.fiscalStart,
        children: [],
      };
      orgMap.set(item.id, node);
    });

    // 第二遍：建立父子关系
    dataArray.forEach((item: OrgRawData) => {
      const node = orgMap.get(item.id);
      if (!node) return;

      if (item.parentId) {
        const parent = orgMap.get(item.parentId);
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

  // 转换产品数据
  private transformProductsData(rawData: any[]): ProductGroup[] {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((item: ProductRawData) => ({
      id: item.id,
      name: {
        zh: item.productName || "",
        en: item.productName || "",
      },
    }));
  }

  // 转换商机阶段数据
  private transformStagesData(
    rawData: DataDictionaryRawData[],
  ): OpportunityStage[] {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData
      .map((item) => ({
        code: item.codeName || item.code,
        name: item.codeName, // codeName 已经是当前语言的值
        rank: item.rank || 0,
      }))
      .sort((a, b) => a.rank - b.rank);
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
}
