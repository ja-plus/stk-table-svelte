<script lang="ts">
    import { onMount } from 'svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import StkTable from '../../StkTable.svelte';

    let stkTableRef: any;

    const columns: StkTableColumn<any>[] = [
        { title: 'Name', dataIndex: 'name', width: 200, className: 'my-td' },
        { title: 'Age', dataIndex: 'age', fixed: 'left', align: 'right', headerAlign: 'right' },
        { title: 'Gender', dataIndex: 'gender', width: 150 },
    ];

    const dataSource: any = new Array(5).fill(0).map((it, i) => ({
        id: 'id' + i,
        name: 'name' + i,
        age: Math.ceil(Math.random() * 100),
        gender: Number(Math.random() * 100 - 50).toFixed(2),
    }));

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
        const interval4 = window.setInterval(() => {
            stkTableRef?.setHighlightDimRow(['id3'], { method: 'css' });
        }, 1000);
        const interval5 = window.setInterval(() => {
            stkTableRef?.setHighlightDimRow(['id4'], {
                method: 'css',
                className: 'special-highlight-row',
                duration: 2000,
            });
        }, 1600);
        const interval6 = window.setInterval(() => {
            stkTableRef?.setHighlightDimCell('id5', 'name', {
                method: 'css',
                className: 'special-highlight-cell',
                duration: 1000,
            });
        }, 2300);
        const interval7 = window.setInterval(() => {
            stkTableRef?.setHighlightDimCell('id6', 'age', {
                method: 'css',
                className: 'special-highlight-cell-red',
                duration: 1500,
            });
        }, 2600);
        const interval8 = window.setInterval(() => {
            stkTableRef?.setHighlightDimCell('id7', 'name', {
                keyframe: {
                    color: ['#fff', '#C70000', '#fff'],
                    transform: ['scale(1)', 'scale(1.2)', 'scale(1)'],
                    boxShadow: ['unset', '0 0 10px #aaa', 'unset'],
                    easing: 'cubic-bezier(.11,.1,.03,.98)',
                },
                duration: 1000,
            });
        }, 1790);
        intervals.push(
            interval1,
            interval2,
            interval3,
            interval4,
            interval5,
            interval6,
            interval7,
            interval8,
        );

        return () => {
            intervals.forEach(n => {
                window.clearInterval(n);
            });
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
