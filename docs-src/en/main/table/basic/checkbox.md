# Checkbox
## Using Built-in Extension <Badge type="tip" text="^1.0.0" />
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## Custom Implementation

Implement checkbox functionality through `customCell` and `customHeaderCell` configuration options. This approach is very flexible and can meet different business requirements.
## Example

<demo svelte="basic/checkbox/Checkbox.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/checkbox/Checkbox.svelte"></demo>

## Code Implementation

Add a custom column to the columns configuration to display checkboxes:

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
// columns configuration
{
    customHeaderCell: bindComponentProps(CheckboxHeaderCell, { dataSource }),
    customCell: CheckboxCell,
}
```
Wrap the input element in a parent element for vertical centering.

You can replace the `input` with the `Checkbox` component from the Svelte component library used in your project (shadcn-svelte, Skeleton, Flowbite Svelte, etc.) to maintain a consistent style throughout the project.
