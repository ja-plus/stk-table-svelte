<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    let dataSource = $state<any[]>([]);

    function addData() {
        dataSource.push(
            ...new Array(5).fill(0).map(
                (_, i) =>
                    ({
                        name: `Edward King ${i}`,
                        age: 32,
                        address: `London, Park Lane no. ${i}`,
                        gender: 'male',
                    }) as any,
            ),
        );
        dataSource = [...dataSource];
    }
    function clearData() {
        dataSource = [];
    }
</script>

<button class="btn" onclick={addData}>{t('addFiveData')}</button>
<button class="btn" onclick={clearData}>{t('clearData')}</button>
<StkTable style="height: 200px" {columns} {dataSource}>
    {#snippet customBottom()}
        <div class="custom-bottom">
            <span>{t('customBottom')}</span>
        </div>
    {/snippet}
</StkTable>

<style>
    .custom-bottom {
        text-align: center;
        padding: 40px 0;
    }
</style>
