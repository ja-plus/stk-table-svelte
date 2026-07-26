<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import CheckItem from '../../components/CheckItem.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    let virtual = $state(false);
    let showOverflow = $state(true);
    let showHeaderOverflow = $state(false);

    type DataType = {
        key: string;
        name: string;
        age: number;
        gender: string;
        corporation: string;
        address: string;
    };

    const columns: StkTableColumn<DataType>[] = [
        { title: t('name'), dataIndex: 'name', width: 100 },
        { title: t('age'), dataIndex: 'age' },
        { title: t('gender'), dataIndex: 'gender' },
        { title: t('corporation'), dataIndex: 'corporation', maxWidth: 120 },
        { title: t('address'), dataIndex: 'address', maxWidth: 120 },
        { title: t('longTitle'), dataIndex: 'address', maxWidth: 120 },
    ];

    let dataSource = $state<DataType[]>([
        {
            key: '1',
            name: 'John Brown',
            age: 32,
            gender: 'male',
            corporation: 'Netscape Communications Corporation',
            address: 'New York No. 1 Lake Park',
        },
        {
            key: '2',
            name: 'Jim Green',
            age: 42,
            gender: 'male',
            corporation: 'Netscape Communications Corporation',
            address: 'London No. 1 Lake Park',
        },
        {
            key: '3',
            name: 'Joe Black',
            age: 32,
            gender: 'male',
            corporation: 'Netscape Communications Corporation',
            address: 'Sidney No. 1 Lake Park',
        },
    ]);
</script>

<CheckItem bind:checked={showOverflow} text="showOverflow"></CheckItem>
<CheckItem bind:checked={showHeaderOverflow} text="showHeaderOverflow"></CheckItem>
<CheckItem bind:checked={virtual} text="virtual"></CheckItem>

<StkTable rowKey="key" {virtual} {showOverflow} {showHeaderOverflow} {columns} {dataSource}></StkTable>
