<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import NoData from '../../assets/svg-components/NoData.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    let dataSource = $state([]);
</script>

<StkTable {columns} {dataSource}>
    {#snippet empty()}
        <div style="padding: 20px; display: flex; flex-direction: column; align-items: center">
            <NoData />
            <p>{t('noData')} <a href="#" style="color: #1890ff">{t('clickHere')}</a></p>
        </div>
    {/snippet}
</StkTable>
