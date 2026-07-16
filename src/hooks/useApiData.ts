import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useOptionalRestApi } from "@/contexts/ApiContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardApiService, OpportunityStage } from "@/services/api";
import type { OrgNode, Deal, Contract, ReceivablePlan, CurrencyItem, ExchangeRate } from "@/types";
import { ExchangeRateService } from "@/services/exchangeRate";

// 通用数据获取 hook
function useApiData<T>(fetchFn: (() => Promise<T>) | null, emptyData: T) {
  const [data, setData] = useState<T>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 使用 ref 来避免 emptyData 引起的重复渲染
  const emptyDataRef = useRef(emptyData);
  const hasFetchedRef = useRef(false);
  const fetchFnRef = useRef(fetchFn);

  // 更新 fetchFn ref
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    const currentFetchFn = fetchFnRef.current;

    if (!currentFetchFn) {
      setData(emptyDataRef.current);
      setLoading(false);
      return;
    }

    // 防止重复请求
    if (hasFetchedRef.current) {
      return;
    }

    let mounted = true;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await currentFetchFn();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error("API fetch error:", err);
          setData(emptyDataRef.current);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []); // 空依赖数组，只执行一次

  return { data, loading, error };
}

// 根据组织节点的财年月日 + 用户选中的年份，计算实际的 dateFrom / dateTo
export function computeFiscalRange(
  orgStructure: OrgNode,
  selectedYear: number,
): { dateFrom: string; dateTo: string } {
  const orgForFiscal = orgStructure.theStartDateOfTheFiscalYear
    ? orgStructure
    : orgStructure.children?.[0] || orgStructure;
  const startStr = orgForFiscal.theStartDateOfTheFiscalYear;
  const endStr = orgForFiscal.theEndDateOfTheFiscalYear;

  if (startStr) {
    // 取月-日部分，与 selectedYear 拼接
    const startDate = new Date(startStr);
    const startMonth = startDate.getMonth(); // 0-based
    const dateFrom = `${selectedYear}-${String(startMonth + 1).padStart(2, "0")}-01`;

    if (endStr) {
      const endDate = new Date(endStr);
      const endMonth = endDate.getMonth();
      // 如果结束月 < 开始月，说明跨年（结束在 selectedYear + 1）
      const endYear = endMonth < startMonth ? selectedYear + 1 : selectedYear;
      const lastDay = new Date(endYear, endMonth + 1, 0).getDate();
      const dateTo = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${lastDay}`;
      return { dateFrom, dateTo };
    } else {
      // 只有开始月，结束为开始 + 12 个月 - 1 天
      const endDate = new Date(selectedYear, startMonth + 12, 0);
      const dateTo = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${endDate.getDate()}`;
      return { dateFrom, dateTo };
    }
  } else if (endStr) {
    // 只有结束日期，推算开始
    const endDate = new Date(endStr);
    const endMonth = endDate.getMonth();
    const startMonth = (endMonth - 11 + 12) % 12;
    // 如果开始月 > 结束月，说明开始在 selectedYear，结束在 selectedYear + 1
    const startYear = startMonth > endMonth ? selectedYear : selectedYear;
    const endYear = startMonth > endMonth ? selectedYear + 1 : selectedYear;
    const dateFrom = `${startYear}-${String(startMonth + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(endYear, endMonth + 1, 0).getDate();
    const dateTo = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${lastDay}`;
    return { dateFrom, dateTo };
  }

  // 都没有，fallback 到 selectedYear 自然年
  return {
    dateFrom: `${selectedYear}-01-01`,
    dateTo: `${selectedYear}-12-31`,
  };
}

// 获取商机数据（依赖组织树确定财年月日 + selectedYear 确定年份）
export function useDeals(orgStructure: OrgNode, selectedYear: number) {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();
  const [data, setData] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const prevKeyRef = useRef<string>("");

  useEffect(() => {
    if (!restApi) return;
    // 等待组织树加载完毕（需要有 id 表示已拿到数据）
    if (!orgStructure.id) return;

    const { dateFrom, dateTo } = computeFiscalRange(orgStructure, selectedYear);

    // 防止相同参数重复请求
    const key = `${dateFrom}_${dateTo}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    let mounted = true;
    const apiService = new DashboardApiService(restApi, language);

    const fetchDeals = async () => {
      setLoading(true);
      try {
        const result = await apiService.getOpportunity(dateFrom, dateTo);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error("Failed to fetch deals:", err);
          setData([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDeals();

    return () => {
      mounted = false;
    };
  }, [restApi, orgStructure, language, selectedYear]);

  return { data, loading, error };
}

// 获取组织结构
export function useOrgStructure() {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();

  const emptyOrg: OrgNode = useMemo(
    () => ({
      id: "",
      name: { zh: "", en: "" },
      type: "company" as const,
      children: [],
    }),
    [],
  );

  const apiService = useMemo(
    () => (restApi ? new DashboardApiService(restApi, language) : null),
    [restApi, language],
  );

  const fetchFn = useCallback(
    () =>
      apiService ? apiService.getOrganizations() : Promise.resolve(emptyOrg),
    [apiService, emptyOrg],
  );

  return useApiData(apiService ? fetchFn : null, emptyOrg);
}

// 获取产品线
export function useProductGroups() {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();

  const apiService = useMemo(
    () => (restApi ? new DashboardApiService(restApi, language) : null),
    [restApi, language],
  );

  const fetchFn = useCallback(
    () => (apiService ? apiService.getProducts() : Promise.resolve([])),
    [apiService],
  );

  return useApiData(apiService ? fetchFn : null, []);
}

// 获取商机阶段配置（数据字典）
export function useOpportunityStages() {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();

  const apiService = useMemo(
    () => (restApi ? new DashboardApiService(restApi, language) : null),
    [restApi, language],
  );

  const fetchFn = useCallback(
    () =>
      apiService ? apiService.getOpportunityStages() : Promise.resolve([]),
    [apiService],
  );

  return useApiData(apiService ? fetchFn : null, []);
}
// 获取线索总数
export function useLeadCount(orgStructure: OrgNode, selectedYear: number) {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();
  const [data, setData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const prevKeyRef = useRef<string>("");

  useEffect(() => {
    if (!restApi) return;
    if (!orgStructure.id) return;

    const { dateFrom, dateTo } = computeFiscalRange(orgStructure, selectedYear);
    const key = `lead_${dateFrom}_${dateTo}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    let mounted = true;
    const apiService = new DashboardApiService(restApi, language);

    const fetchLeadCount = async () => {
      setLoading(true);
      try {
        const result = await apiService.getLeadCount(dateFrom, dateTo);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setData(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLeadCount();
    return () => { mounted = false; };
  }, [restApi, orgStructure, selectedYear, language]);

  return { data, loading, error };
}

// 获取币种列表
export function useCurrencies() {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();

  const apiService = useMemo(
    () => (restApi ? new DashboardApiService(restApi, language) : null),
    [restApi, language],
  );

  const fetchFn = useCallback(
    () => (apiService ? apiService.getCurrencies() : Promise.resolve([])),
    [apiService],
  );

  return useApiData<CurrencyItem[]>(apiService ? fetchFn : null, []);
}

// 获取公司基础配置中的默认结算币种 code
export function useCompanyDefaultCurrency() {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();

  const apiService = useMemo(
    () => (restApi ? new DashboardApiService(restApi, language) : null),
    [restApi, language],
  );

  const fetchFn = useCallback(
    () => (apiService ? apiService.getCompanyDefaultCurrency() : Promise.resolve(null)),
    [apiService],
  );

  return useApiData<string | null>(apiService ? fetchFn : null, null);
}

// 获取汇率表
// 获取汇率表
export function useExchangeRates() {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();

  const apiService = useMemo(
    () => (restApi ? new DashboardApiService(restApi, language) : null),
    [restApi, language],
  );

  const fetchFn = useCallback(
    () => (apiService ? apiService.getExchangeRates() : Promise.resolve([])),
    [apiService],
  );

  return useApiData<ExchangeRate[]>(apiService ? fetchFn : null, []);
}

// 汇率转换服务实例（依赖汇率表数据和币种列表）
export function useExchangeRateService(
  exchangeRates: ExchangeRate[],
  currencies: CurrencyItem[] = [],
): ExchangeRateService | null {
  return useMemo(() => {
    if (exchangeRates.length === 0) return null;
    return new ExchangeRateService(exchangeRates, currencies);
  }, [exchangeRates, currencies]);
}


// 合同数据类型：按 contractNumber 索引
export type ContractMap = Map<string, Contract[]>;

// 获取合同数据（依赖 deals 数据）
export function useContracts(deals: Deal[]) {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();
  const [contracts, setContracts] = useState<ContractMap>(new Map());
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const prevContractNumbersRef = useRef<string>("");

  useEffect(() => {
    if (!restApi || deals.length === 0) return;

    // 提取所有非空的 contractNumber
    const contractNumbers = deals
      .map((d) => d.contractNumber)
      .filter((cn): cn is string => !!cn && cn.trim() !== "");

    // 去重
    const uniqueContractNumbers = [...new Set(contractNumbers)];

    if (uniqueContractNumbers.length === 0) {
      setContracts(new Map());
      return;
    }

    // 防止重复请求（相同的 contractNumbers 不再请求）
    const numbersKey = uniqueContractNumbers.sort().join(",");
    if (numbersKey === prevContractNumbersRef.current) return;
    prevContractNumbersRef.current = numbersKey;

    let mounted = true;
    const apiService = new DashboardApiService(restApi, language);

    const fetchContracts = async () => {
      setLoading(true);
      try {
        const allContracts = await apiService.getContracts(uniqueContractNumbers);

        if (mounted) {
          // 按 contractCode 分组
          const map: ContractMap = new Map();
          allContracts.forEach((contract) => {
            const code = contract.contractCode;
            if (!map.has(code)) {
              map.set(code, []);
            }
            map.get(code)!.push(contract);
          });
          setContracts(map);
        }
      } catch (error) {
        console.error("Failed to fetch contracts:", error);
        if (mounted) {
          setContracts(new Map());
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchContracts();

    return () => {
      mounted = false;
    };
  }, [restApi, deals, language]);

  return { contracts, loading };
}

// 根据财年范围独立获取合同数据（不依赖商机，用于回款健康度）
export function useContractsByFiscalYear(orgStructure: OrgNode, selectedYear: number) {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();
  const [contracts, setContracts] = useState<ContractMap>(new Map());
  const [loading, setLoading] = useState(false);
  const prevKeyRef = useRef<string>("");

  useEffect(() => {
    if (!restApi) return;
    // 等待组织树加载完毕
    if (!orgStructure.id) return;

    const { dateFrom, dateTo } = computeFiscalRange(orgStructure, selectedYear);

    // 防止相同参数重复请求
    const key = `${dateFrom}_${dateTo}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    let mounted = true;
    const apiService = new DashboardApiService(restApi, language);

    const fetchContracts = async () => {
      setLoading(true);
      try {
        const allContracts = await apiService.getContractsByDateRange(dateFrom, dateTo);

        if (mounted) {
          // 按 contractCode 分组
          const map: ContractMap = new Map();
          allContracts.forEach((contract) => {
            const code = contract.contractCode;
            if (!map.has(code)) {
              map.set(code, []);
            }
            map.get(code)!.push(contract);
          });
          setContracts(map);
        }
      } catch (error) {
        console.error("Failed to fetch contracts by fiscal year:", error);
        if (mounted) {
          setContracts(new Map());
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchContracts();

    return () => {
      mounted = false;
    };
  }, [restApi, orgStructure, language, selectedYear]);

  return { contracts, loading };
}

// 应收计划数据类型：按合同 id 索引
export type ReceivablePlanMap = Map<string, ReceivablePlan[]>;

// 获取应收计划数据（依赖合同数据）
export function useReceivablePlans(contractMap: ContractMap) {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();
  const [receivablePlans, setReceivablePlans] = useState<ReceivablePlanMap>(new Map());
  const [loading, setLoading] = useState(false);
  const prevContractIdsRef = useRef<string>("");

  useEffect(() => {
    if (!restApi) return;

    // 从 contractMap 提取所有合同 id
    const contractIds: string[] = [];
    contractMap.forEach((contracts) => {
      contracts.forEach((c) => {
        if (c.id) contractIds.push(String(c.id));
      });
    });

    if (contractIds.length === 0) {
      setReceivablePlans(new Map());
      return;
    }

    // 去重
    const uniqueIds = [...new Set(contractIds)];

    // 防止重复请求
    const idsKey = uniqueIds.sort().join(",");
    if (idsKey === prevContractIdsRef.current) return;
    prevContractIdsRef.current = idsKey;

    let mounted = true;
    const apiService = new DashboardApiService(restApi, language);

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const allPlans = await apiService.getReceivablePlans(uniqueIds);

        if (mounted) {
          // 按 parentDataId（合同 id）分组
          const map: ReceivablePlanMap = new Map();
          allPlans.forEach((plan) => {
            const contractId = plan.parentDataId;
            if (!map.has(contractId)) {
              map.set(contractId, []);
            }
            map.get(contractId)!.push(plan);
          });
          setReceivablePlans(map);
        }
      } catch (error) {
        console.error("Failed to fetch receivable plans:", error);
        if (mounted) {
          setReceivablePlans(new Map());
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      mounted = false;
    };
  }, [restApi, contractMap, language]);

  return { receivablePlans, loading };
}
