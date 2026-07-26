# 自定义单元格

* 通过 `StkTableColumn['customCell']` 自定义**表体**单元格内容。
* 通过 `StkTableColumn['customHeaderCell']` 自定义**表头**单元格内容。

`customCell` 和 `customHeaderCell` 使用方式基本相同，下面以 `customCell` 为例子进行说明。

::: warning 建议
* `customCell` 建议套上一层元素(div,span等)，否则 &lt;td&gt; 子节点为 `TextNode` 可能导致布局问题。
* `customCell` 的根元素请**谨慎**设置 `inline`/`inline-block`/`inline-flex` 等行内元素，此布局在**虚拟列表**中可能会撑开行高。
:::

### 通过 Svelte 组件使用
支持传入 Svelte 组件，组件的 props 需要用 `CustomCellProps` 类型特殊定义。

::: tip 最佳实践
 columns 单独写在一个文件中导出使用。
:::

::: code-group
```ts [column.ts]
import { StkTableColumn } from 'stk-table-svelte/src/StkTable/index';
import type { DataType } from './types';
import YieldCell from './YieldCell.svelte';
export const columns: StkTableColumn<DataType> = [{
    title: '收益率',
    dataIndex: 'yield',
    customCell: YieldCell
}]
```
```svelte [YieldCell.svelte]
<script lang="ts">
    import type { DataType } from './types';
    import type { CustomCellProps } from 'stk-table-svelte/src/StkTable/types/index';

    // svelte 无属性透传，需显式接收并应用 class/tabindex
    let { class: classNameProp, tabindex, cellValue }: CustomCellProps<DataType> & { class?: string; tabindex?: number } = $props();

    let className = $derived.by(() => {
        let name = '';
        if (cellValue > 0) {
            name = 'color-up';
        } else if (cellValue < 0) {
            name = 'color-down';
        }
        return name;
    });
</script>

<span class="{classNameProp} {className}" {tabindex}>{cellValue > 0 ? '+' : ''}{(cellValue * 100).toFixed(4)}%</span>

<style>
    :global(.color-up) {
        color: #2fc87b;
    }
    :global(.color-down) {
        color: #ff2b48;
    }
</style>
```
```ts [types.ts]
export type DataType = {
    name: string;
    yield: number;
};

```
:::

<demo svelte="advanced/custom-cell/CustomCell/index.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/custom-cell/CustomCell/index.svelte"></demo>

### 组件收到的 props
Svelte 没有 vue 的属性透传机制，`customCell` 组件会收到以下 props，其中 `class`、`tabindex` 需要显式接收并应用到根元素上：

| prop | 说明 |
|---|---|
| class | 单元格内容 class，需应用到根元素 |
| tabindex | 键盘导航所需 tabindex，需应用到根元素 |
| col | 列配置 |
| row | 行数据 |
| rowIndex | 行索引 |
| colIndex | 列索引 |
| cellValue | `row[col.dataIndex]` 的值 |
| expanded | 当前行是否展开 |
| treeExpanded | 树节点当前行是否展开 |
| onTriangleClick | 树节点展开/收起回调（`type: 'tree-node'` 列） |
| onDragStart | 行拖拽开始回调（`type: 'dragRow'` 列） |



## API
| 属性 | props | 默认值 | 说明 |
|---|---|---|---|
| customCell | Component&lt;Partial&lt;CustomCellProps&gt;&gt; | - | 自定义单元格渲染组件 |
| customHeaderCell | Component&lt;Partial&lt;CustomHeaderCellProps&gt;&gt; | - | 自定义表头渲染组件 |

### types
customCell props 类型
```ts
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** row[col.dataIndex] 的值 */
    cellValue: any;
    rowIndex: number;
    /** 
     * 列索引(从0开始)。
     * 
     * 注意：
     * 在virtual-x 下，否则表示虚拟列表中的列索引
     */
    colIndex: number;
    /**
     * 当前行是否展开
     * - 不展开: null
     * - 展开: 返回column配置
     */
    expanded?: StkTableColumn<any>;
    /** 树节点当前行是否展开 */
    treeExpanded?: boolean;
};

export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    /** 
     * 列索引(从0开始)。
     * 
     * 注意：
     * 在virtual-x 下，否则表示虚拟列表中的列索引
     */
    colIndex: number;
};



```
