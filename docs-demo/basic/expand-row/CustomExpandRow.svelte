<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import { bindComponentProps } from '../../../src/StkTable/custom-cells/utils/bindComponent';
    import CheckItem from '../../components/CheckItem.svelte';
    import { useI18n } from '../../hooks/useI18n/index';
    import CustomExpandCell from './CustomExpandCell.svelte';

    const { t } = useI18n();

    let virtual = $state(false);

    let stkTableRef: any;

    const columns: StkTableColumn<any>[] = [
        { type: 'expand', dataIndex: '', width: 50, align: 'center', fixed: 'left' },
        {
            type: 'expand',
            dataIndex: 'name',
            title: t('customExpandRow'),
            width: 80,
            customCell: bindComponentProps(CustomExpandCell, { onCellClick: handleCustomCellClick }),
        },
        { dataIndex: 'id', title: t('id') + '(100px)', width: '100px' },
        { dataIndex: 'address', title: t('address') },
        { dataIndex: 'email', title: t('email') },
        { dataIndex: 'phone', title: t('phone') },
        { dataIndex: 'website', title: t('website') },
        { dataIndex: 'company', title: t('company') },
        { dataIndex: 'catchPhrase', title: t('catchPhrase') },
        { dataIndex: 'bs', title: t('bs') },
    ];

    const data = new Array(100).fill(0).map((it, index) => {
        return {
            id: index,
            name: 'name' + index,
            address: 'sss',
            email: 'email' + index + '@example.com',
            phone: '123-456-7890',
            website: 'www.example.com',
            company: 'Company' + index,
            catchPhrase: 'Catch Phrase' + index,
            bs: 'BS' + index,
        };
    });
    function handleCustomCellClick(row: any, col: StkTableColumn<any>) {
        stkTableRef?.setRowExpand(row, null, { col, silent: true });
    }
    function handleToggleRowExpand(data: any) {
        console.log('handleToggleRowExpand', data);
    }
</script>

<div>
    <CheckItem bind:checked={virtual} text={t('virtual')}></CheckItem>
    <StkTable
        bind:this={stkTableRef}
        rowKey="id"
        style="height: 400px"
        {virtual}
        expandConfig={{
            height: 80,
        }}
        {columns}
        dataSource={data}
        ontogglerowexpand={handleToggleRowExpand}
    >
        {#snippet expand({ row, col })}
            <div>trigger: {col.title || '--'}</div>
            <p>id: {row.id}, phone: {row.phone}</p>
            <p>name: {row.name}</p>
            <p>website: {row.website}</p>
        {/snippet}
    </StkTable>
</div>

<style>
    div :global(.stk-table .custom-expand-icon) {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-right: 6px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border: 1px solid;
        transition: all 0.2s ease;
    }
    div :global(.stk-table .custom-expand-icon-active) {
        background-color: #1890ff;
        color: #fff;
        transform: rotate(90deg);
    }
</style>
