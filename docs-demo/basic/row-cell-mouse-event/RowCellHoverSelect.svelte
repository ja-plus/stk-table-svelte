<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import CheckItem from '../../components/CheckItem.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();
    let stkTableRef: any;

    let stripe = $state(true);
    let rowActive = $state({
        enabled: true,
        disabled: (row: any) => row.name === 'Disabled',
        revokable: true,
    });
    let cellActive = $state(true);
    let rowHover = $state(true);
    let cellHover = $state(true);
    let selectedCellRevokable = $state(true);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    let dataSource = $state([
        { name: `Jack`, age: 18, address: `Beijing Forbidden City `, gender: 'male' },
        { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
        { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
        { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
        { name: `Disabled`, age: 0, address: `Unknown`, gender: 'male' },
    ]);

    function setCurrentRow(rowKeyOrRow: string | undefined | any) {
        stkTableRef?.setCurrentRow(rowKeyOrRow);
    }

    function setSelectedCell(row: any, col: StkTableColumn<any>) {
        stkTableRef?.setSelectedCell(row, col);
    }
</script>

<CheckItem bind:checked={stripe} text={'stripe' + '(' + t('zebraStripes') + ')'}></CheckItem>
<br />
<CheckItem bind:checked={rowActive.enabled} text={'rowActive' + '(' + t('rowSelectedState') + ')'}></CheckItem>
<CheckItem bind:checked={cellActive} text={'cellActive' + '(' + t('cellSelectedState') + ')'}></CheckItem>
<br />
<CheckItem bind:checked={rowHover} text={'rowHover' + '(' + t('rowHoverState') + ')'}></CheckItem>
<CheckItem bind:checked={cellHover} text={'cellHover' + '(' + t('cellHoverState') + ')'}></CheckItem>
<br />
<CheckItem bind:checked={rowActive.revokable} text={'rowActive.revokable(' + t('rowSelectedStateCancellable') + ')'}></CheckItem>
<br />
<CheckItem bind:checked={selectedCellRevokable} text={'selectedCellRevokable' + '(' + t('cellSelectedStateCancellable') + ')'}></CheckItem>
<hr />
<button class="btn" onclick={() => setCurrentRow('Jack')}>setCurrentRow('Jack')</button>
<button class="btn" onclick={() => setSelectedCell(dataSource[0], columns[1])}>
    setSelectedCell('Jack-age')
</button>
<button class="btn" onclick={() => setCurrentRow('Disabled')}>setCurrentRow('Disabled')</button>

<StkTable
    bind:this={stkTableRef}
    rowKey="name"
    {stripe}
    {rowActive}
    {cellActive}
    {rowHover}
    {cellHover}
    {selectedCellRevokable}
    {columns}
    {dataSource}
></StkTable>
