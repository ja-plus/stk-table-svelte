# Multi-Level Headers
## Configuration
`StkTableColumn['children']` configures multi-level headers
```ts 
const columns: StkTableColumn<any>[] = [
    {
        dataIndex: 'Basic',
        title: 'Basic',
        children: [ // [!code highlight]
            { dataIndex: 'id',title: 'ID', width: 100,},
            {
                dataIndex: 'lv2',
                title: 'Lv 2',
                width: 100,
                children: [ // [!code highlight]
                    { dataIndex: 'lv2_1', title: 'Lv 2.1', width: 100,}, 
                    { dataIndex: 'lv2_2', title: 'Lv 2.2', width: 100,},
                ],
            },
        ],
    },
]
```


<demo svelte="basic/multi-header/MultiHeader.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/multi-header/MultiHeader.svelte"></demo>

## Horizontal Virtual List
With the help of AI, multi-level headers finally support horizontal virtual list!

Configure `props.virtualX` to enable it.
<demo svelte="basic/multi-header/MultiHeaderVirtualX.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/multi-header/MultiHeaderVirtualX.svelte"></demo>

::: tip
If a parent header has many child nodes, try splitting the headers for better virtual scrolling performance.
:::


## Column Fixing
### Most Common Column Fixing
::: tip
The fixed column value in multi-header tables only affects the current header node. If you want to fix parent headers, you also need to configure fixed.
:::

```ts 
const columns: StkTableColumn<any>[] = [
    {
        dataIndex: 'Basic',
        title: 'Basic',
        fixed: 'left', // [!code ++]
        children: [
            { 
                dataIndex: 'id',
                title: 'ID',
                width: 100,
                fixed: 'left'  // [!code ++]
             },
            {
                dataIndex: 'lv2',
                title: 'Lv 2',
                width: 100,
                fixed: 'left', // [!code ++]
                children: [
                    { 
                        dataIndex: 'lv2_1',
                        title: 'Lv 2.1', 
                        width: 100, 
                        fixed: 'left'// [!code ++]
                    }, 
                    { 
                        dataIndex: 'lv2_2',
                        title: 'Lv 2.2', 
                        width: 100, 
                        fixed: 'left' // [!code ++]
                    }, 
                ],
            },
        ],
    },
]
```
<demo svelte="basic/multi-header/MultiHeaderFixed.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/multi-header/MultiHeaderFixed.svelte"></demo>
### Only Configure Leaf Node Fixing

<demo svelte="basic/multi-header/MultiHeaderLeavesFixed.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/multi-header/MultiHeaderLeavesFixed.svelte"></demo>
::: warning Horizontal virtual list (`props.virtualX`) does not support this mode yet.
:::

### Configure Arbitrary Fixing
<demo svelte="basic/multi-header/MultiHeaderAnyFixed.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/multi-header/MultiHeaderAnyFixed.svelte"></demo>
::: warning Horizontal virtual list (`props.virtualX`) does not support this mode yet.
:::

Isn't that interesting? This is also thanks to the sticky feature.









