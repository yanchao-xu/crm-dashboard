# 商机阶段API使用说明

## API端点

```
GET /form/api/v2/form-entity-data/basic-system-setting/data-dictionary/list
```

## 重要说明

**多语言处理**: `codeName` 字段在API返回时已经根据当前用户的语言设置好了，前端不需要再做多语言处理。

## 数据格式要求

### 请求
无特殊参数，返回所有数据字典项。

### 响应
返回数组，每个商机阶段项应包含以下字段：

```json
{
  "code": "阶段代码",           // 必需，用于数据聚合
  "codeName": "显示名称",       // 必需，已经是当前语言的值
  "enable": "true",            // 必需，必须为 "true"
  "rank": 数字,                // 必需，用于排序
  "parentHandle": "opportunityStage"  // 必需，用于过滤
}
```

## 示例数据

### 中文环境下的响应
```json
[
  {
    "code": "Intentional Communication",
    "codeName": "意向沟通",
    "enable": "true",
    "rank": 1.0,
    "handle": "opportunityStage-Intentional Communication",
    "parentHandle": "opportunityStage",
    "id": 7107446
  },
  {
    "code": "Demand Confirmation",
    "codeName": "需求确认",
    "enable": "true",
    "rank": 2.0,
    "handle": "opportunityStage-Demand Confirmation",
    "parentHandle": "opportunityStage",
    "id": 7107447
  }
]
```

### 英文环境下的响应
```json
[
  {
    "code": "Intentional Communication",
    "codeName": "Intentional Communication",
    "enable": "true",
    "rank": 1.0,
    "handle": "opportunityStage-Intentional Communication",
    "parentHandle": "opportunityStage",
    "id": 7107446
  },
  {
    "code": "Demand Confirmation",
    "codeName": "Demand Confirmation",
    "enable": "true",
    "rank": 2.0,
    "handle": "opportunityStage-Demand Confirmation",
    "parentHandle": "opportunityStage",
    "id": 7107447
  }
]
```

## 数据处理逻辑

### 1. 过滤
系统会自动过滤出商机阶段相关的数据：
- `parentHandle === "opportunityStage"`
- `enable === "true"`

### 2. 排序
按 `rank` 字段升序排序

### 3. 转换
```typescript
{
  code: item.code,        // 用于数据聚合
  name: item.codeName,    // 直接使用，已经是当前语言
  rank: item.rank
}
```

## 商机数据匹配

商机数据中的 `stage` 字段应该使用阶段的 `code` 值：

```json
{
  "id": "deal-001",
  "opportunityName": "某公司合作项目",
  "opportunityStage": [
    {
      "label": "Intentional Communication"  // 这个值应该匹配阶段的 code
    }
  ],
  // ... 其他字段
}
```

## 图表显示

### 健康度图表
- X轴：月份
- Y轴：金额
- 堆叠柱：按阶段 `code` 聚合金额
- 图例：显示阶段 `name`（已经是当前语言）

### 销售漏斗
- 每行：一个阶段
- 标签：显示阶段 `name`（已经是当前语言）
- 数据：按阶段 `code` 聚合

### 停滞分析
- X轴：阶段 `name`（已经是当前语言）
- Y轴：金额或数量
- 数据：按阶段 `code` 聚合

## 多语言切换

当用户切换语言时：
1. 前端重新调用数据字典API
2. API根据新的语言设置返回对应的 `codeName`
3. 前端使用新的阶段配置重新渲染图表

前端不需要维护多语言映射表。

## 注意事项

1. **code 字段唯一性**: 每个阶段的 `code` 必须唯一
2. **rank 连续性**: 建议 `rank` 值连续，便于排序
3. **codeName 语言**: API必须根据当前用户语言返回对应的 `codeName`
4. **向后兼容**: 如果API返回空数据或失败，系统会使用默认阶段配置
