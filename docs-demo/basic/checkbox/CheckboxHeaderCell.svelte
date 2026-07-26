<script lang="ts">
    // 对应 vue 版 customHeaderCell 中 h() 渲染的全选复选框
    let { dataSource }: any = $props();

    // 是否全选
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

<style>
    input[type='checkbox'] {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }
</style>
