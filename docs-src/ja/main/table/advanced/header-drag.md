# ヘッダードラッグ

* `headerDrag` プロパティを設定して、列ドラッグ並べ替えを有効にします。
* `columns` は `onupdatecolumns` コールバックで書き戻すように設定する必要があります。

```js
<StkTable
    headerDrag // [!code ++]
    {columns}
    onupdatecolumns={cols => (columns = cols)} // [!code ++]
></StkTable>
```

ヘッダーをドラッグしてみてください

<demo svelte="advanced/header-drag/HeaderDrag.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/header-drag/HeaderDrag.svelte"></demo>

## イベントで順序を変更
```ts
/**
 * ヘッダー列ドラッグイベント
 * ```(dragStartKey: string, targetColKey: string)```
 */
oncolorderchange: (dragStartKey: string, targetColKey: string) => void;
```

この方法では、`onupdatecolumns` コールバックを設定する必要はありません。`columns` 配列の順序を手動で更新できます。

## API

### props.headerDrag

```ts
/** ヘッダードラッグ設定 */
export type HeaderDragConfig<DT extends Record<string, any> = any> =
    | boolean
    | {
          /**
           * 列交換モード
           * - none - 何もしない
           * - insert - 挿入（デフォルト）
           * - swap - 交換
           */
          mode?: 'none' | 'insert' | 'swap';
          /** ドラッグを無効にする列 */
          disabled?: (col: StkTableColumn<DT>) => boolean;
      };
```

### emit
```ts
/**
 * ヘッダー列ドラッグイベント
 * ```(dragStartKey: string, targetColKey: string)```
 */
oncolorderchange: (dragStartKey: string, targetColKey: string) => void;
/**
 * ヘッダー列ドラッグ開始
 * ```(dragStartKey: string)```
 */
onthdragstart: (dragStartKey: string) => void;
/**
 * ヘッダー列ドラッグドロップ
 * ```(targetColKey: string)```
 */
onthdrop: (targetColKey: string) => void;
```
