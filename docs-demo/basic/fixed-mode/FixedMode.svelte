<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import RangeInput from '../../components/RangeInput.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    let width = $state(50);
    const columns: StkTableColumn<any>[] = [
        { dataIndex: 'id', title: t('id') + '(100px)', width: '100px' },
        { dataIndex: 'name', title: t('name') },
        { dataIndex: 'address', title: t('address') },
    ];
    const data = new Array(200).fill(0).map((it, index) => {
        return { id: index, name: 'Jack', address: 'Beijing' };
    });
</script>

<div>
    <RangeInput bind:value={width} min="0" max="100" label={t('width')} suffix="%"></RangeInput>
    <StkTable
        style="height: 150px"
        rowKey="id"
        virtual
        fixedMode
        width={width + '%'}
        {columns}
        dataSource={data}
    ></StkTable>
    <div>headless</div>
    <StkTable
        style="height: 140px"
        rowKey="id"
        virtual
        fixedMode
        headless
        width={width + '%'}
        {columns}
        dataSource={data}
    ></StkTable>
</div>
