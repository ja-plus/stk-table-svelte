<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/types/index';
    import CheckItem from '../../components/CheckItem.svelte';
    import RowDragCustomHandleCell, { setOnDropRow } from './RowDragCustomHandleCell.svelte';

    const p = $state({
        virtual: false,
    });

    let columns = $state<StkTableColumn<any>[]>([
        { dataIndex: 'id', title: 'id' },
        {
            dataIndex: '',
            width: 200,
            title: 'Custom',
            align: 'center',
            customCell: RowDragCustomHandleCell,
        },
        { dataIndex: 'email', title: 'email' },
        { dataIndex: 'phone', title: 'phone' },
    ]);

    let data = $state(
        new Array(100).fill(0).map((it, index) => {
            return {
                id: index,
                name: 'name' + index,
                email: 'email' + index + '@example.com',
                phone: '123-456-7890',
            };
        }),
    );

    // 拖拽落点后重排数据（vue 版在 handleDrop 中完成）
    setOnDropRow((sourceIndex: number, endIndex: number) => {
        const d = data.slice();
        const sourceData = d[sourceIndex];
        d.splice(sourceIndex, 1);
        d.splice(endIndex, 0, sourceData);
        data = d;
    });
</script>

<div>
    <CheckItem bind:checked={p.virtual} text="virtual"></CheckItem>
    <StkTable
        {columns}
        onupdatecolumns={(cols: StkTableColumn<any>[]) => (columns = cols)}
        style="height: 300px"
        rowKey="id"
        virtual={p.virtual}
        dataSource={data}
    >
    </StkTable>
</div>

<style lang="less">
    :global {
        .stk-table {
            .custom-drag-handle {
                padding: 2px;
                cursor: grab;
                border-radius: 4px;
                display: flex;
                justify-content: center;

                &:hover {
                    background-color: var(--vp-c-border);
                }

                .point-wrapper {
                    height: 14px;
                    width: 16px;
                    position: relative;
                    pointer-events: none;
                }

                .point {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: #888;
                    position: absolute;

                    &:nth-child(2) {
                        left: 8px;
                    }

                    &:nth-child(3) {
                        top: 8px;
                    }

                    &:nth-child(4) {
                        left: 8px;
                        top: 8px;
                    }
                }
            }
        }
    }
</style>
