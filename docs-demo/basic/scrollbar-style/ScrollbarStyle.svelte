<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    const columns: StkTableColumn<any>[] = [
        { type: 'seq', dataIndex: '', title: t('seq'), width: 50 },
        { title: t('name'), dataIndex: 'name', sorter: true, width: 100 },
        { title: t('age'), dataIndex: 'age', sorter: true, width: 100 },
        { title: t('address'), dataIndex: 'address', sorter: true, width: 300 },
        { title: t('gender'), dataIndex: 'gender', sorter: true, width: 100 },
        ...new Array(10).fill(0).map((_, index) => {
            return { title: t('column') + ' ' + index, dataIndex: `column${index}`, sorter: true, width: 100 };
        }),
    ];

    const dataSource = new Array(100).fill(0).map((_, index) => {
        return {
            name: `Jack ${index}`,
            age: 18 + index,
            address: `Beijing Forbidden City ${index}`,
            gender: index % 2 === 0 ? 'male' : 'female',
        };
    });
</script>

<StkTable style="height: 200px" class="scrollbar" {columns} virtual {dataSource}></StkTable>

<style>
    /* svelte 样式无法作用于子组件根元素，故使用 :global 替代 vue scoped 样式 */
    :global(.scrollbar.light) {
        --scrollbar-thumb-color: #b0b0b0;
        --scrollbar-thumb-hover-color: #888;
    }
    :global(.scrollbar.dark) {
        --scrollbar-thumb-color: #393838;
        --scrollbar-thumb-hover-color: #555;
    }

    :global(.scrollbar::-webkit-scrollbar) {
        width: 8px;
        height: 8px;
    }
    :global(.scrollbar::-webkit-scrollbar-thumb) {
        border-radius: 4px;
        border: 2px solid transparent;
        box-shadow: inset 0 0 0 4px var(--scrollbar-thumb-color);
    }
    :global(.scrollbar::-webkit-scrollbar-thumb:hover) {
        box-shadow: inset 0 0 0 4px var(--scrollbar-thumb-hover-color);
    }
    :global(.scrollbar::-webkit-scrollbar-track) {
        background-color: transparent;
        border: 1px solid var(--border-color);
        border-bottom: none;
        border-right: none;
    }
    :global(.scrollbar::-webkit-scrollbar-corner) {
        background-color: transparent;
        border-right: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
    }
</style>
