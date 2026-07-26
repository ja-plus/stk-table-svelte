<script lang="ts">
    import { onMount, tick } from 'svelte';
    import type { HighlightConfig } from '../../../src/StkTable/types/index';
    import RangeInput from '../../components/RangeInput.svelte';
    import StkTable from '../../StkTable.svelte';
    import { columns, dataSource as dataSourceRaw } from './const';

    let stkTableRef: any;
    let dataSource = $state([...dataSourceRaw]);

    const highlightConfig = $state<HighlightConfig>({
        duration: 2,
        fps: 0,
    });

    let intervals: number[] = [];
    onMount(() => {
        const interval1 = window.setInterval(() => {
            stkTableRef?.setHighlightDimCell('id1', 'age');
        }, 2500);
        const interval2 = window.setInterval(() => {
            stkTableRef?.setHighlightDimCell('id2', 'gender');
        }, 1200);
        const interval3 = window.setInterval(() => {
            stkTableRef?.setHighlightDimRow(['id0']);
        }, 3000);
        intervals.push(interval1, interval2, interval3);

        return () => {
            intervals.forEach(n => window.clearInterval(n));
        };
    });

    function addData() {
        const id = 'id' + dataSource.length;
        dataSource.unshift({
            id,
            name: 'name' + dataSource.length,
            age: dataSource.length,
            gender: dataSource.length % 2 === 0 ? 'male' : 'female',
        });

        dataSource = [...dataSource];

        tick().then(() => {
            stkTableRef?.setHighlightDimRow([id]);
        });
    }
</script>

<button class="btn" style="margin-right: 20px" onclick={addData}>Add data</button>
<RangeInput
    bind:value={highlightConfig.duration}
    min="0.1"
    max="5"
    step="0.1"
    label="Duration"
    suffix="s"
></RangeInput>
<RangeInput
    bind:value={highlightConfig.fps}
    min="0"
    max="30"
    label="FPS"
    suffix="fps"
></RangeInput>
<StkTable
    bind:this={stkTableRef}
    rowKey="id"
    style="height: 200px"
    {highlightConfig}
    {columns}
    {dataSource}
></StkTable>
