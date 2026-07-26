import { formatNumber, type FormatNumberOptions } from '../utils/formatNumber';
import { bindComponentProps } from '../utils/bindComponent';
import ChangeCellBase from './ChangeCell.svelte';

/** createChangeCell 配置选项 */
export interface CreateChangeCellOptions extends FormatNumberOptions {
    /** 涨跌颜色是否反转：false=A股(涨红跌绿，默认)，true=国际(涨绿跌红) */
    colorReverse?: boolean;
    /** 是否显示涨跌箭头 ▲/▼，默认 false */
    arrow?: boolean;
    /** 自定义上涨颜色（覆盖默认配色，传入后不受 colorReverse 影响） */
    riseColor?: string;
    /** 自定义下跌颜色 */
    fallColor?: string;
    /** 自定义平盘颜色 */
    flatColor?: string;
}

/**
 * 涨跌单元格工厂函数
 *
 * 在 {@link formatNumber} 的基础上叠加涨跌染色与箭头。染色按 `cellValue` 正负判断，
 * 颜色方向可通过 `colorReverse` 切换（A股 / 国际），也可用 `riseColor` 等自定义。
 * 数字对齐请在列配置上设置 `align: 'right'`。
 *
 * @param options 格式化 + 染色/箭头选项
 * @returns `ChangeCell` Svelte 组件，直接赋值给 `customCell` 使用
 *
 * @example
 * ```ts
 * const { ChangeCell } = createChangeCell({ decimals: 2, showSign: true, arrow: true });
 * const columns = [
 *   { title: '涨跌额', dataIndex: 'change', align: 'right', customCell: ChangeCell },
 * ];
 * ```
 */
export function createChangeCell(options: CreateChangeCellOptions = {}) {
    /** 单元格组件 - 用于 customCell */
    const ChangeCell = bindComponentProps(ChangeCellBase, { __options: options });
    return { ChangeCell };
}
