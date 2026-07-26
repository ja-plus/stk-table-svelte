<script lang="ts">
    import type { AreaSelectionRange, StkTableColumn } from '../../../src/StkTable/index';
    import ContextMenu from 'ja-contextmenu';
    import type { MenuOption } from 'ja-contextmenu/lib/types/MenuOption';
    import { SvelteMap } from 'svelte/reactivity';
    import StkTable from '../../StkTable.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    import 'ja-contextmenu/styles/dark.css';

    // vue 版通过 vitepress useData().isDark 获取暗色主题，svelte 版监听 html class
    let isDark = $state(false);
    $effect(() => {
        const html = document.documentElement;
        const update = () => (isDark = html.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    });

    const { t } = useI18n();

    type Row = { id: number; name: string; age: number; city: string; score: number };

    const columns: StkTableColumn<Row>[] = [
        { title: 'ID', dataIndex: 'id', width: 60, mergeCells },
        { title: '', dataIndex: 'name', width: 120, mergeCells },
        { title: '', dataIndex: 'age', width: 100, mergeCells },
        { title: '', dataIndex: 'city', width: 120, mergeCells },
        { title: '', dataIndex: 'score', width: 100, mergeCells },
    ];
    // set title via i18n
    columns[1].title = t('name');
    columns[2].title = t('age');
    columns[3].title = t('city');
    columns[4].title = t('score');

    let dataSource = $state<Row[]>(
        Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            name: `User${i + 1}`,
            age: 20 + (i % 30),
            city: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'][i % 4],
            score: 60 + (i % 40),
        })),
    );

    /**
     * Merge state storage
     * key: `${rowId}__${colIndex}`
     * value: { rowspan, colspan }
     */
    const mergeMap = new SvelteMap<string, { rowspan: number; colspan: number }>();

    function getMergeKey(rowId: number, colIndex: number) {
        return `${rowId}__${colIndex}`;
    }

    /** mergeCells callback for each column */
    function mergeCells({ row, col }: { row: Row; col: StkTableColumn<Row> }) {
        const colIndex = columns.findIndex(c => c.dataIndex === col.dataIndex);
        const info = mergeMap.get(getMergeKey(row.id, colIndex));
        if (info) return info;
    }

    // ============ Area Selection ============
    let selectionRanges = $state<AreaSelectionRange[]>([]);

    function onSelectionChange(ranges: AreaSelectionRange[]) {
        selectionRanges = ranges;
    }

    /** Normalize range to min/max */
    function normalizeRange(range: AreaSelectionRange) {
        const { begin, end } = range.index;
        return {
            minRow: Math.min(begin.row, end.row),
            maxRow: Math.max(begin.row, end.row),
            minCol: Math.min(begin.col, end.col),
            maxCol: Math.max(begin.col, end.col),
        };
    }

    // ============ Merge / Split ============
    function mergeSelectedCells() {
        if (!selectionRanges.length) return;
        const range = selectionRanges[selectionRanges.length - 1];
        const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);

        const rowspan = maxRow - minRow + 1;
        const colspan = maxCol - minCol + 1;
        if (rowspan <= 1 && colspan <= 1) return;

        const startRow = dataSource[minRow];
        if (!startRow) return;

        // Remove conflicting merge info within the range
        for (let r = minRow; r <= maxRow; r++) {
            const row = dataSource[r];
            if (!row) continue;
            for (let c = minCol; c <= maxCol; c++) {
                mergeMap.delete(getMergeKey(row.id, c));
            }
        }

        // Set merge info on the top-left cell
        mergeMap.set(getMergeKey(startRow.id, minCol), { rowspan, colspan });

        // Force table re-render
        dataSource = dataSource.slice();
    }

    function splitSelectedCells() {
        if (!selectionRanges.length) return;

        for (const range of selectionRanges) {
            const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
            for (let r = minRow; r <= maxRow; r++) {
                const row = dataSource[r];
                if (!row) continue;
                for (let c = minCol; c <= maxCol; c++) {
                    mergeMap.delete(getMergeKey(row.id, c));
                }
            }
        }

        // Force table re-render
        dataSource = dataSource.slice();
    }

    // ============ Context Menu (ja-contextmenu) ============
    const canMerge = $derived.by(() => {
        if (!selectionRanges.length) return false;
        const range = selectionRanges[selectionRanges.length - 1];
        const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
        return maxRow - minRow + 1 > 1 || maxCol - minCol + 1 > 1;
    });

    const canSplit = $derived.by(() => {
        if (!selectionRanges.length) return false;
        for (const range of selectionRanges) {
            const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
            for (let r = minRow; r <= maxRow; r++) {
                const row = dataSource[r];
                if (!row) continue;
                for (let c = minCol; c <= maxCol; c++) {
                    if (mergeMap.has(getMergeKey(row.id, c))) return true;
                }
            }
        }
        return false;
    });

    const contextMenu = new ContextMenu({
        theme: () => (isDark ? 'dark' : ('' as any)),
    });
    const menuOption: MenuOption<any> = {
        items: [
            {
                label: () => t('mergeCells'),
                disabled: () => !canMerge,
                onclick: () => {
                    mergeSelectedCells();
                },
            },
            {
                label: () => t('splitCells'),
                disabled: () => !canSplit,
                onclick: () => {
                    splitSelectedCells();
                },
            },
        ],
    };
    const menu = contextMenu.create(menuOption);

    function onRowMenu(e: MouseEvent) {
        menu.show(e);
    }

    const mergedCount = $derived(mergeMap.size);
</script>

<div class="realtime-merge-cells-demo">
    <p class="demo-tip">{t('realtimeMergeTip')}</p>
    <StkTable
        style="height: 400px"
        rowKey="id"
        virtual
        {columns}
        {dataSource}
        areaSelection={{ enabled: true }}
        onareaselectionchange={onSelectionChange}
        onrowmenu={onRowMenu}
    />
    <div class="demo-status">
        <span>{t('mergedRegions')}: {mergedCount}</span>
    </div>
</div>

<style>
.demo-tip {
    margin: 0 0 8px;
    font-size: 13px;
    color: var(--vp-c-text-2, #888);
}
.demo-status {
    margin-top: 8px;
    font-size: 13px;
    color: var(--vp-c-text-2, #888);
}
</style>
