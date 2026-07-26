<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import CheckItem from '../../components/CheckItem.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();
    let rowByRow = $state<boolean | 'scrollbar'>(true);

    const columns: StkTableColumn<any>[] = [
        { type: 'seq', width: 50, dataIndex: '', title: t('seq') },
        { title: t('name'), dataIndex: 'name', width: 100, sorter: true },
        { title: t('age'), dataIndex: 'age', width: 100, sorter: true },
        { title: t('gender'), dataIndex: 'gender', width: 100, sorter: true },
        { title: t('address'), dataIndex: 'address', sorter: true },
    ];

    const dataSource = new Array(1000).fill(0).map((_, index) => {
        return {
            name: `Jack ${index}`,
            age: 18 + index,
            address: `Beijing Forbidden City ${index}`,
            gender: index % 2 === 0 ? 'male' : 'female',
        };
    });

    function onlyScrollbarChange(checked: boolean) {
        if (checked) {
            rowByRow = 'scrollbar';
        } else {
            rowByRow = false;
        }
    }
</script>

<div>
    <CheckItem checked={true} text="scroll-row-by-row" onchange={v => (rowByRow = v)} />
    <CheckItem text="仅拖动滚动条触发|Only drag scrollbar" onchange={onlyScrollbarChange} />
    <StkTable
        style="height: 200px"
        scrollRowByRow={rowByRow}
        virtual
        rowHeight={30}
        headerRowHeight={68}
        {columns}
        {dataSource}
    ></StkTable>
</div>
