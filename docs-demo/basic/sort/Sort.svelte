<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    type DataType = {
        key: string;
        name: string;
        age: number;
        gender: string;
    };

    const columns: StkTableColumn<DataType>[] = [
        { title: t('name'), dataIndex: 'name', width: 100, sorter: true },
        { title: t('age'), dataIndex: 'age', sorter: true },
        { title: t('gender'), dataIndex: 'gender', sorter: true },
    ];

    let dataSource = $state<DataType[]>(
        // 100 个假数据
        Array.from({ length: 100 }, (_, i) => ({
            key: i.toString(),
            name: `Name ${i}`,
            age: Math.round(Math.random() * 100),
            gender: i % 2 === 0 ? 'Male' : 'Female',
        })),
    );
</script>

<StkTable style="height: 200px" rowKey="key" {columns} {dataSource}></StkTable>
