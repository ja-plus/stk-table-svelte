# Header Drag

* Configure the `headerDrag` property to enable column dragging for reordering.
* `columns` needs to be configured with the `onupdatecolumns` callback to write back.

```js
<StkTable
    headerDrag // [!code ++]
    {columns}
    onupdatecolumns={cols => (columns = cols)} // [!code ++]
></StkTable>
```

Try dragging the headers

<demo svelte="advanced/header-drag/HeaderDrag.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/header-drag/HeaderDrag.svelte"></demo>

## Change Order via Event
```ts
/**
 * Header column drag event
 * ```(dragStartKey: string, targetColKey: string)```
 */
oncolorderchange: (dragStartKey: string, targetColKey: string) => void;
```

This way, you don't need to configure the `onupdatecolumns` callback; you can manually update the order of the `columns` array.

## API

### props.headerDrag

```ts
/** header drag config */
export type HeaderDragConfig<DT extends Record<string, any> = any> =
    | boolean
    | {
          /**
           * Column exchange mode
           * - none - Do nothing
           * - insert - Insert (default)
           * - swap - Swap
           */
          mode?: 'none' | 'insert' | 'swap';
          /** Columns to disable dragging */
          disabled?: (col: StkTableColumn<DT>) => boolean;
      };
```

### emit
```ts
/**
 * Header column drag event
 * ```(dragStartKey: string, targetColKey: string)```
 */
oncolorderchange: (dragStartKey: string, targetColKey: string) => void;
/**
 * Header column drag start
 * ```(dragStartKey: string)```
 */
onthdragstart: (dragStartKey: string) => void;
/**
 * Header column drag drop
 * ```(targetColKey: string)```
 */
onthdrop: (targetColKey: string) => void;
```
