<script lang="ts">
    import StkTable from '../StkTable.svelte';
    import type { StkTableColumn } from '../../src/StkTable/index';
    import { useI18n } from '../hooks/useI18n/index';

    const { t } = useI18n();

    type Data = {
        name: string;
        age: number;
        address: string;
        gender: 'male' | 'female';
    };

    const columns: StkTableColumn<Data>[] = [
        { type: 'seq', title: t('seq'), dataIndex: '' as any, width: 50 },
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age', headerAlign: 'right', align: 'right' },
        { title: t('gender'), dataIndex: 'gender', align: 'center' },
        { title: t('address'), dataIndex: 'address' },
    ];

    let dataSource = $state<Data[]>([
        { name: `Jack`, age: 18, address: `Beijing Forbidden City `, gender: 'male' },
        { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
        { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
        { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
    ]);
</script>

<StkTable style="height: 200px" rowKey="name" {columns} {dataSource}></StkTable>
