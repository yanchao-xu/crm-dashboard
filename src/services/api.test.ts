import { describe, expect, it, vi } from "vitest";
import type { RestApi } from "../../icp-extension.types";
import { DashboardApiService } from "./api";

function createRestApi(post: ReturnType<typeof vi.fn>): RestApi {
  return {
    post,
    get: vi.fn(),
    getStatic: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
}

describe("DashboardApiService - 回款应收优先查询", () => {
  it("按 plannedDate 财年范围查询并标准化 paymentOwner 多个匹配键", async () => {
    const post = vi.fn().mockResolvedValue({
      count: 1,
      results: [{
        id: 1001,
        parentDataId: "contract-1",
        plannedAmount: 10000,
        plannedDate: "2026-04-15",
        actualAmount: 8000,
        actualDate: "2026-05-06",
        paymentStage: "首款",
        paymentOwner: [{
          id: 297,
          uid: "10257",
          value: "jeff.hu@forlandholding.com",
          email: "jeff.hu@forlandholding.com",
          label: "胡剑飞",
        }],
        settlementCurrency: [{ code: "CNY" }],
      }],
    });
    const service = new DashboardApiService(createRestApi(post), "zh");

    const plans = await service.getReceivablePlansByDateRange(
      "2026-04-01",
      "2027-03-31",
    );

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      "/form/api/v3/form-entity-data/contract-management/receivable-plan-form/list",
      expect.objectContaining({
        startRow: 0,
        endRow: 1000,
        filterModel: [{
          colId: "plannedDate",
          filterType: "date",
          type: "inRange",
          dateFrom: "2026-04-01",
          dateTo: "2027-03-31",
        }],
      }),
    );

    expect(plans).toEqual([expect.objectContaining({
      id: "1001",
      parentDataId: "contract-1",
      plannedYearMonth: "2026-04",
      actualYearMonth: "2026-05",
      paymentOwner: "297",
      paymentOwnerName: "胡剑飞",
      paymentOwnerKeys: ["297", "jeff.hu@forlandholding.com", "10257"],
      currencyCode: "CNY",
    })]);
  });

  it("按 parentDataId 去重后使用合同 id 批量反查合同", async () => {
    const post = vi.fn().mockResolvedValue({
      results: [{
        id: 42,
        contractCode: "C-042",
        contractName: "测试合同",
        customer: [{ label: "测试客户" }],
        contractOwner: [],
        totalAmountWithTax: 12000,
        signingDate: "2025-12-01",
        expiryDate: "2026-12-31",
        settlementCurrency: [{ code: "CNY" }],
      }],
    });
    const service = new DashboardApiService(createRestApi(post), "zh");

    const contracts = await service.getContractsByIds(["42", "42", "43"]);

    expect(post).toHaveBeenCalledWith(
      "/form/api/v3/form-entity-data/contract-management/contract-management-form/list",
      expect.objectContaining({
        startRow: 0,
        endRow: 2,
        filterModel: [{
          colId: "id",
          filterType: "set",
          values: ["42", "43"],
        }],
      }),
    );
    expect(contracts).toEqual([expect.objectContaining({
      id: "42",
      contractCode: "C-042",
      customer: "测试客户",
    })]);
  });
});
