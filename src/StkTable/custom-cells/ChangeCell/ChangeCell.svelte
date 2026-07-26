<script lang="ts">
    import { formatNumber } from '../utils/formatNumber';
    import type { CreateChangeCellOptions } from './createChangeCell';

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
        __options?: CreateChangeCellOptions;
    } = $props();

    /** 涨跌方向：涨 / 跌 / 平（含空值） */
    function resolveDir(rawValue: any): 'rise' | 'fall' | 'flat' {
        const num = rawValue === '' || rawValue == null ? NaN : Number(rawValue);
        if (Number.isNaN(num) || num === 0) return 'flat';
        return num > 0 ? 'rise' : 'fall';
    }

    let dir = $derived(resolveDir(cellValue));

    let colorClass = $derived.by(() => {
        const colorReverse = __options.colorReverse ?? false;
        if (dir === 'rise') return colorReverse ? 'stk-change-cell--green' : 'stk-change-cell--red';
        if (dir === 'fall') return colorReverse ? 'stk-change-cell--red' : 'stk-change-cell--green';
        return 'stk-change-cell--flat';
    });

    /** 自定义颜色（若传）直接内联覆盖 */
    let customColor = $derived(dir === 'rise' ? __options.riseColor : dir === 'fall' ? __options.fallColor : __options.flatColor);

    /** 箭头：涨 ▲ / 跌 ▼，平及空值不显示 */
    let arrowChar = $derived(__options.arrow && dir !== 'flat' ? (dir === 'rise' ? '▲' : '▼') : '');

    let text = $derived(formatNumber(cellValue, __options));
</script>

<span class="stk-change-cell {colorClass}" style={customColor ? `color:${customColor}` : undefined}>
    {#if arrowChar}<span class="stk-change-cell__arrow">{arrowChar}</span>{/if}{text}
</span>
