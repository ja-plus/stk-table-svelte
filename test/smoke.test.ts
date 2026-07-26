import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import StkTable from '../src/StkTable/StkTable.svelte';

const cols = [
    { title: 'Name', dataIndex: 'name', width: 150 },
    { title: 'Age', dataIndex: 'age', width: 100 },
];
const data = Array.from({ length: 20 }, (_, i) => ({ id: i, name: 'u' + i, age: i }));

describe('smoke', () => {
    it('mount empty', () => {
        const { container } = render(StkTable, { props: { columns: cols, dataSource: [], rowKey: 'id' } });
        expect(container.querySelector('.stk-table')).toBeTruthy();
    });
    it('mount plain', () => {
        const { container } = render(StkTable, { props: { columns: cols, dataSource: data, rowKey: 'id' } });
        expect(container.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    });
    it('mount virtual', () => {
        const { container } = render(StkTable, { props: { columns: cols, dataSource: data, rowKey: 'id', virtual: true } });
        expect(container.querySelector('.stk-table')).toBeTruthy();
    });
    it('mount virtual + virtualX + fixed', () => {
        const colsFixed = [
            { title: 'Name', dataIndex: 'name', width: 150, fixed: 'left' as const, sorter: true },
            { title: 'Age', dataIndex: 'age', width: 100, sorter: true },
            { title: 'Addr', dataIndex: 'addr', width: 300 },
        ];
        const { container } = render(StkTable, {
            props: { columns: colsFixed, dataSource: data, rowKey: 'id', virtual: true, virtualX: true, stripe: true, cellActive: true },
        });
        expect(container.querySelector('.stk-table')).toBeTruthy();
    });
});
