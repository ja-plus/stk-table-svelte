<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import CheckItem from '../../components/CheckItem.svelte';
    import { useI18n } from '../../hooks/useI18n';
    const { t } = useI18n();

    let headless = $state(true);
    const columns: StkTableColumn<any>[] = [
        { dataIndex: 'vHead', title: t('vHead'), className: 'v-head', width: 100 },
        { dataIndex: 'col1', title: t('col1') },
        { dataIndex: 'vHead2', title: t('vHead2'), className: 'v-head', width: 100 },
        { dataIndex: 'col2', title: t('col2') },
    ];
    const data = [
        { vHead: 'Name', col1: 'Jack', vHead2: 'Birthday', col2: '1990-01-01' },
        { vHead: 'Age', col1: '24', vHead2: 'School', col2: 'University' },
        { vHead: 'Address', col1: 'Beijing', vHead2: 'ID Card', col2: '1234567890' },
    ];
</script>

<CheckItem bind:checked={headless} text={t('headless')}></CheckItem>
<StkTable
    class="headless-demo"
    rowKey="id"
    rowActive={false}
    rowHover={false}
    {headless}
    {columns}
    dataSource={data}
></StkTable>

<style>
    :global(.stk-table.headless-demo .v-head) {
        background-color: #eee;
    }
    :global(.stk-table.dark.headless-demo .v-head) {
        background-color: #333;
    }
    :global(.headless-demo .v-head) {
        font-weight: bold;
    }
</style>
