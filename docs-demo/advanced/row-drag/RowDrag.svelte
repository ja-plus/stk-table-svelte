<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/types/index';
    import CheckItem from '../../components/CheckItem.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    const p = $state({
        virtual: false,
    });

    let columns = $state<StkTableColumn<any>[]>([
        {
            type: 'dragRow',
            key: 'dragRow',
            width: 100,
            title: t('builtinDrag'),
            dataIndex: '',
            align: 'center',
        },
        { dataIndex: 'email', title: t('email') },
        { dataIndex: 'phone', title: t('phone'), width: 150 },
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
</script>

<div>
    <CheckItem bind:checked={p.virtual} text={t('virtual')}></CheckItem>
    <StkTable
        {columns}
        onupdatecolumns={(cols: StkTableColumn<any>[]) => (columns = cols)}
        rowKey="id"
        style="height: 300px"
        headerDrag
        colKey={(col: StkTableColumn<any>) => col.key || col.dataIndex}
        virtual={p.virtual}
        dataSource={data}
    >
    </StkTable>
</div>
