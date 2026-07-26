# Emits 事件

svelte 版本中，事件以回调 prop 形式提供（全小写、无连字符），括号内为 vue 版对应的事件名。

## API

### onsortchange (sort-change)

排序变更触发。defaultSort.dataIndex 找不到时，col 将返回 null。

```ts
onsortchange?: (col: StkTableColumn<DT> | null, order: Order, data: DT[], sortConfig: SortConfig<DT>) => void;
```

### onrowclick (row-click)

一行点击事件。

```ts
onrowclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### oncurrentchange (current-change)

选中一行触发。ev 返回 null 表示不是点击事件触发的。

```ts
oncurrentchange?: (ev: MouseEvent | null, row: DT | undefined, data: { select: boolean }) => void;
```

### oncellselected (cell-selected)

选中单元格触发。ev 返回 null 表示不是点击事件触发的。

```ts
oncellselected?: (ev: MouseEvent | null, data: { select: boolean; row: DT | undefined; col: StkTableColumn<DT> | undefined }) => void;
```

### onrowdblclick (row-dblclick)

行双击事件。

```ts
onrowdblclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onheaderrowmenu (header-row-menu)

表头右键事件。

```ts
onheaderrowmenu?: (ev: MouseEvent) => void;
```

### onrowmenu (row-menu)

表体行右键点击事件。

```ts
onrowmenu?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### oncellclick (cell-click)

单元格点击事件。

```ts
oncellclick?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### oncellmouseenter (cell-mouseenter)

单元格鼠标进入事件。

```ts
oncellmouseenter?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmouseleave (cell-mouseleave)

单元格鼠标移出事件。

```ts
oncellmouseleave?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmouseover (cell-mouseover)

单元格悬浮事件。

```ts
oncellmouseover?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmousedown (cell-mousedown)

单元格鼠标按下事件。

```ts
oncellmousedown?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onheadercellclick (header-cell-click)

表头单元格点击事件。

```ts
onheadercellclick?: (ev: MouseEvent, col: StkTableColumn<DT>) => void;
```

### ontablescroll (scroll)

表格滚动事件。

```ts
ontablescroll?: (ev: Event, data: { startIndex: number; endIndex: number }) => void;
```

### onscrollx (scroll-x)

表格横向滚动事件。

```ts
onscrollx?: (ev: Event) => void;
```

### oncolorderchange (col-order-change)

表头列拖动事件。

```ts
oncolorderchange?: (dragStartKey: string, targetColKey: string) => void;
```

### onthdragstart (th-drag-start)

表头列拖动开始。

```ts
onthdragstart?: (dragStartKey: string) => void;
```

### onthdrop (th-drop)

表头列拖动 drop。

```ts
onthdrop?: (targetColKey: string) => void;
```

### onroworderchange (row-order-change)

行拖动事件。

```ts
onroworderchange?: (dragStartKey: string, targetRowKey: string) => void;
```

### oncolresize (col-resize)

列宽变动时触发。

```ts
oncolresize?: (col: StkTableColumn<DT>) => void;
```

### onfilterchange (filter-change)

筛选状态变更时触发。通过调用 `setFilter` 方法设置筛选状态时才会触发此回调。

```ts
onfilterchange?: (status: Record<UniqKey, FilterStatus>) => void;
```

### ontogglerowexpand (toggle-row-expand)

展开行触发。

```ts
ontogglerowexpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### ontoggletreeexpand (toggle-tree-expand)

点击展开树行触发。

```ts
ontoggletreeexpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onareaselectionchange (area-selection-change)

单元格选区变更事件。

```ts
onareaselectionchange?: (ranges: AreaSelectionRange[]) => void;
```

#### AreaSelectionRange

单元格选区范围类型。每个选区通过 `index` 字段描述在表格中覆盖的单元格范围。

```ts
type AreaSelectionRange = {
    index: {
        /** 列索引范围 [起始列, 结束列]（包含两端） @deprecated 请使用 begin/end */
        x: [number, number];
        /** 行索引范围 [起始行, 结束行]（包含两端） @deprecated 请使用 begin/end */
        y: [number, number];
        /** 选区起始点索引 */
        begin: { row: number; col: number };
        /** 选区结束点索引 */
        end: { row: number; col: number };
    };
};
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| index.x | `[number, number]` | 选区覆盖的列索引范围，`[起始列, 结束列]`，包含两端。已废弃，请使用 begin/end |
| index.y | `[number, number]` | 选区覆盖的行索引范围，`[起始行, 结束行]`，包含两端。已废弃，请使用 begin/end |
| index.begin | `{ row: number; col: number }` | 选区起始点索引 |
| index.end | `{ row: number; col: number }` | 选区结束点索引 |

当使用 Ctrl 多选或 Shift 扩选时，`ranges` 可能包含多个选区。

### onupdatecolumns (update:columns)

col resize 时更新宽度。配合 `columns` prop 使用，在回调中更新外部的 columns 数据。

```ts
onupdatecolumns?: (cols: StkTableColumn<DT>[]) => void;
```
