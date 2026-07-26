import { useAreaSelection, useAreaSelectionName } from './features/index';
import type { UseAreaSelectionDeps } from './features/useAreaSelection.svelte';
import { MY_FN_NAME } from './features/const';

type OnDemandFeature = {
    [useAreaSelectionName]: typeof useAreaSelection<any>;
};

/**
 * 按需功能注册表。
 * 默认注入 noop 实现（不启用任何功能）；调用 registerFeature(useAreaSelection) 后替换为真实实现。
 * 与 Vue 版一致：若未注册却在组件上传入 areaSelection prop，会给出警告。
 */
export const ON_DEMAND_FEATURE: OnDemandFeature = {
    [useAreaSelectionName]: ((deps: UseAreaSelectionDeps<any>) => {
        const areaSelectionProp = deps?.getAreaSelectionProp?.();
        if (areaSelectionProp) {
            console.warn('useAreaSelection is not registered');
        }
        return {
            get config() {
                return { enabled: false };
            },
            get isSelecting() {
                return false;
            },
            onMD: () => {},
            get: () => ({ rows: [], cols: [], ranges: [] }),
            set: () => [],
            clear: () => {},
            copy: () => '',
        };
    }) as typeof useAreaSelection<any>,
};

type Feature = OnDemandFeature[keyof OnDemandFeature];

export function registerFeature(feature: Feature | Feature[]) {
    const features = Array.isArray(feature) ? feature : [feature];
    features.forEach(f => {
        const fnName = (f as any)[MY_FN_NAME];
        if (!fnName) {
            console.warn('invalid feature');
            return;
        }
        (ON_DEMAND_FEATURE as any)[fnName] = f as any;
    });
}
