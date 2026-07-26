# カスタムセル

* `StkTableColumn['customCell']` を介して**ボディ**セルコンテンツをカスタマイズします。
* `StkTableColumn['customHeaderCell']` を介して**ヘッダー**セルコンテンツをカスタマイズします。

`customCell` と `customHeaderCell` は同様の方法で使用されます。ここで `customCell` を例として使用します。

::: warning 推奨事項
* `customCell` を要素（div、spanなど）でラップすることをお勧めします。そうしないと、`TextNode` が &lt;td&gt; の子要素として存在するとレイアウト問題が発生する可能性があります。
* `customCell` のルート要素をインライン要素（inline、inline-block、inline-flexなど）に設定することに**注意してください**。このレイアウトは**仮想リスト**で行の高さを引き伸ばす可能性があります。
:::

### Svelte コンポーネントでの使用
Svelte コンポーネントの受け渡しをサポートしています。コンポーネントのpropsは `CustomCellProps` 型で特に定義する必要があります。

::: tip ベストプラクティス
列を別ファイルで定義してエクスポートすることをお勧めします。
:::

::: code-group
```ts [column.ts]
import { StkTableColumn } from 'stk-table-svelte/src/StkTable/index';
import type { DataType } from './types';
import YieldCell from './YieldCell.svelte';
export const columns: StkTableColumn<DataType> = [{
    title: '歩留まり',
    dataIndex: 'yield',
    customCell: YieldCell
}]
```
```svelte [YieldCell.svelte]
<script lang="ts">
    import type { DataType } from './types';
    import type { CustomCellProps } from 'stk-table-svelte/src/StkTable/types/index';

    // svelte は属性の透過渡しが無いため、class/tabindex を明示的に受け取って適用する必要があります
    let { class: classNameProp, tabindex, cellValue }: CustomCellProps<DataType> & { class?: string; tabindex?: number } = $props();

    let className = $derived.by(() => {
        let name = '';
        if (cellValue > 0) {
            name = 'color-up';
        } else if (cellValue < 0) {
            name = 'color-down';
        }
        return name;
    });
</script>

<span class="{classNameProp} {className}" {tabindex}>{cellValue > 0 ? '+' : ''}{(cellValue * 100).toFixed(4)}%</span>

<style>
    :global(.color-up) {
        color: #2fc87b;
    }
    :global(.color-down) {
        color: #ff2b48;
    }
</style>
```
```ts [types.ts]
export type DataType = {
    name: string;
    yield: number;
};
```
:::

<demo svelte="advanced/custom-cell/CustomCell/index.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/custom-cell/CustomCell/index.svelte"></demo>

### コンポーネントが受け取る props
Svelte には vue のような属性透過の仕組みがないため、`customCell` コンポーネントは以下の props を受け取ります。そのうち `class`、`tabindex` は明示的に受け取ってルート要素に適用する必要があります：

| prop | 説明 |
|---|---|
| class | セルコンテンツの class。ルート要素に適用する必要があります |
| tabindex | キーボードナビゲーションに必要な tabindex。ルート要素に適用する必要があります |
| col | 列設定 |
| row | 行データ |
| rowIndex | 行インデックス |
| colIndex | 列インデックス |
| cellValue | `row[col.dataIndex]` の値 |
| expanded | 現在の行が展開されているかどうか |
| treeExpanded | ツリーノードの現在の行が展開されているかどうか |
| onTriangleClick | ツリーノード展開/折りたたみコールバック（`type: 'tree-node'` 列） |
| onDragStart | 行ドラッグ開始コールバック（`type: 'dragRow'` 列） |



## API
| プロパティ | props | デフォルト | 説明 |
|---|---|---|---|
| customCell | Component&lt;Partial&lt;CustomCellProps&gt;&gt; | - | カスタムセルレンダリングコンポーネント |
| customHeaderCell | Component&lt;Partial&lt;CustomHeaderCellProps&gt;&gt; | - | カスタムヘッダーセルレンダリングコンポーネント |

### types
customCell props 型
```ts
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** row[col.dataIndex] の値 */
    cellValue: any;
    rowIndex: number;
    /** 
     * 列インデックス（0から開始）
     * 
     * 注意：
     * - virtual-xでは、そうでない場合は仮想リスト内のインデックスを表します
     */
    colIndex: number;
    /**
     * 現在の行が展開されているかどうか
     * - 展開されていない：null
     * - 展開されている：列設定を返します
     */
    expanded?: StkTableColumn<any>;
    /** 現在のツリーノード行が展開されているかどうか */
    treeExpanded?: boolean;
};

export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    /** 
     * 列インデックス（0から開始）
     * 
     * 注意：
     * - virtual-xでは、そうでない場合は仮想リスト内のインデックスを表します
     */
    colIndex: number;
};
```
