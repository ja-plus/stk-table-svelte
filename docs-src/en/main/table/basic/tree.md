# Tree

Enable tree function in two steps

1. Set `StkTableColumn['type']` to `tree-node` to specify the position of the tree expansion button
```ts
const columns: StkTableColumn<any>[] = [
    { type: 'tree-node', title: 'Area', dataIndex: 'area' },
]
```

2. Add `children` field to the data source. After clicking, the content in the `children` field of the data will be displayed as child nodes.
```ts
export const getDataSource = () => [ 
    {
        area: 'Asia',
        gdp: 10000,
        population: 50000000,
        gdpPerCapita: 20000,
        children: [
            { area: 'China', gdp: 5000, population: 1400000000, gdpPerCapita: 35000, }, 
            { area: 'Japan', gdp: 4000, population: 126000000, gdpPerCapita: 33000, }
        ],
    },
];
```

## Simple Tree

<demo svelte="basic/tree/Tree.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/tree/Tree.svelte"></demo>

## Default Expanded Nodes

### Expand All
`treeConfig.defaultExpandAll = true`

<demo svelte="basic/tree/TreeDefaultExpandAll.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/tree/TreeDefaultExpandAll.svelte"></demo>

### Expand Specific Level
`treeConfig.defaultExpandLevel = 1`

<demo svelte="basic/tree/TreeDefaultExpandLevel.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/tree/TreeDefaultExpandLevel.svelte"></demo>

### Expand Specific Nodes
`treeConfig.defaultExpandedKeys = ['Asia', 'China', 'Zhejiang']`

<demo svelte="basic/tree/TreeDefaultExpandKeys.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/tree/TreeDefaultExpandKeys.svelte"></demo>


## Virtual List

<demo svelte="basic/tree/TreeVirtualList.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/tree/TreeVirtualList.svelte"></demo>

::: warning Note
The component will inject the `__T_EXP__` field into each row of the dataSource to control whether it is expanded. Do not modify this field when updating the data of a row. Therefore, `Object.assign` is used in the example to update data.
:::

::: warning Performance Note
Even with virtual lists, every change in `props.dataSource` will cause the component to internally traverse `dataSource` to flatten the data. Therefore, for frequently changing data, it will occupy more computing resources of the computer.
If you have certain performance requirements, you can refer to [Example - Huge Data](/en/demos/huge-data) to implement the tree expansion logic yourself.
:::

## Sorting
By default, when clicking on the table header to sort, only the data at the current level will be sorted. If you need to sort child nodes as well, you need to configure `sortConfig.sortChildren = true`.

For details, see [Sorting](/en/main/table/basic/sort)
