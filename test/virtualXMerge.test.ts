import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, test, vi, beforeEach } from 'vitest';
// 从库入口导入，验证完整导出链（含 .svelte.ts 模块解析）
import * as lib from '../src/StkTable/index';

const StkTable = lib.StkTable;

// Mock requestAnimationFrame
beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb(0);
        return 0;
    });
});

function nextFrame() {
    return new Promise(resolve => setTimeout(resolve, 50));
}

/** 模拟横向滚动（jsdom 下设置 scrollLeft 后手动派发 scroll 事件） */
async function scrollXTo(container: HTMLElement, left: number) {
    container.scrollLeft = left;
    fireEvent.scroll(container);
    await nextFrame();
    await tick();
}

/** 获取表格根节点（滚动容器） */
function getRoot(container: HTMLElement) {
    return container.firstElementChild as HTMLElement;
}

/** 获取指定行的可见 td 的 data-col-key 列表 */
function getRowTdColKeys(container: HTMLElement, rowKey: string) {
    return Array.from(container.querySelectorAll(`tbody.stk-tbody-main > tr[data-row-key="${rowKey}"] > td`))
        .map(td => td.getAttribute('data-col-key'))
        .filter(Boolean);
}

/** 行的总 colspan 数（含合并单元格） */
function getRowSpanSum(container: HTMLElement, selector: string) {
    return Array.from(container.querySelectorAll(selector)).reduce(
        (sum, cell) => sum + (Number(cell.getAttribute('colspan')) || 1),
        0,
    );
}

describe('virtual-x with mergeCells colspan', () => {
    function renderTable() {
        const columns = new Array(12).fill(0).map((_, i) => ({ title: `Col ${i}`, dataIndex: `c${i}`, width: 100 }));
        // c3 列合并 3 列（覆盖 c3 c4 c5）
        (columns[3] as any).mergeCells = ({ row }: any) => (row.colspan ? { colspan: row.colspan } : void 0);
        const dataSource = new Array(6).fill(0).map((_, i) => ({ id: i, colspan: 3, c3: `merged-${i}` }));
        return render(StkTable, { props: { rowKey: 'id', virtualX: true, columns, dataSource } });
    }

    test('合并单元格锚点列滚出可视区左侧时，依然渲染完整合并单元格', async () => {
        const { container } = renderTable();
        // 容器宽度 200(DEFAULT_TABLE_WIDTH)。scrollLeft=450 时原始可视列为 [4,7)，
        // c4 c5 被 c3(colspan=3) 覆盖，需将可视范围左扩到锚点列 c3
        await scrollXTo(getRoot(container), 450);

        const colKeys = getRowTdColKeys(container, '0');
        expect(colKeys).toContain('c3');
        expect(colKeys).not.toContain('c4');
        expect(colKeys).not.toContain('c5');

        const c3 = container.querySelector('tbody.stk-tbody-main > tr[data-row-key="0"] > td[data-col-key="c3"]');
        expect(c3?.getAttribute('colspan')).toBe('3');

        // vt-x-left 宽度应为修正后起始列(c3)之前的宽度和 = 300
        expect((container.querySelector('thead th.vt-x-left') as HTMLElement)?.style.width).toBe('300px');
        // 修正后 endIndex=7，右侧占位宽度 = c7..c11 = 500
        expect((container.querySelector('thead th.vt-x-right') as HTMLElement)?.style.width).toBe('500px');
    });

    test('合并单元格超出可视区右边界时，扩展可视范围保证完整渲染', async () => {
        const { container } = renderTable();
        // scrollLeft=250 时原始可视列为 [2,5)，c3 的合并区域覆盖到 c5，需右扩到 6
        await scrollXTo(getRoot(container), 250);

        const colKeys = getRowTdColKeys(container, '0');
        expect(colKeys).toEqual(['c2', 'c3']);

        // 右侧占位宽度 = c6..c11 = 600
        expect((container.querySelector('thead th.vt-x-right') as HTMLElement)?.style.width).toBe('600px');
    });

    test('滚回左侧后可视范围恢复正常', async () => {
        const { container } = renderTable();
        await scrollXTo(getRoot(container), 450);
        await scrollXTo(getRoot(container), 250);
        await scrollXTo(getRoot(container), 0);

        const colKeys = getRowTdColKeys(container, '0');
        expect(colKeys).not.toContain('c3');
        expect((container.querySelector('thead th.vt-x-left') as HTMLElement)?.style.width).toBe('0px');
    });
});

describe('virtual + virtual-x with mergeCells colspan', () => {
    test('纵向虚拟滚动下横向合并单元格依然正确', async () => {
        const columns = new Array(12).fill(0).map((_, i) => ({ title: `Col ${i}`, dataIndex: `c${i}`, width: 100 }));
        (columns[3] as any).mergeCells = ({ row }: any) => (row.colspan ? { colspan: row.colspan } : void 0);
        const dataSource = new Array(200).fill(0).map((_, i) => ({ id: i, colspan: 3, c3: `merged-${i}` }));

        const { container } = render(StkTable, { props: { rowKey: 'id', virtual: true, virtualX: true, columns, dataSource } });
        await scrollXTo(getRoot(container), 450);

        const colKeys = getRowTdColKeys(container, '0');
        expect(colKeys).toContain('c3');
        expect(colKeys).not.toContain('c4');
        expect(colKeys).not.toContain('c5');

        const c3 = container.querySelector('tbody.stk-tbody-main > tr[data-row-key="0"] > td[data-col-key="c3"]');
        expect(c3?.getAttribute('colspan')).toBe('3');
    });
});

describe('virtual-x multi-level header with mergeCells colspan', () => {
    test('多级表头下合并单元格与 spacer 对齐', async () => {
        const leafCols: lib.StkTableColumn<any>[] = new Array(12).fill(0).map((_, i) => ({ title: `Col ${i}`, dataIndex: `c${i}`, width: 100 }));
        (leafCols[3] as any).mergeCells = ({ row }: any) => (row.colspan ? { colspan: row.colspan } : void 0);
        const columns: lib.StkTableColumn<any>[] = [
            { title: 'G1', dataIndex: 'g1', children: leafCols.slice(0, 3) },
            { title: 'G2', dataIndex: 'g2', children: leafCols.slice(3, 6) },
            { title: 'G3', dataIndex: 'g3', children: leafCols.slice(6, 9) },
            { title: 'G4', dataIndex: 'g4', children: leafCols.slice(9, 12) },
        ];
        const dataSource = new Array(6).fill(0).map((_, i) => ({ id: i, colspan: 3, c3: `merged-${i}` }));

        const { container } = render(StkTable, { props: { rowKey: 'id', virtualX: true, columns, dataSource } });
        await scrollXTo(getRoot(container), 450);

        const colKeys = getRowTdColKeys(container, '0');
        expect(colKeys).toContain('c3');
        expect(colKeys).not.toContain('c4');
        expect(colKeys).not.toContain('c5');

        // thead 各行与 tbody 行的总列数（colspan 之和）必须一致
        const tbodySpanSum = getRowSpanSum(container, 'tbody.stk-tbody-main > tr[data-row-key="0"] > td');
        const theadRow0SpanSum = getRowSpanSum(container, 'thead > tr:nth-child(1) > th');
        const theadRow1SpanSum = getRowSpanSum(container, 'thead > tr:nth-child(2) > th');
        expect(tbodySpanSum).toBe(theadRow0SpanSum);
        expect(tbodySpanSum).toBe(theadRow1SpanSum);
    });
});

describe('virtual-x with mergeCells rowspan', () => {
    function renderTable() {
        const columns = new Array(12).fill(0).map((_, i) => ({ title: `Col ${i}`, dataIndex: `c${i}`, width: 100 }));
        // c3 列行合并 3 行
        (columns[3] as any).mergeCells = ({ row }: any) => (row.rowspan ? { rowspan: row.rowspan } : void 0);
        const dataSource = new Array(6).fill(0).map((_, i) => ({ id: i, rowspan: i === 0 ? 3 : void 0, c3: `merged-${i}` }));
        return render(StkTable, { props: { rowKey: 'id', virtualX: true, columns, dataSource } });
    }

    test('锚点列可见时，行合并单元格正常渲染', async () => {
        const { container } = renderTable();
        // scrollLeft=250 可视列 [2,5) 包含锚点列 c3
        await scrollXTo(getRoot(container), 250);

        const anchor = container.querySelector('tbody.stk-tbody-main > tr[data-row-key="0"] > td[data-col-key="c3"]');
        expect(anchor?.getAttribute('rowspan')).toBe('3');
        // 被覆盖行不渲染 c3 单元格
        expect(container.querySelector('tbody.stk-tbody-main > tr[data-row-key="1"] > td[data-col-key="c3"]')).toBeNull();
        expect(container.querySelector('tbody.stk-tbody-main > tr[data-row-key="2"] > td[data-col-key="c3"]')).toBeNull();
    });

    test('锚点列滚出可视区时，行合并不产生残留单元格', async () => {
        const { container } = renderTable();
        // scrollLeft=450 可视列不包含 c3
        await scrollXTo(getRoot(container), 450);

        expect(container.querySelector('tbody.stk-tbody-main td[data-col-key="c3"]')).toBeNull();
    });
});
