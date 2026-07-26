<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    let columns = $state<StkTableColumn<any>[]>([
        { title: t('name'), dataIndex: 'name', width: 100, fixed: 'left' },
        { title: t('age'), dataIndex: 'age', width: 60 },
        { title: t('gender'), dataIndex: 'gender', width: 80 },
        { title: t('address'), dataIndex: 'address', width: 200 },
        { title: t('operate'), dataIndex: '', width: 100, fixed: 'right' },
    ]);

    const dataSource = [
        {
            name: `Jack`,
            age: 18,
            address: `Beijing Forbidden City, ${' Long text'.repeat(20)}`,
            gender: 'male',
        },
        { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
        { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
        { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
    ];
</script>

<StkTable
    {columns}
    onupdatecolumns={(cols: StkTableColumn<any>[]) => (columns = cols)}
    rowKey="name"
    virtual
    headerDrag
    fixedColShadow
    {dataSource}
></StkTable>
