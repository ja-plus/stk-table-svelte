<script lang="ts">
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import StkTable from '../../StkTable.svelte';
    import EditCell from './EditCell.svelte';
    import EditRowSwitch from './EditRowSwitch.svelte';
    import type { RowDataType } from './type';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    // 定义表格列
    const columns: StkTableColumn<RowDataType>[] = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: t('name'), dataIndex: 'name', width: 100, customCell: EditCell as any },
        { title: t('age'), dataIndex: 'age', width: 80, customCell: EditCell as any },
        { title: t('address'), dataIndex: 'address', customCell: EditCell as any },
        { title: t('edit'), dataIndex: '_isEditing', width: 80, customCell: EditRowSwitch as any },
    ];

    // 初始化表格数据
    let tableData = $state<RowDataType[]>([
        { id: 1, name: '张三', age: 28, address: '北京市海淀区' },
        { id: 2, name: '李四', age: 32, address: '上海市浦东新区', _isEditing: true },
        { id: 3, name: 'Jack', age: 45, address: 'London' },
        { id: 4, name: 'Rose', age: 22, address: 'New York' },
    ]);
</script>

<div>
    <StkTable
        rowKey="id"
        cellActive
        selectedCellRevokable={false}
        rowActive={false}
        rowHeight={40}
        {columns}
        dataSource={tableData}
    />
    <div>data-source:</div>
    <div>
        <div>[</div>
        {#each tableData as row (row.id)}
            <div style="padding-left: 16px">{JSON.stringify(row)},</div>
        {/each}
        <div>]</div>
    </div>
</div>
