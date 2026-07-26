import { bindComponentProps } from '../utils/bindComponent';
import EditableCellBase from './EditableCell.svelte';

/** createEditableCell 配置选项 */
export interface CreateEditableCellOptions {
    /** 触发编辑的事件，默认 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** 值变更回调 */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}

/**
 * 可编辑单元格工厂函数
 * @param option 配置选项
 * @returns EditableCell Svelte 组件，直接赋值给 `customCell` 使用
 */
export function createEditableCell(option?: CreateEditableCellOptions) {
    const EditableCell = bindComponentProps(EditableCellBase, {
        trigger: option?.trigger || 'dblclick',
        onChange: (newValue: any, row: Record<string, any>, dataIndex: string) => {
            option?.onChange?.(newValue, row, dataIndex);
        },
    });

    return { EditableCell };
}
