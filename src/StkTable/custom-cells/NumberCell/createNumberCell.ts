import type { FormatNumberOptions } from '../utils/formatNumber';
import { bindComponentProps } from '../utils/bindComponent';
import NumberCellBase from './NumberCell.svelte';

/** createNumberCell 配置选项（等同于格式化选项） */
export interface CreateNumberCellOptions extends FormatNumberOptions {}

/**
 * 数字格式化单元格工厂函数
 *
 * 纯展示型单元格：将 `cellValue` 经 formatNumber 格式化为文本。
 * 数字对齐请在列配置上设置 `align: 'right'`。
 *
 * @param options 格式化选项
 * @returns `NumberCell` Svelte 组件，直接赋值给 `customCell` 使用
 *
 * @example
 * ```ts
 * const { NumberCell } = createNumberCell({ decimals: 2 });
 * const columns = [
 *   { title: '现价', dataIndex: 'price', align: 'right', customCell: NumberCell },
 * ];
 * ```
 */
export function createNumberCell(options?: CreateNumberCellOptions) {
    /** 单元格组件 - 用于 customCell */
    const NumberCell = bindComponentProps(NumberCellBase, { __options: options ?? {} });
    return { NumberCell };
}
