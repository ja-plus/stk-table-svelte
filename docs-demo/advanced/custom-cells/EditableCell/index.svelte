<script lang="ts">
    import StkTable from '../../../StkTable.svelte';
    import { createEditableCell, type StkTableColumn } from '../../../../src/StkTable/index';
    import { useI18n } from '../../../hooks/useI18n/index';

    const { t } = useI18n();

    const { EditableCell } = createEditableCell({
        onChange: (newValue, row, dataIndex) => {
            console.log(t('valueChange'), { newValue, row, dataIndex });
        },
    });

    interface RowData {
        id: number;
        name: string;
        age: number;
        address: string;
    }

    const EditableCellComp = EditableCell;

    const columns: StkTableColumn<RowData>[] = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: t('name'), dataIndex: 'name', width: 100, customCell: EditableCellComp },
        { title: t('age'), dataIndex: 'age', width: 80, customCell: EditableCellComp },
        { title: t('address'), dataIndex: 'address', customCell: EditableCellComp },
    ];

    const dataSource = $state<RowData[]>([
        { id: 1, name: t('zhangSan'), age: 28, address: t('haidian') },
        { id: 2, name: t('liSi'), age: 32, address: t('pudong') },
        { id: 3, name: t('wangWu'), age: 25, address: t('tianhe') },
    ]);
</script>

<StkTable
    rowKey="id"
    cellHover
    cellActive
    selectedCellRevokable={false}
    rowActive={false}
    rowHover={false}
    {columns}
    {dataSource}
/>
