# Emits

In the Svelte version, events are provided as callback props (all lowercase, no hyphens). The names in parentheses are the corresponding event names in the Vue version.

## API

### onsortchange (sort-change)

Triggered when sorting changes. When defaultSort.dataIndex is not found, col will return null.

```ts
onsortchange?: (col: StkTableColumn<DT> | null, order: Order, data: DT[], sortConfig: SortConfig<DT>) => void;
```

### onrowclick (row-click)

Click event for a row.

```ts
onrowclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### oncurrentchange (current-change)

Triggered when a row is selected. ev returns null if not triggered by a click event.

```ts
oncurrentchange?: (ev: MouseEvent | null, row: DT | undefined, data: { select: boolean }) => void;
```

### oncellselected (cell-selected)

Triggered when a cell is selected. ev returns null if not triggered by a click event.

```ts
oncellselected?: (ev: MouseEvent | null, data: { select: boolean; row: DT | undefined; col: StkTableColumn<DT> | undefined }) => void;
```

### onrowdblclick (row-dblclick)

Double click event for a row.

```ts
onrowdblclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onheaderrowmenu (header-row-menu)

Right click event for table header.

```ts
onheaderrowmenu?: (ev: MouseEvent) => void;
```

### onrowmenu (row-menu)

Right click event for table body row.

```ts
onrowmenu?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### oncellclick (cell-click)

Click event for a cell.

```ts
oncellclick?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### oncellmouseenter (cell-mouseenter)

Mouse enter event for a cell.

```ts
oncellmouseenter?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmouseleave (cell-mouseleave)

Mouse leave event for a cell.

```ts
oncellmouseleave?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmouseover (cell-mouseover)

Mouse over event for a cell.

```ts
oncellmouseover?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmousedown (cell-mousedown)

Mouse down event for a cell.

```ts
oncellmousedown?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onheadercellclick (header-cell-click)

Click event for header cell.

```ts
onheadercellclick?: (ev: MouseEvent, col: StkTableColumn<DT>) => void;
```

### ontablescroll (scroll)

Table scroll event.

```ts
ontablescroll?: (ev: Event, data: { startIndex: number; endIndex: number }) => void;
```

### onscrollx (scroll-x)

Table horizontal scroll event.

```ts
onscrollx?: (ev: Event) => void;
```

### oncolorderchange (col-order-change)

Header column drag event.

```ts
oncolorderchange?: (dragStartKey: string, targetColKey: string) => void;
```

### onthdragstart (th-drag-start)

Header column drag start.

```ts
onthdragstart?: (dragStartKey: string) => void;
```

### onthdrop (th-drop)

Header column drag drop.

```ts
onthdrop?: (targetColKey: string) => void;
```

### onroworderchange (row-order-change)

Row drag event.

```ts
onroworderchange?: (dragStartKey: string, targetRowKey: string) => void;
```

### oncolresize (col-resize)

Triggered when column width changes.

```ts
oncolresize?: (col: StkTableColumn<DT>) => void;
```

### onfilterchange (filter-change)

Triggered when filter status changes. This callback is only triggered when calling the `setFilter` method to set the filter status.

```ts
onfilterchange?: (status: Record<UniqKey, FilterStatus>) => void;
```

### ontogglerowexpand (toggle-row-expand)

Triggered when expanding a row.

```ts
ontogglerowexpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### ontoggletreeexpand (toggle-tree-expand)

Triggered when clicking to expand a tree row.

```ts
ontoggletreeexpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onareaselectionchange (area-selection-change)

Area selection change event.

```ts
onareaselectionchange?: (ranges: AreaSelectionRange[]) => void;
```

#### AreaSelectionRange

Cell selection range type. Each range describes the cells covered in the table via the `index` field.

```ts
type AreaSelectionRange = {
    index: {
        /** Column index range [startCol, endCol] (both ends inclusive) @deprecated Use begin/end instead */
        x: [number, number];
        /** Row index range [startRow, endRow] (both ends inclusive) @deprecated Use begin/end instead */
        y: [number, number];
        /** Start point index of the selection */
        begin: { row: number; col: number };
        /** End point index of the selection */
        end: { row: number; col: number };
    };
};
```

| Field | Type | Description |
| --- | --- | --- |
| index.x | `[number, number]` | Column index range covered by the selection, `[startCol, endCol]`, both ends inclusive. Deprecated, use begin/end instead |
| index.y | `[number, number]` | Row index range covered by the selection, `[startRow, endRow]`, both ends inclusive. Deprecated, use begin/end instead |
| index.begin | `{ row: number; col: number }` | Start point index of the selection |
| index.end | `{ row: number; col: number }` | End point index of the selection |

When using Ctrl multi-select or Shift range-select, `ranges` may contain multiple selection ranges.

### onupdatecolumns (update:columns)

Update width when col is resized. Use together with the `columns` prop, updating the external columns data in the callback.

```ts
onupdatecolumns?: (cols: StkTableColumn<DT>[]) => void;
```
