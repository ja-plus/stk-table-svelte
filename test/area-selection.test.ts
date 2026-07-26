import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
// 从库入口导入，验证完整导出链（含 registerFeature / useAreaSelection）
import * as lib from '../src/StkTable/index';

const StkTable = lib.StkTable;

const cols = [
    { title: 'Name', dataIndex: 'name', width: 150 },
    { title: 'Age', dataIndex: 'age', width: 100 },
    { title: 'Addr', dataIndex: 'addr', width: 120 },
];
// age 从 1 开始，避免 0 在复制时被当作 falsy 转为空串
const data = Array.from({ length: 5 }, (_, i) => ({ id: i, name: 'u' + i, age: i + 1, addr: 'a' + i }));

/** 等待响应式更新与 tick().then(DOM 操作) 完成 */
async function settle() {
    await tick();
    await tick();
    await new Promise(r => setTimeout(r, 0));
    await tick();
}

describe('area selection exports', () => {
    it('exports useAreaSelection and registerFeature', () => {
        expect(lib.useAreaSelection).toBeTypeOf('function');
        expect(lib.registerFeature).toBeTypeOf('function');
    });
});

describe('area selection noop (feature not registered)', () => {
    it('warns and keeps selection disabled when not registered', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: true },
        });
        expect(warn).toHaveBeenCalledWith('useAreaSelection is not registered');
        // noop feature: config.enabled = false，不应用 area-selection class
        expect(container.querySelector('.stk-table')!.classList.contains('area-selection')).toBe(false);
        warn.mockRestore();
    });
});

describe('area selection feature', () => {
    beforeAll(() => {
        lib.registerFeature(lib.useAreaSelection);
    });

    it('applies area-selection class and tabindex when enabled', async () => {
        const { container } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: true },
        });
        await settle();
        const table = container.querySelector('.stk-table')!;
        expect(table.classList.contains('area-selection')).toBe(true);
        expect(table.getAttribute('tabindex')).toBe('0');
    });

    it('mousedown on a cell marks it selected (data-cs-s)', async () => {
        const { container } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: true },
        });
        await settle();
        const td = container.querySelector('.stk-tbody-main tr[data-row-i="0"] td[data-col-key]') as HTMLElement;
        expect(td).toBeTruthy();

        await fireEvent.mouseDown(td, { button: 0 });
        await settle();

        expect(td.hasAttribute('data-cs-s')).toBe(true);
        // 单格选区：四周边界属性
        expect(td.hasAttribute('data-cs-t')).toBe(true);
        expect(td.hasAttribute('data-cs-b')).toBe(true);
        expect(td.hasAttribute('data-cs-l')).toBe(true);
        expect(td.hasAttribute('data-cs-r')).toBe(true);
    });

    it('drag expands selection and emits onareaselectionchange on mouseup', async () => {
        const onChange = vi.fn();
        const { container } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: true, onareaselectionchange: onChange },
        });
        await settle();

        const startTd = container.querySelector('.stk-tbody-main tr[data-row-i="0"] td[data-col-key]') as HTMLElement;
        const endRowTds = container.querySelectorAll('.stk-tbody-main tr[data-row-i="1"] td[data-col-key]');
        const endTd = endRowTds[1] as HTMLElement; // 第 2 行第 2 列

        await fireEvent.mouseDown(startTd, { button: 0 });
        await settle();
        // mousemove 冒泡到 document 监听器，e.target = endTd
        await fireEvent.mouseMove(endTd);
        await settle();
        await fireEvent.mouseUp(document);
        await settle();

        expect(onChange).toHaveBeenCalled();
        const ranges = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(ranges.length).toBe(1);
        const { begin, end } = ranges[0].index;
        expect(Math.min(begin.row, end.row)).toBe(0);
        expect(Math.max(begin.row, end.row)).toBe(1);
        expect(Math.min(begin.col, end.col)).toBe(0);
        expect(Math.max(begin.col, end.col)).toBe(1);

        // 选区内 2x2=4 个单元格被标记
        expect(container.querySelectorAll('.stk-tbody-main td[data-cs-s]').length).toBe(4);
    });

    it('exposes setAreaSelection / getSelectedArea / clearSelectedArea', async () => {
        const { container, component } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: true },
        });
        await settle();
        const comp = component as any;

        const res = comp.setAreaSelection({ begin: { row: 0, col: 0 }, end: { row: 2, col: 1 } });
        await settle();
        expect(res.length).toBe(1);

        const area = comp.getSelectedArea();
        expect(area.rows.length).toBe(3);
        expect(area.cols.length).toBe(2);
        expect(area.ranges.length).toBe(1);

        // 3 行 x 2 列 = 6 个单元格被标记
        expect(container.querySelectorAll('.stk-tbody-main td[data-cs-s]').length).toBe(6);

        comp.clearSelectedArea();
        await settle();
        expect(comp.getSelectedArea().ranges.length).toBe(0);
        expect(container.querySelectorAll('.stk-tbody-main td[data-cs-s]').length).toBe(0);
    });

    it('copySelectedArea returns tab/newline separated text', async () => {
        const { component } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: true },
        });
        await settle();
        const comp = component as any;

        comp.setAreaSelection({ begin: { row: 0, col: 0 }, end: { row: 1, col: 1 } });
        await settle();
        const text = comp.copySelectedArea();
        // name/age 两列，两行：u0\t1 \n u1\t2
        expect(text).toBe('u0\t1\nu1\t2');
    });

    it('keyboard navigation moves the selection (keyboard=true)', async () => {
        const { container, component } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: { enabled: true, keyboard: true } },
        });
        await settle();
        const comp = component as any;
        const table = container.querySelector('.stk-table') as HTMLElement;

        // 无选区时按方向键：选中 (0,0)
        await fireEvent.keyDown(table, { key: 'ArrowDown' });
        await settle();
        expect(comp.getSelectedArea().ranges.length).toBe(1);

        // 再按 ArrowDown：移动到 (1,0)
        await fireEvent.keyDown(table, { key: 'ArrowDown' });
        await settle();
        let range = comp.getSelectedArea().ranges[0].index;
        expect(range.begin.row).toBe(1);
        expect(range.end.row).toBe(1);

        // 按 ArrowRight：移动到 (1,1)
        await fireEvent.keyDown(table, { key: 'ArrowRight' });
        await settle();
        range = comp.getSelectedArea().ranges[0].index;
        expect(range.begin.row).toBe(1);
        expect(range.begin.col).toBe(1);
    });

    it('Shift+Arrow expands the selection (keyboard+shift)', async () => {
        const { container, component } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: { enabled: true, keyboard: true, shift: true } },
        });
        await settle();
        const comp = component as any;
        const table = container.querySelector('.stk-table') as HTMLElement;

        // 先建立 (0,0) 选区
        await fireEvent.keyDown(table, { key: 'ArrowDown' });
        await settle();
        // Shift+ArrowDown 扩展 end 到 (1,0)
        await fireEvent.keyDown(table, { key: 'ArrowDown', shiftKey: true });
        await settle();
        const { begin, end } = comp.getSelectedArea().ranges[0].index;
        expect(begin.row).toBe(0);
        expect(end.row).toBe(1);
    });

    it('Ctrl/Cmd+C copies the selected area', async () => {
        const { container, component } = render(StkTable, {
            props: { columns: cols, dataSource: data, rowKey: 'id', areaSelection: { enabled: true, keyboard: true } },
        });
        await settle();
        const comp = component as any;
        const table = container.querySelector('.stk-table') as HTMLElement;

        comp.setAreaSelection({ begin: { row: 0, col: 0 }, end: { row: 0, col: 1 } });
        await settle();

        // mock clipboard
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });

        await fireEvent.keyDown(table, { key: 'c', ctrlKey: true });
        await settle();
        expect(writeText).toHaveBeenCalledWith('u0\t1');
    });
});
