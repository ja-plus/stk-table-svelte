<script lang="ts">
    import type { StkTableColumn } from '../../../../src/StkTable/index';
    import StkTable from '../../../StkTable.svelte';
    import { dataSource as initialDataSource } from './dataSource';
    import { useI18n } from '../../../hooks/useI18n/index';

    const { t } = useI18n();

    let dataSource = $state.raw(initialDataSource);

    const columns: StkTableColumn<any>[] = [
        { title: t('id'), dataIndex: 'id', width: 100, },
        { title: t('continent'), dataIndex: 'continent', width: 100, mergeCells, },
        { title: t('country'), dataIndex: 'country', width: 120, mergeCells, },
        { title: t('province'), dataIndex: 'province' },
    ];

    function mergeCells({ row, col }: { row: any, col: StkTableColumn<any> }) {
        if (!row.rowspan) return;
        return { rowspan: row.rowspan[col.dataIndex] || 1 };
    }

    function addMoreData() {
        // add 1000 row
        const last = dataSource.at(-1);
        const id = last?.id.split('-') || [];
        const startIndex = Number(id[0] || 0);
        const data = [];
        let childCount = 10;
        for (let i = startIndex; i < startIndex + 100; i++) {
            for (let j = 0; j < childCount; j++) {
                const row: any = {
                    id: i + '-' + j,
                    continent: 'Asia' + i,
                    country: 'China',
                    province: 'Beijing',
                };
                if (j === 0) {
                    row.rowspan = {
                        continent: childCount,
                    };
                }
                data.push(row);
            }
        }
        dataSource = dataSource.concat(data);
    }
</script>

<button class="btn" onclick={addMoreData}>{t('add1000Row')}</button>
<StkTable style="max-height: 300px" virtual cellHover rowKey="id" {columns} {dataSource}>
</StkTable>
