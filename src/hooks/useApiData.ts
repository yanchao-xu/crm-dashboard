import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useOptionalRestApi } from "@/contexts/ApiContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardApiService, OpportunityStage } from "@/services/api";
import type { OrgNode } from "@/types";

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

// 获取产品组
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
