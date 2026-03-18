# Shadow DOM 样式修复说明

## 问题描述

在 Shadow DOM 环境下，`OrgFilter.tsx` 和 `ProductTeamFilter.tsx` 组件使用的 Popover 样式无法生效。

根本原因：Radix UI 的 Portal 组件（Popover、Dialog、Select 等）默认将内容渲染到 `document.body`，而 Shadow DOM 的样式是隔离的，无法应用到 document.body 中的元素。

## 解决方案

### 1. 创建 ShadowRootContext

创建了 `src/contexts/ShadowRootContext.tsx`，用于检测和提供 Shadow DOM 容器：

- 使用 `getRootNode()` 检测当前是否在 Shadow DOM 中
- 如果在 Shadow DOM 中，使用 Shadow Root 作为 Portal 容器
- 如果不在 Shadow DOM 中，使用 `document.body`（保持向后兼容）

### 2. 更新 UI 组件

修改了以下使用 Portal 的组件，让它们使用 ShadowRootContext 提供的容器：

- `src/components/ui/popover.tsx` - Popover 组件
- `src/components/ui/dialog.tsx` - Dialog 组件  
- `src/components/ui/select.tsx` - Select 组件

### 3. 集成到应用

在 `src/App.tsx` 中添加 `ShadowRootProvider`，包裹整个应用：

```tsx
<ShadowRootProvider>
  <ApiProvider restApi={restApi}>
    <LanguageProvider>
      <Index />
    </LanguageProvider>
  </ApiProvider>
</ShadowRootProvider>
```

## 技术细节

### Portal 容器选择逻辑

```typescript
const root = element.getRootNode();
if (root instanceof ShadowRoot) {
  // 在 Shadow DOM 中，使用 Shadow Root
  setContainer(root as unknown as HTMLElement);
} else {
  // 不在 Shadow DOM 中，使用 document.body
  setContainer(document.body);
}
```

### 为什么这样可以解决问题

1. Portal 内容现在渲染到 Shadow Root 内部，而不是 document.body
2. Shadow DOM 内的样式可以正常应用到 Portal 内容
3. 保持了向后兼容性 - 在非 Shadow DOM 环境下仍然使用 document.body

## 影响范围

修改影响以下组件：
- OrgFilter（组织筛选器）
- ProductTeamFilter（产品团队筛选器）
- 所有使用 Popover、Dialog、Select 的组件

## 测试建议

1. 测试 OrgFilter 和 ProductTeamFilter 的样式是否正常显示
2. 测试 Popover 的定位是否正确
3. 测试在非 Shadow DOM 环境下是否仍然正常工作
4. 测试 Dialog 和 Select 组件是否也正常工作
