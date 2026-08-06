# セルマージ

`StkTableColumns['mergeCells']` 関数を通じてマージするセルを指定します。

```ts
function mergeCells(data: {
    row: any,
    col: StkTableColumn<any>,
    rowIndex: number,
    colIndex: number
}): {
    /** マージする列数 */
    colspan:number, 
    /** マージする行数 */
    rowspan:number
}
```

`{ colspan: number, rowspan: number }` を返してマージするセル数を示し、`colspan` は列用、`rowspan` は行用です。

## 列マージ
<demo svelte="basic/merge-cells/MergeCellsCol.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/merge-cells/MergeCellsCol.svelte"></demo>

### 列マージ仮想リスト <Badge type="tip" text="^1.1.0" />
<demo svelte="basic/merge-cells/MergeCellsColVirtual/index.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/merge-cells/MergeCellsColVirtual/index.svelte"></demo>

::: tip
横方向仮想リストモードでは、マージセル（colspan）のアンカー列が可視エリア外にスクロールアウトした場合、可視列範囲を自動的に拡張し、マージセルの完全なレンダリングを保証します。
:::

## 行マージ
<demo svelte="basic/merge-cells/MergeCellsRow.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/merge-cells/MergeCellsRow.svelte"></demo>

::: tip
テーブルデータが変更されると、`mergeCells` 関数が再度呼び出されて再計算されます。
:::

### 仮想リストでの行マージ
#### シンプルマージ
<demo svelte="basic/merge-cells/MergeCellsRowVirtual/index.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/merge-cells/MergeCellsRowVirtual/index.svelte"></demo>
コードでは、行の `rowspan` フィールドをマージ数として使用するように `mergeCells` 関数が定義されています。
```ts
function mergeCells({ row, col }: { row: any, col: StkTableColumn<any> }) {
    if (!row.rowspan) return;
    return { rowspan: row.rowspan[col.dataIndex] || 1 };
}
```
これにより、`mergeCells` 関数で追加の判断をせず、データに直接マージ数を定義できます。
```ts
{
    id: '1-1-1', continent: 'アジア', country: '日本', province: '東京',
    rowspan: { continent: 12, country: 6, }
}
```
::: tip パフォーマンス
仮想リストモードでは、すべてのマージセル（mergeCells関数）が走査されるため、パフォーマンスにある程度の影響を与える可能性があります。
:::
::: warning 注意
rowspanが非常に大きい場合（例如：1000行）、マージセルはそれでもカバーするすべての行をレンダリングしますTherefore, rowspan is not recommended to be very large.
:::

#### 不規則マージ
<demo svelte="basic/merge-cells/MergeCellsRowVirtual/Special.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/merge-cells/MergeCellsRowVirtual/Special.svelte"></demo>

## 行・列マージ <Badge type="tip" text="^1.1.0" />
行マージ（`rowspan`）と列マージ（`colspan`）は同時に使用でき、`virtual` と `virtual-x` の仮想スクロールにも対応しています。
<demo svelte="basic/merge-cells/MergeCellsRowColVirtual/index.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/merge-cells/MergeCellsRowColVirtual/index.svelte"></demo>

## リアルタイムセル結合
ユーザー操作（範囲選択 + 右クリックメニュー）でセルを動的に結合/分割したい場合は、[リアルタイムセル結合](/ja/demos/realtime-merge-cells)をご参照ください。
