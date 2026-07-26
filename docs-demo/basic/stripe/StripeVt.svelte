<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import { useI18n } from '../../hooks/useI18n/index';
    const { t } = useI18n();

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    // 模拟500条数据
    let dataSource = $state(
        Array.from({ length: 500 }, (_, i) => ({
            key: i,
            name: `Edward King ${i}`,
            age: 32,
            address: `London, Park Lane no. ${i}`,
            gender: i % 2 === 0 ? 'male' : 'female',
        })),
    );
</script>

<StkTable style="height: 200px" virtual stripe {columns} {dataSource}></StkTable>
