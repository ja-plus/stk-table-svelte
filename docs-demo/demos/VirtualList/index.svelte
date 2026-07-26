<script lang="ts">
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import mockjs from 'mockjs';
    import { useI18n } from '../../hooks/useI18n/index';
    import StkTable from '../../StkTable.svelte';
    import Panel from './Panel.svelte';
    import type { DataType } from './types';

    const { isZH } = useI18n();

    const columns: StkTableColumn<DataType>[] = [{ dataIndex: 'title', title: '', customCell: Panel }];

    const data = new Array(20).fill(0).map((_, i) => ({
        id: i,
        title: isZH ? mockjs.Random.ctitle(5, 15) : mockjs.Random.sentence(1, 5),
        content: isZH ? mockjs.Random.cparagraph(1, 10) : mockjs.Random.paragraph(1, 5),
        date: isZH
            ? mockjs.Random.datetime('yyyy-MM-dd HH:mm')
            : mockjs.Random.datetime('MM/dd/yyyy HH:mm'),
    }));
</script>

<StkTable
    rowKey="id"
    style="height: 400px"
    virtual
    headless
    rowHeight={200}
    rowActive={false}
    bordered={false}
    rowHover={false}
    {columns}
    dataSource={data}
></StkTable>

<style>
:global(.v-head) {
    background-color: #333;
    font-weight: bold;
}
</style>
