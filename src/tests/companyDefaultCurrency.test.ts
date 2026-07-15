import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardApiService } from "@/services/api";

// ─── Mock restApi ───────────────────────────────────────────

function createMockRestApi(postResponse: any = {}) {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue(postResponse),
  };
}

// ─── 真实 API 响应数据（来自 testData.md） ───────────────────

const companyConfigResponse = {
  count: 1,
  results: [
    {
      companySlogan: "More green more power",
      companyNameZh: "无锡福兰德科技有限公司",
      companyNameEn: "Wuxi Forland Technology Co., Ltd.",
      settlementCurrency: [
        {
          pbcToken: "basic-system-setting",
          code: "SGD",
          label_i18n_zh_CN: "新加坡元",
          formEntityToken: "data-dictionary",
          label_i18n_en_US: "SGD",
          label: "新加坡元",
          id: 24824,
          value: "SGD",
        },
      ],
      deleted: false,
      formEntityToken: "company-basic-config",
    },
  ],
};

const companyConfigResponseCNY = {
  count: 1,
  results: [
    {
      settlementCurrency: [
        {
          code: "CNY",
          label: "人民币",
          id: 25887,
          value: "CNY",
        },
      ],
    },
  ],
};

const companyConfigEmptyCurrency = {
  count: 1,
  results: [
    {
      settlementCurrency: [],
    },
  ],
};

const companyConfigNoCurrencyField = {
  count: 1,
  results: [
    {
      companyNameZh: "无锡福兰德科技有限公司",
    },
  ],
};

const companyConfigEmptyResults = {
  count: 0,
  results: [],
};

// ─── 测试用例 ───────────────────────────────────────────────

describe("getCompanyDefaultCurrency - 公司基础配置默认币种", () => {
  let mockRestApi: any;
  let apiService: DashboardApiService;

  beforeEach(() => {
    mockRestApi = createMockRestApi();
    apiService = new DashboardApiService(mockRestApi, "zh");
  });

  it("正常返回公司配置的结算币种 code（如 SGD）", async () => {
    mockRestApi.post.mockResolvedValue(companyConfigResponse);
    const result = await apiService.getCompanyDefaultCurrency();
    expect(result).toBe("SGD");
  });

  it("正常返回 CNY", async () => {
    mockRestApi.post.mockResolvedValue(companyConfigResponseCNY);
    const result = await apiService.getCompanyDefaultCurrency();
    expect(result).toBe("CNY");
  });

  it("settlementCurrency 为空数组时返回 null", async () => {
    mockRestApi.post.mockResolvedValue(companyConfigEmptyCurrency);
    const result = await apiService.getCompanyDefaultCurrency();
    expect(result).toBeNull();
  });

  it("results[0] 不含 settlementCurrency 字段时返回 null", async () => {
    mockRestApi.post.mockResolvedValue(companyConfigNoCurrencyField);
    const result = await apiService.getCompanyDefaultCurrency();
    expect(result).toBeNull();
  });

  it("results 为空数组时返回 null", async () => {
    mockRestApi.post.mockResolvedValue(companyConfigEmptyResults);
    const result = await apiService.getCompanyDefaultCurrency();
    expect(result).toBeNull();
  });

  it("API 报错时返回 null（不抛异常）", async () => {
    mockRestApi.post.mockRejectedValue(new Error("Network error"));
    const result = await apiService.getCompanyDefaultCurrency();
    expect(result).toBeNull();
  });

  it("请求的 API 路径和 payload 正确", async () => {
    mockRestApi.post.mockResolvedValue(companyConfigResponse);
    await apiService.getCompanyDefaultCurrency();

    expect(mockRestApi.post).toHaveBeenCalledWith(
      "/form/api/v3/form-entity-data/basic-system-setting/company-basic-config/list",
      { selectColId: ["settlementCurrency"] },
    );
  });

  it("response 直接是数组（无 results 包装）时也能正常解析", async () => {
    mockRestApi.post.mockResolvedValue([
      {
        settlementCurrency: [{ code: "EUR", id: 21172, value: "EUR" }],
      },
    ]);
    const result = await apiService.getCompanyDefaultCurrency();
    expect(result).toBe("EUR");
  });

  it("settlementCurrency[0] 无 code 字段时返回 null", async () => {
    mockRestApi.post.mockResolvedValue({
      count: 1,
      results: [
        {
          settlementCurrency: [{ label: "人民币", id: 25887, value: "CNY" }],
        },
      ],
    });
    const result = await apiService.getCompanyDefaultCurrency();
    expect(result).toBeNull();
  });
});

describe("默认币种选择逻辑 - 优先级验证", () => {
  /**
   * 模拟 Index.tsx 中的默认币种选择逻辑（纯函数提取）
   * 优先级：公司配置结算币种 > 币种列表第一项
   */
  function resolveDefaultCurrency(
    currencies: Array<{ code: string; id: string; name: string }>,
    companyDefaultCurrency: string | null,
    companyDefaultCurrencyLoading: boolean,
  ): string | null {
    if (currencies.length === 0 || companyDefaultCurrencyLoading) {
      return null; // 还不能决定
    }
    if (companyDefaultCurrency && currencies.some((c) => c.code === companyDefaultCurrency)) {
      return companyDefaultCurrency;
    }
    return currencies[0].code;
  }

  const currencies = [
    { code: "CNY", id: "25887", name: "人民币" },
    { code: "SGD", id: "24824", name: "新加坡元" },
    { code: "USD", id: "21171", name: "美元" },
  ];

  it("公司配置 SGD 且在列表中 → 选 SGD", () => {
    const result = resolveDefaultCurrency(currencies, "SGD", false);
    expect(result).toBe("SGD");
  });

  it("公司配置 CNY 且在列表中 → 选 CNY", () => {
    const result = resolveDefaultCurrency(currencies, "CNY", false);
    expect(result).toBe("CNY");
  });

  it("公司配置 GBP 但不在列表中 → fallback 到列表第一项 CNY", () => {
    const result = resolveDefaultCurrency(currencies, "GBP", false);
    expect(result).toBe("CNY");
  });

  it("公司配置为 null → fallback 到列表第一项 CNY", () => {
    const result = resolveDefaultCurrency(currencies, null, false);
    expect(result).toBe("CNY");
  });

  it("公司配置仍在加载中 → 返回 null（不做选择）", () => {
    const result = resolveDefaultCurrency(currencies, null, true);
    expect(result).toBeNull();
  });

  it("币种列表为空 → 返回 null（不做选择）", () => {
    const result = resolveDefaultCurrency([], "SGD", false);
    expect(result).toBeNull();
  });

  it("公司配置加载中 + 币种列表已就绪 → 等待（返回 null）", () => {
    const result = resolveDefaultCurrency(currencies, null, true);
    expect(result).toBeNull();
  });

  it("两者都加载完成，公司配置为空字符串 → fallback 到列表第一项", () => {
    const result = resolveDefaultCurrency(currencies, "", false);
    expect(result).toBe("CNY");
  });
});
