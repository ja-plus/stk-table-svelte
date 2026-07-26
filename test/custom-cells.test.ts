import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
// 从库入口导入，验证完整导出链（含 .svelte.ts 模块解析）
import * as lib from '../src/StkTable/index';

const StkTable = lib.StkTable;

describe('library entry exports', () => {
    it('exports all custom-cell factories and helpers', () => {
        expect(StkTable).toBeTruthy();
        expect(lib.createChangeCell).toBeTypeOf('function');
        expect(lib.createNumberCell).toBeTypeOf('function');
        expect(lib.createCheckboxCell).toBeTypeOf('function');
        expect(lib.createEditableCell).toBeTypeOf('function');
        expect(lib.createFilterCell).toBeTypeOf('function');
        expect(lib.formatNumber).toBeTypeOf('function');
    });
});

describe('formatNumber', () => {
    it('formats decimals / sign / thousands / placeholder', () => {
        expect(lib.formatNumber(5, { decimals: 2, showSign: true })).toBe('+5.00');
        expect(lib.formatNumber(-3, { decimals: 2, showSign: true })).toBe('-3.00');
        expect(lib.formatNumber(1234567)).toBe('1,234,567');
        expect(lib.formatNumber(null)).toBe('--');
        expect(lib.formatNumber('abc')).toBe('--');
        expect(lib.formatNumber(0.25, { percent: true })).toBe('25%');
    });
});

describe('ChangeCell', () => {
    it('renders rise/fall/flat with color class and arrow', () => {
        const { ChangeCell } = lib.createChangeCell({ decimals: 2, showSign: true, arrow: true });
        const columns = [{ title: 'Chg', dataIndex: 'chg', customCell: ChangeCell }];
        const dataSource = [
            { id: 1, chg: 5 },
            { id: 2, chg: -3 },
            { id: 3, chg: 0 },
        ];
        const { container } = render(StkTable, { props: { columns, dataSource, rowKey: 'id' } });
        const cells = Array.from(container.querySelectorAll('.stk-change-cell'));
        expect(cells.length).toBe(3);
        // 涨：红（A股默认）+ ▲
        expect(cells[0].className).toContain('stk-change-cell--red');
        expect(cells[0].textContent).toContain('▲');
        expect(cells[0].textContent).toContain('+5.00');
        // 跌：绿 + ▼
        expect(cells[1].className).toContain('stk-change-cell--green');
        expect(cells[1].textContent).toContain('▼');
        expect(cells[1].textContent).toContain('-3.00');
        // 平：无箭头
        expect(cells[2].className).toContain('stk-change-cell--flat');
        expect(cells[2].textContent).not.toContain('▲');
    });

    it('supports colorReverse (international)', () => {
        const { ChangeCell } = lib.createChangeCell({ colorReverse: true });
        const columns = [{ title: 'Chg', dataIndex: 'chg', customCell: ChangeCell }];
        const { container } = render(StkTable, { props: { columns, dataSource: [{ id: 1, chg: 5 }], rowKey: 'id' } });
        const cell = container.querySelector('.stk-change-cell')!;
        expect(cell.className).toContain('stk-change-cell--green');
    });
});

describe('NumberCell', () => {
    it('formats numbers', () => {
        const { NumberCell } = lib.createNumberCell({ decimals: 2 });
        const columns = [{ title: 'Price', dataIndex: 'price', customCell: NumberCell }];
        const dataSource = [{ id: 1, price: 1234567.891 }, { id: 2, price: null }];
        const { container } = render(StkTable, { props: { columns, dataSource, rowKey: 'id' } });
        const cells = Array.from(container.querySelectorAll('.stk-number-cell'));
        expect(cells.length).toBe(2);
        expect(cells[0].textContent).toBe('1,234,567.89');
        expect(cells[1].textContent).toBe('--');
    });
});

describe('CheckboxCell', () => {
    it('renders row checkboxes and toggles on click', async () => {
        const onChange = vi.fn();
        const { CheckboxCell, CheckboxAllCell } = lib.createCheckboxCell({ field: '_isChecked', onChange });
        const columns = [
            { title: '', dataIndex: 'checkbox', width: 50, customCell: CheckboxCell, customHeaderCell: CheckboxAllCell },
            { title: 'Name', dataIndex: 'name' },
        ];
        const dataSource = [
            { id: 1, name: 'a', _isChecked: false },
            { id: 2, name: 'b', _isChecked: false },
        ];
        const { container } = render(StkTable, { props: { columns, dataSource, rowKey: 'id' } });

        const boxes = Array.from(container.querySelectorAll('tbody input[type=checkbox]')) as HTMLInputElement[];
        expect(boxes.length).toBe(2);
        expect(boxes[0].checked).toBe(false);

        await fireEvent.click(boxes[0]);
        expect(onChange).toHaveBeenCalledWith(true, dataSource[0]);
        expect(dataSource[0]._isChecked).toBe(true);
    });

    it('header select-all checks every row', async () => {
        const onSelectAll = vi.fn();
        const { CheckboxCell, CheckboxAllCell } = lib.createCheckboxCell({ field: '_isChecked', onSelectAll });
        const columns = [
            { title: '', dataIndex: 'checkbox', width: 50, customCell: CheckboxCell, customHeaderCell: CheckboxAllCell },
            { title: 'Name', dataIndex: 'name' },
        ];
        const dataSource = [
            { id: 1, name: 'a', _isChecked: false },
            { id: 2, name: 'b', _isChecked: false },
        ];
        const { container } = render(StkTable, { props: { columns, dataSource, rowKey: 'id' } });

        const headerBox = container.querySelector('thead input[type=checkbox]') as HTMLInputElement;
        expect(headerBox).toBeTruthy();
        await fireEvent.click(headerBox);
        expect(onSelectAll).toHaveBeenCalledWith(true);
        expect(dataSource.every(r => r._isChecked)).toBe(true);
    });
});

describe('EditableCell', () => {
    it('edits on dblclick and commits on Enter', async () => {
        const onChange = vi.fn();
        const { EditableCell } = lib.createEditableCell({ onChange });
        const columns = [{ title: 'Name', dataIndex: 'name', customCell: EditableCell }];
        const dataSource = [{ id: 1, name: 'old' }];
        const { container } = render(StkTable, { props: { columns, dataSource, rowKey: 'id' } });

        const cell = container.querySelector('.stk-editable-cell') as HTMLElement;
        expect(cell).toBeTruthy();
        expect(cell.textContent).toContain('old');

        await fireEvent.dblClick(cell);
        await tick();
        const input = container.querySelector('.stk-editable-cell-input') as HTMLInputElement;
        expect(input).toBeTruthy();

        await fireEvent.input(input, { target: { value: 'new' } });
        await fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith('new', dataSource[0], 'name');
        expect(dataSource[0].name).toBe('new');
    });
});

describe('FilterCell', () => {
    it('renders filter icon in header and opens dropdown on click', async () => {
        const { Filter } = lib.createFilterCell();
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                customHeaderCell: Filter({ options: [{ label: 'a', value: 'a' }, { label: 'b', value: 'b' }] }),
            },
        ];
        const dataSource = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
        const { container } = render(StkTable, { props: { columns, dataSource, rowKey: 'id' } });

        const filter = container.querySelector('.stk-filter');
        expect(filter).toBeTruthy();
        const icon = container.querySelector('.stk-filter-icon') as SVGElement;
        expect(icon).toBeTruthy();

        // 点击图标打开下拉（挂载到 body，异步 import）
        await fireEvent.click(icon);
        await waitFor(() => {
            expect(document.body.querySelector('.stk-filter-dropdown')).toBeTruthy();
        });
    });
});
