<script lang="ts">
    import type { DataType } from './types';
    import type { CustomCellProps } from '../../../../src/StkTable/types/index';

    // svelte 无属性透传，需显式接收并应用 class/tabindex
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
