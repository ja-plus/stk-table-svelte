<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import RangeInput from '../../components/RangeInput.svelte';
    import { useI18n } from '../../hooks/useI18n';
    const { t } = useI18n();

    let width = $state(400);
    let height = $state(150);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    let dataSource = $state(
        new Array(3).fill(0).map((_, index) => {
            return {
                name: `Jack ${index}`,
                age: 18 + index,
                address: `Beijing Forbidden City ${index}`,
                gender: index % 2 === 0 ? 'male' : 'female',
            };
        }),
    );
</script>

<div>
    <div>
        <RangeInput bind:value={width} min="100" max="800" label={t('width')} suffix="px"></RangeInput>
    </div>
    <div>
        <RangeInput bind:value={height} min="100" max="800" label={t('height')} suffix="px"></RangeInput>
    </div>
    <div style="overflow: auto">
        <StkTable style="width: {width}px; height: {height}px" {columns} {dataSource}></StkTable>
    </div>
</div>
