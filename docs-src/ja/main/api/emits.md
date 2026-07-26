# Emits

svelte 版では、イベントはコールバック prop として提供されます（すべて小文字・ハイフンなし）。括弧内は vue 版の対応するイベント名です。

## API

### onsortchange (sort-change)

排序が変更されたときにトリガーされます。defaultSort.dataIndexが見つからない場合、colはnullを返します。

```ts
onsortchange?: (col: StkTableColumn<DT> | null, order: Order, data: DT[], sortConfig: SortConfig<DT>) => void;
```

### onrowclick (row-click)

行のクリックイベント。

```ts
onrowclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### oncurrentchange (current-change)

行が選択されたときにトリガーされます。evはクリックイベントでトリガーされていない場合はnullを返します。

```ts
oncurrentchange?: (ev: MouseEvent | null, row: DT | undefined, data: { select: boolean }) => void;
```

### oncellselected (cell-selected)

セルが選択されたときにトリガーされます。evはクリックイベントでトリガーされていない場合はnullを返します。

```ts
oncellselected?: (ev: MouseEvent | null, data: { select: boolean; row: DT | undefined; col: StkTableColumn<DT> | undefined }) => void;
```

### onrowdblclick (row-dblclick)

行のダブルクリックイベント。

```ts
onrowdblclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onheaderrowmenu (header-row-menu)

テーブルヘッダーの右クリックイベント。

```ts
onheaderrowmenu?: (ev: MouseEvent) => void;
```

### onrowmenu (row-menu)

テーブルボディ行の右クリックイベント。

```ts
onrowmenu?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### oncellclick (cell-click)

セルのクリックイベント。

```ts
oncellclick?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### oncellmouseenter (cell-mouseenter)

セルのマウスエンターイベント。

```ts
oncellmouseenter?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmouseleave (cell-mouseleave)

セルのマウスリーブイベント。

```ts
oncellmouseleave?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmouseover (cell-mouseover)

セルのマウスオーバイベント。

```ts
oncellmouseover?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### oncellmousedown (cell-mousedown)

セルのマウストラッグイベント。

```ts
oncellmousedown?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onheadercellclick (header-cell-click)

ヘッダーセルのクリックイベント。

```ts
onheadercellclick?: (ev: MouseEvent, col: StkTableColumn<DT>) => void;
```

### ontablescroll (scroll)

テーブルスクロールイベント。

```ts
ontablescroll?: (ev: Event, data: { startIndex: number; endIndex: number }) => void;
```

### onscrollx (scroll-x)

テーブル横スクロールイベント。

```ts
onscrollx?: (ev: Event) => void;
```

### oncolorderchange (col-order-change)

ヘッダー列ドラッグイベント。

```ts
oncolorderchange?: (dragStartKey: string, targetColKey: string) => void;
```

### onthdragstart (th-drag-start)

ヘッダー列ドラッグ開始。

```ts
onthdragstart?: (dragStartKey: string) => void;
```

### onthdrop (th-drop)

ヘッダー列ドラッグドロップ。

```ts
onthdrop?: (targetColKey: string) => void;
```

### onroworderchange (row-order-change)

行ドラッグイベント。

```ts
onroworderchange?: (dragStartKey: string, targetRowKey: string) => void;
```

### oncolresize (col-resize)

列幅が変更されたときにトリガーされます。

```ts
oncolresize?: (col: StkTableColumn<DT>) => void;
```

### onfilterchange (filter-change)

フィルター状態が変更されたときにトリガーされます。`setFilter` メソッドを呼び出してフィルター状態を設定したときにのみこのコールバックがトリガーされます。

```ts
onfilterchange?: (status: Record<UniqKey, FilterStatus>) => void;
```

### ontogglerowexpand (toggle-row-expand)

行を展開ときにトリガーされます。

```ts
ontogglerowexpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### ontoggletreeexpand (toggle-tree-expand)

ツリー行を展開するためにクリックしたときにトリガーされます。

```ts
ontoggletreeexpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onareaselectionchange (area-selection-change)

エリア選択変更イベント。

```ts
onareaselectionchange?: (ranges: AreaSelectionRange[]) => void;
```

#### AreaSelectionRange

セル選択範囲の型。各選択範囲は `index` フィールドでテーブル内のセル範囲を表します。

```ts
type AreaSelectionRange = {
    index: {
        /** 列インデックス範囲 [開始列, 終了列]（両端を含む） @deprecated begin/endを使用してください */
        x: [number, number];
        /** 行インデックス範囲 [開始行, 終了行]（両端を含む） @deprecated begin/endを使用してください */
        y: [number, number];
        /** 選択範囲の開始点インデックス */
        begin: { row: number; col: number };
        /** 選択範囲の終了点インデックス */
        end: { row: number; col: number };
    };
};
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| index.x | `[number, number]` | 選択範囲が覆う列インデックス範囲、`[開始列, 終了列]`、両端を含む。非推奨、begin/endを使用してください |
| index.y | `[number, number]` | 選択範囲が覆う行インデックス範囲、`[開始行, 終了行]`、両端を含む。非推奨、begin/endを使用してください |
| index.begin | `{ row: number; col: number }` | 選択範囲の開始点インデックス |
| index.end | `{ row: number; col: number }` | 選択範囲の終了点インデックス |

Ctrl 複数選択または Shift 範囲選択を使用する場合、`ranges` には複数の選択範囲が含まれる可能性があります。

### onupdatecolumns (update:columns)

列のサイズ変更時に幅を更新します。`columns` prop と組み合わせて使用し、コールバック内で外部の columns データを更新します。

```ts
onupdatecolumns?: (cols: StkTableColumn<DT>[]) => void;
```
