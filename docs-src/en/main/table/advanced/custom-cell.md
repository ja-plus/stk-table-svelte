
* Customize **body** cell content via `StkTableColumn['customCell']`.
* Customize **header** cell content via `StkTableColumn['customHeaderCell']`.

`customCell` and `customHeaderCell` are used similarly. Here we'll use `customCell` as an example.

::: warning Recommendations
* It's recommended to wrap `customCell` with an element (div, span, etc.), otherwise having `TextNode` as the child of &lt;td&gt; may cause layout issues.
* Be **cautious** when setting root elements of `customCell` as inline elements (inline, inline-block, inline-flex, etc.), as this layout may stretch row heights in **virtual lists**.
:::

### Using with Svelte Components
Supports passing Svelte components. The props of the component need to be specially defined with the `CustomCellProps` type.

::: tip Best Practice
Define columns in a separate file and export them.
:::

::: code-group
```ts [column.ts]
import { StkTableColumn } from 'stk-table-svelte/src/StkTable/index';
import type { DataType } from './types';
import YieldCell from './YieldCell.svelte';
export const columns: StkTableColumn<DataType> = [{
    title: 'Yield Rate',
    dataIndex: 'yield',
    customCell: YieldCell
}]
```
```svelte [YieldCell.svelte]
<script lang="ts">
    import type { DataType } from './types';
    import type { CustomCellProps } from 'stk-table-svelte/src/StkTable/types/index';

    // Svelte has no attribute fallthrough; class/tabindex need to be explicitly received and applied
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

### Props Received by the Component
Svelte does not have Vue's attribute fallthrough mechanism. The `customCell` component receives the following props, among which `class` and `tabindex` need to be explicitly received and applied to the root element:

| prop | Description |
|---|---|
| class | Class of the cell content, needs to be applied to the root element |
| tabindex | tabindex required for keyboard navigation, needs to be applied to the root element |
| col | Column configuration |
| row | Row data |
| rowIndex | Row index |
| colIndex | Column index |
| cellValue | Value of `row[col.dataIndex]` |
| expanded | Whether the current row is expanded |
| treeExpanded | Whether the current tree node row is expanded |
| onTriangleClick | Tree node expand/collapse callback (`type: 'tree-node'` column) |
| onDragStart | Row drag start callback (`type: 'dragRow'` column) |



## API
| Property | props | Default | Description |
|---|---|---|---|
| customCell | Component&lt;Partial&lt;CustomCellProps&gt;&gt; | - | Custom cell rendering component |
| customHeaderCell | Component&lt;Partial&lt;CustomHeaderCellProps&gt;&gt; | - | Custom header cell rendering component |

### types
customCell props type
```ts
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** Value of row[col.dataIndex] */
    cellValue: any;
    rowIndex: number;
    /** 
     * Column index (starting from 0)
     * 
     * Note:
     * - In virtual-x, otherwise it represents the index in the virtual list
     */
    colIndex: number;
    /**
     * Whether the current row is expanded
     * - Not expanded: null
     * - Expanded: returns column configuration
     */
    expanded?: StkTableColumn<any>;
    /** Whether the current tree node row is expanded */
    treeExpanded?: boolean;
};

export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    /** 
     * Column index (starting from 0)
     * 
     * Note:
     * - In virtual-x, otherwise it represents the index in the virtual list
     */
    colIndex: number;
};



```
