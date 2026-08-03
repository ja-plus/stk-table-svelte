<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import { getDataSource, columns } from './config';
    const dataSource = getDataSource();
    let tableRef: any;

    function handleToggleChina() {
        tableRef?.setTreeExpand(['China']);
    }
</script>

<div style="margin-bottom: 12px">
    <button class="btn" onclick={handleToggleChina}>Toggle China</button>
</div>
<StkTable
    bind:this={tableRef}
    style="max-height: 250px"
    rowKey="area"
    treeConfig={{
        defaultExpandKeys: ['Asia', 'China', 'Zhejiang'],
    }}
    {columns}
    {dataSource}
></StkTable>
