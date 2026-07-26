<script lang="ts">
    import type { StkTableColumn } from '../../../src/StkTable/index'; // 请替换为实际的导入路径
    import { onDestroy, onMount } from 'svelte';
    import StkTable from '../../StkTable.svelte';
    import MatrixCell from './MatrixCell.svelte';
    import type { CellDataType, RowDataType } from './type';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    let stkTableRef: any;

    let updateLastColInterval = $state(0);

    const columns: StkTableColumn<RowDataType>[] = [
        { title: '', dataIndex: 'rowTitle', className: 'col-title', width: 100 } as any,
        { title: '1M', dataIndex: 'm1', className: 'no-padding', customCell: MatrixCell },
        { title: '3M', dataIndex: 'm3', className: 'no-padding', customCell: MatrixCell },
        { title: '6M', dataIndex: 'm6', className: 'no-padding', customCell: MatrixCell },
        { title: '1Y', dataIndex: 'y1', className: 'no-padding', customCell: MatrixCell },
    ];

    const colTitle = ['AAA+', 'AAA', 'AA+', 'AA', '<=AA-'];

    let tableData = $state<RowDataType[]>([]);
    initTableData();

    onMount(() => {
        updateLastColPercent();
    });

    onDestroy(() => {
        self.clearInterval(updateLastColInterval);
    });

    function initTableData() {
        tableData = colTitle.map(title => {
            let row: any = {
                rowTitle: title,
            };
            columns.forEach((col, colIndex) => {
                if (colIndex === 0) return;
                row[col.dataIndex] = createCellData();
            });
            return row as RowDataType;
        });
    }

    function createCellData(): CellDataType {
        return {
            code: Math.floor(Math.random() * 1000000) + '.IB',
            value: (Math.random() * 100).toFixed(4),
            count: Math.floor(Math.random() * 100),
            percent: Math.random() * 100,
            // 随机正负数
            bp: (Math.random() * 4 - 2).toFixed(2),
        };
    }

    function updateCell() {
        tableData[0].m1 = createCellData();
        stkTableRef?.setHighlightDimCell('AAA+', 'm1');
    }
    function updateLastColPercent() {
        if (updateLastColInterval) {
            clearInterval(updateLastColInterval);
            updateLastColInterval = 0;
            return;
        }

        updateLastColInterval = self.setInterval(() => {
            tableData.forEach(row => {
                row.y1.percent += 1;
                if (row.y1.percent > 100) {
                    row.y1.percent = 0;
                }
            });
        }, 100);
    }
</script>

<div>
    <button class="btn" onclick={updateCell}>{t('tryUpdate')}</button>
    <button class="btn" onclick={updateLastColPercent}>
        {updateLastColInterval ? t('stop') : t('start')} {t('updateLastColumn')}
    </button>
    <StkTable
        bind:this={stkTableRef}
        rowKey="rowTitle"
        rowHeight={60}
        cellHover
        cellActive
        rowHover={false}
        rowActive={false}
        {columns}
        dataSource={tableData}
        oncellclick={(e: any) => console.log('cell-click', e)}
    />
</div>

<style lang="less">
div :global(.col-title) {
    color: var(--th-color);
    background-color: var(--th-bgc);
    font-weight: bold;
    pointer-events: none; // 禁止点击;
}

div :global(.stk-table .stk-table-main) {
    height: 100%; // 重要，这里必须加高度
}

div :global(.stk-table .no-padding) {
    padding: 0; // 去除表格默认的padding
}
</style>
