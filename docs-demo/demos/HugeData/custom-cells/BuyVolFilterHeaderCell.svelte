<script lang="ts">
    // 对应 vue 版 columns.ts 中 bestBuyVol 列 Filter 第二参数的 h('span') 自定义表头内容
    import type { StkTableColumn } from '../../../../src/StkTable/index';
    import type { DataType } from '../types';
    import { filterStatus } from '../columns';

    let { col }: { col: StkTableColumn<DataType> } = $props();
</script>

<span>{col.title + `(${filterStatus.bestBuyVol?.value || '-'})`}</span>
