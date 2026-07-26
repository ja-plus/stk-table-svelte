<script lang="ts">
    // 对应 vue 版 customCell 中 h() 渲染的自定义展开触发单元格
    let { class: className, tabindex, row, col, cellValue, expanded, onCellClick }: any = $props();

    const iconClass = $derived(
        'custom-expand-icon' + (expanded && expanded.dataIndex === 'name' ? ' custom-expand-icon-active' : ''),
    );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class={className} {tabindex} style="display: flex; align-items: center; " onclick={() => onCellClick(row, col)}>
    <span class={iconClass}></span>
    <span>{cellValue}</span>
</div>
