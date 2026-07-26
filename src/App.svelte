<script lang="ts">
    import { StkTable, registerFeature, useAreaSelection } from './StkTable/index';
    import {
        createChangeCell,
        createNumberCell,
        createCheckboxCell,
        createEditableCell,
        createFilterCell,
    } from './StkTable/index';
    import type { StkTableColumn } from './StkTable/types/index';

    // 注册区域选择功能（按需 feature）
    registerFeature(useAreaSelection);

    // ==================== custom cells ====================
    const { ChangeCell } = createChangeCell({ decimals: 2, showSign: true, arrow: true });
    const { NumberCell } = createNumberCell({ decimals: 2 });
    const { CheckboxCell, CheckboxAllCell } = createCheckboxCell({ field: '_isChecked' });
    const { EditableCell } = createEditableCell({});
    const { Filter } = createFilterCell();

    // ==================== 主表：虚拟滚动 + 排序 + 固定列 + 区域选择 + custom cells ====================
    let mainColumns: StkTableColumn<any>[] = [
        { title: '', dataIndex: 'checkbox', width: 46, fixed: 'left', customCell: CheckboxCell, customHeaderCell: CheckboxAllCell },
        { title: 'Name(editable)', dataIndex: 'name', width: 150, fixed: 'left', sorter: true, customCell: EditableCell },
        { title: 'Price', dataIndex: 'price', width: 120, sorter: true, customCell: NumberCell },
        { title: 'Change', dataIndex: 'chg', width: 120, sorter: true, customCell: ChangeCell },
        {
            title: 'City',
            dataIndex: 'city',
            width: 130,
            customHeaderCell: Filter({
                options: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'].map(v => ({ label: v, value: v })),
            }),
        },
        { title: 'Address', dataIndex: 'address', width: 260 },
        { title: 'Zip', dataIndex: 'zip', width: 110 },
        { title: 'Remark', dataIndex: 'remark', width: 200 },
    ];

    let mainData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        price: 1000 + i * 3.14159,
        chg: ((i * 7) % 200 - 100) / 10,
        city: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'][i % 4],
        address: `Street ${i}, Building ${i % 10}`,
        zip: `1000${String(i % 100).padStart(2, '0')}`,
        remark: `remark ${i}`,
        _isChecked: false,
    }));

    let mainRef: any;
    let selectionInfo = $state('');

    function onAreaChange(ranges: any[]) {
        selectionInfo = ranges.length ? JSON.stringify(ranges[ranges.length - 1].index) : '';
    }

    // ==================== 树形表 ====================
    let treeColumns: StkTableColumn<any>[] = [
        { type: 'tree-node', title: 'Name', dataIndex: 'name', width: 220 },
        { title: 'Value', dataIndex: 'value', width: 120 },
    ];
    let treeData = [
        {
            id: 'a',
            name: 'Node A',
            value: 10,
            children: [
                { id: 'a1', name: 'Node A-1', value: 4 },
                { id: 'a2', name: 'Node A-2', value: 6 },
            ],
        },
        {
            id: 'b',
            name: 'Node B',
            value: 20,
            children: [{ id: 'b1', name: 'Node B-1', value: 20 }],
        },
        { id: 'c', name: 'Node C', value: 30 },
    ];

    // ==================== 展开行表 ====================
    let expandColumns: StkTableColumn<any>[] = [
        { type: 'expand', dataIndex: '', width: 50, align: 'center' },
        { title: 'Name', dataIndex: 'name', width: 220 },
        { title: 'Age', dataIndex: 'age', width: 120 },
    ];
    let expandData = Array.from({ length: 5 }, (_, i) => ({ id: i, name: 'Row ' + i, age: 20 + i }));

    // ==================== 合并单元格表 ====================
    let mergeColumns: StkTableColumn<any>[] = [
        {
            title: 'Group',
            dataIndex: 'group',
            width: 120,
            mergeCells: ({ rowIndex }) => (rowIndex % 2 === 0 ? { rowspan: 2 } : { rowspan: 0 }),
        },
        { title: 'Name', dataIndex: 'name', width: 160 },
        { title: 'Value', dataIndex: 'value', width: 120 },
    ];
    let mergeData = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        group: 'G' + Math.floor(i / 2),
        name: 'item ' + i,
        value: i,
    }));

    // ==================== 表尾表 ====================
    let footerColumns: StkTableColumn<any>[] = [
        { title: 'Name', dataIndex: 'name', width: 160 },
        { title: 'Score', dataIndex: 'score', width: 120 },
    ];
    let footerData = Array.from({ length: 4 }, (_, i) => ({ id: i, name: 'S' + i, score: (i + 1) * 10 }));
    let footerRow = [{ name: 'Total', score: 100 }];
</script>

<div class="page">
    <h1>StkTable Svelte — Full Feature Demo</h1>

    <section>
        <h2>1. Virtual Scroll (1000 rows) + Sort + Fixed + Area Selection + Custom Cells</h2>
        <p class="tip">
            拖拽/Shift/Ctrl 选择区域，方向键移动，Ctrl+C 复制。当前选区：{selectionInfo || '无'}
            <button onclick={() => mainRef?.clearSelectedArea()}>清空选区</button>
            <button onclick={() => mainRef?.setAreaSelection({ begin: { row: 0, col: 1 }, end: { row: 2, col: 3 } })}>
                设置选区(0,1)-(2,3)
            </button>
        </p>
        <div class="table-box" style="height: 380px;">
            <StkTable
                bind:this={mainRef}
                columns={mainColumns}
                dataSource={mainData}
                rowKey="id"
                virtual={true}
                virtualX={true}
                stripe={true}
                cellActive={true}
                areaSelection={{ enabled: true, keyboard: true, highlight: { cell: true, row: false } }}
                onareaselectionchange={onAreaChange}
            />
        </div>
    </section>

    <section>
        <h2>2. Tree Data</h2>
        <div class="table-box" style="height: 240px;">
            <StkTable columns={treeColumns} dataSource={treeData} rowKey="id" treeConfig={{ childrenKey: 'children' }} />
        </div>
    </section>

    <section>
        <h2>3. Expand Row</h2>
        <div class="table-box" style="height: 240px;">
            <StkTable columns={expandColumns} dataSource={expandData} rowKey="id" expandConfig={{}}>
                {#snippet expand({ row })}
                    <div style="padding: 8px 16px; background: #f5f5f5;">Expanded content of {row?.name}</div>
                {/snippet}
            </StkTable>
        </div>
    </section>

    <section>
        <h2>4. Merge Cells</h2>
        <div class="table-box" style="height: 240px;">
            <StkTable columns={mergeColumns} dataSource={mergeData} rowKey="id" />
        </div>
    </section>

    <section>
        <h2>5. Footer</h2>
        <div class="table-box" style="height: 220px;">
            <StkTable columns={footerColumns} dataSource={footerData} rowKey="id" footerData={footerRow} />
        </div>
    </section>
</div>

<style>
    .page {
        padding: 16px 24px 48px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    section {
        margin-bottom: 32px;
    }
    h1 {
        font-size: 22px;
    }
    h2 {
        font-size: 16px;
        margin: 0 0 8px;
    }
    .tip {
        font-size: 13px;
        color: #666;
        margin: 0 0 8px;
    }
    .tip button {
        margin-left: 8px;
    }
    .table-box {
        border: 1px solid #e5e6eb;
        border-radius: 4px;
    }
    .table-box :global(.stk-table) {
        height: 100%;
    }
</style>
