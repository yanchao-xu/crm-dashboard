# 商机阶段动态配置实现总结

## 核心改动

已成功将所有图表的商机阶段从硬编码改为从API动态获取。

## 关键点

1. **数据聚合**: 使用 `code` 字段
2. **显示**: 使用 `codeName` 字段（API已处理多语言）
3. **多语言**: 由API层处理，前端直接使用返回的 `codeName`

## 类型定义

```typescript
// API返回的阶段配置
interface OpportunityStage {
  code: string;    // 用于数据聚合
  name: string;    // 显示名称（已经是当前语言）
  rank: number;    // 排序
}

// 图表数据类型
interface FunnelStage {
  stage: string;       // 阶段代码
  stageName?: string;  // 阶段显示名称
  // ...
}

interface StagnationData {
  stage: string;       // 阶段代码
  stageName?: string;  // 阶段显示名称
  // ...
}
```

## API集成

```typescript
// 获取阶段配置
const { data: opportunityStages } = useOpportunityStages();

// 使用阶段配置计算数据
const funnelData = calculateFunnelData(deals, opportunityStages);
const stagnationData = calculateStagnationData(deals, opportunityStages);
const healthData = calculateStackedHealthData(deals, org, opportunityStages);
```

## 显示逻辑

```typescript
// 直接使用 stageName，无需语言判断
<div>{stage.stageName || stage.stage}</div>
```

## 向后兼容

如果API失败或返回空数据，系统会使用默认阶段：
- Discovery
- Qualification
- Proposal
- Negotiation
- Closing

## 测试要点

1. ✅ API返回正确的阶段配置
2. ✅ 使用 `code` 进行数据聚合
3. ✅ 使用 `codeName` 进行显示
4. ✅ `codeName` 已经是当前语言的值
5. ✅ 阶段按 `rank` 排序
6. ✅ 降级到默认阶段
