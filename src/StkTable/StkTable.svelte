<!--
    StkTable - High performance virtual scroll table for Svelte 5
    Ported from stk-table-vue
    @author japlus
-->
<script lang="ts">
    import { onMount, onDestroy, tick, untrack, setContext } from 'svelte';
    import DragHandle from './components/DragHandle.svelte';
    import SortIcon from './components/SortIcon.svelte';
    import TreeNodeCell from './components/TreeNodeCell.svelte';
    import TriangleIcon from './components/TriangleIcon.svelte';
    import {
        CELL_KEY_SEPARATE,
        DEFAULT_ROW_ACTIVE_CONFIG,
        DEFAULT_ROW_HEIGHT,
        DEFAULT_SMOOTH_SCROLL,
        DEFAULT_SORT_CONFIG,
        DEFAULT_TABLE_HEIGHT,
        DEFAULT_TABLE_WIDTH,
        EXPANDED_ROW_KEY_PREFIX,
        HIGHLIGHT_CELL_CLASS,
        HIGHLIGHT_COLOR,
        HIGHLIGHT_DURATION,
        HIGHLIGHT_ROW_CLASS,
        IS_LEGACY_MODE,
        STK_TABLE_CONTEXT,
    } from './const';
    import type { StkTableContext } from './const';
    import type {
        AutoRowHeightConfig,
        ColResizableConfig,
        DragRowConfig,
        ExpandConfig,
        ExperimentalConfig,
        FooterConfig,
        HeaderDragConfig,
        HighlightConfig,
        Order,
        PrivateRowDT,
        PrivateStkTableColumn,
        RowActiveOption,
        SeqConfig,
        SortConfig,
        SortOption,
        SortState,
        StkTableColumn,
        TreeConfig,
        UniqKey,
        UniqKeyProp,
    } from './types/index';
    import { TagType } from './types/index';
    import {
        binarySearch,
        getClosestColKey,
        getClosestTd,
        getClosestTh,
        getClosestTr,
        getClosestTrIndex,
        howDeepTheHeader,
        isEmptyValue,
        pureCellKeyGen,
        rafThrottle,
        tableSort,
        throttle,
        transformWidthToStr,
    } from './utils/index';
    import { createStkTableId, getCalculatedColWidth, getColWidth } from './utils/constRefUtils';
    import { ON_DEMAND_FEATURE } from './registerFeature';
    import { useAreaSelectionName } from './features/index';

    type DT = any & PrivateRowDT;

    /** generate table instance id */
    const stkTableId = createStkTableId();

    // ==================== Props ====================
    let {
        // class/style passthrough (vue attribute fallthrough equivalent)
        class: classNameProp = '',
        style: styleProp = '',
        width = '',
        minWidth = '',
        maxWidth = '',
        stripe = false,
        fixedMode = false,
        headless = false,
        theme = 'light',
        rowHeight = DEFAULT_ROW_HEIGHT,
        autoRowHeight = false,
        rowHover = true,
        rowActive = DEFAULT_ROW_ACTIVE_CONFIG,
        rowCurrentRevokable = true,
        headerRowHeight = DEFAULT_ROW_HEIGHT,
        footerRowHeight = DEFAULT_ROW_HEIGHT,
        virtual = false,
        virtualX = false,
        columns = [],
        dataSource = [],
        rowKey = '',
        colKey = undefined,
        emptyCellText = '--',
        noDataFull = false,
        showNoData = true,
        sortRemote = false,
        showHeaderOverflow = false,
        showOverflow = false,
        showTrHoverClass = false,
        cellHover = false,
        cellActive = false,
        selectedCellRevokable = true,
        areaSelection = false,
        headerDrag = false,
        rowClassName = () => '',
        colResizable = false,
        colMinWidth = 10,
        bordered = true,
        autoResize = true,
        fixedColShadow = false,
        sortConfig = DEFAULT_SORT_CONFIG,
        hideHeaderTitle = false,
        highlightConfig = {},
        seqConfig = {},
        expandConfig = {},
        dragRowConfig = {},
        treeConfig = {},
        cellFixedMode = 'sticky',
        smoothScroll = DEFAULT_SMOOTH_SCROLL,
        scrollRowByRow = false,
        scrollbar = false,
        experimental = {},
        footerData = [],
        footerConfig = { position: 'bottom' },
        // ---- event callbacks ----
        onsortchange,
        onrowclick,
        oncurrentchange,
        oncellselected,
        onrowdblclick,
        onheaderrowmenu,
        onrowmenu,
        oncellclick,
        oncellmouseenter,
        oncellmouseleave,
        oncellmouseover,
        oncellmousedown,
        onheadercellclick,
        ontablescroll,
        onscrollx,
        oncolorderchange,
        onthdragstart,
        onthdrop,
        onroworderchange,
        oncolresize,
        ontogglerowexpand,
        ontoggletreeexpand,
        onareaselectionchange,
        onfilterchange,
        onupdatecolumns,
        // ---- snippets (slots) ----
        tableHeader,
        empty,
        expand,
        customBottom,
    } = $props();

    // ==================== Refs ====================
    let tableContainerRef = $state<HTMLDivElement | undefined>(undefined);
    let colResizeIndicatorRef = $state<HTMLDivElement | undefined>(undefined);
    let trRef = $state<HTMLTableRowElement[]>([]);

    // ==================== Core State ====================
    /** whether to use relative fixed mode */
    let isRelativeMode = $state(IS_LEGACY_MODE ? true : untrack(() => cellFixedMode) === 'relative');

    /** footer position top */
    let isFooterTop = $derived(footerConfig?.position === 'top');
    /** footer tag name */
    let footerTagName = $derived(isFooterTop ? 'tbody' : 'tfoot');

    /** current selected row */
    let currentRow = $state<DT | undefined>(undefined);
    /** current selected row key */
    let currentRowKey = $state<UniqKey | undefined>(undefined);
    /** current selected cell key */
    let currentSelectedCellKey = $state<string | undefined>(undefined);
    /** current hover row */
    let currentHoverRow: DT | null = null;
    /** current hover row key */
    let currentHoverRowKey = $state<UniqKey | null>(null);

    /** data source copy (processed: sorted + flattened tree + filtered)
     * 使用 $state.raw：行对象保持用户原始引用（不做深层代理），
     * custom-cell 原地修改行数据时可写穿到用户数据（与 Vue/React 版本行为一致）。
     * 数组整体替换（排序/筛选/更新）仍具响应式；行内容变更通过 rowVersion 触发更新。 */
    let dataSourceCopy = $state.raw<DT[]>([]);

    /** 行数据版本号：行内容被原地修改时递增，供依赖行内容的派生值（如表头全选状态）响应 */
    let rowVersion = $state(0);

    /** filter status */
    let filterStatus = $state<Record<UniqKey, any>>({});

    // ==================== Component Context (for custom-cells) ====================
    setContext<StkTableContext>(STK_TABLE_CONTEXT, {
        getDataSource: () => dataSourceCopy,
        setFilter: (status, option) => setFilter(status, option),
        getTheme: () => theme as string,
        getRowVersion: () => rowVersion,
        bumpRowVersion: () => {
            rowVersion++;
        },
    });

    // ==================== Key Generators ====================
    const rowKeyGenCache = new WeakMap();

    function rowKeyGenFn(row: DT | null | undefined) {
        if (!row) return row;
        let key = rowKeyGenCache.get(row);
        if (key !== undefined) return key;
        const cachedRowKey = (row as PrivateRowDT).__R_K__;
        if (cachedRowKey !== undefined) {
            rowKeyGenCache.set(row, cachedRowKey);
            return cachedRowKey;
        }
        if (typeof rowKey === 'function') {
            key = (rowKey as (row: DT) => string)(row);
        } else {
            key = row[rowKey];
        }
        if (key === void 0) {
            key = Math.random().toString(36).slice(2);
        }
        rowKeyGenCache.set(row, key);
        return key;
    }

    function colKeyGen(col: StkTableColumn<DT>): string {
        if (colKey === void 0) {
            return col.key || col.dataIndex;
        } else if (typeof colKey === 'function') {
            return (colKey as (col: StkTableColumn<DT>) => string)(col);
        } else {
            return (col as any)[colKey];
        }
    }

    function cellKeyGen(row: DT | null | undefined, col: StkTableColumn<DT>) {
        return rowKeyGenFn(row) + CELL_KEY_SEPARATE + colKeyGen(col);
    }

    function getEmptyCellTextFn(col: StkTableColumn<DT>, row: DT) {
        if (typeof emptyCellText === 'string') {
            return emptyCellText;
        }
        return emptyCellText({ row, col });
    }

    // ==================== Row Active Config ====================
    let rowActiveProp = $derived.by(() => {
        if (typeof rowActive === 'boolean') {
            return {
                ...DEFAULT_ROW_ACTIVE_CONFIG,
                enabled: rowActive ?? true,
                revokable: Boolean(rowCurrentRevokable),
            } as Required<RowActiveOption<DT>>;
        }
        return { ...DEFAULT_ROW_ACTIVE_CONFIG, ...rowActive } as Required<RowActiveOption<DT>>;
    });

    // ==================== Table Columns Processing ====================
    /** table headers (multi-level) */
    let tableHeaders = $state<PrivateStkTableColumn<PrivateRowDT>[][]>([]);
    /** table headers for calc (with rowSpan duplicates) */
    let tableHeadersForCalc = $state<PrivateStkTableColumn<PrivateRowDT>[][]>([]);

    /** last row of tableHeaders (leaf columns) */
    let tableHeaderLast = $derived(tableHeadersForCalc.slice(-1)[0] || []);

    let isTreeData = $derived(columns.some((col: StkTableColumn<DT>) => col.type === 'tree-node'));

    function dealColumns(cols: StkTableColumn<DT>[]) {
        const tableHeadersTemp: PrivateStkTableColumn<PrivateRowDT>[][] = [];
        const tableHeadersForCalcTemp: PrivateStkTableColumn<PrivateRowDT>[][] = [];
        let copyColumn: StkTableColumn<DT>[] = cols;

        if (isRelativeMode) {
            const leftCol: StkTableColumn<DT>[] = [];
            const centerCol: StkTableColumn<DT>[] = [];
            const rightCol: StkTableColumn<DT>[] = [];
            for (let i = 0, len = copyColumn.length; i < len; i++) {
                const col = copyColumn[i];
                if (col.fixed === 'left') leftCol.push(col);
                else if (col.fixed === 'right') rightCol.push(col);
                else centerCol.push(col);
            }
            copyColumn = leftCol.concat(centerCol).concat(rightCol);
        }

        const maxDeep = howDeepTheHeader(copyColumn);
        for (let i = 0; i <= maxDeep; i++) {
            tableHeadersTemp[i] = [];
            tableHeadersForCalcTemp[i] = [];
        }

        let leafIndex = 0;

        function flat(arr: PrivateStkTableColumn<PrivateRowDT>[], parent: PrivateStkTableColumn<PrivateRowDT> | null, depth = 0): [number, number] {
            let allChildrenLen = 0;
            let allChildrenWidthSum = 0;
            for (let i = 0, len = arr.length; i < len; i++) {
                const col = arr[i];
                if (col.hidden) continue;
                col.__P__ = parent;
                col.__LF_S__ = leafIndex;

                let colChildrenLen = 1;
                let colWidth = 0;

                if (col.children) {
                    const [len2, widthSum] = flat(col.children, col, depth + 1);
                    colChildrenLen = len2;
                    colWidth = widthSum;
                    tableHeadersForCalcTemp[depth].push(col);
                } else {
                    colWidth = getColWidth(col);
                    leafIndex++;
                    for (let j = depth; j <= maxDeep; j++) {
                        tableHeadersForCalcTemp[j].push(col);
                    }
                }

                col.__LF_E__ = leafIndex;
                col.__W__ = colWidth;
                tableHeadersTemp[depth].push(col);
                const rowSpan = col.children ? 1 : maxDeep - depth + 1;
                const colSpan = colChildrenLen;
                if (rowSpan > 1) col.__R_SP__ = rowSpan;
                if (colSpan > 1) col.__C_SP__ = colSpan;

                allChildrenLen += colChildrenLen;
                allChildrenWidthSum += colWidth;
            }
            return [allChildrenLen, allChildrenWidthSum];
        }

        flat(copyColumn as PrivateStkTableColumn<PrivateRowDT>[], null);
        tableHeaders = tableHeadersTemp;
        tableHeadersForCalc = tableHeadersForCalcTemp;
    }
    // ==================== Scrollbar Options ====================
    let scrollbarOptions = $derived.by(() => ({
        enabled: true,
        minHeight: 20,
        minWidth: 20,
        width: 8,
        height: 8,
        ...(typeof scrollbar === 'boolean' ? { enabled: scrollbar } : scrollbar),
    }));

    let isExperimentalScrollY = $derived.by(() => {
        if (scrollbarOptions?.enabled && scrollRowByRow) {
            return true;
        }
        return (experimental as ExperimentalConfig)?.scrollY;
    });

    // ==================== Scroll Row By Row ====================
    let isDragScrollValue = false;
    let isDragScrollDebounceTimer = 0;
    let isDragScrollTrigger: (() => void) | null = null;

    function setIsDragScroll(newValue: boolean) {
        if (isDragScrollValue && !newValue) {
            if (isDragScrollDebounceTimer) window.clearTimeout(isDragScrollDebounceTimer);
            isDragScrollDebounceTimer = window.setTimeout(() => {
                isDragScrollValue = newValue;
                isDragScrollTrigger?.();
                isDragScrollDebounceTimer = 0;
            }, 300);
        } else {
            if (isDragScrollDebounceTimer) {
                window.clearTimeout(isDragScrollDebounceTimer);
                isDragScrollDebounceTimer = 0;
            }
            isDragScrollValue = newValue;
            isDragScrollTrigger?.();
        }
    }

    /** re-render trigger for isDragScroll debounce */
    let isDragScrollVersion = $state(0);
    isDragScrollTrigger = () => isDragScrollVersion++;

    let onlyDragScroll = $derived(scrollRowByRow === 'scrollbar');
    let isSRBRActive = $derived.by(() => {
        void isDragScrollVersion; // track debounce changes
        if (onlyDragScroll) {
            return isDragScrollValue;
        }
        return Boolean(scrollRowByRow);
    });

    let isSRBRListenersAdded = false;

    function handleSRBRMouseDown(e: Event) {
        const el = e.target as HTMLElement;
        if (el.classList.contains('stk-table')) {
            setIsDragScroll(true);
        }
    }
    function handleSRBRMouseUp() {
        setIsDragScroll(false);
    }

    function addSRBREventListener() {
        if (isSRBRListenersAdded || !onlyDragScroll) return;
        const container = tableContainerRef;
        if (!container) return;
        container.addEventListener('mousedown', handleSRBRMouseDown);
        container.addEventListener('mouseup', handleSRBRMouseUp);
        isSRBRListenersAdded = true;
    }
    function removeSRBREventListener() {
        const container = tableContainerRef;
        if (!container) return;
        container.removeEventListener('mousedown', handleSRBRMouseDown);
        container.removeEventListener('mouseup', handleSRBRMouseUp);
        isSRBRListenersAdded = false;
    }

    // ==================== Virtual Scroll Y ====================
    let virtualScroll = $state({
        containerHeight: 0,
        rowHeight: untrack(() => rowHeight),
        pageSize: 0,
        startIndex: 0,
        endIndex: 0,
        offsetTop: 0,
        scrollTop: 0,
        scrollHeight: 0,
        translateY: 0,
    });

    // ==================== Virtual Scroll X ====================
    let virtualScrollX = $state({
        containerWidth: 0,
        scrollWidth: 0,
        startIndex: 0,
        endIndex: 0,
        offsetLeft: 0,
        scrollLeft: 0,
    });

    /** col width cache for virtualX */
    type ColWidthCacheItem = { index: number; cumWidth: number };
    type LeftFixedColCacheItem = { index: number; width: number };
    let colWidthCache: { cols: PrivateStkTableColumn<PrivateRowDT>[] | null; nonFixedCols: ColWidthCacheItem[]; leftFixedCols: LeftFixedColCacheItem[] } = { cols: null, nonFixedCols: [], leftFixedCols: [] };

    function getColWidthCache(cols: PrivateStkTableColumn<PrivateRowDT>[]) {
        if (colWidthCache.cols === cols) return colWidthCache;
        const nonFixedCols: ColWidthCacheItem[] = [];
        const leftFixedCols: LeftFixedColCacheItem[] = [];
        let cumWidth = 0;
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            const w = getCalculatedColWidth(col);
            if (col.fixed === 'left') {
                leftFixedCols.push({ index: i, width: w });
                continue;
            }
            cumWidth += w;
            nonFixedCols.push({ index: i, cumWidth });
        }
        colWidthCache = { cols, nonFixedCols, leftFixedCols };
        return colWidthCache;
    }
    function clearColWidthCache() {
        colWidthCache.cols = null;
    }

    let tableHeaderHeight = $derived(headerRowHeight * tableHeaders.length);

    let hasExpandCol = $derived(tableHeaderLast.some(col => col.type === 'expand'));

    /** virtual scroll on flag */
    let virtual_on = $derived(virtual && dataSourceCopy.length > virtualScroll.pageSize);

    let virtual_dataSourcePart = $derived.by(() => {
        if (!virtual_on) return dataSourceCopy;
        const { startIndex, endIndex } = virtualScroll;
        return dataSourceCopy.slice(startIndex, endIndex + 1);
    });

    /** auto row height map */
    const autoRowHeightMap = new Map<string, number>();

    function setAutoHeight(rowKeyValue: UniqKey, height?: number | null) {
        const key = String(rowKeyValue);
        if (!height) {
            autoRowHeightMap.delete(key);
        } else {
            autoRowHeightMap.set(key, height);
        }
    }
    function clearAllAutoHeight() {
        autoRowHeightMap.clear();
    }
    function getAutoRowHeight(row?: PrivateRowDT) {
        if (!row) return;
        const rk = rowKeyGenFn(row);
        const storedHeight = autoRowHeightMap.get(String(rk));
        if (storedHeight) {
            return storedHeight;
        }
        const expectedHeight: AutoRowHeightConfig<PrivateRowDT>['expectedHeight'] = (autoRowHeight as AutoRowHeightConfig<DT>)?.expectedHeight;
        if (expectedHeight) {
            if (typeof expectedHeight === 'function') {
                return expectedHeight(row);
            } else {
                return expectedHeight;
            }
        }
    }

    function getRowHeightFn(row?: PrivateRowDT): number {
        const rh = rowHeight || DEFAULT_ROW_HEIGHT;
        let result = rh;
        if (autoRowHeight) {
            result = getAutoRowHeight(row) || rh;
        }
        if (hasExpandCol) {
            const expandedRowHeight = (expandConfig as ExpandConfig)?.height;
            if (row && row.__EXP_R__ && expandedRowHeight) {
                result = expandedRowHeight;
            }
        }
        return result;
    }

    let virtual_offsetBottom = $derived.by(() => {
        if (!virtual_on) return 0;
        const { startIndex, endIndex } = virtualScroll;
        if (autoRowHeight) {
            let offsetBottom = 0;
            for (let i = endIndex + 1; i < dataSourceCopy.length; i++) {
                offsetBottom += getRowHeightFn(dataSourceCopy[i]);
            }
            return offsetBottom;
        }
        return (dataSourceCopy.length - startIndex - virtual_dataSourcePart.length) * getRowHeightFn();
    });

    let virtualX_on = $derived.by(() => {
        return (
            virtualX &&
            tableHeaderLast.reduce((sum, col) => (sum += getCalculatedColWidth(col)), 0) > virtualScrollX.containerWidth + 100
        );
    });

    /** multi-level header flag */
    let isMultiLevelHeader = $derived(tableHeaders.length > 1);

    /**
     * Multi-level header virtualX params: compute start/end by top-level column groups
     */
    let theadVirtualX = $derived.by(() => {
        if (!virtualX_on || !isMultiLevelHeader) {
            return {
                startIndex: virtualScrollX.startIndex,
                endIndex: virtualScrollX.endIndex,
                offsetLeft: virtualScrollX.offsetLeft,
            };
        }
        const { scrollLeft, containerWidth } = virtualScrollX;
        const topLevelCols = tableHeaders[0];
        const totalLeafCount = tableHeaderLast.length;

        let theadStartIndex = 0;
        let theadEndIndex = totalLeafCount;
        let theadOffsetLeft = 0;
        let cumLeft = 0;
        let foundStart = false;

        for (let i = 0, len = topLevelCols.length; i < len; i++) {
            const col = topLevelCols[i];
            if (col.fixed === 'left' || col.fixed === 'right') continue;

            const groupWidth = col.__W__ || getCalculatedColWidth(col);
            const groupRight = cumLeft + groupWidth;

            if (!foundStart && groupRight > scrollLeft) {
                foundStart = true;
                theadStartIndex = col.__LF_S__ ?? 0;
                theadOffsetLeft = cumLeft;
            }
            cumLeft = groupRight;

            theadEndIndex = col.__LF_E__ ?? totalLeafCount;
            if (foundStart && groupRight >= scrollLeft + containerWidth) {
                break;
            }
        }

        if (!foundStart) {
            theadStartIndex = totalLeafCount;
            theadOffsetLeft = cumLeft;
        }

        return { startIndex: theadStartIndex, endIndex: theadEndIndex, offsetLeft: theadOffsetLeft };
    });

    let virtualX_columnPart = $derived.by((): PrivateStkTableColumn<PrivateRowDT>[] => {
        if (virtualX_on) {
            const { startIndex, endIndex } = virtualScrollX;
            const maxIndex = tableHeaderLast.length;
            const validEndIndex = Math.min(endIndex, maxIndex);
            const validStartIndex = Math.min(startIndex, maxIndex);

            // multi-level header: separate left/right fixed cols, insert spacer markers
            if (isMultiLevelHeader) {
                const leftFixedCols: PrivateStkTableColumn<PrivateRowDT>[] = [];
                const rightFixedCols: PrivateStkTableColumn<PrivateRowDT>[] = [];
                const visibleCols: PrivateStkTableColumn<PrivateRowDT>[] = [];
                for (let i = 0; i < tableHeaderLast.length; i++) {
                    const col = tableHeaderLast[i];
                    if (col.fixed === 'right') {
                        rightFixedCols.push(col);
                    } else if (col.fixed === 'left') {
                        leftFixedCols.push(col);
                    } else if (i >= validStartIndex && i < validEndIndex) {
                        visibleCols.push(col);
                    }
                }

                const result: PrivateStkTableColumn<PrivateRowDT>[] = [];
                result.push(...leftFixedCols);

                const theadStart = theadVirtualX.startIndex;
                const leftSpacerColspan = Math.max(0, startIndex - theadStart);
                if (leftSpacerColspan) {
                    result.push({ __VT_C_SP__: leftSpacerColspan } as PrivateStkTableColumn<PrivateRowDT>);
                }

                result.push(...visibleCols);

                const rightSpacerColspan = Math.max(0, theadVirtualX.endIndex - endIndex);
                if (rightSpacerColspan) {
                    result.push({ __VT_C_SP__: rightSpacerColspan } as PrivateStkTableColumn<PrivateRowDT>);
                }
                result.push(...rightFixedCols);

                return result;
            }

            // single-level header: reorder logic
            const leftCols: PrivateStkTableColumn<PrivateRowDT>[] = [];
            const rightCols: PrivateStkTableColumn<PrivateRowDT>[] = [];

            for (let i = 0; i < validStartIndex; i++) {
                const col = tableHeaderLast[i];
                if (col?.fixed === 'left') leftCols.push(col);
            }
            for (let i = validEndIndex; i < tableHeaderLast.length; i++) {
                const col = tableHeaderLast[i];
                if (col?.fixed === 'right') rightCols.push(col);
            }

            const mainColumns = tableHeaderLast.slice(validStartIndex, validEndIndex);
            return leftCols.concat(mainColumns).concat(rightCols);
        }
        return tableHeaderLast;
    });

    /**
     * thead virtualX: filter by top-level group granularity for multi-level headers
     */
    let virtualX_tableHeaders = $derived.by(() => {
        if (!virtualX_on) return tableHeaders;
        if (isMultiLevelHeader) {
            const { startIndex, endIndex } = theadVirtualX;
            return tableHeaders.map(row => {
                return row.filter(col => {
                    if (col.fixed === 'left' || col.fixed === 'right') return true;
                    const leafStart = col.__LF_S__ ?? 0;
                    const leafEnd = col.__LF_E__ ?? leafStart + 1;
                    return leafEnd > startIndex && leafStart < endIndex;
                });
            });
        }
        const headers = tableHeaders;
        return headers.map((row, i) => (i === headers.length - 1 ? virtualX_columnPart : row));
    });

    /** expand row colspan */
    let expandRowColspan = $derived.by(() => {
        if (!virtualX_on) return tableHeaderLast.length;
        const spacers = virtualX_columnPart.filter(c => c.__VT_C_SP__);
        return 2 + virtualX_columnPart.length + spacers.reduce((sum, s) => sum + Math.max(0, (s.__VT_C_SP__ ?? 0) - 1), 0);
    });

    let virtualX_offsetRight = $derived.by(() => {
        if (!virtualX_on) return 0;
        const eIdx = isMultiLevelHeader ? theadVirtualX.endIndex : virtualScrollX.endIndex;
        let w = 0;
        for (let i = eIdx; i < tableHeaderLast.length; i++) {
            const col = tableHeaderLast[i];
            if (col.fixed !== 'right') {
                w += getCalculatedColWidth(col);
            }
        }
        return w;
    });

    /** SRBR total height */
    let SRBRTotalHeight = $derived.by(() => {
        if (!isSRBRActive || !virtual) return 0;
        return dataSourceCopy.length * virtualScroll.rowHeight + tableHeaderHeight;
    });
    let SRBRBottomHeight = $derived.by(() => {
        if (!isSRBRActive || !virtual) return 0;
        const { containerHeight, rowHeight: rh } = virtualScroll;
        return (containerHeight - tableHeaderHeight) % rh;
    });

    // ==================== Max Row Span ====================
    const maxRowSpan = new Map<UniqKey, number>();

    function updateMaxRowSpan() {
        if (!virtual) {
            if (maxRowSpan.size) maxRowSpan.clear();
            return;
        }
        maxRowSpan.clear();
        const data = dataSourceCopy;
        const columns = tableHeaderLast;
        const columnsWithMerge = columns.filter(col => col.mergeCells);
        if (!columnsWithMerge.length) return;

        const dataLength = data.length;
        const mergeColumnsLength = columnsWithMerge.length;

        for (let rowIndex = 0; rowIndex < dataLength; rowIndex++) {
            const row = data[rowIndex];
            const rk = rowKeyGenFn(row);
            let currentMax = maxRowSpan.get(rk) || 0;
            for (let colIndex = 0; colIndex < mergeColumnsLength; colIndex++) {
                const col = columnsWithMerge[colIndex];
                const { rowspan = 1 } = col.mergeCells!({ row, col, rowIndex, colIndex }) || {};
                if (rowspan > 1 && rowspan > currentMax) {
                    currentMax = rowspan;
                    maxRowSpan.set(rk, currentMax);
                }
            }
        }
    }

    // ==================== Virtual Scroll Functions ====================
    const VUE2_SCROLL_TIMEOUT_MS = 200;
    let vue2ScrollYTimeout: number | null = null;
    let vue2ScrollXTimeout: number | null = null;

    function initVirtualScroll(height?: number) {
        initVirtualScrollY(height);
        initVirtualScrollX();
    }

    function initVirtualScrollY(height?: number) {
        if (height !== void 0 && typeof height !== 'number') {
            console.warn('initVirtualScrollY: height must be a number');
            height = 0;
        }
        const { clientHeight, scrollHeight } = tableContainerRef || {};
        let scrollTop = isExperimentalScrollY ? virtualScroll.scrollTop : tableContainerRef?.scrollTop || 0;

        const rh = getRowHeightFn();
        const containerHeight = height || clientHeight || DEFAULT_TABLE_HEIGHT;
        let pageSize = Math.ceil(containerHeight / rh);
        if (!headless) {
            const headerToBodyRowHeightCount = Math.floor(tableHeaderHeight / rh);
            pageSize -= headerToBodyRowHeightCount;
        }
        const maxScrollTop = Math.max(0, dataSourceCopy.length * rh + tableHeaderHeight - containerHeight);
        if (scrollTop > maxScrollTop) {
            scrollTop = maxScrollTop;
        }
        virtualScroll.containerHeight = containerHeight;
        virtualScroll.pageSize = pageSize;
        virtualScroll.scrollHeight = scrollHeight || 0;
        updateVirtualScrollY(scrollTop);
    }

    function initVirtualScrollX() {
        const { clientWidth, scrollLeft, scrollWidth } = tableContainerRef || {};
        virtualScrollX.containerWidth = clientWidth || DEFAULT_TABLE_WIDTH;
        virtualScrollX.scrollWidth = scrollWidth || DEFAULT_TABLE_WIDTH;
        updateVirtualScrollX(scrollLeft);
    }

    /** calculate virtual scroll params by scroll position */
    function updateVirtualScrollY(sTop = 0) {
        const { pageSize, scrollTop, startIndex: oldStartIndex, endIndex: oldEndIndex, containerHeight } = virtualScroll;

        const dataSourceCopyTemp = dataSourceCopy;
        const dataLength = dataSourceCopyTemp.length;
        const rh = getRowHeightFn();

        const scrollHeight = dataLength * rh + tableHeaderHeight;
        const { enabled: scrollbarEnable } = scrollbarOptions;
        if (scrollbarEnable) {
            virtualScroll.scrollHeight = scrollHeight;
            if (isExperimentalScrollY) {
                let maxTop: number;
                sTop = sTop < 0 ? 0 : sTop < (maxTop = scrollHeight - containerHeight) ? sTop : maxTop;
                virtualScroll.translateY = scrollRowByRow ? 0 : -(sTop % rh);
            }
        }
        virtualScroll.scrollTop = sTop;

        if (!virtual_on) {
            virtualScroll.startIndex = 0;
            virtualScroll.endIndex = 0;
            virtualScroll.offsetTop = 0;
            return;
        }

        let startIndex = 0;
        let endIndex = dataLength;
        let autoRowHeightTop = 0;
        if (autoRowHeight || hasExpandCol) {
            if (autoRowHeight && trRef.length) {
                const trElements = trRef;
                for (let i = 0, len = trElements.length; i < len; i++) {
                    const tr = trElements[i];
                    if (!tr) continue; // svelte keeps null holes in bind:this array when rows shrink
                    const rk = tr.dataset.rowKey;
                    if (!rk || autoRowHeightMap.has(rk)) continue;
                    autoRowHeightMap.set(rk, tr.offsetHeight);
                }
            }
            for (let i = 0; i < dataLength; i++) {
                const h = getRowHeightFn(dataSourceCopyTemp[i]);
                autoRowHeightTop += h;
                if (autoRowHeightTop >= sTop) {
                    startIndex = i;
                    autoRowHeightTop -= h;
                    break;
                }
            }
            let containerHeightSum = 0;
            for (let i = startIndex + 1; i < dataLength; i++) {
                containerHeightSum += getRowHeightFn(dataSourceCopyTemp[i]);
                if (containerHeightSum >= containerHeight) {
                    endIndex = i;
                    break;
                }
            }
        } else {
            startIndex = Math.floor(sTop / rh);
            endIndex = startIndex + pageSize;
            if (startIndex === oldStartIndex && endIndex === oldEndIndex) {
                return;
            }
        }

        if (maxRowSpan.size) {
            let correctedStartIndex = startIndex;
            let correctedEndIndex = endIndex;

            for (let i = 0; i < startIndex; i++) {
                const row = dataSourceCopyTemp[i];
                if (!row) continue;
                const spanEndIndex = i + (maxRowSpan.get(rowKeyGenFn(row)) || 1);
                if (spanEndIndex > startIndex) {
                    correctedStartIndex = i;
                    if (spanEndIndex > endIndex) {
                        correctedEndIndex = spanEndIndex;
                    }
                    break;
                }
            }

            for (let i = correctedStartIndex; i < endIndex; i++) {
                const row = dataSourceCopyTemp[i];
                if (!row) continue;
                const spanEndIndex = i + (maxRowSpan.get(rowKeyGenFn(row)) || 1);
                if (spanEndIndex > correctedEndIndex) {
                    correctedEndIndex = Math.max(spanEndIndex, correctedEndIndex);
                }
            }

            startIndex = correctedStartIndex;
            endIndex = correctedEndIndex;
        }

        if (stripe && !isExperimentalScrollY && startIndex > 0 && startIndex % 2) {
            startIndex -= 1;
            if (autoRowHeight || hasExpandCol) {
                const h = getRowHeightFn(dataSourceCopyTemp[startIndex]);
                autoRowHeightTop -= h;
            }
        }

        startIndex = Math.max(0, startIndex);
        endIndex = Math.min(endIndex, dataLength);

        if (startIndex >= endIndex) {
            startIndex = endIndex - pageSize;
        }

        if (vue2ScrollYTimeout) {
            window.clearTimeout(vue2ScrollYTimeout);
        }

        let offsetTop = 0;
        if (autoRowHeight || hasExpandCol) {
            offsetTop = autoRowHeightTop;
        } else {
            offsetTop = startIndex * rh;
        }

        const optimizeVue2Scroll = false; // vue2-only optimization, not needed in svelte
        if (!optimizeVue2Scroll || sTop <= scrollTop || Math.abs(oldStartIndex - startIndex) >= pageSize) {
            virtualScroll.startIndex = startIndex;
            virtualScroll.endIndex = endIndex;
            virtualScroll.offsetTop = offsetTop;
        } else {
            virtualScroll.endIndex = endIndex;
            vue2ScrollYTimeout = window.setTimeout(() => {
                virtualScroll.startIndex = startIndex;
                virtualScroll.offsetTop = offsetTop;
            }, VUE2_SCROLL_TIMEOUT_MS);
        }
    }

    /** Calculate virtual scroll X params based on horizontal scroll position */
    function updateVirtualScrollX(sLeft = 0) {
        if (!virtualX) return;
        const headerLength = tableHeaderLast?.length;
        if (!headerLength) return;

        const { scrollLeft, containerWidth } = virtualScrollX;
        let startIndex = 0;
        let offsetLeft = 0;
        let leftFirstColRestWidth = 0;

        const { nonFixedCols, leftFixedCols } = getColWidthCache(tableHeaderLast);

        if (nonFixedCols.length > 0 && sLeft > 0) {
            const found = binarySearch(nonFixedCols, mid => {
                return nonFixedCols[mid].cumWidth <= sLeft ? -1 : 1;
            });
            const idx = Math.min(found, nonFixedCols.length - 1);
            startIndex = nonFixedCols[idx].index;
            offsetLeft = idx > 0 ? nonFixedCols[idx - 1].cumWidth : 0;
            leftFirstColRestWidth = nonFixedCols[idx].cumWidth - sLeft;
        } else if (nonFixedCols.length > 0) {
            startIndex = nonFixedCols[0].index;
        }

        let actualLeftColWidthSum = 0;
        for (const leftCol of leftFixedCols) {
            if (leftCol.index >= startIndex) break;
            actualLeftColWidthSum += leftCol.width;
        }
        const containerW = containerWidth - actualLeftColWidthSum;
        let endIndex = headerLength;
        let endColWidthSum = leftFirstColRestWidth;

        for (let colIndex = leftFirstColRestWidth ? startIndex + 1 : startIndex; colIndex < headerLength; colIndex++) {
            const col = tableHeaderLast[colIndex];
            endColWidthSum += getCalculatedColWidth(col);
            if (endColWidthSum >= containerW) {
                endIndex = colIndex + 1;
                break;
            }
        }

        endIndex = Math.min(endIndex, headerLength);

        if (vue2ScrollXTimeout) {
            window.clearTimeout(vue2ScrollXTimeout);
        }

        const optimizeVue2Scroll = false; // vue2-only optimization, not needed in svelte
        if (!optimizeVue2Scroll || sLeft <= scrollLeft) {
            virtualScrollX.startIndex = startIndex;
            virtualScrollX.endIndex = endIndex;
            virtualScrollX.offsetLeft = offsetLeft;
            virtualScrollX.scrollLeft = sLeft;
        } else {
            virtualScrollX.endIndex = endIndex;
            virtualScrollX.scrollLeft = sLeft;
            vue2ScrollXTimeout = window.setTimeout(() => {
                virtualScrollX.startIndex = startIndex;
                virtualScrollX.offsetLeft = offsetLeft;
            }, VUE2_SCROLL_TIMEOUT_MS);
        }
    }

    /** requestAnimationFrame throttled updateVirtualScrollY */
    const rafUpdateVirtualScrollYForWheel = rafThrottle(updateVirtualScrollY);

    // ==================== Sorter ====================
    const SORT_SWITCH_ORDER: Order[] = [null, 'desc', 'asc'] as const;

    let sortStates = $state<SortState<DT>[]>([]);

    let isMultiSort = $derived((sortConfig as SortConfig<DT>).multiSort ?? false);
    let multiSortLimit = $derived((sortConfig as SortConfig<DT>).multiSortLimit ?? 3);
    let sortCol = $derived(sortStates[0]?.dataIndex);

    function getSortStateIndex(colKey: UniqKey): number {
        return sortStates.findIndex(s => s.key === colKey || s.dataIndex === colKey);
    }

    function getColumnSortState(colKey: UniqKey): SortState<DT> | undefined {
        return sortStates[getSortStateIndex(colKey)] as SortState<DT> | undefined;
    }

    function getTableCol(state: { key?: SortState<DT>['key']; dataIndex: SortState<DT>['dataIndex'] }) {
        return tableHeaderLast.find(c => (state.key && colKeyGen(c) === state.key) || c.dataIndex === state.dataIndex);
    }

    function getSortColumns(): { key: keyof DT | undefined; order: Order }[] {
        return sortStates.map(s => ({ key: s.key || s.dataIndex, order: s.order }));
    }

    function addOrUpdateSortState(newState: SortState<DT>, mode?: 1 | 0) {
        const existingIndex = getSortStateIndex(newState.key || newState.dataIndex);
        if (existingIndex >= 0) {
            sortStates.splice(existingIndex, 1);
        }
        if (mode && isMultiSort) {
            if (sortStates.length >= multiSortLimit) {
                sortStates.pop();
            }
            sortStates.unshift(newState as any);
        } else {
            sortStates = [newState as any];
        }
    }

    function updateSortState(col: StkTableColumn<DT>, sortCfg: SortConfig<DT>): Order {
        const colKeyValue = colKeyGen(col);
        const existingIndex = getSortStateIndex(colKeyValue);
        let newOrder: Order;

        const defaultSort = sortCfg.defaultSort;

        if (existingIndex >= 0) {
            const currentOrder = sortStates[existingIndex].order;
            if (currentOrder && defaultSort && (defaultSort.key === colKeyValue || defaultSort.dataIndex === col.dataIndex)) {
                const defaultSwitchOrder = SORT_SWITCH_ORDER.filter(order => order !== null);
                const currentIndex = defaultSwitchOrder.indexOf(currentOrder);
                newOrder = defaultSwitchOrder[(currentIndex + 1) % defaultSwitchOrder.length];
            } else {
                const currentIndex = SORT_SWITCH_ORDER.indexOf(currentOrder);
                newOrder = SORT_SWITCH_ORDER[(currentIndex + 1) % 3];
            }

            if (newOrder) {
                const updatedState = { ...sortStates[existingIndex], order: newOrder };
                addOrUpdateSortState(updatedState as any, 1);
            } else {
                sortStates.splice(existingIndex, 1);
                if (defaultSort?.order) {
                    const defaultSortCol = getTableCol(defaultSort);
                    const { key, sortField, sortType } = defaultSortCol || {};
                    addOrUpdateSortState({ key, sortField, sortType, ...defaultSort } as any, 1);
                }
            }
        } else {
            newOrder = SORT_SWITCH_ORDER[1];
            const newState: SortState<DT> = {
                key: colKeyValue,
                dataIndex: col.dataIndex,
                sortField: col.sortField,
                sortType: col.sortType,
                order: newOrder,
            };
            addOrUpdateSortState(newState, 1);
        }

        return newOrder;
    }

    /** sort data source */
    function sortData(dataSource: DT[]): DT[] {
        if (!sortStates.length) return dataSource;

        const sortCfg = { ...DEFAULT_SORT_CONFIG, ...sortConfig };
        let result = dataSource.slice();

        for (let i = sortStates.length - 1; i >= 0; i--) {
            const state = sortStates[i];
            const col = getTableCol(state);
            if (col && state.order) {
                const colSortConfig = { ...sortCfg, ...col.sortConfig };
                result = tableSort(col, state.order, result, colSortConfig);
            }
        }

        return result;
    }

    /** header click sort */
    function onColumnSort(col: StkTableColumn<DT> | undefined | null) {
        if (!col) {
            console.warn('onColumnSort: not found col:', col);
            return;
        }
        if (!col.sorter) return;

        const sortCfg: SortConfig<DT> = { ...DEFAULT_SORT_CONFIG, ...sortConfig, ...col.sortConfig };
        const order = updateSortState(col, sortCfg);

        if (!sortRemote) {
            initDataSource();
        }

        onsortchange?.(col, order, dataSourceCopy, sortCfg);
    }

    function setSorter(
        colKeyValue: string,
        order: Order,
        option: { sortOption?: SortOption<DT>; force?: boolean; silent?: boolean; sort?: boolean; append?: boolean } = {},
    ): DT[] {
        const newOption = { silent: true, sortOption: null as any, sort: true, append: false, ...option };
        let column: StkTableColumn<DT> | undefined;

        if (order) {
            column = newOption.sortOption || tableHeaderLast.find(it => colKeyGen(it) === colKeyValue);
            if (column) {
                const newState: SortState<DT> = {
                    key: colKeyValue,
                    dataIndex: column.dataIndex,
                    sortField: column.sortField,
                    sortType: column.sortType,
                    order,
                };
                const mode = newOption.append && isMultiSort ? 1 : 0;
                addOrUpdateSortState(newState, mode);
            }
        } else {
            sortStates = [];
        }

        if (newOption.sort && dataSourceCopy?.length) {
            if (!sortRemote || newOption.force) {
                initDataSource(dataSource, { forceSort: newOption.force });
            }
        }

        if (!newOption.silent) {
            if (!column) {
                column = newOption.sortOption || tableHeaderLast.find(it => colKeyGen(it) === colKeyValue);
            }
            if (column) {
                onsortchange?.(column, order, dataSourceCopy, sortConfig as SortConfig<DT>);
            } else {
                console.warn('Can not find column by key:', colKeyValue);
            }
        }

        return dataSourceCopy;
    }

    function resetSorter() {
        sortStates = [];
        initDataSource();
    }

    function dealDefaultSorter() {
        if (!(sortConfig as SortConfig<DT>).defaultSort) return;
        const { key, dataIndex, order, silent } = { silent: true, ...(sortConfig as SortConfig<DT>).defaultSort };
        setSorter((key || dataIndex) as string, order, { force: false, silent });
    }

    // ==================== Data Source ====================
    function initDataSource(v = dataSource, option?: { forceSort?: boolean }) {
        let dataSourceTemp = v.slice();

        if (!sortRemote || option?.forceSort) {
            dataSourceTemp = sortData(dataSourceTemp);
        }

        if (isTreeData) {
            dataSourceTemp = flatTreeData(dataSourceTemp);
        }
        dataSourceTemp = filterDataSource(dataSourceTemp);
        dataSourceCopy = dataSourceTemp;
    }

    function setFilter(
        status: Record<UniqKey, any> | null,
        option?: { remote?: boolean; silent?: boolean },
    ) {
        status = status || {};
        filterStatus = status;
        if (!option?.remote) {
            initDataSource();
        }
        if (!option?.silent) {
            onfilterchange?.(status);
        }
    }

    function filterDataSource(dataSource: DT[]) {
        const filterKeys = Object.keys(filterStatus);
        if (!filterKeys?.length) return dataSource;
        let result = dataSource;
        for (const key of filterKeys) {
            const { value, filter } = filterStatus[key];
            if (!value?.length) continue;
            result = result.filter(row => {
                const cellValue = row[key];
                if (filter) {
                    return filter({ row, cellValue, filterValues: value });
                }
                return value.some((v: any) => cellValue == v);
            });
        }
        return result;
    }

    function updateDataSource(val: DT[]) {
        if (!Array.isArray(val)) {
            console.warn('invalid dataSource');
            return;
        }

        let needInitVirtualScrollY = false;
        if (dataSourceCopy.length !== val.length) {
            needInitVirtualScrollY = true;
        }
        initDataSource(val);
        updateMaxRowSpan();

        if (!val.length) {
            clearSelectedArea();
        }

        if (needInitVirtualScrollY) {
            tick().then(() => initVirtualScrollY());
        }
        tick().then(() => updateCustomScrollbar());
    }

    // ==================== Tree ====================
    const { defaultExpandAll, defaultExpandKeys, defaultExpandLevel }: TreeConfig = untrack(() => treeConfig as TreeConfig);
    let isTreeFirstLoad = true;

    function toggleTreeNode(row: DT, col: any) {
        const expand = row ? !row.__T_EXP__ : false;
        privateSetTreeExpand(row, { expand, col, isClick: true });
    }

    type SetTreeExpandOption = {
        expand?: boolean;
        all?: boolean;
        level?: number;
    };

    function setDescendantsToLevel(row: DT, currentLevel: number, targetLevel: number, expanded: boolean) {
        if (!row.children || currentLevel > targetLevel) return;
        for (const child of row.children) {
            setNodeExpanded(child, expanded, currentLevel);
            setDescendantsToLevel(child, currentLevel + 1, targetLevel, expanded);
        }
    }

    function privateSetTreeExpand(row: (UniqKey | DT) | (UniqKey | DT)[], option: SetTreeExpandOption & { col?: any; isClick: boolean }) {
        const rowKeyOrRowArr: (UniqKey | DT)[] = Array.isArray(row) ? row : [row];

        const tempData = dataSourceCopy.slice();
        for (let i = 0; i < rowKeyOrRowArr.length; i++) {
            const rowKeyOrRow = rowKeyOrRowArr[i];
            let rk: UniqKey;
            if (typeof rowKeyOrRow === 'string' || typeof rowKeyOrRow === 'number') {
                rk = rowKeyOrRow;
            } else {
                rk = rowKeyGenFn(rowKeyOrRow);
            }
            const index = tempData.findIndex(it => rowKeyGenFn(it) === rk);
            if (index === -1) {
                console.warn('treeExpandRow failed.rowKey:', rk);
                return;
            }

            const targetRow = tempData[index];
            const level = targetRow.__T_LV__ || 0;
            const wasExpanded = Boolean(targetRow.__T_EXP__);
            let expanded = option?.expand;
            if (expanded === void 0) {
                expanded = !targetRow.__T_EXP__;
            }
            if (option.all || option.level !== void 0) {
                const targetLevel = option.all ? Infinity : option.level || 0;
                setDescendantsToLevel(targetRow, level + 1, targetLevel, expanded);
            }
            if (expanded) {
                if (wasExpanded) {
                    // already expanded, rebuild the flattened subtree so newly expanded
                    // descendants are inserted into the visible data source
                    const deleteCount = foldTreeNode(index, tempData, level);
                    const childrenNodes = expandTreeNode(targetRow, level);
                    tempData.splice(index + 1, deleteCount, ...childrenNodes);
                } else {
                    const childrenNodes = expandTreeNode(targetRow, level);
                    tempData.splice(index + 1, 0, ...childrenNodes);
                }
            } else {
                const deleteCount = foldTreeNode(index, tempData, level);
                tempData.splice(index + 1, deleteCount);
            }

            setNodeExpanded(targetRow, expanded, level);

            if (option.isClick) {
                ontoggletreeexpand?.({ expanded: Boolean(expanded), row: targetRow, col: option.col });
            }
        }

        dataSourceCopy = tempData;
        onDataSourceChange();
    }

    function setTreeExpand(row: (UniqKey | DT) | (UniqKey | DT)[], option?: SetTreeExpandOption) {
        privateSetTreeExpand(row, { ...option, isClick: false });
    }

    function setNodeExpanded(row: DT, expanded: boolean, level?: number) {
        row.__T_EXP__ = expanded;
        if (level !== void 0) {
            row.__T_LV__ = level;
        }
    }

    function recursionFlat(data: DT[] | undefined, level: number): DT[] {
        if (!data) return [];
        let result: DT[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(item);
            const isExpanded = Boolean(item.__T_EXP__);
            setNodeExpanded(item, isExpanded, level);
            if (isTreeFirstLoad && !isExpanded) {
                if (defaultExpandAll) {
                    setNodeExpanded(item, true);
                } else {
                    if (defaultExpandLevel && level < defaultExpandLevel) {
                        setNodeExpanded(item, true);
                    }
                    if (defaultExpandKeys?.includes(rowKeyGenFn(item))) {
                        setNodeExpanded(item, true);
                    }
                }
            }
            if (item.__T_EXP__) {
                const res = recursionFlat(item.children, level + 1);
                result = result.concat(res);
            }
        }
        return result;
    }

    function flatTreeData(data: DT[]) {
        const result = recursionFlat(data, 0);
        isTreeFirstLoad = false;
        return result;
    }

    function expandTreeNode(row: DT, level: number) {
        let result: DT[] = [];
        row.children &&
            row.children.forEach((child: DT) => {
                result.push(child);
                const childLv = level + 1;
                if (child.__T_EXP__ && child.children) {
                    const res = expandTreeNode(child, childLv);
                    result = result.concat(res);
                } else {
                    setNodeExpanded(child, false, childLv);
                }
            });
        return result;
    }

    function foldTreeNode(index: number, tempData: DT[], level: number) {
        let deleteCount = 0;
        for (let i = index + 1; i < tempData.length; i++) {
            const child = tempData[i];
            if (child.__T_LV__ && child.__T_LV__ > level) {
                deleteCount++;
            } else {
                break;
            }
        }
        return deleteCount;
    }

    // ==================== Row Expand ====================
    const expandedKey = '__EXP__';

    function isRowExpanded(row: DT, col?: StkTableColumn<DT>) {
        return row?.[expandedKey] === col ? !row?.[expandedKey] : true;
    }

    function toggleExpandRow(row: DT, col: StkTableColumn<DT>) {
        const isExpand = isRowExpanded(row, col);
        setRowExpand(row, isExpand, { col });
    }

    function setRowExpand(rowKeyOrRow: string | number | undefined | DT, expand?: boolean | null, data?: { col?: StkTableColumn<DT>; silent?: boolean }) {
        let rk: UniqKey;
        if (typeof rowKeyOrRow === 'string' || typeof rowKeyOrRow === 'number') {
            rk = rowKeyOrRow;
        } else {
            rk = rowKeyGenFn(rowKeyOrRow);
        }

        const tempData = dataSourceCopy.slice();
        const index = tempData.findIndex(it => rowKeyGenFn(it) === rk);
        if (index === -1) {
            console.warn('expandRow failed.rowKey:', rk);
            return;
        }

        for (let i = index + 1; i < tempData.length; i++) {
            const item: PrivateRowDT = tempData[i];
            const itemKey = item.__R_K__;
            if (itemKey?.startsWith(EXPANDED_ROW_KEY_PREFIX)) {
                tempData.splice(i, 1);
                i--;
            } else {
                break;
            }
        }

        const row = tempData[index];
        const col = data?.col;

        if (expand == null) {
            expand = isRowExpanded(row, col);
        }

        if (expand) {
            const newExpandRow: PrivateRowDT = {
                __R_K__: EXPANDED_ROW_KEY_PREFIX + rk,
                __EXP_R__: row,
                __EXP_C__: col,
            };
            tempData.splice(index + 1, 0, newExpandRow);
        }

        if (row) {
            row[expandedKey] = expand ? col : void 0;
        }

        dataSourceCopy = tempData;
        onDataSourceChange();
        if (!data?.silent) {
            ontogglerowexpand?.({ expanded: Boolean(expand), row, col });
        }
    }

    // ==================== Fixed Col Position ====================
    /**
     * 无 colKey 列的兜底键：Svelte 5 深层 $state 下同一列对象经不同 $state 根会得到不同 proxy，
     * WeakMap 按引用查找会失效，改用叶子索引区间作为稳定键
     */
    function fixedColPosFallbackKey(col: PrivateStkTableColumn<PrivateRowDT>): string {
        return col.__LF_S__ + ':' + col.__LF_E__;
    }

    let fixedColPositionStore = $derived.by(() => {
        const colKeyStore: Record<string, number> = {};
        const fallbackStore: Record<string, number> = {};
        tableHeadersForCalc.forEach(cols => {
            let left = 0;
            let rightStartIndex = 0;
            for (let i = 0; i < cols.length; i++) {
                const item = cols[i];
                if (item.fixed === 'left') {
                    const ck = colKeyGen(item);
                    if (ck) {
                        colKeyStore[ck] = left;
                    } else {
                        fallbackStore[fixedColPosFallbackKey(item)] = left;
                    }
                    left += getCalculatedColWidth(item);
                }
                if (!rightStartIndex && item.fixed === 'right') {
                    rightStartIndex = i;
                }
            }

            let right = 0;
            for (let i = cols.length - 1; i >= rightStartIndex; i--) {
                const item = cols[i];
                const ck = colKeyGen(item);
                if (item.fixed === 'right') {
                    if (ck) {
                        colKeyStore[ck] = right;
                    } else {
                        fallbackStore[fixedColPosFallbackKey(item)] = right;
                    }
                    right += getCalculatedColWidth(item);
                }
            }
        });
        return { colKeyStore, fallbackStore };
    });

    function getFixedColPosition(col: StkTableColumn<any>): number {
        const ck = colKeyGen(col);
        const { colKeyStore, fallbackStore } = fixedColPositionStore;
        return ck ? colKeyStore[ck] : fallbackStore[fixedColPosFallbackKey(col as PrivateStkTableColumn<PrivateRowDT>)] || 0;
    }

    // ==================== Fixed Style ====================
    function getFixedStyle(tagType: TagType, col: StkTableColumn<DT>, depth = 0): string {
        const { fixed } = col;
        if ((tagType === TagType.TD || tagType === TagType.TF) && !fixed) return '';

        const isFixedLeft = fixed === 'left';
        const { scrollLeft, scrollWidth, offsetLeft, containerWidth } = virtualScrollX;
        const scrollRight = scrollWidth - containerWidth - scrollLeft;

        let style = '';

        if (tagType === TagType.TH) {
            if (!isRelativeMode) {
                if (depth) {
                    style += `top:${depth * (headerRowHeight ?? rowHeight)}px;`;
                }
            } else {
                style += `top:${virtualScroll.scrollTop}px;`;
            }
        } else if (tagType === TagType.TF) {
            style += 'bottom:0;';
        }

        if (fixed) {
            if (!isRelativeMode) {
                const lr = getFixedColPosition(col) + 'px';
                if (isFixedLeft) {
                    style += `left:${lr};`;
                } else {
                    style += `right:${lr};`;
                }
            } else {
                if (isFixedLeft) {
                    style += `left:${scrollLeft - (virtualX_on ? offsetLeft : 0)}px;`;
                } else {
                    style += `right:${Math.max(scrollRight - (virtualX_on ? virtualX_offsetRight : 0), 0)}px;`;
                }
            }
        }

        return style;
    }

    // ==================== Fixed Col ====================
    let fixedShadowCols = $state<StkTableColumn<DT>[]>([]);
    let fixedCols = $state<StkTableColumn<DT>[]>([]);
    /**
     * 需要自行绘制左边框的右固定列。
     * 单元格的左边框由左侧相邻单元格的 border-right 提供，右固定列吸附遮挡内容后两者不再相邻，因此需要自行绘制。
     */
    let fixedBorderLeftCols = $state<StkTableColumn<DT>[]>([]);

    // NOTE: 用 colKey 比较。Svelte5 深层 $state 中，同一列对象经 tableHeaders 与
    // tableHeadersForCalc 两个 $state 根读取会得到不同 proxy，对象身份比较会失效。
    let fixedColKeys = $derived(new Set(fixedCols.map(c => colKeyGen(c))));
    let fixedShadowColKeys = $derived(new Set(fixedShadowCols.map(c => colKeyGen(c))));
    let fixedBorderLeftColKeys = $derived(new Set(fixedBorderLeftCols.map(c => colKeyGen(c))));

    let fixedColClassMap = $derived.by(() => {
        const colMap = new Map<string, string[]>();
        for (let i = 0, len = tableHeaders.length; i < len; i++) {
            const cols = tableHeaders[i];
            for (let j = 0, colLen = cols.length; j < colLen; j++) {
                const col = cols[j];
                const ck = colKeyGen(col);
                const fixed = col.fixed;
                const showShadow = fixed && fixedColShadow && fixedShadowColKeys.has(ck);
                const classList: string[] = [];

                if (fixedColKeys.has(ck)) {
                    classList.push('fixed-cell--active');
                }
                if (fixed) {
                    classList.push('fixed-cell');
                    classList.push('fixed-cell--' + fixed);
                }
                if (showShadow) {
                    classList.push('fixed-cell--shadow');
                }
                if (fixed === 'right' && fixedBorderLeftColKeys.has(ck)) {
                    classList.push('fixed-cell--border-left');
                }
                colMap.set(ck, classList);
            }
        }
        return colMap;
    });

    function updateFixedShadow(virtualScrollXRef?: { containerWidth: number; scrollLeft: number }) {
        const fixedColsTemp: StkTableColumn<DT>[] = [];
        let clientWidth: number, scrollLeftVal: number;

        if (virtualScrollXRef) {
            clientWidth = virtualScrollXRef.containerWidth;
            scrollLeftVal = virtualScrollXRef.scrollLeft;
        } else {
            const el = tableContainerRef as HTMLDivElement;
            clientWidth = el?.clientWidth || 0;
            scrollLeftVal = el?.scrollLeft || 0;
        }

        const leftShadowCol: StkTableColumn<DT>[] = [];
        const rightShadowCol: StkTableColumn<DT>[] = [];
        const len = tableHeadersForCalc.length;
        for (let level = 0; level < len; level++) {
            const row = tableHeadersForCalc[level];
            /**
             * 最右侧连续 fixed:right 列的起始下标。
             * 这些列的固定偏移只由其右侧固定列宽度决定，不依赖中间列的声明宽度，
             * 且 sticky/relative 在无横向溢出时偏移为0无副作用，因此无需判断滚动位置，始终固定。
             */
            let rightSuffixStart = row.length;
            while (rightSuffixStart > 0 && row[rightSuffixStart - 1].fixed === 'right') {
                rightSuffixStart--;
            }
            let left = 0;
            for (let i = 0, rowLen = row.length; i < rowLen; i++) {
                const col = row[i];
                const position = getFixedColPosition(col);
                const isFixedLeft = col.fixed === 'left';
                const isFixedRight = col.fixed === 'right';

                if (isFixedLeft && position + scrollLeftVal > left) {
                    fixedColsTemp.push(col);
                    leftShadowCol[level] = col;
                }

                left += getCalculatedColWidth(col);

                if (isFixedRight) {
                    /** 是否需要固定。依赖列声明宽度累加，声明宽度与实际渲染宽度不一致时会失真 */
                    const needFix = scrollLeftVal + clientWidth - left < position;
                    if (i >= rightSuffixStart || needFix) {
                        fixedColsTemp.push(col);
                    }
                    // 右固定列阴影，只要第一列。阴影仍按滚动位置判断，避免未遮挡时也显示阴影
                    if (needFix && !rightShadowCol[level]) {
                        rightShadowCol[level] = col;
                    }
                }
            }
        }

        if (fixedColShadow) {
            fixedShadowCols = leftShadowCol.concat(rightShadowCol).filter(Boolean) as StkTableColumn<DT>[];
        }

        // rightShadowCol 是每层最靠左的、已遮挡内容的右固定列，正是需要绘制左边框的列
        fixedBorderLeftCols = rightShadowCol.filter(Boolean) as StkTableColumn<DT>[];

        fixedCols = fixedColsTemp;
    }

    // ==================== Merge Cells ====================
    let hoverMergedCells = $state<Set<string>>(new Set());
    let activeMergedCells = $state<Set<string>>(new Set());

    /**
     * 合并单元格布局（预计算，避免在模板渲染期间修改 $state）
     * - hidden: rowKey -> 被合并隐藏的 colKey Set
     * - hover: rowKey -> 覆盖该行的合并锚点 cellKey Set
     * - props: cellKey -> { colspan, rowspan }（锚点单元格）
     */
    let mergeCellsLayout = $derived.by(() => {
        const hidden: Record<UniqKey, Set<UniqKey>> = {};
        const hover: Record<UniqKey, Set<string>> = {};
        const props = new Map<string, { colspan?: number; rowspan?: number }>();

        const headers = tableHeaderLast;
        if (!headers.some(c => c.mergeCells)) return { hidden, hover, props };

        const rows = virtual_dataSourcePart;

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            if (!row) continue;
            const rk = rowKeyGenFn(row);
            for (let colIndex = 0; colIndex < headers.length; colIndex++) {
                const col = headers[colIndex];
                if (!col.mergeCells) continue;
                const ck = colKeyGen(col);
                // 跳过已被前面锚点覆盖的单元格（与渲染顺序行为一致）
                if (hidden[rk]?.has(ck)) continue;

                let { colspan, rowspan } = col.mergeCells({ row, col, rowIndex, colIndex }) || {};
                colspan = colspan || 1;
                rowspan = rowspan || 1;
                if (colspan === 1 && rowspan === 1) continue;

                const mergedCellKey = pureCellKeyGen(rk, ck);
                props.set(mergedCellKey, { colspan, rowspan });

                for (let i = rowIndex; i < rowIndex + rowspan; i++) {
                    const targetRow = rows[i];
                    if (!targetRow) break;
                    const targetRk = rowKeyGenFn(targetRow);
                    if (!hover[targetRk]) hover[targetRk] = new Set();
                    if (!hidden[targetRk]) hidden[targetRk] = new Set();
                    const hoverSet = hover[targetRk];
                    const hiddenSet = hidden[targetRk];
                    const endIndex = Math.min(colIndex + colspan, headers.length);
                    for (let j = colIndex; j < endIndex; j++) {
                        hoverSet.add(mergedCellKey);
                        if (i === rowIndex && j === colIndex) continue;
                        const nextCol = headers[j];
                        if (!nextCol) break;
                        hiddenSet.add(colKeyGen(nextCol));
                    }
                }
            }
        }

        return { hidden, hover, props };
    });

    const emptySet = new Set<string>();
    function updateHoverMergedCells(rowKeyValue: UniqKey | undefined) {
        hoverMergedCells = rowKeyValue === void 0 ? emptySet : mergeCellsLayout.hover[rowKeyValue] || emptySet;
    }

    function updateActiveMergedCells(clear?: boolean, rowKeyValue?: UniqKey) {
        if (!rowActiveProp.enabled) return;
        if (clear) {
            activeMergedCells = new Set();
            return;
        }
        activeMergedCells = (rowKeyValue !== void 0 && mergeCellsLayout.hover[rowKeyValue]) || new Set(hoverMergedCells);
    }

    // ==================== Highlight ====================
    type HighlightDimRowStore = {
        readonly ts: number;
        visible: boolean;
        keyframe: PropertyIndexedKeyframes;
        readonly duration: number;
        ignoreInvisible?: boolean;
    };

    const highlightColor = { light: HIGHLIGHT_COLOR.light, dark: HIGHLIGHT_COLOR.dark };
    let highlightDuration = $derived((highlightConfig as HighlightConfig).duration ? (highlightConfig as HighlightConfig).duration! * 1000 : HIGHLIGHT_DURATION);
    let highlightFrequency = $derived((highlightConfig as HighlightConfig).fps && (highlightConfig as HighlightConfig).fps! > 0 ? 1000 / (highlightConfig as HighlightConfig).fps! : null);
    let highlightSteps = $derived(highlightFrequency ? Math.round(highlightDuration / highlightFrequency) : null);
    let highlightFrom = $derived(highlightColor[(theme as 'light' | 'dark')].from);

    const highlightDimRowsAnimation = new Map<UniqKey, HighlightDimRowStore>();
    let calcHighlightDimLoopAnimation = false;
    const highlightDimRowsTimeout = new Map<UniqKey, number>();
    const highlightDimCellsTimeout = new Map<string, number>();

    let defaultHighlightDimOption = $derived.by(() => {
        const keyframe: PropertyIndexedKeyframes = { backgroundColor: [highlightFrom, ''] };
        if (highlightSteps) {
            keyframe.easing = `steps(${highlightSteps})`;
        }
        return { duration: highlightDuration, keyframe };
    });

    function calcRowHighlightLoop() {
        if (calcHighlightDimLoopAnimation) return;
        calcHighlightDimLoopAnimation = true;
        const recursion = () => {
            window.requestAnimationFrame(() => {
                const nowTs = performance.now();
                const keysToDelete: UniqKey[] = [];
                highlightDimRowsAnimation.forEach((store, rowKeyValue) => {
                    const { ts, duration } = store;
                    const timeOffset = nowTs - ts;
                    if (timeOffset < duration) {
                        const shouldDelete = updateRowAnimation(rowKeyValue, store, timeOffset);
                        if (shouldDelete) keysToDelete.push(rowKeyValue);
                    } else {
                        keysToDelete.push(rowKeyValue);
                    }
                });
                keysToDelete.forEach(key => highlightDimRowsAnimation.delete(key));

                if (highlightDimRowsAnimation.size) {
                    recursion();
                } else {
                    calcHighlightDimLoopAnimation = false;
                    highlightDimRowsAnimation.clear();
                }
            });
        };
        recursion();
    }

    function setHighlightDimCell(rowKeyValue: UniqKey, colKeyValue: string, option: any = {}) {
        const cellEl = tableContainerRef?.querySelector<HTMLElement>(`[data-row-key="${rowKeyValue}"] [data-col-key="${colKeyValue}"]`);
        if (!cellEl) return;
        const { className, method, duration, keyframe } = {
            className: HIGHLIGHT_CELL_CLASS,
            method: 'animation',
            ...defaultHighlightDimOption,
            ...option,
        };
        if (method === 'animation') {
            cellEl.animate(keyframe, duration);
        } else {
            highlightCellsInCssKeyFrame(cellEl, rowKeyValue, colKeyValue, className, duration);
        }
    }

    function setHighlightDimRow(rowKeyValues: UniqKey[], option: any = {}) {
        if (!Array.isArray(rowKeyValues)) rowKeyValues = [rowKeyValues];
        if (!rowKeyValues.length) return;
        const { className, method, keyframe, duration } = {
            className: HIGHLIGHT_ROW_CLASS,
            method: 'animation',
            ...defaultHighlightDimOption,
            ...option,
        };

        const ignoreInvisible = Boolean(option.ignoreInvisible);
        if (method === 'animation') {
            if (virtual) {
                const nowTs = performance.now();
                for (let i = 0; i < rowKeyValues.length; i++) {
                    const rowKeyValue = rowKeyValues[i];
                    const store: HighlightDimRowStore = { ts: nowTs, visible: false, keyframe, duration, ignoreInvisible };
                    const shouldDelete = updateRowAnimation(rowKeyValue, store, 0);
                    if (ignoreInvisible && shouldDelete) {
                        highlightDimRowsAnimation.delete(rowKeyValue);
                    } else {
                        highlightDimRowsAnimation.set(rowKeyValue, store);
                    }
                }
                calcRowHighlightLoop();
            } else {
                for (let i = 0; i < rowKeyValues.length; i++) {
                    const rowEl = document.getElementById(stkTableId + '-' + String(rowKeyValues[i])) as HTMLTableRowElement | null;
                    if (!rowEl) continue;
                    rowEl.animate(keyframe, duration);
                }
            }
        } else {
            highlightRowsInCssKeyframe(rowKeyValues, className, duration);
        }
    }

    function highlightRowsInCssKeyframe(rowKeyValues: UniqKey[], className: string, duration: number) {
        let needRepaint = false;
        const rowElTemp: HTMLTableRowElement[] = [];
        for (let i = 0; i < rowKeyValues.length; i++) {
            const rowKeyValue = rowKeyValues[i];
            const rowEl = document.getElementById(stkTableId + '-' + String(rowKeyValue)) as HTMLTableRowElement | null;
            if (!rowEl) continue;
            if (rowEl.classList.contains(className)) {
                rowEl.classList.remove(className);
                needRepaint = true;
            }
            rowElTemp.push(rowEl);
            window.clearTimeout(highlightDimRowsTimeout.get(rowKeyValue));
            highlightDimRowsTimeout.set(
                rowKeyValue,
                window.setTimeout(() => {
                    rowEl.classList.remove(className);
                    highlightDimRowsTimeout.delete(rowKeyValue);
                }, duration),
            );
        }
        if (needRepaint) {
            void tableContainerRef?.offsetWidth;
        }
        rowElTemp.forEach(el => el.classList.add(className));
    }

    function highlightCellsInCssKeyFrame(cellEl: HTMLElement, rowKeyValue: UniqKey, colKeyValue: string, className: string, duration: number) {
        if (cellEl.classList.contains(className)) {
            cellEl.classList.remove(className);
            void cellEl.offsetHeight;
        }
        cellEl.classList.add(className);
        const cellKey = `${rowKeyValue}-${colKeyValue}`;
        window.clearTimeout(highlightDimCellsTimeout.get(cellKey));
        if (!duration) return;
        highlightDimCellsTimeout.set(
            cellKey,
            window.setTimeout(() => {
                cellEl.classList.remove(className);
                highlightDimCellsTimeout.delete(cellKey);
            }, duration),
        );
    }

    function updateRowAnimation(rowKeyValue: UniqKey, store: HighlightDimRowStore, timeOffset: number): boolean {
        const rowEl = document.getElementById(stkTableId + '-' + String(rowKeyValue));
        const { visible, ignoreInvisible } = store;
        if (!rowEl) {
            if (ignoreInvisible) return true;
            if (visible) store.visible = false;
            return false;
        }
        const { keyframe, duration: initialDuration } = store;
        if (!visible) {
            store.visible = true;
            const iterationStart = timeOffset / initialDuration;
            rowEl.animate(keyframe, {
                duration: initialDuration - timeOffset,
                iterationStart,
                iterations: 1 - iterationStart,
            });
        }
        return false;
    }

    // ==================== Col Resize ====================
    let isColResizing = $state(false);
    let colResizeState = {
        currentCol: null as StkTableColumn<DT> | null,
        lastCol: null as StkTableColumn<DT> | null,
        startX: 0,
        startOffsetTableX: 0,
        revertMoveX: false,
    };

    function colResizeOn(col: StkTableColumn<DT>): boolean {
        if (Object.prototype.toString.call(colResizable) === '[object Object]') {
            return !(colResizable as ColResizableConfig<DT>).disabled(col);
        }
        return Boolean(colResizable);
    }

    function onThResizeMouseDown(e: MouseEvent, col: StkTableColumn<DT>, leftHandle = false) {
        if (!tableContainerRef) return;
        e.stopPropagation();
        e.preventDefault();
        const { clientX } = e;
        const { scrollLeft, scrollTop } = tableContainerRef;
        const { left } = tableContainerRef.getBoundingClientRect();
        let revertMoveX = false;
        const colKeyValue = colKeyGen(col);
        const colIndex = tableHeaderLast.findIndex(it => colKeyGen(it) === colKeyValue);
        const fixedIndex = fixedCols.findIndex(it => colKeyGen(it) === colKeyValue);
        const isColFixed = fixedIndex !== -1;

        if (leftHandle) {
            if (isColFixed && col.fixed === 'right') {
                revertMoveX = true;
            } else {
                if (colIndex - 1 >= 0) {
                    col = tableHeaderLast[colIndex - 1];
                }
            }
        } else {
            if (isColFixed && col.fixed === 'right') {
                col = fixedCols[fixedIndex + 1] || col;
            }
        }

        const offsetTableX = clientX - left + scrollLeft;

        isColResizing = true;
        Object.assign(colResizeState, {
            currentCol: col,
            lastCol: findLastChildCol(col),
            startX: clientX,
            startOffsetTableX: offsetTableX,
            revertMoveX,
        });

        if (colResizeIndicatorRef) {
            const style = colResizeIndicatorRef.style;
            style.display = 'block';
            style.left = offsetTableX + 'px';
            style.top = scrollTop + 'px';
        }
    }

    function onThResizeMouseMove(e: MouseEvent) {
        if (!isColResizing) return;
        e.stopPropagation();
        e.preventDefault();
        const { lastCol, startX, startOffsetTableX } = colResizeState;
        const { clientX } = e;
        let moveX = clientX - startX;
        const currentColWidth = getCalculatedColWidth(lastCol);
        const minWidth = lastCol?.minWidth ?? colMinWidth;
        if (currentColWidth + moveX < minWidth) {
            moveX = -currentColWidth;
        }
        const offsetTableX = startOffsetTableX + moveX;
        if (!colResizeIndicatorRef) return;
        colResizeIndicatorRef.style.left = offsetTableX + 'px';
    }

    function onThResizeMouseUp(e: MouseEvent) {
        if (!isColResizing) return;
        const { startX, lastCol, revertMoveX } = colResizeState;
        const { clientX } = e;
        const moveX = revertMoveX ? startX - clientX : clientX - startX;

        let width = getCalculatedColWidth(lastCol) + moveX;
        if (width < colMinWidth) width = colMinWidth;

        const curCol = tableHeaderLast.find(it => colKeyGen(it) === colKeyGen(lastCol!));
        if (curCol) {
            curCol.width = width + 'px';
            clearColWidthCache();
            onupdatecolumns?.(columns.slice());
            oncolresize?.({ ...curCol });
        }

        if (colResizeIndicatorRef) {
            const style = colResizeIndicatorRef.style;
            style.display = 'none';
            style.left = '0';
            style.top = '0';
        }
        isColResizing = false;
        colResizeState = { currentCol: null, lastCol: null, startX: 0, startOffsetTableX: 0, revertMoveX: false };
    }

    function findLastChildCol(column: StkTableColumn<DT> | null): StkTableColumn<DT> | null {
        if (column?.children?.length) {
            const lastChild = column.children.slice(-1)[0] as StkTableColumn<DT>;
            return findLastChildCol(lastChild);
        }
        return column;
    }

    // ==================== Th Drag ====================
    let headerDragConfig = $derived.by(() => {
        const hd = headerDrag;
        const draggable = hd !== false;
        return {
            draggable,
            mode: 'insert' as string,
            disabled: () => false,
            ...(typeof hd === 'object' ? hd : {}),
        } as HeaderDragConfig<DT> & { draggable: boolean; mode: string; disabled: (col: any) => boolean };
    });

    function isHeaderDraggable(col: StkTableColumn<any>) {
        return headerDragConfig.draggable && !headerDragConfig.disabled(col);
    }

    function onThDragStart(e: DragEvent) {
        const th = getClosestTh(e.target as HTMLElement);
        if (!th) return;
        const dragStartKey = th.dataset.colKey || '';
        const dt = e.dataTransfer;
        if (dt) {
            dt.effectAllowed = 'move';
            dt.setData('text/plain', dragStartKey);
        }
        onthdragstart?.(dragStartKey);
    }

    function onThDragOver(e: DragEvent) {
        const th = getClosestTh(e.target as HTMLElement);
        if (!th) return;
        const isDraggable = th.getAttribute('draggable') === 'true';
        if (!isDraggable) return;
        const dt = e.dataTransfer;
        if (dt) dt.dropEffect = 'move';
        e.preventDefault();
    }

    function onThDrop(e: DragEvent) {
        const th = getClosestTh(e.target as HTMLElement);
        if (!th) return;
        const dragStartKey = e.dataTransfer?.getData('text');
        if (dragStartKey !== th.dataset.colKey) {
            handleColOrderChange(dragStartKey, th.dataset.colKey);
        }
        onthdrop?.(th.dataset.colKey);
    }

    function handleColOrderChange(dragStartKey: string | undefined, dragEndKey: string | undefined) {
        if (isEmptyValue(dragStartKey) || isEmptyValue(dragEndKey)) return;

        if (headerDragConfig.mode !== 'none') {
            const columnsTemp: StkTableColumn<any>[] = columns.slice();
            const dragStartIndex = columnsTemp.findIndex(col => colKeyGen(col) === dragStartKey);
            const dragEndIndex = columnsTemp.findIndex(col => colKeyGen(col) === dragEndKey);
            if (dragStartIndex === -1 || dragEndIndex === -1) return;

            const dragStartCol = columnsTemp[dragStartIndex];
            if (headerDragConfig.mode === 'swap') {
                columnsTemp[dragStartIndex] = columnsTemp[dragEndIndex];
                columnsTemp[dragEndIndex] = dragStartCol;
            } else {
                columnsTemp.splice(dragStartIndex, 1);
                columnsTemp.splice(dragEndIndex, 0, dragStartCol);
            }
            onupdatecolumns?.(columnsTemp);
        }

        oncolorderchange?.(dragStartKey, dragEndKey);
    }

    // ==================== Tr Drag ====================
    const TR_DRAGGING_CLASS = 'tr-dragging';
    const TR_DRAG_OVER_CLASS = 'tr-dragging-over';
    const DATA_TRANSFER_FORMAT = 'text/plain';
    let trDragFlag = false;
    let oldDragTr: HTMLElement | null = null;

    let dragRowConfigMerged = $derived.by(() => ({ mode: 'insert' as string, ...(dragRowConfig as DragRowConfig) }));

    function onTrDragStart(e: DragEvent, rowIndex: number) {
        const tr = getClosestTr(e.target as HTMLElement);
        if (tr) {
            const trRect = tr.getBoundingClientRect();
            const x = e.clientX - (trRect.left ?? 0);
            e.dataTransfer?.setDragImage(tr, x, trRect.height / 2);
            tr.classList.add(TR_DRAGGING_CLASS);
        }
        const dt = e.dataTransfer;
        if (dt) {
            dt.effectAllowed = 'move';
            dt.setData(DATA_TRANSFER_FORMAT, String(rowIndex));
        }
        trDragFlag = true;
    }

    function onTrDragOver(e: DragEvent) {
        if (!trDragFlag) return;
        e.preventDefault();
        const dt = e.dataTransfer;
        if (dt) dt.dropEffect = 'move';
    }

    function onTrDragEnter(e: DragEvent) {
        if (!trDragFlag) return;
        e.preventDefault();
        const tr = getClosestTr(e.target as HTMLElement);
        if (oldDragTr && oldDragTr !== tr) {
            oldDragTr.classList.remove(TR_DRAG_OVER_CLASS);
        }
        if (tr) {
            oldDragTr = tr;
            tr.classList.add(TR_DRAG_OVER_CLASS);
        }
    }

    function onTrDragEnd(e: DragEvent) {
        if (!trDragFlag) return;
        const tr = getClosestTr(e.target as HTMLElement);
        if (tr) tr.classList.remove(TR_DRAGGING_CLASS);
        if (oldDragTr) {
            oldDragTr.classList.remove(TR_DRAG_OVER_CLASS);
            oldDragTr = null;
        }
        trDragFlag = false;
    }

    function onTrDrop(e: DragEvent, rowIndex: number) {
        if (!trDragFlag) return;
        const dt = e.dataTransfer;
        if (!dt) return;
        const mode = dragRowConfigMerged.mode;
        const sourceIndex = Number(dt.getData(DATA_TRANSFER_FORMAT));
        const endIndex = rowIndex;
        if (sourceIndex === endIndex) return;

        if (mode !== 'none') {
            const dataSourceTemp = dataSourceCopy.slice();
            const sourceRow = dataSourceTemp[sourceIndex];
            if (mode === 'swap') {
                dataSourceTemp[sourceIndex] = dataSourceTemp[endIndex];
                dataSourceTemp[endIndex] = sourceRow;
            } else {
                dataSourceTemp.splice(sourceIndex, 1);
                dataSourceTemp.splice(endIndex, 0, sourceRow);
            }
            dataSourceCopy = dataSourceTemp;
        }
        onroworderchange?.(sourceIndex, endIndex);
    }

    // ==================== Custom Scrollbar ====================
    let showScrollbar = $state({ x: false, y: false });
    let scrollbarState = $state({ h: 0, w: 0, t: 0, l: 0 });

    let sbIsDraggingVertical = false;
    let sbIsDraggingHorizontal = false;
    let sbDragStartY = 0;
    let sbDragStartX = 0;
    let sbDragStartTop = 0;
    let sbDragStartLeft = 0;
    let sbCurrentDragHandler: ((e: MouseEvent | TouchEvent) => void) | undefined;
    let sbIsMobileDevice = false;

    const sbThrottledUpdate = throttle(() => updateCustomScrollbar(), 200);
    const sbRafUpdateVirtualScrollY = rafThrottle((scrollTop: number) => updateVirtualScrollY(scrollTop));

    function updateCustomScrollbar() {
        if (!scrollbarOptions.enabled || sbIsMobileDevice) return;
        const { scrollHeight, scrollTop, containerHeight } = virtualScroll;
        const { scrollWidth, scrollLeft, containerWidth } = virtualScrollX;

        const needVertical = scrollHeight > containerHeight;
        const needHorizontal = scrollWidth > containerWidth;
        showScrollbar = { x: needHorizontal, y: needVertical };

        if (needVertical) {
            const ratio = containerHeight / scrollHeight;
            scrollbarState.h = Math.max(scrollbarOptions.minHeight, ratio * containerHeight);
            scrollbarState.t = Math.round((scrollTop / (scrollHeight - containerHeight)) * (containerHeight - scrollbarState.h));
        }

        if (needHorizontal) {
            const ratio = containerWidth / scrollWidth;
            scrollbarState.w = Math.max(scrollbarOptions.minWidth, ratio * containerWidth);
            scrollbarState.l = Math.round((scrollLeft / (scrollWidth - containerWidth)) * (containerWidth - scrollbarState.w));
        }
    }

    function onVerticalScrollbarMouseDown(e: MouseEvent | TouchEvent) {
        if (e instanceof MouseEvent) e.preventDefault();
        sbIsDraggingVertical = true;
        sbDragStartTop = virtualScroll.scrollTop;
        sbDragStartY = e instanceof MouseEvent ? e.clientY : (e as TouchEvent).touches[0].clientY;
        sbAddDragListeners(sbOnVerticalDrag);
    }

    function onHorizontalScrollbarMouseDown(e: MouseEvent | TouchEvent) {
        if (e instanceof MouseEvent) e.preventDefault();
        sbIsDraggingHorizontal = true;
        sbDragStartLeft = virtualScrollX.scrollLeft;
        sbDragStartX = e instanceof MouseEvent ? e.clientX : (e as TouchEvent).touches[0].clientX;
        sbAddDragListeners(sbOnHorizontalDrag);
    }

    function sbAddDragListeners(dragHandler: (e: MouseEvent | TouchEvent) => void) {
        sbRemoveCurrentDragHandlerListeners();
        sbCurrentDragHandler = dragHandler;
        document.addEventListener('mousemove', dragHandler);
        document.addEventListener('mouseup', sbOnDragEnd);
        document.addEventListener('touchmove', dragHandler, { passive: false });
        document.addEventListener('touchend', sbOnDragEnd);
    }

    function sbOnVerticalDrag(e: MouseEvent | TouchEvent) {
        if (!sbIsDraggingVertical) return;
        e.preventDefault();
        const clientY = e instanceof MouseEvent ? e.clientY : (e as TouchEvent).touches[0].clientY;
        const deltaY = clientY - sbDragStartY;
        const { scrollHeight, containerHeight } = virtualScroll;
        const scrollRange = scrollHeight - containerHeight;
        const trackRange = containerHeight - scrollbarState.h;
        const scrollDelta = (deltaY / trackRange) * scrollRange;

        if (isExperimentalScrollY) {
            const ratio = containerHeight / scrollHeight;
            const top = Math.round((sbDragStartTop + scrollDelta) * ratio);
            const maxTop = containerHeight - scrollbarState.h;
            scrollbarState.t = top < 0 ? 0 : top > maxTop ? maxTop : top;
            sbRafUpdateVirtualScrollY(sbDragStartTop + scrollDelta);
        } else {
            tableContainerRef!.scrollTop = sbDragStartTop + scrollDelta;
        }
    }

    function sbOnHorizontalDrag(e: MouseEvent | TouchEvent) {
        if (!sbIsDraggingHorizontal) return;
        e.preventDefault();
        const clientX = e instanceof MouseEvent ? e.clientX : (e as TouchEvent).touches[0].clientX;
        const deltaX = clientX - sbDragStartX;
        const { scrollWidth, containerWidth } = virtualScrollX;
        const scrollRange = scrollWidth - containerWidth;
        const trackRange = containerWidth - scrollbarState.w;
        const scrollDelta = (deltaX / trackRange) * scrollRange;
        tableContainerRef!.scrollLeft = sbDragStartLeft + scrollDelta;
    }

    function sbOnDragEnd() {
        sbIsDraggingVertical = false;
        sbIsDraggingHorizontal = false;
        sbRemoveCurrentDragHandlerListeners();
        document.removeEventListener('mouseup', sbOnDragEnd);
        document.removeEventListener('touchend', sbOnDragEnd);
    }

    function sbRemoveCurrentDragHandlerListeners() {
        if (sbCurrentDragHandler) {
            document.removeEventListener('mousemove', sbCurrentDragHandler);
            document.removeEventListener('touchmove', sbCurrentDragHandler);
            sbCurrentDragHandler = void 0;
        }
    }

    // ==================== Wheeling ====================
    let wheelingValue = false;
    let wheelingTimer = 0;
    function isWheeling() {
        return wheelingValue;
    }
    function setIsWheeling(newValue: boolean) {
        wheelingValue = newValue;
        if (newValue) {
            if (wheelingTimer) self.clearTimeout(wheelingTimer);
            wheelingTimer = self.setTimeout(() => {
                wheelingValue = false;
                wheelingTimer = 0;
            }, 500) as unknown as number;
        }
    }

    // ==================== Area Selection (feature) ====================
    const areaSelectionFeature = ON_DEMAND_FEATURE[useAreaSelectionName]({
        getAreaSelectionProp: () => areaSelection,
        getScrollRowByRow: () => scrollRowByRow,
        emitChange: ranges => onareaselectionchange?.(ranges),
        getContainer: () => tableContainerRef,
        getDataSource: () => dataSourceCopy,
        getTableHeaderLast: () => tableHeaderLast,
        colKeyGen,
        cellKeyGen,
        scrollTo,
        getVirtualScroll: () => virtualScroll,
        getVirtualScrollX: () => virtualScrollX,
        getRowIndex,
        getColumnIndex,
    } as any);

    function getSelectedArea() {
        return areaSelectionFeature.get();
    }

    function setAreaSelection(ranges?: any, option?: any) {
        return areaSelectionFeature.set(ranges, option);
    }

    function clearSelectedArea() {
        areaSelectionFeature.clear();
    }

    function copySelectedArea() {
        return areaSelectionFeature.copy();
    }

    // ==================== Keyboard Arrow Scroll ====================
    const ScrollCodes = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'PageUp', 'PageDown', 'Home', 'End'];
    let kbIsMouseOver = false;

    function handleKeydown(e: KeyboardEvent) {
        if (!virtual_on) return;
        if (areaSelectionFeature.config.keyboard) return;
        const keyCode = e.code;
        if (!ScrollCodes.includes(keyCode)) return;
        if (!kbIsMouseOver) return;
        e.preventDefault();

        const { scrollTop, rowHeight: rh, containerHeight, scrollHeight } = virtualScroll;
        const { scrollLeft } = virtualScrollX;

        const headerHeight = headless ? 0 : tableHeaders.length * (headerRowHeight || rh);
        const bodyPageSize = Math.floor((containerHeight - headerHeight) / rh);
        if (keyCode === 'ArrowUp') {
            scrollTo(scrollTop - rh, null);
        } else if (keyCode === 'ArrowRight') {
            scrollTo(null, scrollLeft + 50);
        } else if (keyCode === 'ArrowDown') {
            scrollTo(scrollTop + rh, null);
        } else if (keyCode === 'ArrowLeft') {
            scrollTo(null, scrollLeft - 50);
        } else if (keyCode === 'PageUp') {
            scrollTo(scrollTop - rh * bodyPageSize + headerHeight, null);
        } else if (keyCode === 'PageDown') {
            scrollTo(scrollTop + rh * bodyPageSize - headerHeight, null);
        } else if (keyCode === 'Home') {
            scrollTo(0, null);
        } else if (keyCode === 'End') {
            scrollTo(scrollHeight, null);
        }
    }

    function kbHandleMouseEnter() {
        kbIsMouseOver = true;
    }
    function kbHandleMouseLeave() {
        kbIsMouseOver = false;
    }
    function kbHandleMouseDown() {
        if (!kbIsMouseOver) kbIsMouseOver = true;
    }

    // ==================== Cell Style Map ====================
    let cellStyleMap = $derived.by(() => {
        const thMap = new Map<string, string>();
        const tdMap = new Map<string, string>();
        const tfMap = new Map<string, string>();
        const headers = tableHeaders;

        for (let depth = 0, depthLen = headers.length; depth < depthLen; depth++) {
            const cols = headers[depth];
            for (let i = 0, colsLen = cols.length; i < colsLen; i++) {
                const col = cols[i];
                const w = virtualX ? getCalculatedColWidth(col) + 'px' : transformWidthToStr(col.width);
                const minWidthStr = transformWidthToStr(col.minWidth);
                const maxWidthStr = transformWidthToStr(col.maxWidth);
                let styleStr = '';
                if (w) styleStr += `--cw:${w}`;
                if (minWidthStr) styleStr += `;min-width:${minWidthStr}`;
                if (maxWidthStr) styleStr += `;max-width:${maxWidthStr}`;
                const ck = colKeyGen(col);
                thMap.set(ck, styleStr + ';' + getFixedStyle(TagType.TH, col, depth));
                tdMap.set(ck, styleStr + ';' + getFixedStyle(TagType.TD, col, depth));
                tfMap.set(ck, 'position:sticky;' + styleStr + ';' + getFixedStyle(TagType.TF, col, depth));
            }
        }
        return { th: thMap, td: tdMap, tf: tfMap };
    });

    /**
     * fixed 模式下 colgroup 中单个 col 的样式。
     * 仅取叶子列的 width（与 cellStyleMap 中 --cw 保持一致）；未设置 width 的列不声明宽度，
     * 由 table-layout:fixed 将剩余空间平分，符合"一列固定、其余列平分"的预期。
     */
    function getColGroupColStyle(col: PrivateStkTableColumn<PrivateRowDT>): string | undefined {
        const width = transformWidthToStr(col.width);
        return width ? `width:${width}` : undefined;
    }

    // ==================== Helper Functions ====================
    function getAbsoluteRowIndex(rowIndex: number) {
        return rowIndex + virtualScroll.startIndex;
    }

    function getRowIndex(row: DT): number {
        const targetKey = rowKeyGenFn(row);
        return dataSourceCopy.findIndex(item => rowKeyGenFn(item) === targetKey);
    }

    function getColumnIndex(column: PrivateStkTableColumn<DT>): number {
        const targetKey = colKeyGen(column);
        return tableHeaderLast.findIndex(item => colKeyGen(item) === targetKey);
    }

    function shouldHideCell(row: PrivateRowDT | null | undefined, col: StkTableColumn<PrivateRowDT>): boolean | undefined {
        if (!row) return;
        return mergeCellsLayout.hidden[rowKeyGenFn(row)]?.has(colKeyGen(col));
    }

    function getHeaderTitle(col: StkTableColumn<DT>): string {
        const ck = colKeyGen(col);
        if (hideHeaderTitle === true || (Array.isArray(hideHeaderTitle) && hideHeaderTitle.includes(ck))) {
            return '';
        }
        return col.title || '';
    }

    function getEmptyCellText(col: StkTableColumn<DT>, row: DT) {
        return getEmptyCellTextFn(col, row);
    }

    function getTRProps(row: PrivateRowDT | null | undefined, index: number) {
        const rowIndex = getAbsoluteRowIndex(index);
        const rk = rowKeyGenFn(row);

        const classList = [rowClassName(row as DT, rowIndex), row?.__EXP__ ? 'expanded' : '', row?.__EXP_R__ ? 'expanded-row' : ''];
        if (currentRowKey === rk || row === currentRow) {
            classList.push('active');
        }
        if (showTrHoverClass && (rk === currentHoverRowKey || row === currentHoverRow)) {
            classList.push('hover');
        }

        const needRowHeight = row?.__EXP_R__ && virtual && (expandConfig as ExpandConfig)?.height;
        const style = needRowHeight ? `--row-height: ${(expandConfig as ExpandConfig)?.height}px` : undefined;

        return {
            id: stkTableId + '-' + rk,
            'data-row-key': String(rk),
            'data-row-i': String(rowIndex),
            class: classList.filter(Boolean).join(' '),
            style,
        };
    }

    function getTHProps(col: PrivateStkTableColumn<DT>) {
        const ck = colKeyGen(col);
        const sortState = getColumnSortState(ck);
        const isSorted = !!sortState && sortState.order !== null;

        const classList = [
            col.sorter ? 'sortable' : '',
            isSorted ? 'sorter-' + sortState?.order : '',
            col.headerClassName || '',
            ...(fixedColClassMap.get(ck) || []),
            col.headerAlign === 'left' ? 'text-l' : col.headerAlign === 'right' ? 'text-r' : col.headerAlign === 'center' ? 'text-c' : '',
        ];

        return {
            'data-col-key': ck,
            draggable: Boolean(isHeaderDraggable(col)),
            rowspan: col.__R_SP__,
            colspan: col.__C_SP__,
            style: cellStyleMap.th.get(ck),
            title: getHeaderTitle(col),
            class: classList.filter(Boolean).join(' '),
        };
    }

    function getTFProps(col: StkTableColumn<DT>) {
        const ck = colKeyGen(col);
        const classList = [
            col.className || '',
            ...(fixedColClassMap.get(ck) || []),
            col.type === 'seq' ? 'seq-column' : '',
            col.align === 'center' ? 'text-c' : col.align === 'right' ? 'text-r' : '',
        ];
        return {
            'data-col-key': ck,
            style: cellStyleMap.tf.get(ck),
            class: classList.filter(Boolean).join(' '),
        };
    }

    function getTDProps(row: PrivateRowDT | null | undefined, col: PrivateStkTableColumn<DT>, rowIndex: number, colIndex: number) {
        const ck = colKeyGen(col);
        if (!row) {
            return { style: cellStyleMap.td.get(ck), class: '', colspan: undefined, rowspan: undefined, 'data-col-key': ck };
        }

        const cellKey = cellKeyGen(row, col);
        const classList: string[] = [col.className || '', ...(fixedColClassMap.get(ck) || [])];

        if (col.align === 'center') {
            classList.push('text-c');
        } else if (col.align === 'right') {
            classList.push('text-r');
        }
        if (col.mergeCells) {
            if (hoverMergedCells.has(cellKey)) {
                classList.push('cell-hover');
            }
            if (activeMergedCells.has(cellKey)) {
                classList.push('cell-active');
            }
        }

        if (cellActive && currentSelectedCellKey === cellKey) {
            classList.push('active');
        }
        if (col.type === 'seq') {
            classList.push('seq-column');
        } else if (col.type === 'expand' && (row.__EXP__ ? colKeyGen(row.__EXP__) === ck : false)) {
            classList.push('expanded');
        } else if (row.__T_EXP__ && col.type === 'tree-node') {
            classList.push('tree-expanded');
        } else if (col.type === 'dragRow') {
            classList.push('drag-row-cell');
        }

        const mergeResult = mergeCellsLayout.props.get(cellKey);

        return {
            'data-col-key': ck,
            style: cellStyleMap.td.get(ck),
            class: classList.filter(Boolean).join(' '),
            colspan: mergeResult?.colspan,
            rowspan: mergeResult?.rowspan,
        };
    }

    // ==================== Event Handlers ====================
    function onRowClick(e: MouseEvent) {
        const rowIndex = getClosestTrIndex(e.target as HTMLElement);
        const row = dataSourceCopy[rowIndex];
        if (!row) return;
        onrowclick?.(e, row, { rowIndex });
        if (rowActiveProp.disabled?.(row)) return;
        const isCurrentRow = rowKey ? currentRowKey === rowKeyGenFn(row) : currentRow === row;
        if (isCurrentRow) {
            if (!rowActiveProp.revokable) return;
            setCurrentRow(void 0, { silent: true });
        } else {
            setCurrentRow(row, { silent: true });
        }
        oncurrentchange?.(e, row, { select: !isCurrentRow });
    }

    function onRowDblclick(e: MouseEvent) {
        const rowIndex = getClosestTrIndex(e.target as HTMLElement);
        const row = dataSourceCopy[rowIndex];
        if (!row) return;
        onrowdblclick?.(e, row, { rowIndex });
    }

    function onHeaderMenu(e: MouseEvent) {
        onheaderrowmenu?.(e);
    }

    function onRowMenu(e: MouseEvent) {
        const rowIndex = getClosestTrIndex(e.target as HTMLElement);
        const row = dataSourceCopy[rowIndex];
        if (!row) return;
        onrowmenu?.(e, row, { rowIndex });
    }

    function triangleClick(e: MouseEvent, row: DT, col: StkTableColumn<DT>) {
        if (col.type === 'expand') {
            toggleExpandRow(row, col);
        } else if (col.type === 'tree-node') {
            toggleTreeNode(row, col);
        }
    }

    function onCellClick(e: MouseEvent) {
        const rowIndex = getClosestTrIndex(e.target as HTMLElement);
        const row = dataSourceCopy[rowIndex];
        if (!row) return;
        const colKeyValue = getClosestColKey(e.target as HTMLElement);
        const col = tableHeaderLast.find(item => colKeyGen(item) === colKeyValue);
        if (!col) return;
        if ((e.target as HTMLElement)?.closest('.stk-fold-icon')) {
            triangleClick(e, row, col);
            return;
        }
        if (cellActive) {
            const cellKey = cellKeyGen(row, col);
            const result = { row, col, select: false, rowIndex };
            if (selectedCellRevokable && currentSelectedCellKey === cellKey) {
                currentSelectedCellKey = void 0;
            } else {
                currentSelectedCellKey = cellKey;
                result.select = true;
            }
            oncellselected?.(e, result);
        }
        oncellclick?.(e, row, col, { rowIndex });
    }

    function getCellEventData(e: MouseEvent) {
        const rowIndex = getClosestTrIndex(e.target as HTMLElement) || 0;
        const row = dataSourceCopy[rowIndex];
        const colKeyValue = getClosestColKey(e.target as HTMLElement);
        const col = tableHeaderLast.find(item => colKeyGen(item) === colKeyValue) as any;
        return { row, col, rowIndex };
    }

    function onHeaderCellClick(e: MouseEvent, col: StkTableColumn<DT>) {
        onColumnSort(col);
        onheadercellclick?.(e, col);
    }

    function onCellMouseOver(e: MouseEvent) {
        const td = getClosestTd(e.target as HTMLElement);
        if (!td) return;
        const { row, col } = getCellEventData(e);
        oncellmouseover?.(e, row, col);
        const related = e.relatedTarget as Node | null;
        if (!related || !td.contains(related)) {
            oncellmouseenter?.(e, row, col);
        }
    }

    function onTbodyMouseOut(e: MouseEvent) {
        const target = e.target as HTMLElement;
        const related = e.relatedTarget as Node | null;

        const td = getClosestTd(target);
        if (td && (!related || !td.contains(related))) {
            const { row, col } = getCellEventData(e);
            oncellmouseleave?.(e, row, col);
        }

        const tr = getClosestTr(target);
        if (tr && (!related || !tr.contains(related))) {
            currentHoverRow = null;
            if (showTrHoverClass) {
                currentHoverRowKey = null;
            }
            if (rowHover) {
                updateHoverMergedCells(void 0);
            }
        }
    }

    function onBodyDrop(e: DragEvent) {
        const trIndex = getClosestTrIndex(e.target as HTMLElement);
        if (trIndex < 0) return;
        onTrDrop(e, getAbsoluteRowIndex(trIndex));
    }

    function onCellMouseDown(e: MouseEvent) {
        const { row, col, rowIndex } = getCellEventData(e);
        oncellmousedown?.(e, row, col, { rowIndex });

        if (areaSelectionFeature.config.enabled) {
            areaSelectionFeature.onMD(e);
        }
    }

    function onTableWheel(e: WheelEvent) {
        if (smoothScroll) return;
        if (isColResizing) {
            e.stopPropagation();
            return;
        }
        const dom = tableContainerRef as HTMLElement;

        const { deltaY, deltaX, shiftKey } = e;

        if (virtual_on && deltaY && !shiftKey) {
            const { containerHeight, scrollTop, scrollHeight } = virtualScroll;
            const canScrollDown = scrollTop < scrollHeight - containerHeight - 1;
            const canScrollUp = scrollTop > 1;

            if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) {
                setIsWheeling(true);
                e.preventDefault();
            } else if (isWheeling()) {
                e.preventDefault();
            }

            if (isExperimentalScrollY) {
                rafUpdateVirtualScrollYForWheel(scrollTop + deltaY);
                updateCustomScrollbar();
            } else {
                dom.scrollTop += deltaY;
            }
        }
        if (virtualX_on) {
            const { containerWidth, scrollLeft, scrollWidth } = virtualScrollX;
            let distance = deltaX;
            if (shiftKey && deltaY) {
                distance = deltaY;
            }
            const canScrollRight = scrollLeft < scrollWidth - containerWidth - 1;
            const canScrollLeft = scrollLeft > 1;

            if ((distance > 0 && canScrollRight) || (distance < 0 && canScrollLeft)) {
                setIsWheeling(true);
                e.preventDefault();
            } else if (isWheeling()) {
                e.preventDefault();
            }
            dom.scrollLeft += distance;
        }
    }

    let scrollRAFScheduled = false;

    function onTableScroll(e: Event) {
        if (!e?.target || scrollRAFScheduled) return;
        scrollRAFScheduled = true;
        requestAnimationFrame(() => {
            scrollRAFScheduled = false;
            const { scrollTop, scrollLeft } = e.target as HTMLElement;
            const vScrollTop = virtualScroll.scrollTop;
            const vScrollLeft = virtualScrollX.scrollLeft;
            const isYScroll = isExperimentalScrollY ? false : scrollTop !== vScrollTop;
            const isXScroll = scrollLeft !== vScrollLeft;

            if (isYScroll) {
                updateVirtualScrollY(scrollTop);
            }

            if (isXScroll) {
                if (virtualX_on) {
                    updateVirtualScrollX(scrollLeft);
                } else {
                    virtualScrollX.scrollLeft = scrollLeft;
                }
                updateFixedShadow(virtualScrollX);
            }

            if (isYScroll) {
                const { startIndex, endIndex } = virtualScroll;
                ontablescroll?.(e, { startIndex, endIndex });
            }
            if (isXScroll) {
                onscrollx?.(e);
            }

            updateCustomScrollbar();
        });
    }

    function onTrMouseOver(e: MouseEvent) {
        const tr = getClosestTr(e.target as HTMLElement);
        if (!tr) return;
        const rowIndex = Number((tr as HTMLElement).dataset.rowI);
        const row = dataSourceCopy[rowIndex];
        if (currentHoverRow === row) return;
        currentHoverRow = row;
        const rk = (tr as HTMLElement).dataset.rowKey;
        if (showTrHoverClass) {
            currentHoverRowKey = rk || null;
        }
        if (rowHover) {
            updateHoverMergedCells(rk);
        }
    }

    // ==================== Public Methods ====================
    function setCurrentRow(rowKeyOrRow: string | undefined | DT, option: { silent?: boolean; deep?: boolean } = { silent: false, deep: false }) {
        const select = rowKeyOrRow !== void 0;
        const currentRowTemp = currentRow;
        if (!select) {
            currentRow = void 0;
            currentRowKey = void 0;
            updateActiveMergedCells(true);
        } else if (typeof rowKeyOrRow === 'string') {
            const findRowByKey = (data: DT[], key: string): DT | null => {
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (rowKeyGenFn(item) === key) return item;
                    if (option.deep && item.children?.length) {
                        const found = findRowByKey(item.children, key);
                        if (found) return found;
                    }
                }
                return null;
            };

            currentRowKey = rowKeyOrRow;
            updateActiveMergedCells(false, currentRowKey);
            const row = findRowByKey(dataSourceCopy || [], rowKeyOrRow);
            if (!row) {
                console.warn('setCurrentRow failed.rowKey:', rowKeyOrRow);
                return;
            }
            currentRow = row;
        } else {
            currentRow = rowKeyOrRow;
            currentRowKey = rowKeyGenFn(rowKeyOrRow);
            updateActiveMergedCells(false, currentRowKey);
        }
        if (!option.silent) {
            oncurrentchange?.(null, select ? currentRow : currentRowTemp, { select });
        }
    }

    function setSelectedCell(row?: DT, col?: StkTableColumn<DT>, option = { silent: false }) {
        if (!dataSourceCopy.length) return;
        const select = row !== void 0 && col !== void 0;
        currentSelectedCellKey = select ? cellKeyGen(row, col) : void 0;
        if (!option.silent) {
            oncellselected?.(null, { row, col, select });
        }
    }

    function scrollTo(top: number | null = 0, left: number | null = 0) {
        if (!tableContainerRef) return;
        if (top !== null) {
            if (isExperimentalScrollY) {
                updateVirtualScrollY(top);
                updateCustomScrollbar();
            } else {
                tableContainerRef.scrollTop = top;
            }
        }
        if (left !== null) tableContainerRef.scrollLeft = left;
    }

    function getTableData() {
        return dataSourceCopy;
    }

    async function onDataSourceChange() {
        await tick();
        initVirtualScrollY();
        updateCustomScrollbar();
    }

    function handleDealColumns() {
        dealColumns(columns as StkTableColumn<DT>[]);
    }

    // ==================== Effects ====================
    // watch columns (no immediate, same as vue watch)
    let isFirstColumnsEffect = true;
    $effect(() => {
        columns; // track
        if (isFirstColumnsEffect) {
            isFirstColumnsEffect = false;
            return;
        }
        untrack(() => {
            handleDealColumns();
            updateMaxRowSpan();
            tick().then(() => {
                initVirtualScrollX();
                updateFixedShadow();
                updateCustomScrollbar();
            });
        });
    });

    // watch virtual
    let isFirstVirtualEffect = true;
    $effect(() => {
        virtual; // track
        if (isFirstVirtualEffect) {
            isFirstVirtualEffect = false;
            return;
        }
        untrack(() => tick().then(() => initVirtualScrollY()));
    });

    // watch rowHeight
    let isFirstRowHeightEffect = true;
    $effect(() => {
        rowHeight; // track
        if (isFirstRowHeightEffect) {
            isFirstRowHeightEffect = false;
            return;
        }
        untrack(() => initVirtualScrollY());
    });

    // watch virtualX
    let isFirstVirtualXEffect = true;
    $effect(() => {
        virtualX; // track
        if (isFirstVirtualXEffect) {
            isFirstVirtualXEffect = false;
            return;
        }
        untrack(() => {
            handleDealColumns();
            tick().then(() => {
                initVirtualScrollX();
                updateFixedShadow();
            });
        });
    });

    // watch dataSource
    let isFirstDataSourceEffect = true;
    $effect(() => {
        dataSource; // track
        if (isFirstDataSourceEffect) {
            isFirstDataSourceEffect = false;
            return;
        }
        untrack(() => updateDataSource(dataSource as DT[]));
    });

    // watch fixedColShadow
    let isFirstFixedColShadowEffect = true;
    $effect(() => {
        fixedColShadow; // track
        if (isFirstFixedColShadowEffect) {
            isFirstFixedColShadowEffect = false;
            return;
        }
        untrack(() => updateFixedShadow());
    });

    // watch onlyDragScroll (same as vue useScrollRowByRow watch)
    let isFirstSRBREffect = true;
    $effect(() => {
        onlyDragScroll; // track
        if (isFirstSRBREffect) {
            isFirstSRBREffect = false;
            return;
        }
        untrack(() => {
            if (onlyDragScroll) {
                addSRBREventListener();
            } else {
                removeSRBREventListener();
            }
        });
    });

    // watch virtual_on (same as vue useKeyboardArrowScroll watch)
    let isFirstKbEffect = true;
    $effect(() => {
        virtual_on; // track
        if (isFirstKbEffect) {
            isFirstKbEffect = false;
            return;
        }
        untrack(() => {
            kbRemoveListeners();
            if (virtual_on) {
                kbAddEventListeners();
            }
        });
    });


    // ==================== Lifecycle ====================
    // init (equivalent to setup-time calls in Vue)
    handleDealColumns();
    initDataSource();
    updateMaxRowSpan();

    let autoResizeObserver: ResizeObserver | null = null;
    let autoResizeObserved = false;
    let sbResizeObserver: ResizeObserver | null = null;
    let autoResizeDebounce = 0;

    function autoResizeCallback() {
        if (autoResizeDebounce) window.clearTimeout(autoResizeDebounce);
        autoResizeDebounce = window.setTimeout(() => {
            if (autoResize) {
                initVirtualScroll();
                // 容器宽度变化后，需重新计算固定列状态
                updateFixedShadow();
                if (typeof autoResize === 'function') {
                    (autoResize as () => void)();
                }
            }
            autoResizeDebounce = 0;
        }, 200);
    }

    function initAutoResizeObserver() {
        if (autoResizeObserved) {
            removeAutoResizeObserver();
        }
        if (!tableContainerRef) return;
        if (window.ResizeObserver) {
            autoResizeObserver = new ResizeObserver(autoResizeCallback);
            autoResizeObserver.observe(tableContainerRef);
        } else {
            window.addEventListener('resize', autoResizeCallback);
        }
        autoResizeObserved = true;
    }

    function removeAutoResizeObserver() {
        if (!autoResizeObserved) return;
        if (autoResizeObserver) {
            autoResizeObserver.disconnect();
            autoResizeObserver = null;
        } else {
            window.removeEventListener('resize', autoResizeCallback);
        }
        autoResizeObserved = false;
    }

    // auto resize：仅初始 autoResize 为真时启用（对齐 Vue 版 setup 期 if (props.autoResize) useAutoResize 的非响应式判断），
    // 并与 Vue 版 useAutoResize 一致：virtual/virtualX 各自独立 watch 启停
    if (untrack(() => autoResize)) {
        let isFirstArVirtualEffect = true;
        $effect(() => {
            virtual; // track
            if (isFirstArVirtualEffect) {
                isFirstArVirtualEffect = false;
                return;
            }
            untrack(() => {
                if (virtual) initAutoResizeObserver();
                else removeAutoResizeObserver();
            });
        });
        let isFirstArVirtualXEffect = true;
        $effect(() => {
            virtualX; // track
            if (isFirstArVirtualXEffect) {
                isFirstArVirtualXEffect = false;
                return;
            }
            untrack(() => {
                if (virtualX) initAutoResizeObserver();
                else removeAutoResizeObserver();
            });
        });
    }

    function kbAddEventListeners() {
        window.addEventListener('keydown', handleKeydown);
        tableContainerRef?.addEventListener('mouseenter', kbHandleMouseEnter);
        tableContainerRef?.addEventListener('mouseleave', kbHandleMouseLeave);
        tableContainerRef?.addEventListener('mousedown', kbHandleMouseDown);
    }

    function kbRemoveListeners() {
        window.removeEventListener('keydown', handleKeydown);
        tableContainerRef?.removeEventListener('mouseenter', kbHandleMouseEnter);
        tableContainerRef?.removeEventListener('mouseleave', kbHandleMouseLeave);
        tableContainerRef?.removeEventListener('mousedown', kbHandleMouseDown);
    }

    onMount(() => {
        initVirtualScroll();
        updateFixedShadow();
        dealDefaultSorter();

        // wheel: 必须以非 passive 方式绑定，preventDefault 才能生效（对齐 Vue 模板 @wheel）
        tableContainerRef?.addEventListener('wheel', onTableWheel, { passive: false });

        // col resize listeners
        window.addEventListener('mousemove', onThResizeMouseMove);
        window.addEventListener('mouseup', onThResizeMouseUp);

        // keyboard
        kbAddEventListeners();

        // scroll row by row
        addSRBREventListener();

        // auto resize
        if (autoResize && (virtual || virtualX)) {
            initAutoResizeObserver();
        }

        // scrollbar
        if (typeof window !== 'undefined' && window.matchMedia) {
            sbIsMobileDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        }
        if (scrollbarOptions.enabled && !sbIsMobileDevice && tableContainerRef) {
            sbResizeObserver = new ResizeObserver(sbThrottledUpdate);
            sbResizeObserver.observe(tableContainerRef);
        }
        tick().then(() => updateCustomScrollbar());
    });

    onDestroy(() => {
        tableContainerRef?.removeEventListener('wheel', onTableWheel);
        window.removeEventListener('mousemove', onThResizeMouseMove);
        window.removeEventListener('mouseup', onThResizeMouseUp);
        kbRemoveListeners();
        removeSRBREventListener();
        sbOnDragEnd();
        sbResizeObserver?.disconnect();
        sbResizeObserver = null;
        removeAutoResizeObserver();
    });

    // ==================== Expose API ====================
    export {
        initVirtualScroll,
        initVirtualScrollX,
        initVirtualScrollY,
        setCurrentRow,
        setSelectedCell,
        setHighlightDimCell,
        setHighlightDimRow,
        sortCol,
        sortStates,
        getSortColumns,
        setSorter,
        resetSorter,
        scrollTo,
        getTableData,
        getRowIndex,
        getColumnIndex,
        setRowExpand,
        setAutoHeight,
        clearAllAutoHeight,
        setTreeExpand,
        getSelectedArea,
        setAreaSelection,
        clearSelectedArea,
        copySelectedArea,
        setFilter,
    };
</script>

<!-- Template -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
    bind:this={tableContainerRef}
    class="stk-table {classNameProp}"
    class:virtual
    class:virtual-x={virtualX}
    class:vt-on={virtual_on}
    class:light={theme === 'light'}
    class:dark={theme === 'dark'}
    class:headless
    class:is-col-resizing={isColResizing}
    class:col-resizable={colResizable}
    class:bordered={Boolean(bordered)}
    class:bordered-h={bordered === 'h'}
    class:bordered-v={bordered === 'v'}
    class:bordered-body-v={bordered === 'body-v'}
    class:bordered-body-h={bordered === 'body-h'}
    class:stripe
    class:cell-hover={cellHover}
    class:cell-active={cellActive}
    class:row-hover={rowHover}
    class:row-active={rowActiveProp.enabled}
    class:text-overflow={showOverflow}
    class:header-text-overflow={showHeaderOverflow}
    class:fixed-relative-mode={isRelativeMode}
    class:auto-row-height={autoRowHeight}
    class:scroll-row-by-row={isSRBRActive}
    class:scrollbar-on={scrollbarOptions.enabled}
    class:area-selection={areaSelectionFeature.config.enabled}
    class:is-area-selecting={areaSelectionFeature.isSelecting}
    class:exp-scroll-y={isExperimentalScrollY}
    tabindex={areaSelectionFeature.config.enabled ? 0 : undefined}
    style="{autoRowHeight ? '' : `--row-height:${virtualScroll.rowHeight}px;`}--header-row-height:{headerRowHeight}px;--footer-row-height:{footerRowHeight}px;{(highlightConfig as HighlightConfig).duration ? `--highlight-duration:${(highlightConfig as HighlightConfig).duration}s;` : ''}{highlightSteps ? `--highlight-timing-function:steps(${highlightSteps});` : ''}--sb-width:{scrollbarOptions.width}px;--sb-height:{scrollbarOptions.height}px;{styleProp}"
    onscroll={onTableScroll}
>
    {#if !isExperimentalScrollY && SRBRTotalHeight}
        <div class="row-by-row-table-height" style="height: {SRBRTotalHeight}px"></div>
    {/if}

    {#if colResizable}
        <div bind:this={colResizeIndicatorRef} class="column-resize-indicator"></div>
    {/if}

    <div class="stk-table-scroll-container">
        <table
            class="stk-table-main"
            class:fixed-mode={fixedMode}
            style="{width ? `width:${width};` : ''}{minWidth ? `min-width:${minWidth};` : ''}{maxWidth ? `max-width:${maxWidth};` : ''}"
            ondragover={onTrDragOver}
            ondragenter={onTrDragEnter}
            ondragend={onTrDragEnd}
            onclick={onRowClick}
            ondblclick={onRowDblclick}
            oncontextmenu={onRowMenu}
            onmouseover={onTrMouseOver}
        >
            <!-- table-layout:fixed 下浏览器仅依据首行/colgroup 决定列宽，
                 多级表头时子列宽度位于非首行会被忽略。
                 故固定模式下通过 colgroup 显式声明每个叶子列宽度，保证子列 width 生效。 -->
            {#if fixedMode && !virtualX_on}
                <colgroup>
                    {#each tableHeaderLast as col (colKeyGen(col))}
                        <col style={getColGroupColStyle(col)} />
                    {/each}
                </colgroup>
            {/if}
            {#if !headless}
                <thead>
                    {#each (virtualX_on ? virtualX_tableHeaders : tableHeaders) as row, rowIndex (rowIndex)}
                        <tr oncontextmenu={onHeaderMenu}>
                            {#if virtualX_on}
                                <th class="vt-x-left" style="min-width:{theadVirtualX.offsetLeft}px;width:{theadVirtualX.offsetLeft}px"></th>
                            {/if}
                            {#each row as col, colIndex (colKeyGen(col))}
                                {@const thProps = getTHProps(col)}
                                <th
                                    data-col-key={thProps['data-col-key']}
                                    draggable={thProps.draggable}
                                    rowspan={thProps.rowspan}
                                    colspan={thProps.colspan}
                                    style={thProps.style}
                                    title={thProps.title}
                                    class={thProps.class}
                                    onclick={(e) => onHeaderCellClick(e, col)}
                                    ondragstart={onThDragStart}
                                    ondrop={onThDrop}
                                    ondragover={onThDragOver}
                                >
                                    {#if colResizeOn(col) && colIndex > 0}
                                        <div class="table-header-resizer left" onmousedown={(e) => onThResizeMouseDown(e, col, true)}></div>
                                    {/if}
                                    <div class="table-header-cell-wrapper" style={col.__R_SP__ ? `--row-span:${col.__R_SP__}` : undefined}>
                                        {#if col.customHeaderCell}
                                            <svelte:component this={col.customHeaderCell} col={col} {colIndex} {rowIndex} />
                                        {:else if tableHeader}
                                            {@render tableHeader({ col })}
                                        {:else}
                                            <span class="table-header-title">{col.title}</span>
                                        {/if}
                                        {#if col.sorter}
                                            <SortIcon class="table-header-sorter" />
                                        {/if}
                                    </div>
                                    {#if colResizeOn(col)}
                                        <div class="table-header-resizer right" onmousedown={(e) => onThResizeMouseDown(e, col)}></div>
                                    {/if}
                                </th>
                            {/each}
                            {#if virtualX_on}
                                <th class="vt-x-right" style="min-width:{virtualX_offsetRight}px;width:{virtualX_offsetRight}px"></th>
                            {/if}
                        </tr>
                    {/each}
                </thead>
            {/if}

            {#if footerData && footerData.length > 0}
                <svelte:element this={footerTagName} class="stk-footer" style={isFooterTop ? `top:${tableHeaderHeight}px` : ''}>
                    {#each footerData as footRow, footRowIndex (footRowIndex)}
                        <tr>
                            {#if virtualX_on}
                                <td class="vt-x-left" style="min-width:{theadVirtualX.offsetLeft}px;width:{theadVirtualX.offsetLeft}px"></td>
                            {/if}
                            {#each virtualX_columnPart as col, _colIdx (col.__VT_C_SP__ ? `spacer-${_colIdx}` : colKeyGen(col))}
                                {#if col.__VT_C_SP__}
                                    <td class="vt-x-spacer" colspan={col.__VT_C_SP__}></td>
                                {:else}
                                    {@const tfProps = getTFProps(col)}
                                    <td data-col-key={tfProps['data-col-key']} style={tfProps.style} class={tfProps.class}>
                                        {#if col.customFooterCell}
                                            <svelte:component this={col.customFooterCell} class="table-cell-wrapper" tabindex="-1" col={col} row={footRow} rowIndex={footRowIndex} cellValue={footRow[col.dataIndex]} />
                                        {/if}
                                        <div class="table-cell-wrapper" tabindex="-1" title={footRow[col.dataIndex] || ''}>
                                            {#if footRow[col.dataIndex] != null}
                                                <span>{footRow[col.dataIndex]}</span>
                                            {/if}
                                        </div>
                                    </td>
                                {/if}
                            {/each}
                            {#if virtualX_on}
                                <td class="vt-x-right" style="min-width:{virtualX_offsetRight}px;width:{virtualX_offsetRight}px"></td>
                            {/if}
                        </tr>
                    {/each}
                </svelte:element>
            {/if}

            <tbody
                class="stk-tbody-main"
                style={isExperimentalScrollY ? `transform:translateY(${virtualScroll.translateY}px)` : ''}
                onclick={onCellClick}
                onmousedown={onCellMouseDown}
                onmouseover={onCellMouseOver}
                onmouseout={onTbodyMouseOut}
                ondrop={onBodyDrop}
            >
                {#if !isExperimentalScrollY && virtual_on && !isSRBRActive}
                    <tr style="height:{virtualScroll.offsetTop}px" class="padding-top-tr">
                        {#if fixedMode && headless}
                            {#if virtualX_on}
                                <td class="vt-x-left" style="min-width:{theadVirtualX.offsetLeft}px;width:{theadVirtualX.offsetLeft}px"></td>
                            {/if}
                            {#each virtualX_columnPart as col, _colIdx (col.__VT_C_SP__ ? `spacer-${_colIdx}` : colKeyGen(col))}
                                {#if col.__VT_C_SP__}
                                    <td class="vt-x-spacer" colspan={col.__VT_C_SP__}></td>
                                {:else}
                                    <td style={cellStyleMap.td.get(colKeyGen(col))}></td>
                                {/if}
                            {/each}
                            {#if virtualX_on}
                                <td class="vt-x-right" style="min-width:{virtualX_offsetRight}px;width:{virtualX_offsetRight}px"></td>
                            {/if}
                        {/if}
                    </tr>
                {/if}
                {#each virtual_dataSourcePart as row, rowIndex (rowKeyGenFn(row))}
                    {@const trProps = getTRProps(row, rowIndex)}
                    <tr
                        bind:this={trRef[rowIndex]}
                        id={trProps.id}
                        data-row-key={trProps['data-row-key']}
                        data-row-i={trProps['data-row-i']}
                        class={trProps.class}
                        style={trProps.style}
                    >
                        {#if row && row.__EXP_R__}
                            <td colspan={expandRowColspan}>
                                <div class="table-cell-wrapper" tabindex="-1">
                                    {#if expand}
                                        {@render expand({ row: row.__EXP_R__, col: row.__EXP_C__ })}
                                    {:else}
                                        {(row.__EXP_R__ && row.__EXP_C__ && row.__EXP_R__[row.__EXP_C__.dataIndex]) || ''}
                                    {/if}
                                </div>
                            </td>
                        {:else}
                            {#if virtualX_on}
                                <td class="vt-x-left"></td>
                            {/if}
                            {#each virtualX_columnPart as col, _colIdx (col.__VT_C_SP__ ? `spacer-${_colIdx}` : colKeyGen(col))}
                                {#if col.__VT_C_SP__}
                                    <td class="vt-x-spacer" colspan={col.__VT_C_SP__}></td>
                                {:else if !shouldHideCell(row, col)}
                                    {@const tdProps = getTDProps(row, col, rowIndex, col.__LF_S__ ?? 0)}
                                    <td
                                        data-col-key={tdProps['data-col-key']}
                                        style={tdProps.style}
                                        class={tdProps.class}
                                        colspan={tdProps.colspan}
                                        rowspan={tdProps.rowspan}
                                    >
                                        {#if col.customCell}
                                            <svelte:component
                                                this={col.customCell}
                                                class="table-cell-wrapper"
                                                tabindex="-1"
                                                col={col}
                                                {row}
                                                rowIndex={getAbsoluteRowIndex(rowIndex)}
                                                colIndex={col.__LF_S__ ?? 0}
                                                cellValue={row && row[col.dataIndex]}
                                                expanded={row && row.__EXP__}
                                                treeExpanded={row && row.__T_EXP__}
                                                onTriangleClick={(e) => triangleClick(e, row, col)}
                                                onDragStart={(e) => onTrDragStart(e, getAbsoluteRowIndex(rowIndex))}
                                            />
                                        {:else if !col.type}
                                            <div class="table-cell-wrapper" tabindex="-1" title={row[col.dataIndex] || ''}>
                                                {(row && row[col.dataIndex]) != null ? row[col.dataIndex] : getEmptyCellText(col, row)}
                                            </div>
                                        {:else if col.type === 'seq'}
                                            <div class="table-cell-wrapper" tabindex="-1">
                                                {((seqConfig as SeqConfig).startIndex || 0) + getAbsoluteRowIndex(rowIndex) + 1}
                                            </div>
                                        {:else if col.type === 'tree-node'}
                                            <TreeNodeCell
                                                class="table-cell-wrapper"
                                                tabindex={-1}
                                                col={col}
                                                {row}
                                            />
                                        {:else}
                                            <div class="table-cell-wrapper" tabindex="-1" title={row[col.dataIndex] || ''}>
                                                {#if col.type === 'dragRow'}
                                                    <DragHandle ondragstart={(e) => onTrDragStart(e, getAbsoluteRowIndex(rowIndex))} />
                                                {:else if col.type === 'expand'}
                                                    <TriangleIcon />
                                                {/if}
                                                {#if row[col.dataIndex] != null}<span>{row[col.dataIndex]}</span>{/if}
                                            </div>
                                        {/if}
                                    </td>
                                {/if}
                            {/each}
                            {#if virtualX_on}
                                <td class="vt-x-right"></td>
                            {/if}
                        {/if}
                    </tr>
                {/each}
                {#if !isExperimentalScrollY}
                    {#if virtual_on && !isSRBRActive}
                        <tr style="height:{virtual_offsetBottom}px"></tr>
                    {/if}
                    {#if SRBRBottomHeight}
                        <tr style="height:{SRBRBottomHeight}px"></tr>
                    {/if}
                {/if}
            </tbody>
        </table>
        {#if scrollbarOptions.enabled && showScrollbar.y}
            <div
                class="stk-sb-thumb vertical"
                style="height:{scrollbarState.h}px;transform:translateY({scrollbarState.t}px)"
                onmousedown={onVerticalScrollbarMouseDown}
                ontouchstart={onVerticalScrollbarMouseDown}
            ></div>
        {/if}
    </div>
    {#if (!dataSourceCopy || !dataSourceCopy.length) && showNoData}
        <div class="stk-table-no-data" class:no-data-full={noDataFull}>
            {#if empty}
                {@render empty()}
            {:else}
                暂无数据
            {/if}
        </div>
    {/if}
    {#if customBottom}
        {@render customBottom()}
    {/if}
    {#if scrollbarOptions.enabled && showScrollbar.x}
        <div
            class="stk-sb-thumb horizontal"
            style="width:{scrollbarState.w}px;transform:translateX({scrollbarState.l}px)"
            onmousedown={onHorizontalScrollbarMouseDown}
            ontouchstart={onHorizontalScrollbarMouseDown}
        ></div>
    {/if}
</div>

<style lang="less">
    @import './style.less';
</style>
