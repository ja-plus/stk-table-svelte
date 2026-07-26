# 行ドラッグ並べ替え

テーブル内の行をドラッグして順序を変更します。

## 例
`StkTableColumn['type']="dragRow"` で組み込みドラッグを使用

::: warning
`dragRow` の列設定では `dataIndex` が指定されていません。これは、一意キーが `props.colKey` でオーバーライドされ、`StkTableColumn['key']` フィールドが優先されるからです。
:::

<demo svelte="advanced/row-drag/RowDrag.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/row-drag/RowDrag.svelte"></demo>

ネイティブ draggable API を使用して自分で実装することもできます。参照してください：

<demo svelte="advanced/row-drag/RowDragCustom.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/row-drag/RowDragCustom.svelte"></demo>

## API

### emits
```ts
/**
 * 行ドラッグイベント
 *
 * ```(dragStartKey: string, targetRowKey: string)```
 */
onroworderchange: (dragStartKey: string, targetRowKey: string) => void;
```
