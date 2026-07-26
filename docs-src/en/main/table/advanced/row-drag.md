# Row Drag to Change Order

Drag rows to change their order in the table.

## Example
Use built-in drag with `StkTableColumn['type']="dragRow"`

::: warning
`dataIndex` is not specified in the column configuration for `dragRow` because the unique key is overridden by `props.colKey`, and the `StkTableColumn['key']` field is prioritized.
:::

<demo svelte="advanced/row-drag/RowDrag.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/row-drag/RowDrag.svelte"></demo>

You can also implement it yourself using the native draggable API, here's a reference:

<demo svelte="advanced/row-drag/RowDragCustom.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/row-drag/RowDragCustom.svelte"></demo>

## API

### emits
```ts
/**
 * Row drag event
 *
 * ```(dragStartKey: string, targetRowKey: string)```
 */
onroworderchange: (dragStartKey: string, targetRowKey: string) => void;
```

