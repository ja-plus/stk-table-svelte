<script lang="ts">
    import StkTable from '../../../StkTable.svelte';
    import { createCheckboxCell } from '../../../../src/StkTable/index';
    import { useI18n } from '../../../hooks/useI18n/index';

    const { t } = useI18n();

    const { CheckboxCell, CheckboxAllCell } = createCheckboxCell({
        field: '_isChecked',
        onChange: (checked: any, row: any) => {
            console.log('行选中变更:', checked, row);
        },
        onSelectAll: (checked: any) => {
            console.log('全选变更:', checked);
        },
    });
    const columns = [
        {
            dataIndex: 'checkbox',
            align: 'center',
            width: 70,
            fixed: 'left',
            customCell: CheckboxCell,
            customHeaderCell: CheckboxAllCell,
        },
        { title: t('name'), dataIndex: 'name', width: 120 },
        { title: t('age'), dataIndex: 'age', width: 80, align: 'right' },
        { title: t('address'), dataIndex: 'address', width: 200 },
    ];

    const dataSource = $state<Record<string, any>[]>([
        { id: 1, name: 'Alice', age: 25, address: 'Haidian District, Beijing', _isChecked: true },
        { id: 2, name: 'Bob', age: 28, address: 'Pudong New Area, Shanghai', _isChecked: true },
        { id: 3, name: 'Charlie', age: 32, address: 'Tianhe District, Guangzhou' },
        { id: 4, name: 'David', age: 29, address: 'Nanshan District, Shenzhen' },
        { id: 5, name: 'Eve', age: 27, address: 'Xihu District, Hangzhou' },
        ...Array.from({ length: 25 }, (_, i) => ({
            id: i + 6,
            name: `User ${i + 6}`,
            age: 25 + i,
            address: `Address ${i + 6}`,
        })),
    ]);

    const selectedItems = $derived(dataSource.filter(item => item._isChecked));
</script>

<StkTable
    style="max-height: 300px"
    rowKey="id"
    virtual
    bordered
    {columns}
    {dataSource}
/>
<div class="info-box">
    <h3>{t('selected')}:</h3>
    <div class="selected-items">
        {#if selectedItems.length > 0}
            {#each selectedItems as item (item.id)}
                <span class="selected-item">
                    {item.name}
                </span>
            {/each}
        {:else}
            <span>{t('noSelect')}</span>
        {/if}
    </div>
</div>

<style>
    .info-box h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
    }

    .selected-items {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .selected-item {
        padding: 4px 12px;
        background-color: #1890ff;
        color: white;
        border-radius: 16px;
    }
</style>
