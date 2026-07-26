<script lang="ts">
    import { onMount, tick } from 'svelte';
    import StkTable from '../../StkTable.svelte';
    import { columns, dataSource as dataSourceRaw } from './const';

    let stkTableRef: any;
    let dataSource = $state([...dataSourceRaw]);

    let intervals: number[] = [];
    onMount(() => {
        const interval1 = window.setInterval(() => {
            stkTableRef?.setHighlightDimCell('id1', 'age', {
                keyframe: {
                    color: ['#fff', '#C70000', '#fff'],
                    transform: ['scale(1)', 'scale(1.1)', 'scale(1)'],
                    boxShadow: ['unset', '0 0 10px #aaa', 'unset'],
                    easing: 'cubic-bezier(.11,.1,.03,.98)',
                },
                duration: 1000,
            });
        }, 1790);
        intervals.push(interval1);

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
            addRowAnimation(id);
        });
    }

    function addRowAnimation(id: string) {
        stkTableRef?.setHighlightDimRow([id], {
            keyframe: [
                {
                    backgroundColor: '#1e4c99',
                    transform: 'translateY(-30px) scale(0.6)',
                    opacity: 0,
                    easing: 'cubic-bezier(.11,.1,.03,.98)',
                },
                { backgroundColor: '#1B1B24', transform: 'translateY(0) scale(1)', opacity: 1 },
            ],
            duration: 1000,
        });
    }
</script>

<button class="btn" onclick={addData}>Add data</button>
<StkTable
    bind:this={stkTableRef}
    style="height: 200px"
    rowKey="id"
    {columns}
    {dataSource}
></StkTable>
