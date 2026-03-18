# 图例显示修复说明

## 问题

健康度图表底部的图例显示的是阶段的 `code`（如 "Intentional Communication"），而不是 `codeName`（如 "意向沟通"）。

## 原因

图例的显示名称来自 Bar 组件的 `name` 属性，该属性使用 `stageLabels` 映射。当 `stages` 数组为空时（API 还在加载或失败），映射无法建立，导致显示原始的 code 值。

## 解决方案

更新了 `HealthChart.tsx` 中的 `stageLabels` 生成逻辑：

```typescript
const stageLabels: Record<string, string> = useMemo(() => {
  const labels: Record<string, string> = {};
  
  if (stages.length > 0) {
    // 如果有阶段配置，使用配置的映射
    stages.forEach(stage => {
      labels[stage.code] = stage.name;
    });
  }
  
  // 对于任何没有映射的 key，使用 key 本身作为显示名称
  stageKeys.forEach(key => {
    if (!labels[key]) {
      labels[key] = key;
    }
  });
  
  return labels;
}, [stages, stageKeys]);
```

## 工作原理

1. **有阶段配置时**: 使用 `stage.code` → `stage.name` 的映射
2. **无阶段配置时**: 使用 code 本身作为显示名称（回退方案）
3. **使用 useMemo**: 优化性能，只在 stages 或 stageKeys 变化时重新计算

## 验证步骤

### 1. 检查 API 是否返回阶段配置

打开浏览器控制台，查看网络请求：
```
GET /form/api/v2/form-entity-data/basic-system-setting/data-dictionary/list
```

确认响应包含：
```json
[
  {
    "code": "Intentional Communication",
    "codeName": "意向沟通",
    "enable": "true",
    "rank": 1.0,
    "parentHandle": "opportunityStage"
  }
]
```

### 2. 检查 stages 是否正确传递

在 `HealthChart.tsx` 中添加调试日志：
```typescript
console.log('HealthChart stages:', stages);
console.log('HealthChart stageKeys:', stageKeys);
console.log('HealthChart stageLabels:', labels);
```

预期输出：
```javascript
// stages 应该包含阶段配置
stages: [
  { code: "Intentional Communication", name: "意向沟通", rank: 1 },
  { code: "Requirements Determination", name: "需求确定", rank: 2 },
  // ...
]

// stageKeys 应该包含数据中的字段名
stageKeys: ["Intentional Communication", "Requirements Determination", ...]

// stageLabels 应该包含正确的映射
stageLabels: {
  "Intentional Communication": "意向沟通",
  "Requirements Determination": "需求确定",
  // ...
}
```

### 3. 检查图例显示

图例应该显示：
- ✅ "意向沟通" 而不是 "Intentional Communication"
- ✅ "需求确定" 而不是 "Requirements Determination"
- ✅ 其他阶段的中文名称

## 可能的问题

### 问题 1: stages 数组为空

**症状**: 图例显示英文 code

**原因**: 
- API 请求失败
- API 返回空数据
- `useOpportunityStages()` hook 有问题

**解决**: 
1. 检查网络请求是否成功
2. 检查 API 响应格式是否正确
3. 检查过滤条件（`parentHandle === "opportunityStage"`）

### 问题 2: code 不匹配

**症状**: 部分阶段显示中文，部分显示英文

**原因**: 
- 商机数据中的 `stage` 值与阶段配置中的 `code` 不匹配
- 数据中有新的阶段，但配置中没有

**解决**:
1. 确保商机数据的 `stage` 字段使用正确的 code
2. 确保数据字典包含所有使用的阶段

### 问题 3: codeName 不是当前语言

**症状**: 显示的是错误的语言

**原因**: API 返回的 `codeName` 不是当前用户的语言

**解决**: 
- 确认 API 根据用户语言设置返回对应的 `codeName`
- 切换语言后重新调用 API

## 测试场景

1. **正常加载**: stages 有数据，图例显示中文
2. **API 失败**: stages 为空，图例显示 code（回退）
3. **部分匹配**: 部分阶段有配置，部分没有
4. **语言切换**: 切换语言后图例更新
