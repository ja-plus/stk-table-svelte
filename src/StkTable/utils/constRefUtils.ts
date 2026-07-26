import { DEFAULT_COL_WIDTH, STK_ID_PREFIX } from '../const';
import type { PrivateStkTableColumn, StkTableColumn } from '../types';

declare global {
    interface Window {
        __STK_TB_ID_COUNT__?: number;
    }
}

/**
 * Get column width
 */
export function getColWidth(col: StkTableColumn<any>): number {
    const val = col.minWidth ?? col.width ?? DEFAULT_COL_WIDTH;
    if (typeof val === 'number') {
        return Math.floor(val);
    }
    return parseInt(val);
}

/** Get calculated width */
export function getCalculatedColWidth(col: PrivateStkTableColumn<any> | null) {
    return col?.__W__ || DEFAULT_COL_WIDTH;
}

/** Create unique component id */
export function createStkTableId() {
    let id = window.__STK_TB_ID_COUNT__;
    if (!id) id = 0;
    id += 1;
    window.__STK_TB_ID_COUNT__ = id;
    return STK_ID_PREFIX + id.toString(36);
}
