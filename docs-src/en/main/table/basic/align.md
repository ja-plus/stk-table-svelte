# Alignment

Configuration
| Property | Type | Default | Description |
| --- | --- | --- | --- |
| align | `"left"`\|`"center"`\|`"right"` | 'left' | Table body alignment |
| headerAlign | `"left"`\|`"center"`\|`"right"` | 'center' | Table header alignment |

```ts
const columns:StkTableColumn<any>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    align: 'center', // [!code ++]
    headerAlign: 'center', // [!code ++]
  },
]
```

<demo svelte="basic/align/Align.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/align/Align.svelte"></demo>
