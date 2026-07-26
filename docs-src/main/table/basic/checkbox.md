# 多选框
## 使用内置扩展
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## 自行实现

通过 `customCell` 和 `customHeaderCell` 配置项来自定义实现多选框功能。这种方式非常灵活，可以满足不同的业务需求。
## 示例

<demo svelte="basic/checkbox/Checkbox.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/checkbox/Checkbox.svelte"></demo>

## 代码实现

在 columns 配置中添加一个自定义列，用于显示复选框：

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
// columns 配置
{
    customHeaderCell: bindComponentProps(CheckboxHeaderCell, { dataSource }),
    customCell: CheckboxCell,
}
```
input元素外面加一层父元素，为了垂直居中。

您可以根据项目中使用的svelte组件库(shadcn-svelte, Skeleton, Flowbite Svelte,等)中的`Checkbox`组件来替代`input`实现多选框, 以保持项目整体样式统一。
