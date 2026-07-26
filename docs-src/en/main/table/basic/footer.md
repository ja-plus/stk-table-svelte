# Footer Summary Row <Badge type="tip" text="^0.11.0" />

* `props.footerData` Configure footer summary row data.
* `props.footerConfig` Configure footer position and behavior.

`footerData` is an array where each element represents a footer row. The data structure is similar to `dataSource`, with field names corresponding to column's dataIndex.

## Basic Usage

Pass `props.footerData` directly:
```svelte
<script lang="ts">
let footerData = $state<Data[]>([
    { name: 'Total', age: 84, salary: 26000, bonus: 7000, },
]);
</script>

<StkTable
    rowKey="name"
    {columns}
    {dataSource}
    footerData={footerData} //[!code ++]
></StkTable>
```

<demo svelte="basic/footer/Footer.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/footer/Footer.svelte"></demo>


## Anchor to Top

Anchor the footer to the top of the table:

```svelte
<StkTable
    footerData={footerData}
    footerConfig={{ position: 'top' }} //[!code ++]
></StkTable>
```

<demo svelte="basic/footer/FooterTop.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/footer/FooterTop.svelte"></demo>

## Multi-row Header Support

The footer correctly positions itself below multi-row headers:

<demo svelte="basic/footer/FooterMultiHeader.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/footer/FooterMultiHeader.svelte"></demo>

## API

### FooterConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| position | `'bottom'` \| `'top'` | `'bottom'` | Footer  anchor position |

### FooterData

An array where each element represents a footer row. The data structure should match the column definitions.
