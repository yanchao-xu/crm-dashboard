import { createContext, useContext, ReactNode } from "react";
import type { RestApi } from "../../icp-extension.types";

interface ApiContextType {
  restApi: RestApi | null;
}

const ApiContext = createContext<ApiContextType>({ restApi: null });

export function ApiProvider({
  children,
  restApi,
}: {
  children: ReactNode;
  restApi: RestApi | null;
}) {
  return (
    <ApiContext.Provider value={{ restApi }}>{children}</ApiContext.Provider>
  );
}

export function useRestApi() {
  const context = useContext(ApiContext);
  if (!context.restApi) {
    throw new Error(
      "useRestApi must be used within ApiProvider with a valid restApi",
    );
  }
  return context.restApi;
}

// 可选的 hook，返回可能为 null 的 restApi
export function useOptionalRestApi() {
  const context = useContext(ApiContext);
  return context.restApi;
}
