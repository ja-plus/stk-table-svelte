<script lang="ts">
    import { onMount } from 'svelte';
    import StkTable from '../../StkTable.svelte';
    import { columns, dataSource } from './const';

    let stkTableRef: any;

    let intervals: number[] = [];
    onMount(() => {
        const interval1 = window.setInterval(() => {
            stkTableRef?.setHighlightDimRow(['id0'], { method: 'css' });
        }, 1000);
        const interval2 = window.setInterval(() => {
            stkTableRef?.setHighlightDimRow(['id1'], {
                method: 'css',
                className: 'special-highlight-row',
                duration: 2000,
            });
        }, 1600);
        const interval3 = window.setInterval(() => {
            stkTableRef?.setHighlightDimCell('id2', 'name', {
                method: 'css',
                className: 'special-highlight-cell',
                duration: 1000,
            });
        }, 2300);
        const interval4 = window.setInterval(() => {
            stkTableRef?.setHighlightDimCell('id3', 'age', {
                method: 'css',
                className: 'special-highlight-cell-red',
                duration: 1500,
            });
        }, 2600);
        intervals.push(interval1, interval2, interval3, interval4);

        return () => {
            intervals.forEach(n => window.clearInterval(n));
        };
    });
</script>

<StkTable
    bind:this={stkTableRef}
    rowKey="id"
    {columns}
    {dataSource}
></StkTable>

<style>
    @keyframes -global-my-highlight-row {
        from {
            background-color: #bd7201;
        }
    }
    @keyframes -global-my-highlight-cell {
        from {
            background-color: #5fa95f;
        }
    }
    @keyframes -global-my-highlight-cell-red {
        from {
            background-color: #b14949;
        }
    }
    :global(.special-highlight-row) {
        animation: my-highlight-row 2s linear;
    }
    :global(.special-highlight-cell) {
        animation: my-highlight-cell 1s linear;
    }
    :global(.special-highlight-cell-red) {
        animation: my-highlight-cell-red 1.5s linear;
    }
</style>
