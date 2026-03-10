# CRM Dashboard

销售智能仪表板项目，使用外部传入的 REST API 获取数据。

## 功能特性

- 📊 多维度数据可视化（健康图表、漏斗图表、停滞分析）
- 🌐 支持中英文双语
- 🔌 使用外部 REST API（通过 mount 函数传入）
- 📱 响应式设计
- ⚡ 实时数据加载
- 🔄 自动 Fallback 到 Mock 数据

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 架构说明

### REST API 集成

本项目使用外部系统通过 `mount` 函数传入的 `restApi`。

```typescript
// main.tsx
export default function mount<T>(
  element: HTMLElement,
  { restApi, ... }: MountParams<T>,
): MountReturn<T> {
  const root = createRoot(element);
  root.render(<App restApi={restApi} />);
  // ...
}
```

### 数据流

```
外部系统 → mount(restApi) → App → ApiProvider → 
组件通过 hooks 获取数据 → 失败时使用 fallback 数据
```

### API 端点

应用期望以下端点可用：

- `GET /deals` - 获取交易数据
- `GET /health-data` - 获取健康图表数据
- `GET /stagnation-data` - 获取停滞数据
- `GET /funnel-data` - 获取漏斗数据
- `GET /org-structure` - 获取组织结构
- `GET /product-groups` - 获取产品组

详细说明请查看 [API_INTEGRATION.md](./API_INTEGRATION.md)

## 项目结构

```
├── src/
│   ├── components/      # React 组件
│   ├── contexts/        # React Context (包括 ApiContext)
│   ├── data/           # Mock 数据（作为 fallback）
│   ├── hooks/          # 自定义 Hooks（包括 API hooks）
│   ├── pages/          # 页面组件
│   ├── services/       # API 服务工厂
│   └── utils/          # 工具函数
└── ...
```

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Recharts
- Framer Motion

## 开发说明

### 本地开发（无后端）

应用会自动使用 `src/data/mockData.ts` 中的数据，无需配置。

### 添加新的 API 端点

1. 在 `src/services/api.ts` 中添加端点配置
2. 在 `src/hooks/useApiData.ts` 中创建对应的 hook
3. 在组件中使用新的 hook

详见 [API_INTEGRATION.md](./API_INTEGRATION.md)

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

## 预览生产版本

```bash
npm run preview
```

## 故障排除

### 数据不显示

- 检查浏览器控制台是否有错误
- 应用会在 API 失败时自动使用 fallback 数据
- 确认外部传入的 `restApi` 是否正确实现

### API 请求失败

- 检查 `restApi` 的端点配置
- 确认后端 API 返回的数据结构符合类型定义
- 查看网络请求（浏览器开发者工具 -> Network）

## 文档

- [API_INTEGRATION.md](./API_INTEGRATION.md) - API 集成详细说明
- [USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md) - 使用示例和集成指南
- [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - 项目改造总结

## License

MIT
