<script lang="ts">
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import StkTable from '../../StkTable.svelte';
    import CheckItem from '../../components/CheckItem.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    let virtual = $state(false);
    let stripe = $state(false);

    const columns: StkTableColumn<any>[] = [
        { type: 'expand', dataIndex: '', width: 50, align: 'center', fixed: 'left' },
        { dataIndex: 'id', title: t('id'), width: 100 },
        { dataIndex: 'address', title: t('address') },
    ];

    const data = new Array(100).fill(0).map((it, index) => {
        return {
            id: index,
            name: 'name' + index,
            address: 'Beijing' + index,
            phone: '1234567890' + index,
        };
    });
    function handleToggleRowExpand(data: any) {
        console.log('handleToggleRowExpand', data);
    }
</script>

<div>
    <CheckItem bind:checked={virtual} text={t('virtual')}></CheckItem>
    <CheckItem bind:checked={stripe} text={t('stripe')}></CheckItem>
    <StkTable
        rowKey="id"
        style="height: 200px"
        {virtual}
        {stripe}
        expandConfig={{
            height: 80,
        }}
        {columns}
        dataSource={data}
        ontogglerowexpand={handleToggleRowExpand}
    >
        {#snippet expand({ row })}
            <p>ID: {row.id}, Phone: {row.phone}</p>
            <p>Name: {row.name}</p>
            <p>Address: {row.address}</p>
        {/snippet}
    </StkTable>
</div>
