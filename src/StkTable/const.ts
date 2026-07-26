import type { RowActiveOption, SortConfig } from './types';
import { getBrowsersVersion } from './utils';

export const DEFAULT_COL_WIDTH = 100;

export const DEFAULT_TABLE_HEIGHT = 100;
export const DEFAULT_TABLE_WIDTH = 200;
export const DEFAULT_ROW_HEIGHT = 28;

/** highlight background */
export const HIGHLIGHT_COLOR = {
    light: { from: '#71a2fd', to: '#fff' },
    dark: { from: '#1e4c99', to: '#181c21' },
};
export const HIGHLIGHT_DURATION = 2000;

export const HIGHLIGHT_ROW_CLASS = 'highlight-row';
export const HIGHLIGHT_CELL_CLASS = 'highlight-cell';

const _chromeVersion = getBrowsersVersion('chrome');
const _firefoxVersion = getBrowsersVersion('firefox');

/** legacy sticky compatible mode */
export const IS_LEGACY_MODE = _chromeVersion < 56 || _firefoxVersion < 59;

/** default props.smoothDefault */
export const DEFAULT_SMOOTH_SCROLL = _chromeVersion < 85;

export const STK_ID_PREFIX = 'stk';

/** expanded row key prefix */
export const EXPANDED_ROW_KEY_PREFIX = 'expanded-';

/** cell key split str */
export const CELL_KEY_SEPARATE = '--';

export const DEFAULT_SORT_CONFIG = {
    emptyToBottom: false,
    stringLocaleCompare: false,
    sortChildren: false,
} satisfies SortConfig<any>;

export const DEFAULT_ROW_ACTIVE_CONFIG: Required<RowActiveOption<any>> = {
    enabled: true,
    disabled: () => false,
    revokable: true,
};

/**
 * StkTable 组件上下文 key。
 * custom-cells（CheckboxAllCell / FilterCell 等）通过 getContext 获取表格实例能力，
 * 等价于 Vue 版本中沿父链查找 StkTable 实例。
 */
export const STK_TABLE_CONTEXT = Symbol('stk-table');

/** StkTable 上下文能力接口 */
export interface StkTableContext {
    /** 获取处理后的数据源（响应式） */
    getDataSource: () => any[];
    /** 设置筛选状态 */
    setFilter: (status: Record<string | number, any> | null, option?: { remote?: boolean; silent?: boolean }) => void;
    /** 获取当前主题 */
    getTheme: () => string;
    /** 读取行数据版本号（响应式）。行内容被原地修改后版本号递增，依赖它的派生值会重新计算 */
    getRowVersion: () => number;
    /** 行数据被原地修改后调用，触发表格内依赖行内容的响应式更新（如表头全选状态） */
    bumpRowVersion: () => void;
}
