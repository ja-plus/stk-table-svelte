<script lang="ts">
    // 对应 vue 版 customCell 中 h() 渲染的行复选框
    let { class: className, tabindex, row }: any = $props();

    function handleChange(e: Event) {
        row._isChecked = (e.target as HTMLInputElement).checked;
    }
</script>

<div class={className} {tabindex} style="display:flex;align-items:center;justify-content:center">
    <input type="checkbox" checked={row._isChecked} onchange={handleChange} />
</div>

<style>
    input[type='checkbox'] {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }
</style>
