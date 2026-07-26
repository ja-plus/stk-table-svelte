<script lang="ts">
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import StkTable from '../../StkTable.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];
    let noDataFull = $state(true);
</script>

<label>
    <input bind:checked={noDataFull} type="checkbox" />
    <span>{t('noDataFull')}</span>
</label>
<StkTable style="height: 200px" {noDataFull} {columns} dataSource={[]}></StkTable>
