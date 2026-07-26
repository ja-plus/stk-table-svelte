<script lang="ts">
    /**
     * support vitepress env
     * - 跟随 vitepress 明暗主题
     * - 注册 areaSelection feature
     * - 代理组件实例方法
     */
    import { StkTable as StkTableBase, registerFeature, useAreaSelection } from '../src/StkTable/index';

    registerFeature([useAreaSelection]);

    let { theme, class: className = '', ...rest }: any = $props();

    let isDark = $state(false);

    $effect(() => {
        const html = document.documentElement;
        const update = () => (isDark = html.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    });

    let inst: any = $state();

    /** 代理 base 组件的 sortStates（实例导出，读取时取当前值） */
    let sortStates = $derived(inst?.sortStates);
    export { sortStates };

    export function setCurrentRow(...p: any[]) { return inst?.setCurrentRow(...p); }
    export function setSelectedCell(...p: any[]) { return inst?.setSelectedCell(...p); }
    export function setHighlightDimCell(...p: any[]) { return inst?.setHighlightDimCell(...p); }
    export function setHighlightDimRow(...p: any[]) { return inst?.setHighlightDimRow(...p); }
    export function getSortColumns(...p: any[]) { return inst?.getSortColumns(...p); }
    export function setSorter(...p: any[]) { return inst?.setSorter(...p); }
    export function resetSorter(...p: any[]) { return inst?.resetSorter(...p); }
    export function scrollTo(...p: any[]) { return inst?.scrollTo(...p); }
    export function getTableData(...p: any[]) { return inst?.getTableData(...p); }
    export function getRowIndex(...p: any[]) { return inst?.getRowIndex(...p); }
    export function getColumnIndex(...p: any[]) { return inst?.getColumnIndex(...p); }
    export function setRowExpand(...p: any[]) { return inst?.setRowExpand(...p); }
    export function setAutoHeight(...p: any[]) { return inst?.setAutoHeight(...p); }
    export function clearAllAutoHeight(...p: any[]) { return inst?.clearAllAutoHeight(...p); }
    export function setTreeExpand(...p: any[]) { return inst?.setTreeExpand(...p); }
    export function getSelectedArea(...p: any[]) { return inst?.getSelectedArea(...p); }
    export function setAreaSelection(...p: any[]) { return inst?.setAreaSelection(...p); }
    export function clearSelectedArea(...p: any[]) { return inst?.clearSelectedArea(...p); }
    export function copySelectedArea(...p: any[]) { return inst?.copySelectedArea(...p); }
    export function setFilter(...p: any[]) { return inst?.setFilter(...p); }
</script>

<StkTableBase bind:this={inst} class="vp-raw {className}" theme={theme ?? (isDark ? 'dark' : 'light')} {...rest} />
