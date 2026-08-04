<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import { getDataSource, columns } from './config';
    const dataSource = getDataSource();
    let tableRef: any;

    function handleToggleAll() {
        tableRef?.setTreeExpand(dataSource, { all: true });
    }
    function handleCollapseAll() {
        tableRef?.setTreeExpand(dataSource, { all: true, expand: false });
    }

    function handleToggleAsia() {
        tableRef?.setTreeExpand(['Asia']);
    }
    function handleExpandAllAsia() {
        tableRef?.setTreeExpand(['Asia'], { expand: true, all: true });
    }
    function handleCollapseAllAsia() {
        tableRef?.setTreeExpand(['Asia'], { expand: false, all: true });
    }
    function handleExpandToLevel2() {
        tableRef?.setTreeExpand(['Asia'], { expand: true, level: 2 });
    }
    function handleCollapseToLevel1() {
        tableRef?.setTreeExpand(['Asia'], { expand: false, level: 1 });
    }
</script>

<div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px">
    <button class="btn" onclick={handleToggleAll}>Toggle All</button>
    <button class="btn" onclick={handleCollapseAll}>Collapse All</button>
    <button class="btn" onclick={handleToggleAsia}>Toggle Asia</button>
    <button class="btn" onclick={handleExpandAllAsia}>Expand All Asia</button>
    <button class="btn" onclick={handleCollapseAllAsia}>Collapse All Asia</button>
    <button class="btn" onclick={handleExpandToLevel2}>Expand Asia to Level 2</button>
    <button class="btn" onclick={handleCollapseToLevel1}>Collapse Asia to Level 1</button>
</div>
<StkTable
    bind:this={tableRef}
    style="max-height: 300px"
    rowKey="area"
    {columns}
    {dataSource}
></StkTable>
