# 商机阶段动态配置更新

## 概述

已将所有图表的商机阶段从硬编码改为从API动态获取配置。现在系统会从数据字典API获取阶段配置，并使用 `code` 字段进行数据聚合，使用 `codeName` 字段进行显示。

**重要**: `codeName` 字段在API返回时已经根据当前语言设置好了，前端不需要再做多语言处理。

## 主要更改

### 1. API服务 (`src/services/api.ts`)

#### 新增接口
- `OpportunityStage`: 商机阶段配置类型
  ```typescript
  {
    code: string;    // 用于数据聚合
    name: string;    // 显示名称（已经是当前语言）
    rank: number;    // 排序
  }
  ```

#### 新增方法
- `getOpportunityStages()`: 从数据字典API获取商机阶段配置
  - API路径: `/form/api/v2/form-entity-data/basic-system-setting/data-dictionary/list`
  - 过滤条件: `parentHandle === "opportunityStage" && enable === "true"`
  - 按 `rank` 字段排序
  - 直接使用 `codeName` 作为显示名称

#### 更新的方法
- `calculateHealthData()`: 接受 `stages` 参数，动态生成阶段字段
- `calculateStagnationData()`: 接受 `stages` 参数，使用 `code` 聚合，返回 `stageName`
- `calculateFunnelData()`: 接受 `stages` 参数，使用 `code` 聚合，返回 `stageName`

### 2. 数据类型 (`src/data/mockData.ts`)

更新了类型定义以支持动态阶段名称：

```typescript
export interface StagnationData {
  stage: string;           // 阶段代码
  stageName?: string;      // 阶段显示名称（已经是当前语言）
  // ... 其他字段
}

export interface FunnelStage {
  stage: string;           // 阶段代码
  stageName?: string;      // 阶段显示名称（已经是当前语言）
  // ... 其他字段
}
```

### 3. Hooks (`src/hooks/useApiData.ts`)

新增 hook:
- `useOpportunityStages()`: 获取商机阶段配置

### 4. 工具函数 (`src/utils/orgFilter.ts`)

更新了所有计算函数以支持动态阶段：
- `calculateStackedHealthData(deals, org, stages)`: 动态生成阶段字段
- `calculateStagnationData(deals, stages)`: 使用阶段配置进行聚合
- `calculateFunnelData(deals, stages)`: 使用阶段配置进行聚合

### 5. 图表组件

#### HealthChart (`src/components/charts/HealthChart.tsx`)
- 新增 `stages` prop: `{ code: string; name: string }[]`
- 动态生成 Bar 组件
- 直接使用 `stage.name` 显示（已经是当前语言）
- 自动分配颜色（支持任意数量的阶段）

#### FunnelChart (`src/components/charts/FunnelChart/FunnelBar.tsx`)
- 使用 `stageName` 字段显示阶段名称
- 直接显示，无需语言判断

#### StagnationChart (`src/components/charts/StagnationChart.tsx`)
- 使用 `tickFormatter` 显示阶段名称
- 直接显示 `stageName`，无需语言判断

### 6. 页面 (`src/pages/Index.tsx`)
- 使用 `useOpportunityStages()` 获取阶段配置
- 将阶段配置传递给所有图表组件
- 所有计算函数都使用阶段配置

## API数据格式

### 数据字典API响应示例

```json
[
  {
    "code": "Intentional Communication",
    "codeName": "意向沟通",  // 已经是当前语言的值
    "enable": "true",
    "rank": 2.0,
    "handle": "opportunityStage-Intentional Communication",
    "parentHandle": "opportunityStage",
    "id": 7107446
  }
]
```

### 转换后的格式

```typescript
{
  code: "Intentional Communication",
  name: "意向沟通",  // 直接使用 codeName
  rank: 2.0
}
```

## 数据流

1. **获取阶段配置**: `useOpportunityStages()` → API → 按 `rank` 排序
2. **数据聚合**: 使用 `stage.code` 匹配商机数据中的 `deal.stage`
3. **显示**: 直接使用 `stage.name`（已经是当前语言）

## 多语言处理

**重要**: 多语言处理在API层完成，前端不需要处理：
- API根据当前用户的语言设置返回对应的 `codeName`
- 前端直接使用 `codeName` 显示，无需判断语言
- 切换语言时，重新调用API获取新的数据即可

## 向后兼容

所有计算函数都提供了默认值，如果没有阶段配置，会使用硬编码的默认阶段：
- Discovery
- Qualification
- Proposal
- Negotiation
- Closing

## 测试建议

1. 验证数据字典API返回正确的阶段配置
2. 确认阶段按 `rank` 正确排序
3. 验证 `codeName` 已经是当前语言的值
4. 测试数据聚合使用 `code` 字段
5. 测试没有阶段配置时的降级行为
6. 验证切换语言后重新获取数据
