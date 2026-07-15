# 年份筛选器改动方案

## 概述

在 OrgFilter 之前新增一个「年份选择器」，用户可以选择/输入年份（1996~2036，共 40 年），默认当前年。选中的年份与组织节点财年配置中的月-日拼接，生成实际的 dateFrom/dateTo，用于商机 API 请求。

## 核心逻辑

- 组织节点 `theStartDateOfTheFiscalYear` 和 `theEndDateOfTheFiscalYear` 仅提取月-日部分
- 与用户选中的年份拼接得到完整的财年起止日期
- 例：组织配置 `04-01` 开始，用户选 2024 → dateFrom=`2024-04-01`，dateTo=`2025-03-31`

## 改动清单

| 文件 | 改动 |
|------|------|
| `src/components/filters/YearFilter.tsx` | **新建** - 年份下拉选择组件，支持输入搜索 |
| `src/pages/Index.tsx` | 新增 `selectedYear` state，传递给数据 hook 和工具函数，UI 中在 OrgFilter 前渲染 YearFilter |
| `src/hooks/useApiData.ts` | `useDeals` 接收 `selectedYear`，去掉 `hasFetchedRef` 单次限制改为依赖 selectedYear；日期拼接逻辑改为 selectedYear + 财年月日 |
| `src/utils/orgFilter.ts` | `getFiscalMonths` / `getFiscalYearMonths` 新增 `selectedYear` 参数，用于替代配置中的年份 |
| `src/components/charts/CollectionHealthChart/useCollectionHealthData.ts` | 同步更新 `getFiscalMonths` / `getFiscalYearMonths` 调用 |
| `src/services/api.ts` | `getLeadCount` 接收日期范围参数 |
| i18n 翻译文件 | 新增年份筛选器相关 key |

## 影响分析

1. **数据重新请求**：切换年份触发整条串行链路重新请求（商机→合同→应收计划）
2. **跨年处理**：财年 4月~次年3月 时，结束年 = selectedYear + 1
3. **统计标签**：`currentYear` 标签改为使用 selectedYear
4. **chartFilter 重置**：年份切换时清除当前图表筛选状态
5. **组织节点年份字段**：配置中的年份部分将被忽略，仅用月-日
