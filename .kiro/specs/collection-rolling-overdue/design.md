# Design Document

## Overview

本设计在现有 `CollectionHealthChart`（回款健康度图表）和 `ContractsTable`（合同列表）的基础上，增加逾期判定和滚动逻辑。不新建图表组件，而是：
1. 改造 `CollectionHealthChart` 的柱状图数据结构，将原先的 target 柱拆为"原生计划（蓝色）+ 滚动逾期（橙色）"叠加柱
2. 增强 `ContractsTable`，新增逾期标识和滚动来源列
3. 扩展 `useCollectionHealthData` 的计算逻辑，加入滚动累积算法

## Architecture

### System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Index.tsx (页面编排)                           │
│                                                                      │
│  ┌──────────────────┐    ┌─────────────────────────────────────────┐ │
│  │  已有数据源       │    │  改造: useCollectionHealthData.ts        │ │
│  │  contractMap      │───▶│    + calculateOverdueStatus()           │ │
│  │  receivablePlanMap│    │    + calculateRollingAmounts()           │ │
│  │  selectedOrg      │    │    → 输出 CollectionHealthDataPoint      │ │
│  │  exchangeService  │    │       (新增 nativePlan, rolledOverdue)   │ │
│  └──────────────────┘    └──────────┬──────────────────────────────┘ │
│                                     │                                │
│            ┌────────────────────────┼──────────────────┐             │
│            ▼                        ▼                  ▼             │
│  ┌──────────────────┐   ┌──────────────────┐  ┌──────────────────┐  │
│  │CollectionHealth   │   │  ContractsTable  │  │ ChartFilterContext│  │
│  │Chart (改造)       │   │  (增强)          │  │ + segment 字段    │  │
│  │ target→叠加柱     │   │  + 逾期标识      │  │                  │  │
│  │ 蓝色+橙色        │   │  + 滚动来源列     │  │                  │  │
│  └──────────────────┘   └──────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 改造文件清单

```
src/
├── components/charts/
│   ├── CollectionHealthChart.tsx                    ← 改造: 叠加柱 + 分段点击
│   └── CollectionHealthChart/
│       ├── useCollectionHealthData.ts              ← 改造: 新增逾期/滚动计算
│       └── CollectionHealthTooltip.tsx             ← 改造: 展示原生+逾期+总额
├── components/deals/
│   └── ContractsTable.tsx                          ← 增强: 逾期标识 + 来源列
├── pages/
│   └── Index.tsx                                   ← 小改: ChartFilterContext 加 segment
└── types/
    └── index.ts                                    ← 无需改动，已有所需字段
```

### Data Flow (改造后)

```
contractMap + receivablePlanMap + OrgNode
        │
        ▼
calculateCollectionHealthFromApi() [改造]
        │
        ├── Step 1: 对每笔 ReceivablePlan 判定逾期状态
        │           (isOverdue, overdueAmount, shouldRoll)
        │
        ├── Step 2: 按月计算原生计划 (nativePlan)
        │           + 滚动逾期累积 (rolledOverdue)
        │
        ├── Step 3: 输出 CollectionHealthDataPoint[]
        │           (新字段: nativePlan, rolledOverdue, target=nativePlan+rolledOverdue)
        │
        └── Step 4: 构建按月的合同滚动映射
                    (供 ContractsTable 按 segment 筛选使用)
        │
        ▼
CollectionHealthChart 渲染叠加柱状图
ContractsTable 展示合同 + 逾期标识 + 来源标记
```

## Data Models

### 1. 扩展 `CollectionHealthDataPoint`

改造现有数据点类型，增加 nativePlan 和 rolledOverdue 字段：

```typescript
// src/components/charts/CollectionHealthChart/useCollectionHealthData.ts

/** 改造后的数据点（向后兼容，保留 target/actual） */
export interface CollectionHealthDataPoint {
  month: string;                 // 月份标签
  target: number;                // 应收总额 = nativePlan + rolledOverdue（保持向后兼容）
  actual: number;                // 实际回款金额（保持不变）
  nativePlan: number;            // 新增: 当月原生计划金额
  rolledOverdue: number;         // 新增: 滚动逾期累积金额
}
```

### 2. 合同滚动信息类型（新增）

```typescript
// src/components/charts/CollectionHealthChart/useCollectionHealthData.ts

/** 逾期状态 */
type OverdueStatus = "normal" | "dueSoon" | "overdue" | "completed";

/** 单条合同滚动信息（供 ContractsTable 使用） */
export interface RollingContractInfo {
  contractId: string;
  planId: string;
  isOverdue: boolean;
  rollingSourceMonth: string | null;  // "YYYY-MM" 格式，null 表示原生计划
  overdueAmount: number;
  status: OverdueStatus;
}

/** 按月汇总的滚动合同映射 */
export type MonthlyRollingMap = Map<string, RollingContractInfo[]>;
// key = yearMonth ("2026-07"), value = 该月所有相关合同（含原生 + 滚动进来的）
```

### 3. ChartFilterContext 扩展

```typescript
// src/pages/Index.tsx — 在现有类型上新增 segment 字段

export type ChartFilterContext = {
  type: "health" | "funnel" | "stagnation" | "collection";
  stage?: string;
  activityStatus?: string;
  month?: string;
  segment?: "native" | "overdue" | "all";  // 新增: 点击蓝/橙色块的筛选
} | null;
```

## Components and Interfaces

### 1. 改造 `calculateCollectionHealthFromApi`

在现有函数基础上，增加逾期判定和滚动累积逻辑：

```typescript
// src/components/charts/CollectionHealthChart/useCollectionHealthData.ts

export function calculateCollectionHealthFromApi(
  contractMap: ContractMap,
  receivablePlanMap: ReceivablePlanMap,
  selectedOrg: OrgNode | null,
  exchangeService: ExchangeRateService | null,
  targetCurrencyId?: string,
  allowedContractNumbers?: Set<string>,
): {
  chartData: CollectionHealthDataPoint[];  // 改造: 增加 nativePlan, rolledOverdue
  rollingMap: MonthlyRollingMap;           // 新增: 供 ContractsTable 使用
}
```

#### 逾期判定算法

```typescript
function determineOverdueStatus(plan: ReceivablePlan, now: Date): {
  status: OverdueStatus;
  overdueAmount: number;
  shouldRoll: boolean;
} {
  const plannedDate = new Date(plan.plannedDate);
  const remainingAmount = Math.max(plan.plannedAmount - plan.actualAmount, 0);

  // 已全额回款
  if (plan.actualAmount >= plan.plannedAmount) {
    return { status: "completed", overdueAmount: 0, shouldRoll: false };
  }

  // 未到期
  if (plannedDate >= now) {
    const daysUntilDue = Math.floor(
      (plannedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue <= 14 && plan.actualAmount === 0) {
      return { status: "dueSoon", overdueAmount: 0, shouldRoll: false };
    }
    return { status: "normal", overdueAmount: 0, shouldRoll: false };
  }

  // 已逾期
  const plannedEndOfMonth = getEndOfMonth(plannedDate);

  // 同月回款 → 不滚动
  if (plan.actualDate) {
    const actualDate = new Date(plan.actualDate);
    if (isSameMonth(actualDate, plannedDate)) {
      return { status: "overdue", overdueAmount: remainingAmount, shouldRoll: false };
    }
  }

  // 月底已过且未全额回款 → 需要滚动
  if (now > plannedEndOfMonth && remainingAmount > 0) {
    return { status: "overdue", overdueAmount: remainingAmount, shouldRoll: true };
  }

  // 当月内逾期但当月未结束 → 不滚动
  return { status: "overdue", overdueAmount: remainingAmount, shouldRoll: false };
}
```

#### 滚动累积算法

```typescript
function calculateRollingAmounts(
  plans: Array<{
    plan: ReceivablePlan;
    contract: Contract;
    overdueAmount: number;
    shouldRoll: boolean;
    status: OverdueStatus;
  }>,
  fiscalYearMonths: FiscalMonthInfo[],
  now: Date,
  exchangeService: ExchangeRateService | null,
  targetCurrencyId?: string,
): {
  monthlyNativePlan: Record<string, number>;
  monthlyRolledOverdue: Record<string, number>;
  rollingMap: MonthlyRollingMap;
} {
  const monthlyNativePlan: Record<string, number> = {};
  const monthlyRolledOverdue: Record<string, number> = {};
  const rollingMap: MonthlyRollingMap = new Map();

  // 初始化
  fiscalYearMonths.forEach(({ yearMonth }) => {
    monthlyNativePlan[yearMonth] = 0;
    monthlyRolledOverdue[yearMonth] = 0;
    rollingMap.set(yearMonth, []);
  });

  const getRate = (currencyId?: string) => {
    if (!exchangeService || !targetCurrencyId || !currencyId) return 1;
    return exchangeService.getRate(currencyId, targetCurrencyId);
  };

  // 归类原生计划
  plans.forEach(({ plan, contract, status }) => {
    const ym = plan.plannedYearMonth;
    if (ym && monthlyNativePlan[ym] !== undefined) {
      monthlyNativePlan[ym] += plan.plannedAmount * getRate(plan.currencyId);
      rollingMap.get(ym)!.push({
        contractId: contract.id,
        planId: plan.id,
        isOverdue: status === "overdue",
        rollingSourceMonth: null,
        overdueAmount: 0,
        status,
      });
    }
  });

  // 计算滚动逾期
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  plans
    .filter((p) => p.shouldRoll && p.overdueAmount > 0)
    .forEach(({ plan, contract, overdueAmount, status }) => {
      const sourceYM = plan.plannedYearMonth!;
      const sourceIndex = fiscalYearMonths.findIndex((m) => m.yearMonth === sourceYM);
      if (sourceIndex < 0) return;

      // 滚动至当前月或最近的未来月
      let targetIndex = sourceIndex + 1;
      while (targetIndex < fiscalYearMonths.length) {
        if (fiscalYearMonths[targetIndex].yearMonth >= currentYM) break;
        targetIndex++;
      }
      if (targetIndex >= fiscalYearMonths.length) {
        targetIndex = fiscalYearMonths.length - 1;
      }

      const targetYM = fiscalYearMonths[targetIndex].yearMonth;
      const rate = getRate(plan.currencyId);
      monthlyRolledOverdue[targetYM] += overdueAmount * rate;

      rollingMap.get(targetYM)!.push({
        contractId: contract.id,
        planId: plan.id,
        isOverdue: true,
        rollingSourceMonth: sourceYM,
        overdueAmount: overdueAmount * rate,
        status,
      });
    });

  return { monthlyNativePlan, monthlyRolledOverdue, rollingMap };
}
```

### 2. 改造 `CollectionHealthChart` 组件

将现有的 target 单色柱改为叠加柱：

```typescript
// src/components/charts/CollectionHealthChart.tsx — 核心改动

// 颜色常量
const NATIVE_PLAN_COLOR = "hsl(217, 91%, 60%)";      // 蓝色（原 targetColor）
const ROLLED_OVERDUE_COLOR = "hsl(25, 95%, 53%)";    // 橙色（新增）
const ACTUAL_COLOR = "hsl(252, 87%, 67%)";           // 紫色（保持不变）

// Props 新增 segment 点击回调
interface CollectionHealthChartProps {
  data: CollectionHealthDataPoint[];
  onMonthClick?: (month: string, segment?: "native" | "overdue") => void;  // 改造
  isActive?: boolean;
  activeFilter?: ChartFilterContext;
  filterTags?: FilterTag[];
  fiscalMonths?: string[];
}

// 柱状图改造: target 柱 → nativePlan + rolledOverdue 叠加
<Bar
  dataKey="nativePlan"
  stackId="target"
  name={t("dashboard>collection>nativePlan")}
  fill={NATIVE_PLAN_COLOR}
  onClick={(data, index) => onMonthClick?.(data.month, "native")}
/>
<Bar
  dataKey="rolledOverdue"
  stackId="target"
  name={t("dashboard>collection>rolledOverdue")}
  radius={[4, 4, 0, 0]}  // 仅顶部圆角
  fill={ROLLED_OVERDUE_COLOR}
  onClick={(data, index) => onMonthClick?.(data.month, "overdue")}
/>
<Bar
  dataKey="actual"
  name={t("dashboard>collection>actual")}
  fill={ACTUAL_COLOR}
  radius={[4, 4, 0, 0]}
/>
```

**图例改造：**
```
蓝色: 当月原生计划回款
橙色: 逾期滚动金额
紫色: 实际回款
```

### 3. 改造 `CollectionHealthTooltip`

在现有 Tooltip 中新增显示原生计划和逾期滚动金额的分行：

```typescript
// 改造后的 Tooltip 展示内容:
// ■ 当月原生计划: ¥XXX
// ■ 滚动逾期:     ¥XXX
// ■ 应收总额:     ¥XXX (= 原生 + 逾期)
// ■ 实际回款:     ¥XXX
```

### 4. 增强 `ContractsTable`

在现有组件基础上增加逾期标识和滚动来源标记：

```typescript
// src/components/deals/ContractsTable.tsx — 新增 Props

interface ContractsTableProps {
  contractMap: ContractMap;
  receivablePlanMap: ReceivablePlanMap;
  filterContext?: ChartFilterContext;
  exchangeService?: ExchangeRateService | null;
  targetCurrencyId?: string;
  allowedContractNumbers?: Set<string>;
  selectedOrg?: OrgNode | null;
  rollingMap?: MonthlyRollingMap;   // 新增: 滚动合同映射
}
```

**增强内容：**

1. **筛选增强**: 当 `filterContext.segment === "overdue"` 时，仅展示 `rollingMap` 中 `isOverdue === true` 的合同；当 `segment === "native"` 时，仅展示非滚动合同。

2. **新增列 — 滚动来源**:
```tsx
{/* 在状态列后面新增 */}
<TableHead>{t("dashboard>collection>rollingSource")}</TableHead>

{/* 单元格 */}
<TableCell>
  {rollingInfo?.rollingSourceMonth ? (
    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
      来自 {rollingInfo.rollingSourceMonth}
    </Badge>
  ) : (
    <span className="text-xs text-muted-foreground">—</span>
  )}
</TableCell>
```

3. **逾期标识强化**: 对于逾期滚动进来的合同行，在合同编号前加橙色圆点标识。

4. **空状态处理**: 当筛选后无数据时，显示对应的空状态文案。

### 5. Index.tsx 改造

```typescript
// 改造 collectionHealthData 计算（原有代码位置不变）
const { chartData: collectionHealthData, rollingMap } = useMemo(() => {
  const orgForFiscal = selectedOrg || (orgStructure.id ? orgStructure : null);
  const allowedCN = new Set(
    filteredDeals
      .map((d) => d.contractNumber)
      .filter((cn): cn is string => !!cn && cn.trim() !== ""),
  );
  const result = calculateCollectionHealthFromApi(
    contractMap,
    receivablePlanMap,
    orgForFiscal,
    exchangeService,
    selectedCurrencyId,
    allowedCN,
  );

  let chartData = result.chartData;
  if (periodMode === "quarter") {
    chartData = aggregateCollectionHealthByQuarter(chartData, orgForFiscal);
  }
  return { chartData, rollingMap: result.rollingMap };
}, [contractMap, receivablePlanMap, selectedOrg, orgStructure, exchangeService, selectedCurrencyId, filteredDeals, periodMode]);

// 改造 onMonthClick 回调以支持 segment
onMonthClick={(month, segment) =>
  setChartFilter({ type: "collection", month, segment: segment || "all" })
}

// 将 rollingMap 传递给 ContractsTable
<ContractsTable
  contractMap={contractMap}
  receivablePlanMap={receivablePlanMap}
  filterContext={chartFilter}
  exchangeService={exchangeService}
  targetCurrencyId={selectedCurrencyId}
  allowedContractNumbers={allowedContractNumbers}
  selectedOrg={selectedOrg}
  rollingMap={rollingMap}  // 新增
/>
```

### 6. 辅助函数

```typescript
/** 获取某月最后一天 */
function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

/** 判断两个日期是否为同一年月 */
function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
```

### 7. 国际化 Key 新增

```
dashboard>collection>nativePlan       → "当月原生计划" / "Native Plan"
dashboard>collection>rolledOverdue    → "滚动逾期" / "Rolled Overdue"
dashboard>collection>totalReceivable  → "应收总额" / "Total Receivable"
dashboard>collection>rollingSource    → "滚动来源" / "Rolling Source"
dashboard>collection>rollingFrom      → "来自 {month}" / "From {month}"
dashboard>collection>filterNative     → "仅原生计划" / "Native Only"
dashboard>collection>filterOverdue    → "仅逾期滚动" / "Overdue Only"
```

## Correctness Properties

### Property 1: 滚动金额守恒
**Validates: Requirements 2.1**
对于任意一笔逾期的应收计划，其 `overdueAmount = plannedAmount - actualAmount`。该金额在整个滚动链中不会凭空增加或减少，仅在收到回款时扣减。

### Property 2: 无重复计数
**Validates: Requirements 2.2**
一笔应收计划的金额在任意时间点只出现在一个月份的统计中——要么在原始月的 `nativePlan`，要么在某个目标月的 `rolledOverdue`，不会同时出现在多处。

### Property 3: 总额公式不变式
**Validates: Requirements 2.2**
对于每个月份 `m`，`target[m] = nativePlan[m] + rolledOverdue[m]`，即 target（应收总额）严格等于原生计划加滚动逾期之和。

### Property 4: 滚动方向性
**Validates: Requirements 2.3**
滚动只会从过去月份流向当前或未来月份，不会出现反向滚动。

### Property 5: 幂等性
**Validates: Requirements 2.8**
`calculateCollectionHealthFromApi` 在相同输入下必须产生相同输出（纯函数特性），确保 `useMemo` 不会因重复计算产生不同结果。

### Property 6: 全额回款终止
**Validates: Requirements 2.7**
一旦 `actualAmount >= plannedAmount`，该计划不产生任何滚动逾期金额，不出现在逾期列表中。

### Property 7: 向后兼容
**Validates: Requirements 3.2**
改造后的 `CollectionHealthDataPoint` 保留 `target` 字段（= nativePlan + rolledOverdue），确保依赖 `target` 的统计逻辑（如健康度比率）不受影响。

## Error Handling

1. **空数据处理**: 当 `contractMap` 或 `receivablePlanMap` 为空时，返回12个月全零数据点（`nativePlan=0, rolledOverdue=0, target=0, actual=0`），图表正常渲染。

2. **无效日期处理**: 若 `plannedDate` 为空或非法格式，`determineOverdueStatus` 视为未逾期（`status: "normal"`），不参与滚动计算。

3. **汇率缺失**: 使用 1:1 默认汇率（与现有行为一致）。

4. **财年配置缺失**: 回退到自然年 1月~12月（与现有行为一致）。

5. **segment 筛选无数据**: 当用户点击橙色部分但该月无滚动逾期合同时，`ContractsTable` 显示已有的空状态提示。

## Testing Strategy

1. **单元测试** (`determineOverdueStatus`):
   - 计划日期未到 → status = "normal"
   - 计划日期14天内 → status = "dueSoon"
   - 已逾期 + 未回款 + 月底已过 → shouldRoll = true
   - 已逾期 + 同月回款 → shouldRoll = false
   - 全额回款 → status = "completed"

2. **单元测试** (`calculateRollingAmounts`):
   - 单月逾期 → 滚动至当前月
   - 多月累积逾期 → 各自独立滚动至当前月
   - 部分回款 → 仅滚动未回款余额
   - 全额回款 → 不产生滚动

3. **集成测试** (`calculateCollectionHealthFromApi`):
   - 验证 chartData 的 target = nativePlan + rolledOverdue
   - 验证 rollingMap 正确归类合同
   - 验证向后兼容（actual 字段不受影响）

4. **组件测试** (`CollectionHealthChart`):
   - 渲染叠加柱并验证蓝/橙分色
   - 点击橙色部分触发 onMonthClick(month, "overdue")
   - Tooltip 显示三项金额
