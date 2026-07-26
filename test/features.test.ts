import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import StkTable from '../src/StkTable/StkTable.svelte';

async function settle() {
    await tick();
    await tick();
    await new Promise(r => setTimeout(r, 0));
    await tick();
}

function dataRows(container: HTMLElement) {
    return Array.from(container.querySelectorAll('.stk-tbody-main tr')).filter(
        tr => !tr.classList.contains('padding-top-tr') && !tr.classList.contains('padding-bottom-tr'),
    ) as HTMLTableRowElement[];
}

describe('merge cells', () => {
    const cols = [
        {
            title: 'Group',
            dataIndex: 'group',
            width: 120,
            mergeCells: ({ rowIndex }: any) => (rowIndex % 2 === 0 ? { rowspan: 2 } : { rowspan: 0 }),
        },
        { title: 'Name', dataIndex: 'name', width: 160 },
        { title: 'Value', dataIndex: 'value', width: 120 },
    ];
    const data = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        group: 'G' + Math.floor(i / 2),
        name: 'item ' + i,
        value: i,
    }));

    it('anchor cells get rowspan, covered cells are hidden', async () => {
        const { container } = render(StkTable, { props: { columns: cols, dataSource: data, rowKey: 'id' } });
        await settle();

        const rows = dataRows(container);
        expect(rows.length).toBe(6);

        // anchor rows (0,2,4) have 3 tds; covered rows (1,3,5) have 2 tds (group hidden)
        expect(rows[0].querySelectorAll('td').length).toBe(3);
        expect(rows[1].querySelectorAll('td').length).toBe(2);
        expect(rows[2].querySelectorAll('td').length).toBe(3);
        expect(rows[3].querySelectorAll('td').length).toBe(2);

        // 3 anchor cells with rowspan=2
        const rowspans = Array.from(container.querySelectorAll('.stk-tbody-main td'))
            .map(td => (td as HTMLTableCellElement).rowSpan)
            .filter(r => r > 1);
        expect(rowspans).toEqual([2, 2, 2]);

        // anchor text present, first covered group cell not duplicated
        expect(rows[0].querySelector('td')?.textContent).toContain('G0');
        expect(rows[1].textContent).not.toContain('G0');
        expect(rows[1].textContent).toContain('item 1');
    });

    it('colspan merge hides right neighbour cells', async () => {
        const colspanCols = [
            {
                title: 'A',
                dataIndex: 'a',
                width: 100,
                mergeCells: ({ rowIndex }: any) => (rowIndex === 0 ? { colspan: 2 } : undefined),
            },
            { title: 'B', dataIndex: 'b', width: 100 },
            { title: 'C', dataIndex: 'c', width: 100 },
        ];
        const d = [
            { id: 0, a: 'a0', b: 'b0', c: 'c0' },
            { id: 1, a: 'a1', b: 'b1', c: 'c1' },
        ];
        const { container } = render(StkTable, { props: { columns: colspanCols, dataSource: d, rowKey: 'id' } });
        await settle();

        const rows = dataRows(container);
        // row0: A(colspan2) + C = 2 tds; row1: A + B + C = 3 tds
        expect(rows[0].querySelectorAll('td').length).toBe(2);
        expect(rows[1].querySelectorAll('td').length).toBe(3);
        const anchor = rows[0].querySelector('td') as HTMLTableCellElement;
        expect(anchor.colSpan).toBe(2);
        // B0 is hidden (covered by colspan)
        expect(rows[0].textContent).not.toContain('b0');
        expect(rows[0].textContent).toContain('c0');
    });
});

describe('tree', () => {
    const cols = [
        { type: 'tree-node' as const, title: 'Name', dataIndex: 'name', width: 220 },
        { title: 'Value', dataIndex: 'value', width: 120 },
    ];
    const data = [
        {
            id: 'a',
            name: 'Node A',
            value: 10,
            children: [
                { id: 'a1', name: 'Node A-1', value: 4 },
                { id: 'a2', name: 'Node A-2', value: 6 },
            ],
        },
        { id: 'b', name: 'Node B', value: 20 },
    ];

    it('renders top-level rows collapsed, expands on triangle click', async () => {
        const { container } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', treeConfig: { childrenKey: 'children' } },
        });
        await settle();

        expect(dataRows(container).length).toBe(2);
        expect(container.querySelector('.stk-fold-icon')).toBeTruthy();

        const fold = container.querySelector('.stk-fold-icon') as HTMLElement;
        fold.click();
        await settle();

        const rows = dataRows(container);
        expect(rows.length).toBe(4);
        expect(rows[1].textContent).toContain('Node A-1');
        expect(rows[2].textContent).toContain('Node A-2');

        // collapse again
        (container.querySelector('.stk-fold-icon') as HTMLElement).click();
        await settle();
        expect(dataRows(container).length).toBe(2);
    });
});

describe('expand row', () => {
    const cols = [
        { type: 'expand' as const, dataIndex: '', width: 50 },
        { title: 'Name', dataIndex: 'name', width: 200 },
    ];
    const data = Array.from({ length: 3 }, (_, i) => ({ id: i, name: 'Row ' + i, age: 20 + i }));

    it('adds an expanded row when triangle clicked', async () => {
        const { container } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', expandConfig: {} },
        });
        await settle();

        expect(dataRows(container).length).toBe(3);
        const fold = container.querySelector('.stk-fold-icon') as HTMLElement;
        expect(fold).toBeTruthy();

        fold.click();
        await settle();

        // one expanded row inserted
        expect(dataRows(container).length).toBe(4);
        expect(container.querySelector('tr.expanded-row')).toBeTruthy();
    });
});

describe('footer', () => {
    const cols = [
        { title: 'Name', dataIndex: 'name', width: 160 },
        { title: 'Score', dataIndex: 'score', width: 120 },
    ];
    const data = Array.from({ length: 4 }, (_, i) => ({ id: i, name: 'S' + i, score: (i + 1) * 10 }));

    it('renders tfoot with footer data', async () => {
        const { container } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', footerData: [{ name: 'Total', score: 100 }] },
        });
        await settle();

        const tfoot = container.querySelector('tfoot');
        expect(tfoot).toBeTruthy();
        expect(tfoot!.textContent).toContain('Total');
        expect(tfoot!.textContent).toContain('100');
    });
});

describe('sort', () => {
    const cols = [
        { title: 'Name', dataIndex: 'name', width: 150, sorter: true },
        { title: 'Age', dataIndex: 'age', width: 100, sorter: true },
    ];
    const data = [
        { id: 0, name: 'c', age: 3 },
        { id: 1, name: 'a', age: 1 },
        { id: 2, name: 'b', age: 2 },
    ];

    it('clicking header sorts desc then asc', async () => {
        const { container } = render(StkTable, { props: { columns: cols, dataSource: data, rowKey: 'id' } });
        await settle();

        const ageTh = container.querySelector('thead th[data-col-key="age"]') as HTMLElement;
        expect(ageTh).toBeTruthy();

        // first click -> desc (SORT_SWITCH_ORDER [null, desc, asc])
        ageTh.click();
        await settle();
        let first = dataRows(container)[0];
        expect(first.textContent).toContain('3');
        expect(ageTh.className).toContain('sorter-desc');

        // second click -> asc
        ageTh.click();
        await settle();
        first = dataRows(container)[0];
        expect(first.textContent).toContain('1');
        expect(ageTh.className).toContain('sorter-asc');
    });
});
