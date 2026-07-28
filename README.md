<p align="center">
    <a href="https://ja-plus.github.io/stk-table-svelte/">
        <img src="./docs-src/public/assets/logo.svg" width="152">
    </a>
    <h3 align='center'>Stk Table Svelte</h3>
    <p align="center">
        <a href="https://www.npmjs.com/package/stk-table-svelte"><img src="https://img.shields.io/npm/v/stk-table-svelte"></a>
        <a href="https://www.npmjs.com/package/stk-table-svelte"><img src="https://img.shields.io/npm/dw/stk-table-svelte"></a>
        <a href="https://github.com/ja-plus/stk-table-svelte/stargazers"><img src="https://img.shields.io/github/stars/ja-plus/stk-table-svelte.svg"></a>
        <a href="https://raw.githubusercontent.com/ja-plus/stk-table-svelte/master/LICENSE"><img src="https://img.shields.io/npm/l/stk-table-svelte"></a>
        <a href="https://github.com/ja-plus/stk-table-svelte"><img src="https://img.shields.io/npm/types/stk-table-svelte"></a>
    </p>
</p>

Stk Table Svelte(Sticky Table) is a high-performance virtual list component based on Svelte.

Smooth performance with tens of thousands of rows.

Used for real-time data display, with data highlighting and dynamic effects.

Support Svelte 5.

## Documentation
### [Stk Table Svelte Official](https://ja-plus.github.io/stk-table-svelte/)
### [Stk Table Vue Official](https://ja-plus.github.io/stk-table-vue/)
### [Stk Table React Official](https://ja-plus.github.io/stk-table-react/)
### [Stk Table Solid Official](https://ja-plus.github.io/stk-table-solid/)

## Repo:
- [Github](https://github.com/ja-plus/stk-table-svelte)

## Usage
> npm install stk-table-svelte

Import style in your entry file:
```ts
import 'stk-table-svelte/lib/style.css';
```

```svelte
<script lang="ts">
import { onMount } from 'svelte';
import { StkTable } from 'stk-table-svelte';
import type { StkTableColumn } from 'stk-table-svelte';

let stkTableRef: StkTable | undefined;

// highlight row
stkTableRef?.setHighlightDimRow([rowKey], {
    method: 'css' | 'animation', // default animation
    className: 'custom-class-name', // for method 'css'
    keyframe: { backgroundColor: ['#aaa', '#222'] }, // same as https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats
    duration: 2000,
});
// highlight cell
stkTableRef?.setHighlightDimCell(rowKey, colDataIndex, {
    method: 'css' | 'animation',
    className: 'custom-class-name', // for method 'css'
    keyframe: { backgroundColor: ['#aaa', '#222'] }, // for method 'animation'
    duration: 2000,
});

const columns: StkTableColumn<any>[] = [
    { title: 'name', dataIndex: 'name' },
    { title: 'age', dataIndex: 'age' },
    { title: 'address', dataIndex: 'address' },
];

const dataSource = [
    { id: 1, name: 'John', age: 32, address: 'New York' },
    { id: 2, name: 'Jim', age: 42, address: 'London' },
    { id: 3, name: 'Joe', age: 52, address: 'Tokyo' },
    { id: 4, name: 'Jack', age: 62, address: 'Sydney' },
    { id: 5, name: 'Jill', age: 72, address: 'Paris' },
];
</script>

<StkTable bind:this={stkTableRef} rowKey="id" {columns} {dataSource}></StkTable>
```

## API
* [Props](https://ja-plus.github.io/stk-table-svelte/main/api/table-props.html)

* [Emits](https://ja-plus.github.io/stk-table-svelte/main/api/emits.html)

* [Slots](https://ja-plus.github.io/stk-table-svelte/main/api/slots.html)

* [Expose](https://ja-plus.github.io/stk-table-svelte/main/api/expose.html)

* [StkTableColumn: Define column type](https://ja-plus.github.io/stk-table-svelte/main/api/stk-table-column.html)

* [Highlight: setHighlightDimCell & setHighlightDimRow](https://ja-plus.github.io/stk-table-svelte/main/api/expose.html#sethighlightdimcell)

### Example
```svelte
<script lang="ts">
    import { StkTable } from 'stk-table-svelte';
    import type { StkTableColumn } from 'stk-table-svelte';
    import CustomCell from './CustomCell.svelte';
    import CustomHeaderCell from './CustomHeaderCell.svelte';

    let stkTableRef: StkTable | undefined;

    const columns: StkTableColumn<any>[] = [
        {
            title: 'Name',
            dataIndex: 'name',
            fixed: 'left',
            width: '200px',
            headerClassName: 'my-th',
            className: 'my-td',
            sorter: true,
            customHeaderCell: CustomHeaderCell, // svelte component
            customCell: CustomCell, // svelte component
        },
    ];

    const dataSource = [{ name: 'John' }];
</script>

<StkTable
    bind:this={stkTableRef}
    rowKey="name"
    theme="dark"
    style="height: 200px"
    bordered="h"
    rowHeight={28}
    showOverflow={false}
    showHeaderOverflow={false}
    sortRemote={false}
    colResizable
    headerDrag
    virtual
    virtualX
    noDataFull
    autoResize
    fixedColShadow
    colMinWidth={10}
    headless={false}
    {columns}
    {dataSource}
    oncurrentchange={onCurrentChange}
    onrowmenu={onRowMenu}
    onheaderrowmenu={onHeaderRowMenu}
    onrowclick={onRowClick}
    onrowdblclick={onRowDblclick}
    onsortchange={handleSortChange}
    oncellclick={onCellClick}
    onheadercellclick={onHeaderCellClick}
    ontablescroll={onTableScroll}
    oncolorderchange={onColOrderChange}
/>
```

## Other
* [stk-table-vue](https://github.com/ja-plus/stk-table-vue) - Vue version
* Compare performance with other vue table [vue-table-compare](https://github.com/ja-plus/vue-table-compare)
