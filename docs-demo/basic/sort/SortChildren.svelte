<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import { getDataSource, columns } from '../tree/config';
    const dataSource = getDataSource();
</script>

<StkTable
    style="max-height: 300px"
    treeConfig={{
        defaultExpandAll: true,
    }}
    sortConfig={{
        sortChildren: true,
    }}
    {columns}
    {dataSource}
></StkTable>
