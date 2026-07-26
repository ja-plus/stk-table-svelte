<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import RangeInput from '../../components/RangeInput.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    let height = $state(300);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('address'), dataIndex: 'address', maxWidth: 200 },
    ];

    let dataSource = $state([
        { name: `Jack`, address: `Beijing Forbidden City` },
        { name: `Tom`, address: `Shanghai` },
        { name: `Lucy`, address: `Guangzhou` },
        { name: `Lily`, address: `Shenzhen` },
    ]);
</script>

<div class="container" style="height: {height}px">
    <RangeInput bind:value={height} min="0" max="600" label={t('height')} suffix="px"></RangeInput>
    <StkTable headerRowHeight={50} {columns} {dataSource}></StkTable>
</div>

<style>
    .container {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .container :global(.stk-table) {
        flex: 1;
    }
    .container :global(.stk-table .stk-table-scroll-container) {
        flex: 1;
    }
</style>
