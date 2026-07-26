<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import { getDataSource, columns } from './config';
    const dataSource = getDataSource();
    function handleToggleTreeExpand(data: { row: any; expanded: boolean }) {
        console.log('toggle tree expand', data);
    }
</script>

<StkTable style="max-height: 300px" {columns} {dataSource} ontoggletreeexpand={handleToggleTreeExpand}></StkTable>
