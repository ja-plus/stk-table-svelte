<script lang="ts">
    import type { CustomCellProps } from '../../../../src/StkTable/types/index';
    import type { DataType } from '../types';
    let props: CustomCellProps<DataType> & { class?: string; tabindex?: number } = $props();
    const sourceNameMap: any = {
        1: 'Aa',
        2: 'Bb',
        3: 'Cc',
        4: 'Dd',
        5: 'Ee',
        6: 'Ff',
    };
</script>

<div class={props.class} tabindex={props.tabindex}>
    <div class="source-cell source-{props.cellValue}">{sourceNameMap[props.cellValue]}</div>
</div>
