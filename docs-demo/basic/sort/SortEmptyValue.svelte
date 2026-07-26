<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import { useI18n } from '../../hooks/useI18n/index';
    const { t } = useI18n();

    type DataType = {
        key: string;
        name: string;
        age: number | null;
    };

    const columns: StkTableColumn<DataType>[] = [
        { type: 'seq', title: t('seq'), dataIndex: '' as any, width: 50 },
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age', align: 'right', sortType: 'number', sorter: true },
    ];

    let dataSource = $state<DataType[]>([
        { key: '1', name: 'John Brown', age: 365 },
        { key: '2', name: 'John Brown', age: 60 },
        { key: '3', name: 'John Brown', age: 90 },
        { key: '4', name: 'John Brown', age: null },
        { key: '5', name: 'John Brown', age: 730 },
    ]);
</script>

<StkTable style="height: 200px" rowKey="key" sortConfig={{ emptyToBottom: true }} {columns} {dataSource}></StkTable>
