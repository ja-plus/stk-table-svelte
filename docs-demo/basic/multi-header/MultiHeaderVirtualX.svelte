<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import CheckItem from '../../components/CheckItem.svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();
    let virtual = $state(true);
    let virtualX = $state(true);
    let fixedLeft = $state(true);
    let fixedRight = $state(true);

    const columns = $derived.by(() => {
        return [
            {
                dataIndex: 'Basic',
                title: t('basic'),
                fixed: fixedLeft ? 'left' : null,
                children: [
                    {
                        dataIndex: 'id',
                        title: t('id'),
                        width: 100,
                        fixed: fixedLeft ? 'left' : null,
                    },
                    {
                        dataIndex: 'lv2',
                        title: t('lv2'),
                        width: 100,
                        fixed: fixedLeft ? 'left' : null,
                        children: [
                            {
                                dataIndex: 'lv2_1',
                                title: t('lv2_1'),
                                width: 100,
                                fixed: fixedLeft ? 'left' : null,
                            },
                            {
                                dataIndex: 'lv2_2',
                                title: t('lv2_2'),
                                width: 100,
                                fixed: fixedLeft ? 'left' : null,
                            },
                        ],
                    },
                ],
            },
            {
                dataIndex: 'age',
                title: t('age'),
                width: '50px',
                children: [
                    { dataIndex: 'id3', title: t('id'), width: 50 },
                    {
                        dataIndex: 'lv5',
                        title: t('lv2'),
                        width: 100,
                    },
                ],
            },
            { dataIndex: 'email', title: t('email'), width: '130px' },
            {
                dataIndex: 'other',
                title: t('other'),
                children: new Array(10).fill(0).map((it, i) => {
                    return {
                        dataIndex: 'other' + i,
                        title: t('other') + ' ' + i,
                        width: 100,
                    };
                }),
            },
            ...new Array(5).fill(0).map((it, i) => {
                return {
                    dataIndex: 'lv1' + i,
                    title: t('lv1') + ' ' + i,
                    width: 100,
                };
            }),
            {
                dataIndex: 'right',
                title: t('right'),
                fixed: fixedRight ? 'right' : null,
                children: [
                    {
                        dataIndex: 'right-1',
                        title: t('right1'),
                        width: 50,
                        fixed: fixedRight ? 'right' : null,
                    },
                    {
                        dataIndex: 'right-2',
                        title: t('right2'),
                        width: 100,
                        fixed: fixedRight ? 'right' : null,
                    },
                ],
            },
        ];
    });
    const dataSource = new Array(50).fill(0).map((it, i) => {
        return {
            id: i,
            lv2_1: 'lv2.1',
            lv2_2: 'lv2.2',
            age: i,
            email: i + '@email.com',
        };
    });
</script>

<CheckItem bind:checked={virtual} text="virtual"></CheckItem>
<CheckItem bind:checked={virtualX} text="virtual-x(^1.0.0)"></CheckItem>
<CheckItem bind:checked={fixedLeft} text="fixed-left(Basic)"></CheckItem>
<CheckItem bind:checked={fixedRight} text="fixed-right(right)"></CheckItem>
<StkTable style="height: 200px" rowKey="id" fixedColShadow {virtual} {virtualX} {columns} {dataSource}>
</StkTable>
