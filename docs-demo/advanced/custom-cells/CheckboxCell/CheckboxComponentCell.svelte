<script lang="ts">
    import StkTable from '../../../StkTable.svelte';
    import { createCheckboxCell } from '../../../../src/StkTable/index';

    // 说明：vue 版此 demo 演示 element-plus / ant-design-vue / @arco-design/web-vue / naive-ui
    // 四个 Vue UI 库的 checkbox 组件接入。svelte 环境无对应 UI 库，
    // 此处保留 4 列结构，均使用原生 input[type=checkbox]（不传 checkboxComponent）。

    // element-plus - checkbox 列（用于行选择）
    const { CheckboxCell: ElCheckboxCell, CheckboxAllCell: ElCheckboxAllCell } = createCheckboxCell({
        field: '_isChecked',
        onChange: (checked: boolean, row: any) => {
            console.log('element-plus 行选中变更:', checked, row.name);
        },
        onSelectAll: (checked: boolean) => {
            console.log('element-plus 全选变更:', checked);
        },
    });
    // ant-design-vue - checkbox 列（用于行选择）
    const { CheckboxCell: AntCheckboxCell, CheckboxAllCell: AntCheckboxAllCell } = createCheckboxCell({
        field: '_isChecked',
        onChange: (checked: boolean, row: any) => {
            console.log('ant-design-vue 行选中变更:', checked, row.name);
        },
        onSelectAll: (checked: boolean) => {
            console.log('ant-design-vue 全选变更:', checked);
        },
    });
    // @arco-design/web-vue - checkbox 列（用于行选择）
    const { CheckboxCell: ArcoCheckboxCell, CheckboxAllCell: ArcoCheckboxAllCell } = createCheckboxCell(
        {
            field: '_isChecked',
            onChange: (checked: boolean, row: any) => {
                console.log('arco-design 行选中变更:', checked, row.name);
            },
            onSelectAll: (checked: boolean) => {
                console.log('arco-design 全选变更:', checked);
            },
        },
    );
    // naive-ui - checkbox 列（用于行选择）
    const { CheckboxCell: NaiveCheckboxCell, CheckboxAllCell: NaiveCheckboxAllCell } =
        createCheckboxCell({
            field: '_isChecked',
            onChange: (checked: boolean, row: any) => {
                console.log('naive-ui 行选中变更:', checked, row.name);
            },
            onSelectAll: (checked: boolean) => {
                console.log('naive-ui 全选变更:', checked);
            },
        });

    const columns: any[] = [
        {
            key: 'element-plus',
            title: 'element-plus',
            children: [
                {
                    dataIndex: 'chkEl',
                    customCell: ElCheckboxCell,
                    customHeaderCell: ElCheckboxAllCell,
                },
            ],
        },
        {
            key: 'ant-design-vue',
            title: 'ant-design-vue',
            children: [
                {
                    dataIndex: 'chkAnt',
                    customCell: AntCheckboxCell,
                    customHeaderCell: AntCheckboxAllCell,
                },
            ],
        },
        {
            key: '@arco-design/web-vue',
            title: '@arco-design/web-vue',
            children: [
                {
                    dataIndex: 'chkArco',
                    customCell: ArcoCheckboxCell,
                    customHeaderCell: ArcoCheckboxAllCell,
                },
            ],
        },
        {
            key: 'naive-ui',
            title: 'naive-ui',
            children: [
                {
                    dataIndex: 'chkNaive',
                    customCell: NaiveCheckboxCell,
                    customHeaderCell: NaiveCheckboxAllCell,
                },
            ],
        },
    ];

    const dataSource = $state<Record<string, any>[]>([
        { id: 1, name: 'Alice', age: 25, address: 'Haidian District, Beijing', _isChecked: true },
        { id: 2, name: 'Bob', age: 28, address: 'Pudong New Area, Shanghai', _isChecked: true },
        { id: 3, name: 'Charlie', age: 32, address: 'Tianhe District, Guangzhou' },
        { id: 4, name: 'David', age: 29, address: 'Nanshan District, Shenzhen' },
        { id: 5, name: 'Eve', age: 27, address: 'Xihu District, Hangzhou' },
        ...Array.from({ length: 15 }, (_, i) => ({
            id: i + 6,
            name: `User ${i + 6}`,
            age: 25 + i,
            address: `Address ${i + 6}`,
        })),
    ]);
</script>

<StkTable
    style="max-height: 400px"
    rowKey="id"
    virtual
    bordered
    {columns}
    {dataSource}
/>
