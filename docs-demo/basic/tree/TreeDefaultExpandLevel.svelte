<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import { getDataSource, columns } from './config';
    const dataSource = getDataSource();
</script>

<StkTable
    style="max-height: 250px"
    treeConfig={{
        defaultExpandLevel: 1,
    }}
    {columns}
    {dataSource}
></StkTable>
