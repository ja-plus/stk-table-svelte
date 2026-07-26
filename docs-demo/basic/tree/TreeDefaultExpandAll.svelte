<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import { getDataSource, columns } from './config';
    const dataSource = getDataSource();
</script>

<StkTable
    style="max-height: 250px"
    treeConfig={{
        defaultExpandAll: true,
    }}
    scrollbar
    {columns}
    {dataSource}
></StkTable>
