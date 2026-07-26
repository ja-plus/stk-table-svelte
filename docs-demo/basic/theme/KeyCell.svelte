<script lang="ts">
    // 对应 vue 版 cssVar 列的 customCell：分组行不显示变量名
    let { class: className, tabindex, row, cellValue }: any = $props();
</script>

<div class={className} {tabindex}>{row.children ? '' : cellValue}</div>
