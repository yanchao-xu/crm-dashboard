# API 更新说明

## 概述

已将所有图表的数据源统一为单一接口：`/form/api/v2/form-entity-data/lead-management/lead-management-form/list`

## 数据流程

### 1. 数据源头

所有图表数据都来自同一个商机数据接口：

```
GET /form/api/v2/form-entity-data/lead-management/lead-management-form/list
```

### 2. 图表联动逻辑

#### 商机健康度图表

- **显示方式**：按月展示不同 type（阶段）的商机数据
- **数据范围**：显示所有月份的数据
- **交互**：点击某个月的柱状图时，触发其他图表的过滤

#### 销售漏斗图表

- **默认显示**：显示所有商机数据
- **联动过滤**：当点击"商机健康度"的某个月时，销售漏斗按该月过滤显示数据
- **过滤条件**：`createdMonth === selectedMonth`

#### 商机停滞分析图表

- **默认显示**：显示所有商机数据
- **联动过滤**：当点击"商机健康度"的某个月时，商机停滞分析按该月过滤显示数据
- **过滤条件**：`createdMonth === selectedMonth`

## 代码更改

### 1. API 服务层 (`src/services/api.ts`)

#### 保留的方法：

```typescript
// 商机数据获取（唯一的数据源）
async getOpportunity(): Promise<Deal[]>

// 组织数据获取
async getOrganizations(): Promise<OrgNode>

// 产品数据获取
async getProducts(): Promise<ProductGroup[]>

// 健康度数据计算（显示所有月份）
calculateHealthData(deals: Deal[]): StackedHealthDataPoint[]

// 销售漏斗数据计算（支持按月过滤）
calculateFunnelData(deals: Deal[], selectedMonth?: string): FunnelStage[]

// 停滞分析数据计算（支持按月过滤）
calculateStagnationData(deals: Deal[], selectedMonth?: string): StagnationData[]
```

#### 删除的内容：

- `ApiResponse<T>` 接口（未使用）
- `getOpportunity()` 的 `params` 参数（过滤在前端进行）

### 2. API Hooks (`src/hooks/useApiData.ts`)

#### 保留的 hooks：

```typescript
useDeals(); // 获取商机数据
useOrgStructure(); // 获取组织结构
useProductGroups(); // 获取产品组
```

#### 删除的 hooks：

- `useHealthData()` - 健康度数据通过计算方法获取
- `useStagnationData()` - 停滞数据通过计算方法获取
- `useFunnelData()` - 漏斗数据通过计算方法获取

### 3. 删除的文件

- `src/contexts/DataContext.tsx` - 未使用的上下文

### 4. 主页面 (`src/pages/Index.tsx`)

实现了图表联动逻辑：

- 健康度图表始终显示所有月份
- 点击健康度图表的某个月时，销售漏斗和商机停滞分析自动按该月过滤
- 使用 `chartFilter` 状态管理当前选中的月份
- 使用工具函数 `calculateHealthData`、`calculateFunnelData`、`calculateStagnationData` 进行数据计算

## 使用示例

### 场景 1：初始加载

```typescript
// 所有图表显示全部数据
健康度图表: 显示 1-12 月的所有数据
销售漏斗: 显示所有商机的漏斗分析
商机停滞: 显示所有商机的停滞分析
```

### 场景 2：点击健康度图表的 3 月

```typescript
// 触发联动过滤
健康度图表: 仍然显示 1-12 月的所有数据（高亮 3 月）
销售漏斗: 只显示 3 月创建的商机
商机停滞: 只显示 3 月创建的商机
```

### 场景 3：清除过滤

```typescript
// 点击关闭按钮，恢复默认显示
所有图表恢复显示全部数据;
```

## 数据字段映射

从 API 返回的商机数据需要包含以下字段：

| API 字段           | 应用字段           | 说明                                                             |
| ------------------ | ------------------ | ---------------------------------------------------------------- |
| `id`               | `id`               | 商机 ID                                                          |
| `name`             | `name`             | 商机名称                                                         |
| `company`          | `company`          | 公司名称                                                         |
| `value`            | `value`            | 商机金额                                                         |
| `stage`            | `stage`            | 商机阶段（Discovery/Qualification/Proposal/Negotiation/Closing） |
| `lastActivityDays` | `lastActivityDays` | 最后活动天数                                                     |
| `probability`      | `probability`      | 成交概率                                                         |
| `owner`            | `owner`            | 负责人                                                           |
| `expectedClose`    | `expectedClose`    | 预期成交日期                                                     |
| `createdDate`      | `createdMonth`     | 创建日期（转换为月份：Jan/Feb/Mar...）                           |
| `productGroup`     | `productGroup`     | 产品组                                                           |

## 架构优化

### 简化的数据流：

1. **单一数据源**：只从 API 获取商机原始数据
2. **前端计算**：所有图表数据通过计算方法从商机数据派生
3. **按需过滤**：根据用户交互动态过滤数据
4. **无冗余请求**：不需要为每个图表单独请求数据

### 优势：

- 减少 API 调用次数
- 数据一致性更好
- 更容易维护和调试
- 更灵活的过滤和联动

## 注意事项

1. **月份格式**：`createdMonth` 使用英文缩写（Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec）
2. **数据过滤**：所有过滤都在前端进行，基于从 API 获取的完整数据集
3. **性能优化**：使用 `useMemo` 缓存计算结果，避免不必要的重新计算
4. **状态管理**：使用 `chartFilter` 状态跟踪当前的过滤条件

## 测试建议

1. 测试初始加载时所有图表显示完整数据
2. 测试点击健康度图表不同月份时的联动效果
3. 测试清除过滤后恢复默认显示
4. 测试与组织筛选、产品筛选的组合使用
5. 验证数据计算的准确性（总数、转化率、停滞状态等）
