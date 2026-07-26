<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import RangeInput from '../../components/RangeInput.svelte';
    import { useI18n } from '../../hooks/useI18n';
    const { t } = useI18n();

    // 对应 vue 版 vitepress useData().isDark：监听 html.dark class
    let isDark = $state(false);
    $effect(() => {
        const html = document.documentElement;
        const update = () => (isDark = html.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    });

    let height = $state(150);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    let dataSource = $state(
        new Array(20).fill(0).map((_, index) => {
            return {
                name: `Jack ${index}`,
                age: 18 + index,
                address: `Beijing Forbidden City ${index}`,
                gender: index % 2 === 0 ? 'male' : 'female',
            };
        }),
    );
</script>

<RangeInput bind:value={height} min="100" max="800" label={t('height')} suffix="px"></RangeInput>
<article class:dark={isDark} style="height: {height}px">
    <header>Flex Content</header>
    <StkTable {columns} {dataSource}></StkTable>
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--coot-demo-box-border);
    }

    header {
        min-height: 30px;
        background: var(--coot-demo-box-border);
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-weight: bold;
    }

    article :global(.stk-table) {
        flex: 1;
        height: 0;
    }
</style>
