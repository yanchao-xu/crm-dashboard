# 使用示例

## 外部系统集成示例

### 1. 基本集成

```typescript
import mount from './src/main';

// 创建 restApi 实例
const restApi = {
  get: async (url: string) => {
    const response = await fetch(`https://your-api.com${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  },
  put: async (url: string, payload: Object) => {
    const response = await fetch(`https://your-api.com${url}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },
  post: async (url: string, payload: Object) => {
    const response = await fetch(`https://your-api.com${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },
  delete: async (url: string) => {
    const response = await fetch(`https://your-api.com${url}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

// 挂载应用
const container = document.getElementById('app');
const unmount = mount(container, {
  params: {},
  formApi: null,
  messageApi: {
    error: (msg) => console.error(msg),
    warning: (msg) => console.warn(msg),
    success: (msg) => console.log(msg),
  },
  restApi: restApi,
  i18nApi: {
    language: 'zh-CN',
    t: (key) => key,
  },
  routerApi: {
    navigate: (path) => console.log('Navigate to:', path),
  },
  fieldApi: null,
});

// 卸载应用
// unmount();
```

### 2. 使用 Axios

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://your-api.com',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// 响应拦截器 - 自动提取 data
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 错误处理
    messageApi.error(error.message);
    return Promise.reject(error);
  }
);

const restApi = {
  get: (url: string) => axiosInstance.get(url),
  put: (url: string, payload: Object) => axiosInstance.put(url, payload),
  post: (url: string, payload: Object) => axiosInstance.post(url, payload),
  delete: (url: string) => axiosInstance.delete(url),
};

mount(container, {
  // ...
  restApi,
  // ...
});
```

### 3. 开发环境使用 Mock 数据

```typescript
// 在 main.tsx 中
export const mockRestApi = {
  get: async (url: string) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 根据 URL 返回不同的 mock 数据
    switch (url) {
      case '/deals':
        return import('./data/mockData').then(m => m.deals);
      case '/health-data':
        return import('./data/mockData').then(m => m.stackedHealthData);
      case '/stagnation-data':
        return import('./data/mockData').then(m => m.stagnationData);
      case '/funnel-data':
        return import('./data/mockData').then(m => m.funnelData);
      case '/org-structure':
        return import('./data/mockData').then(m => m.orgStructure);
      case '/product-groups':
        return import('./data/mockData').then(m => m.productGroups);
      default:
        throw new Error(`Unknown endpoint: ${url}`);
    }
  },
  put: async () => ({}),
  post: async () => ({}),
  delete: async () => ({}),
};

// 在开发环境使用 mock
export default function mount<T>(
  element: HTMLElement,
  params: MountParams<T>,
): MountReturn<T> {
  const root = createRoot(element);
  const isDev = import.meta.env.DEV;
  const restApi = params.restApi || (isDev ? mockRestApi : null);
  
  root.render(<App restApi={restApi} />);
  
  return () => {
    root.unmount();
  };
}
```

## 后端 API 实现示例

### Node.js + Express

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// 获取交易数据
app.get('/deals', async (req, res) => {
  try {
    const deals = await db.query('SELECT * FROM deals');
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取健康数据
app.get('/health-data', async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM health_data');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... 其他端点

app.listen(3000);
```

### Python + FastAPI

```python
from fastapi import FastAPI
from typing import List

app = FastAPI()

@app.get("/deals")
async def get_deals() -> List[Deal]:
    deals = await db.fetch_all("SELECT * FROM deals")
    return deals

@app.get("/health-data")
async def get_health_data() -> List[HealthData]:
    data = await db.fetch_all("SELECT * FROM health_data")
    return data

# ... 其他端点
```

## 数据格式示例

### GET /deals

```json
[
  {
    "id": "1",
    "name": {
      "zh": "企业授权许可协议",
      "en": "Enterprise License Deal"
    },
    "company": {
      "zh": "爱克美公司",
      "en": "Acme Corp"
    },
    "value": 125000,
    "stage": "Negotiation",
    "lastActivityDays": 2,
    "probability": 45,
    "owner": "Sarah Chen",
    "expectedClose": "2024-02-15",
    "productGroup": "enterprise",
    "createdMonth": "Jan"
  }
]
```

### GET /health-data

```json
[
  {
    "month": "Jan",
    "target": 480000,
    "Discovery": 125000,
    "Qualification": 95000,
    "Proposal": 72000,
    "Negotiation": 55000,
    "Closing": 38000
  }
]
```

完整的数据结构定义请参考 `src/data/mockData.ts`。
