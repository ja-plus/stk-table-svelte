<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import CheckItem from '../../components/CheckItem.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    let virtual = $state(false);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('gender'), dataIndex: 'gender' },
        { title: t('address'), dataIndex: 'address', maxWidth: 200 },
    ];

    let dataSource = $state([
        {
            name: `Jack`,
            age: 18,
            address: `Beijing Forbidden City, ${' Long text'.repeat(20)}`,
            gender: 'male',
        },
        { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
        { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
        { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
        ...new Array(50).fill(0).map((_, i) => ({
            name: `Jack${i}`,
            age: 18,
            address: `Beijing Forbidden City `,
            gender: 'male',
        })),
    ]);
</script>

<CheckItem bind:checked={virtual} text={t('virtual')}></CheckItem>
<StkTable style="height: 200px" {virtual} rowHeight={40} headerRowHeight={50} {columns} {dataSource}></StkTable>
