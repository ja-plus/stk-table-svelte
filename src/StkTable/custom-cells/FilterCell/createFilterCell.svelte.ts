import { getContext } from 'svelte';
import FilterBase from './Filter.svelte';
import { STK_TABLE_CONTEXT } from '../../const';
import type { StkTableContext } from '../../const';
import type { UniqKey } from '../../types/index';
import type { CreateFilterCellOption, FilterComponentConfig, FilterOption, FilterStatus } from './types';

/**
 * 从数据源提取筛选选项
 *
 * @param dataSource 数据源
 * @param columnKey 列名
 * @returns 筛选选项数组
 */
function extractFilterOptions(dataSource: any[], columnKey: string): FilterOption[] {
    const uniqueValues = new Set<any>();

    dataSource.forEach(row => {
        const val = row[columnKey];
        if (val !== undefined && val !== null) {
            uniqueValues.add(val);
        }
    });

    return Array.from(uniqueValues).map(value => ({
        label: String(value),
        value,
    }));
}

/**
 * 表格筛选功能工厂函数 (BETA)
 *
 * 返回一个 Filter 表头组件与响应式 filterStatus 对象。
 *
 * 用法：
 * ```ts
 * const { Filter, filterStatus } = createFilterCell({ remote: false });
 * const col = { title: 'name', dataIndex: 'name', customHeaderCell: Filter({ autoOptions: true }) };
 * ```
 *
 * Q: 为什么通过表格上下文（getContext）来设置筛选状态，而不是直接传入 dataSource？
 * A: 因为 createFilterCell 不一定有 dataSource 的上下文，它可能在独立的 js/ts 中使用。
 *    通过 StkTable 提供的 context 可以获取到 dataSource 与 setFilter 能力。
 *
 * @beta
 */
export function createFilterCell(option?: CreateFilterCellOption) {
    // 响应式筛选状态（该工厂创建的所有 Filter 列共享）
    const filterStatus = $state<Record<UniqKey, FilterStatus>>({});

    function FilterComponent(config?: FilterComponentConfig, component?: any) {
        // 返回一个 Svelte 组件函数。StkTable 渲染表头单元格时会实例化它，
        // 此时处于 StkTable 的渲染上下文中，可以通过 getContext 获取表格能力。
        return function FilterCellComponent(this: void, anchor: any, props: any) {
            const ctx = getContext(STK_TABLE_CONTEXT) as StkTableContext | undefined;
            const colKey = props?.col?.dataIndex;

            // 懒计算自动提取的选项（dataSource 变化时重新计算）
            let cachedAutoOptions: FilterOption[] | null = null;
            let lastDataSource: any = null;

            function getAutoOptions(): FilterOption[] {
                if (!config?.autoOptions) return [];
                const dataSource: any[] = ctx?.getDataSource() || [];
                if (dataSource !== lastDataSource) {
                    lastDataSource = dataSource;
                    cachedAutoOptions = null;
                }
                if (cachedAutoOptions) return cachedAutoOptions;
                cachedAutoOptions = extractFilterOptions(dataSource, colKey);
                return cachedAutoOptions;
            }

            // 优先使用 FilterComponent 传入的 options，其次使用自动提取的选项
            function getResolvedOptions(): FilterOption[] {
                return config?.options ?? getAutoOptions();
            }

            function handleChange(value: FilterOption['value'][]) {
                filterStatus[colKey] = {
                    value,
                    filter: config?.filter ?? filterStatus[colKey]?.filter,
                };
                option?.onChange?.({ colKey, status: filterStatus[colKey] });
                ctx?.setFilter(filterStatus, option);
            }

            // 构建 props：theme/active 使用 getter 保持响应式（Svelte 5 支持 getter 形式的响应式 props）
            const merged: Record<string, any> = {
                get theme() {
                    return (ctx?.getTheme() as 'light' | 'dark') || 'light';
                },
                get active() {
                    return (filterStatus[colKey]?.value.length || 0) > 0;
                },
                getOptions: getResolvedOptions,
                onchange: handleChange,
            };

            // 复制运行时 props（col、colIndex、rowIndex 等）
            if (props) {
                for (const key of Object.keys(props)) {
                    if (!(key in merged)) {
                        merged[key] = props[key];
                    }
                }
            }

            // 自定义表头内容（等价于 Vue 版本的 default slot）
            if (component) {
                merged.children = function childrenSnippet(childAnchor: any) {
                    return component(childAnchor, props);
                };
            }

            return FilterBase(anchor, merged);
        };
    }

    return {
        Filter: FilterComponent,
        filterStatus,
    };
}
