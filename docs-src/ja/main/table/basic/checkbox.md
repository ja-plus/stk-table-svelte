# チェックボックス
## 組み込み拡張機能を使用
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## 独自実装

`customCell` と `customHeaderCell` 設定オプションを通じてチェックボックス機能を実装します。このアプローチは非常に柔軟で、異なるビジネス要件を満たすことができます。
## 例

<demo svelte="basic/checkbox/Checkbox.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/checkbox/Checkbox.svelte"></demo>

## コード実装

列設定にカスタム列を追加してチェックボックスを表示します：

```svelte
<!-- CheckboxHeaderCell.svelte -->
<script lang="ts">
    let { dataSource }: any = $props();

    const isCheckAll = $derived(dataSource.length > 0 && dataSource.every((item: any) => item._isChecked));

    const isCheckPartial = $derived.by(() => {
        const checkedCount = dataSource.filter((item: any) => item._isChecked).length;
        return checkedCount > 0 && checkedCount < dataSource.length;
    });

    function handleChange(e: Event) {
        const checked = (e.target as HTMLInputElement).checked;
        dataSource.forEach((item: any) => {
            item._isChecked = checked;
        });
    }
</script>

<span>
    <input
        type="checkbox"
        style="vertical-align:middle"
        checked={isCheckAll}
        indeterminate={isCheckPartial}
        onchange={handleChange}
    />
</span>

<!-- CheckboxCell.svelte -->
<script lang="ts">
    let { row }: any = $props();

    function handleChange(e: Event) {
        row._isChecked = (e.target as HTMLInputElement).checked;
    }
</script>

<div style="display:flex;align-items:center;justify-content:center">
    <input type="checkbox" checked={row._isChecked} onchange={handleChange} />
</div>
```

```ts
// columns 設定
{
    customHeaderCell: bindComponentProps(CheckboxHeaderCell, { dataSource }),
    customCell: CheckboxCell,
}
```
input要素を垂直方向の中央配置のために親要素でラップします。

プロジェクトのsvelteコンポーネントライブラリ（shadcn-svelte、Skeleton、Flowbite Svelteなど）から `Checkbox` コンポーネントに `input` を置き換えて、プロジェクト全体で一貫したスタイルを維持できます。
