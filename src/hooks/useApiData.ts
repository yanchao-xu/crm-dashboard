import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useOptionalRestApi } from "@/contexts/ApiContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardApiService, OpportunityStage } from "@/services/api";
import type { OrgNode, Deal, Contract, ReceivablePlan } from "@/types";

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

// 获取商机数据（唯一的数据源）
export function useDeals() {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();

  const apiService = useMemo(
    () => (restApi ? new DashboardApiService(restApi, language) : null),
    [restApi, language],
  );

  const fetchFn = useCallback(
    () => (apiService ? apiService.getOpportunity() : Promise.resolve([])),
    [apiService],
  );

  return useApiData(apiService ? fetchFn : null, []);
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
export function useLeadCount() {
  const restApi = useOptionalRestApi();
  const { language } = useLanguage();

  const apiService = useMemo(
    () => (restApi ? new DashboardApiService(restApi, language) : null),
    [restApi, language],
  );

  const fetchFn = useCallback(
    () => (apiService ? apiService.getLeadCount() : Promise.resolve(0)),
    [apiService],
  );

  return useApiData(apiService ? fetchFn : null, 0);
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
