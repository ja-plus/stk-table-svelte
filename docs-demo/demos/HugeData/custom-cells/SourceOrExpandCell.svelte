<script lang="ts">
    // 对应 vue 版 columns.ts 中 source 列 customCell 的 h() 分支渲染：
    // 子行渲染 SourceCell，否则渲染 ExpandCell
    import type { CustomCellProps } from '../../../../src/StkTable/types/index';
    import type { DataType } from '../types';
    import ExpandCell from './ExpandCell.svelte';
    import SourceCell from './SourceCell.svelte';

    let props: CustomCellProps<DataType> & { class?: string; tabindex?: number } = $props();
</script>

{#if props.row._isChildren}
    <SourceCell {...props} />
{:else}
    <ExpandCell {...props} />
{/if}
