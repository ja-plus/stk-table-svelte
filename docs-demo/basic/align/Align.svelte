<script lang="ts">
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import StkTable from '../../StkTable.svelte';
    import RadioGroup from '../../components/RadioGroup.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    type Data = {
        name: string;
    };
    let align = $state('left');
    let headerAlign = $state('center');

    const columns = $derived(
        [
            { type: 'seq', title: t('seq'), dataIndex: '' as any, width: 50 },
            { title: t('name'), dataIndex: 'name', align, headerAlign },
        ] as StkTableColumn<Data>[],
    );

    let dataSource = $state<Data[]>([
        { name: 'John Brown' },
        { name: 'Jim Green' },
        { name: 'Joe Black' },
        { name: 'Jim Red' },
    ]);
</script>

<RadioGroup
    bind:value={headerAlign}
    text={t('headerAlign')}
    options={[
        { label: 'left', value: 'left' },
        { label: 'center', value: 'center' },
        { label: 'right', value: 'right' },
    ]}
></RadioGroup>
<RadioGroup
    bind:value={align}
    text={t('align')}
    options={[
        { label: 'left', value: 'left' },
        { label: 'center', value: 'center' },
        { label: 'right', value: 'right' },
    ]}
></RadioGroup>
<StkTable rowKey="name" {columns} {dataSource}></StkTable>
