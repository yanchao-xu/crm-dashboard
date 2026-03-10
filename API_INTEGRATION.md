# API 集成说明

本项目使用外部传入的 `restApi` 来获取数据。如果没有提供 API 或 API 请求失败，图表将显示为空。

## 架构设计

### 核心文件

1. **src/contexts/ApiContext.tsx** - API Context，用于在整个应用中共享 restApi
2. **src/services/api.ts** - API 服务工厂，基于传入的 restApi 创建具体的 API 方法
3. **src/hooks/useApiData.ts** - 自定义 React Hooks，用于数据获取和状态管理
4. **src/main.tsx** - 入口文件，接收外部传入的 restApi 并传递给 App
5. **src/App.tsx** - 根组件，使用 ApiProvider 包裹应用

### 数据流

```
外部系统 → main.tsx (mount 函数) → App.tsx → ApiProvider → 
各个组件通过 useApiData hooks 获取数据 → 无数据时显示空图表
```

## 工作原理

### 1. 接收外部 restApi

在 `main.tsx` 中，`mount` 函数接收 `MountParams`，其中包含 `restApi`：

```typescript
export default function mount<T>(
  element: HTMLElement,
  { restApi, ... }: MountParams<T>,
): MountReturn<T> {
  const root = createRoot(element);
  root.render(<App restApi={restApi} />);
  // ...
}
```

### 2. 通过 Context 共享

`App.tsx` 使用 `ApiProvider` 将 restApi 注入到整个应用：

```typescript
function App({ restApi = null }: AppProps) {
  return (
    <ApiProvider restApi={restApi}>
      <LanguageProvider>
        <Index />
      </LanguageProvider>
    </ApiProvider>
  );
}
```

### 3. 在组件中使用

组件通过自定义 hooks 获取数据：

```typescript
const { data: deals, loading, error } = useDeals();
```

## API 端点配置

在 `src/services/api.ts` 中配置的端点：

- `/deals` - 获取所有交易数据
- `/health-data` - 获取健康图表数据
- `/stagnation-data` - 获取停滞图表数据
- `/funnel-data` - 获取漏斗图表数据
- `/org-structure` - 获取组织结构
- `/product-groups` - 获取产品组列表

## RestApi 接口

外部传入的 `restApi` 需要实现以下接口（定义在 `icp-extension.types.ts`）：

```typescript
export interface RestApi {
  get(url: string): Promise<any>;
  put(url: string, payload: Object): Promise<any>;
  post(url: string, payload: Object): Promise<any>;
  delete(url: string): Promise<any>;
}
```

特点：
- 已经包含了认证信息（如 `Authorization: Bearer xxx`）
- 自动处理响应数据提取（`.then(res => res.data)`）
- 请求失败时会自动通过 messageApi 报错

## 数据显示策略

- ✅ **有 restApi 且请求成功**：显示 API 返回的数据
- ⚠️ **有 restApi 但请求失败**：显示错误信息，图表为空
- 📭 **没有 restApi**：显示"暂无数据"，图表为空
- 🔄 **加载中**：显示加载动画

**注意**：不再使用 mockData 作为 fallback，确保用户看到的是真实数据或明确的空状态。

## 添加新的 API 端点

### 1. 在 api.ts 中添加端点

```typescript
const ENDPOINTS = {
  // ... 现有端点
  customData: "/custom-data",
};

export function createApiService(restApi: RestApi) {
  return {
    // ... 现有方法
    getCustomData: () =>
      restApi.get(ENDPOINTS.customData) as Promise<CustomType>,
  };
}
```

### 2. 在 useApiData.ts 中创建 hook

```typescript
export function useCustomData() {
  const restApi = useOptionalRestApi();
  const api = restApi ? createApiService(restApi) : null;
  return useApiData(api?.getCustomData || null, []);
}
```

### 3. 在组件中使用

```typescript
const { data, loading, error } = useCustomData();
```

## 错误处理

- API 错误会自动通过外部的 `messageApi` 显示给用户
- 组件中可以通过 `error` 状态获取错误信息
- 发生错误时图表显示为空，不使用备用数据

## 开发和测试

### 本地开发（无后端）

应用会显示"暂无数据"状态，图表为空。

### 使用 Mock restApi 测试

如果需要测试 API 集成，可以在 `main.tsx` 中提供 mock restApi：

```typescript
export const mockRestApi = {
  get: async (url: string) => {
    const response = await fetch(`http://localhost:3000/api${url}`);
    return response.json();
  },
  put: async (url: string, payload: Object) => {
    const response = await fetch(`http://localhost:3000/api${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.json();
  },
  post: async (url: string, payload: Object) => {
    const response = await fetch(`http://localhost:3000/api${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.json();
  },
  delete: async (url: string) => {
    const response = await fetch(`http://localhost:3000/api${url}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
```

然后在 mount 函数中使用：

```typescript
root.render(<App restApi={restApi || mockRestApi} />);
```

## 数据结构

所有 API 返回的数据结构必须与 `src/data/mockData.ts` 中的类型定义一致：

- `Deal[]` - 交易列表
- `StackedHealthDataPoint[]` - 健康图表数据
- `StagnationData[]` - 停滞数据
- `FunnelStage[]` - 漏斗数据
- `OrgNode` - 组织结构树
- `ProductGroup[]` - 产品组列表

## 性能优化建议

1. 考虑添加数据缓存机制
2. 实现分页加载大量数据
3. 添加请求防抖/节流
4. 使用 React Query 或 SWR 优化数据获取

## 注意事项

- `restApi` 由外部系统提供，不需要自己实现 HTTP 客户端
- 认证、错误处理、响应拦截等都由外部 restApi 处理
- 只需要关注业务逻辑和数据展示
- **不使用 mockData 作为 fallback**，确保数据真实性
