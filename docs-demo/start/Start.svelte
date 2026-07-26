<script lang="ts">
    import { onMount } from 'svelte';
    import type { StkTableColumn } from '../../src/StkTable/index';
    import StkTable from '../StkTable.svelte';
    import { useI18n } from '../hooks/useI18n/index';

    const { t } = useI18n();

    let stkTableRef = $state<StkTable | null>(null);

    type DataType = {
        id: string;
        name: string;
        age: number;
        address: string;
    };
    const columns: StkTableColumn<DataType>[] = [
        { title: t('name'), dataIndex: 'name', key: 'name' },
        { title: t('age'), dataIndex: 'age', key: 'age', align: 'right' },
        { title: t('address'), dataIndex: 'address', key: 'address' },
    ];
    const dataSource: DataType[] = [
        { id: 'k1', name: 'Tom', age: 18, address: 'Beijing' },
        { id: 'k2', name: 'Jerry', age: 19, address: 'Shanghai' },
        { id: 'k3', name: 'Jack', age: 20, address: 'London' },
        { id: 'k4', name: 'Rose', age: 22, address: 'New York' },
    ];

    onMount(() => {
        const interval = window.setInterval(() => {
            stkTableRef?.setHighlightDimRow(['k1']); // highlight row
        }, 2000);
        return () => {
            window.clearInterval(interval);
        };
    });
</script>

<StkTable bind:this={stkTableRef} rowKey="id" {columns} {dataSource}></StkTable>
