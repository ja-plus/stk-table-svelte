<script lang="ts">
    import { tick } from 'svelte';
    import type { Order, SortConfig, SortState, StkTableColumn } from '../../../src/StkTable/index';
    import { insertToOrderedArray, tableSort } from '../../../src/StkTable/index';
    import StkTable from '../../StkTable.svelte';

    let stkTableRef: any;

    type DataType = {
        id: number;
        name: string | null;
        age: number | null;
        gender: number;
    };

    const columns: StkTableColumn<DataType>[] = [
        { title: 'ID', dataIndex: 'id', width: '50px', sorter: true },
        { title: 'Name', dataIndex: 'name', width: '200px', sorter: true },
        {
            title: 'Age(default desc)',
            dataIndex: 'age',
            width: '200px',
            sorter: true,
            sortType: 'number',
        },
        { title: 'Gender', dataIndex: 'gender' },
    ];
    let dataSource = $state<DataType[]>(
        new Array(5).fill(null).map((it, i) => {
            return {
                id: i,
                name: i % 2 === 0 ? null : 'name' + i,
                age: i % 2 === 0 ? null : i,
                gender: i + 1,
            };
        }),
    );
    const defaultSort: SortState<DataType> = {
        dataIndex: 'age',
        order: 'desc',
    };
    const tableSortStore: SortState<DataType> = {
        ...defaultSort,
    };
    function handleSortChange(
        col: StkTableColumn<DataType>,
        order: Order,
        data: DataType[],
        sortConfig: SortConfig<DataType>,
    ) {
        dataSource = tableSort(col, order, data, sortConfig);
        // order 为 null 时回退到 defaultSort，确保 tableSortStore 与实际排序状态一致
        const effectiveOrder = order || sortConfig.defaultSort?.order;
        const effectiveIndex = order
            ? (col.dataIndex as keyof DataType)
            : sortConfig.defaultSort?.dataIndex;
        tableSortStore.dataIndex = effectiveIndex || (col.dataIndex as keyof DataType);
        tableSortStore.order = effectiveOrder || null;
    }
    let count = dataSource.length;
    function addRow() {
        const random = Math.random() * 10;
        const item: DataType = {
            id: count++,
            name: 'name' + random,
            age: random,
            gender: random,
        };
        dataSource = insertToOrderedArray(tableSortStore, item, dataSource);
        tick().then(() => {
            stkTableRef?.setHighlightDimRow([item.id]);
        });
    }

    function clear() {
        dataSource = [];
    }
</script>

<button class="btn" onclick={addRow}>Insert</button>
<button class="btn" onclick={clear}>Clear</button>
<StkTable
    bind:this={stkTableRef}
    rowKey="id"
    style="height: 200px"
    maxWidth="max-content"
    sortRemote
    {columns}
    {dataSource}
    sortConfig={{
        emptyToBottom: true,
        defaultSort: defaultSort,
    }}
    onsortchange={handleSortChange}
></StkTable>
