<script lang="ts">
    import type { Order, SortConfig, SortState, StkTableColumn } from '../../../src/StkTable/types/index';
    import mockjs from 'mockjs';
    import { onMount, tick } from 'svelte';
    import { insertToOrderedArray, tableSort } from '../../../src/StkTable/index';
    import CheckItem from '../../components/CheckItem.svelte';
    import RadioGroup from '../../components/RadioGroup.svelte';
    import RangeInput from '../../components/RangeInput.svelte';
    import { useI18n } from '../../hooks/useI18n/index';
    import StkTable from '../../StkTable.svelte';
    import { columns as columnsRaw } from './columns';
    import { emitter } from './event';
    import { mockData } from './mockData';
    import type { DataType } from './types';

    const { t, isZH } = useI18n();

    const { Random } = mockjs;
    emitter.on('toggle-expand', handleToggleExpand);
    const sortConfig = {
        defaultSort: {
            dataIndex: 'bestTime' as keyof DataType,
            order: 'desc' as Order,
            sortType: 'string' as 'string' | 'number' | undefined,
        },
    } satisfies SortConfig<DataType>;

    const currentSort: SortState<DataType> = {
        dataIndex: 'bestTime',
        order: 'desc',
        sortType: 'string',
    };
    let stkTableRef: any;

    let dataSize = $state(50000);
    let rowByRow = $state(false);
    let optimizeDragScroll = $state<'scrollbar' | undefined>();
    let translateZ = $state(false);
    let updateFreq = $state(1000);
    let scrollbar = $state(true);
    let areaSelection = $state(true);
    let experimentalScrollY = $state(false);
    let showFooter = $state(false); // 控制总计行显示

    let columns = $state(columnsRaw());
    let dataSource = $state.raw<DataType[]>([]);
    let footerData = $state<Record<string, any>[]>([]);

    /** Mock data cost time  */
    let mockDataCost = $state(0);
    /** Table render cost time */
    let renderCost = $state(0);
    /** Table sort cost time */
    let sortDataCost = $state(0);

    const RATING_OPTIONS = ['AAA', 'AA+', 'AA-', 'AA', 'B+', 'B'];
    const CODE_BASE = 10_000_000;
    const createData = (i: number) => {
        return {
            code: CODE_BASE + i,
            bestBuyVol: Random.integer(1, 6) * 1000,
            bestSellVol: Random.integer(1, 6) * 1000,
            source: Random.integer(1, 6),
            lastPrice: (Math.random() * 15 + 5).toFixed(4),
            cbOfrBp: (Math.random() * 10).toFixed(4),
            bestBuyPrice: (Math.random() * 10).toFixed(4),
            bestSellPrice: (Math.random() * 10).toFixed(4),
            orgDebtRating: RATING_OPTIONS[Math.floor(Math.random() * RATING_OPTIONS.length)],
        };
    };

    onMount(() => {
        initDataSource();
        simulateUpdateData();
    });

    const mockDataResult = mockData(isZH);

    function initDataSource() {
        const curDate = new Date();
        const curHour = curDate.getHours();
        const curMinute = curDate.getMinutes();

        let timeStart = performance.now();
        const dataSourceTemp = Array.from({ length: dataSize }).map((_, index) => {
            const data = Object.assign({}, mockDataResult, createData(index)) as any;
            data.bestTime =
                String(Random.integer(0, curHour)).padStart(2, '0') +
                ':' +
                String(Random.integer(0, curMinute - 1)).padStart(2, '0') +
                ':' +
                String(Random.integer(0, 59)).padStart(2, '0') +
                '.' +
                String(Random.integer(0, 999)).padStart(3, '0');
            return data;
        });
        mockDataCost = Math.floor(performance.now() - timeStart); // Mock data cost time

        timeStart = performance.now();
        const sortData = tableSort(
            { dataIndex: 'bestTime', sorter: true },
            'desc',
            dataSourceTemp,
            sortConfig,
        );
        sortDataCost = Math.floor(performance.now() - timeStart);

        dataSource = sortData;
        calculateFootData();

        timeStart = performance.now();
        tick().then(() => {
            renderCost = Math.floor(performance.now() - timeStart);
        });
    }

    function handleToggleExpand(row: DataType) {
        const expand = !row._isExpand;
        const rowIndex = dataSource.findIndex(item => item.code === row.code);
        if (rowIndex === -1) {
            console.error('can not expand:', row);
            return;
        }
        if (expand) {
            const insertRows: DataType[] = [...new Array(6).fill(null)].map((_, index) => {
                return {
                    _isChildren: true, // 标记为子节点
                    code: Random.guid(),
                    source: index + 1,
                    bestBuyVol: Random.integer(1, 6) * 1000,
                    bestSellVol: Random.integer(1, 6) * 1000,
                    lastPrice: Random.float(1, 20, 4, 4),
                    cbOfrBp: Random.float(0, 10, 4, 4),
                    bestBuyPrice: Random.float(0, 10, 4, 4),
                    bestSellPrice: Random.float(0, 10, 4, 4),
                } as any;
            });
            dataSource.splice(rowIndex + 1, 0, ...insertRows);
        } else {
            dataSource.splice(rowIndex + 1, 6);
        }
        dataSource[rowIndex]._isExpand = expand;
        dataSource[rowIndex] = { ...dataSource[rowIndex] }; // trigger  row update
        dataSource = dataSource.slice(); // trigger table update
        calculateFootData();
    }

    let timeout = $state(0);
    function simulateUpdateData() {
        timeout = window.setTimeout(() => {
            simulateUpdateData();
            const curDate = new Date();
            const curHour = curDate.getHours();
            const curMinute = curDate.getMinutes();
            const curSeconds = curDate.getSeconds();
            const curMilliseconds = curDate.getMilliseconds();
            const newData: any = {
                ...mockDataResult,
                ...createData(Random.integer(0, dataSource.length - 1)),
                bestTime:
                    String(curHour).padStart(2, '0') +
                    ':' +
                    String(curMinute).padStart(2, '0') +
                    ':' +
                    String(curSeconds).padStart(2, '0') +
                    '.' +
                    String(curMilliseconds).padStart(3, '0'),
            };
            const rowIndex = dataSource.findIndex(item => item.code === newData.code);
            if (rowIndex === -1) return;
            dataSource.splice(rowIndex, 1); // delete old data
            // 二分插入
            dataSource = insertToOrderedArray(currentSort, newData, dataSource);
            highlightRow(newData);
            calculateFootData();
        }, updateFreq);
    }

    function stopSimulateUpdateData() {
        if (timeout) {
            window.clearTimeout(timeout);
            timeout = 0;
        }
    }

    function highlightRow(row: DataType) {
        tick().then(() => {
            const key = row.code;
            stkTableRef?.setHighlightDimRow([key]);
        });
    }

    function handleSortChange(
        col: StkTableColumn<DataType>,
        order: Order,
        data: DataType[],
        sortConfig: SortConfig<DataType>,
    ) {
        currentSort.dataIndex = col.dataIndex;
        currentSort.order = order;
        currentSort.sortType = col.sortType;
        dataSource = tableSort(col, order, data, sortConfig);
        calculateFootData();
    }

    function calculateFootData() {
        if (dataSource.length === 0 || !showFooter) {
            footerData = [];
            return;
        }

        const totals: Record<string, any> = {};
        const numericFields = [
            'bestBuyVol',
            'bestSellVol',
            'lastPrice',
            'cbOfrBp',
            'bestBuyPrice',
            'bestSellPrice',
        ];

        // 计算数值字段的总和
        numericFields.forEach(field => {
            const sum = dataSource.reduce((acc, row) => {
                const value = parseFloat(row[field as keyof DataType] as string) || 0;
                return acc + value;
            }, 0);
            totals[field] = sum.toFixed(2);
        });

        // 设置文本字段
        totals.seq = t('Summary');
        totals.bestTime = `${t('Total')} ${dataSource.length} ${t('records')}`;

        footerData = [totals];
        console.log('FootData calculated:', footerData);
    }
    function handleDataSizeChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const value = Number(input.value);
        if (isNaN(value)) return;
        dataSize = value;
        initDataSource();
    }

    function handleOptimizeScrollChange(v: boolean) {
        if (v) {
            optimizeDragScroll = 'scrollbar';
            rowByRow = false;
        } else {
            optimizeDragScroll = void 0;
        }
    }

    function handleScroll(e: Event, { startIndex, endIndex }: any) {
        // console.log('scroll', startIndex, endIndex);
    }

    function handleRowSpan(v: boolean) {
        const col = columns.find(col => col.dataIndex === 'code');
        if (!col) return;
        if (v) {
            col.mergeCells = ({ rowIndex }) => {
                return {
                    rowspan: rowIndex % 2 ? 1 : 2,
                };
            };
        } else {
            col.mergeCells = void 0;
        }
    }

    function handleColSpan(v: boolean) {
        const col = columns.find(col => col.dataIndex === 'bondAbbreviation');
        if (!col) return;
        if (v) {
            col.mergeCells = ({ rowIndex }) => {
                return {
                    colspan: rowIndex % 2 ? 1 : 2,
                };
            };
        } else {
            col.mergeCells = void 0;
        }
    }
</script>

<div class="row">
    <RadioGroup
        bind:value={dataSize}
        text={t('dataAmount')}
        options={[
            { label: '1k', value: 1000 },
            { label: '5k', value: 5000 },
            { label: isZH ? '1w' : '10k', value: 10000 },
            { label: isZH ? '5w' : '50k', value: 50000 },
            { label: isZH ? '10w' : '100k', value: 100_000 },
            { label: isZH ? '50w' : '500k', value: 500_000 },
            { label: isZH ? '100w' : '1mln', value: 1_000_000 },
        ]}
        onchange={initDataSource}
    ></RadioGroup>
    <input
        class="input"
        value={dataSize}
        type="number"
        style="width: 70px; margin-left: 6px"
        onchange={handleDataSizeChange}
    />
    <span style="margin-left: 8px">{t('mockDataCost')}: {mockDataCost}ms</span>
    <span style="margin-left: 8px">{t('sortDataCost')}: {sortDataCost}ms</span>
    <span style="margin-left: 8px">{t('renderCost')}: {renderCost}ms</span>
</div>
<button class="btn" onclick={() => (timeout ? stopSimulateUpdateData() : simulateUpdateData())}>
    {t('simulateUpdateData')}({timeout ? t('stop') : t('start')})
</button>
<label style="margin-left: 16px">
    <RangeInput
        bind:value={updateFreq}
        min="16"
        max="1000"
        label={t('freq')}
        suffix="ms"
    ></RangeInput>
</label>
<CheckItem bind:checked={rowByRow} text={t('rowByRowScroll')} />
<CheckItem bind:checked={translateZ} text={t('translateZ')} />
<CheckItem
    text={t('optimizeDragScroll')}
    onchange={handleOptimizeScrollChange}
/>
<CheckItem text={t('rowspanTest')} onchange={handleRowSpan} />
<CheckItem text={t('colspanTest')} onchange={handleColSpan} />
<CheckItem bind:checked={scrollbar} text="scrollbar" />
<CheckItem bind:checked={areaSelection} text="areaSelection" />
<CheckItem bind:checked={experimentalScrollY} text="experimentalScrollY" />
<CheckItem bind:checked={showFooter} text={t('showFooter')} onchange={calculateFootData} />
<StkTable
    bind:this={stkTableRef}
    {columns}
    onupdatecolumns={(cols: StkTableColumn<DataType>[]) => (columns = cols)}
    class={translateZ ? 'stack' : ''}
    style="height: 700px"
    rowKey="code"
    noDataFull
    fixedColShadow
    virtual
    virtualX
    showOverflow
    showHeaderOverflow
    stripe
    colResizable
    sortRemote
    areaSelection={{
        enabled: areaSelection,
        keyboard: areaSelection,
    }}
    {scrollbar}
    experimental={{ scrollY: experimentalScrollY }}
    scrollRowByRow={rowByRow || optimizeDragScroll}
    {sortConfig}
    emptyCellText={({ row }: any) => (row._isChildren ? '' : '--')}
    rowClassName={(row: DataType) => (row._isChildren ? 'child-row' : '')}
    {dataSource}
    footerData={showFooter ? footerData : undefined}
    onsortchange={handleSortChange}
    ontablescroll={handleScroll}
></StkTable>

<style lang="less">
.row {
    display: flex;
    flex-wrap: wrap;
}

:global(.stk-table.stack .stk-tbody-main tr) {
    transform: translateZ(0);
}

:global(.blue-cell) {
    color: #4f8df4;
}

:global(.red-cell) {
    color: #ff2b48;
}

:global(.green-cell) {
    color: #2fc87b;
}

:global(.source-cell) {
    border-radius: 4px;
    background-color: #777;
    display: inline-block;
    padding: 0 8px;
    font-size: 14px;
    line-height: 20px;
}

:global(.source-cell.source-1) {
    background-color: rgba(39, 69, 159, 0.4);
}

:global(.source-cell.source-2) {
    background-color: rgba(171, 99, 0, 0.4);
}

:global(.source-cell.source-3) {
    background-color: rgba(0, 119, 143, 0.4);
}

:global(.source-cell.source-4) {
    background-color: rgba(171, 28, 0, 0.4);
}

:global(.source-cell.source-5) {
    background-color: rgba(199, 166, 0, 0.4);
}

:global(.source-cell.source-6) {
    background-color: rgba(113, 23, 204, 0.4);
}

:global(.stk-table) {
    --child-bgc: #f6f6f6;
}

:global(.stk-table.dark) {
    --child-bgc: #303039;
}

:global(.stk-table.stripe.vt-on .stk-tbody-main .child-row) {
    background-color: var(--child-bgc);
}

:global(.stk-table.stripe.vt-on .stk-tbody-main .child-row.active) {
    background-color: var(--tr-active-bgc);
}

:global(.stk-table.stripe.vt-on .stk-tbody-main .child-row:hover) {
    background-color: var(--tr-hover-bgc);
}
</style>
