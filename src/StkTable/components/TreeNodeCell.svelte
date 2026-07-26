<script lang="ts">
    import type { PrivateStkTableColumn } from '../types';
    import TriangleIcon from './TriangleIcon.svelte';

    let { col, row, onclick }: { col: PrivateStkTableColumn<any>; row: any; onclick?: (e: MouseEvent) => void } = $props();
</script>

<div title={row[col.dataIndex] || ''} style={row.__T_LV__ ? `padding-left:${row.__T_LV__ * 16}px` : ''}>
    {#if row.children !== void 0}
        <TriangleIcon onclick={onclick} />
    {/if}
    <span style={!row.children ? 'padding-left: 16px;' : undefined}>
        {row[col.dataIndex] ?? ''}
    </span>
</div>
