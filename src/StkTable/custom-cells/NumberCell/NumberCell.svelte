<script lang="ts">
    import { formatNumber, type FormatNumberOptions } from '../utils/formatNumber';

    let {
        cellValue = null,
        __options = {},
    }: {
        row?: any;
        col?: any;
        cellValue?: any;
        rowIndex?: number;
        colIndex?: number;
        expanded?: any;
        treeExpanded?: any;
        __options?: FormatNumberOptions;
    } = $props();

    let text = $derived(formatNumber(cellValue, __options));
</script>

<span class="stk-number-cell">{text}</span>
