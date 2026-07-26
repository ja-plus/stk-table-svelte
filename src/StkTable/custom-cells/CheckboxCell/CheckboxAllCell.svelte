<script lang="ts">
    import { getContext } from 'svelte';
    import { STK_TABLE_CONTEXT, type StkTableContext } from '../../const';
    import CheckboxCell from './CheckboxCell.svelte';

    let {
        __field = '_isChecked',
        __customComponent = undefined,
        __onSelectAll = undefined,
    }: {
        col?: any;
        colIndex?: number;
        rowIndex?: number;
        __field?: string;
        __customComponent?: any;
        __onSelectAll?: (checked: boolean) => void;
    } = $props();

    /** 从 StkTable 上下文获取数据源（响应式） */
    const ctx = getContext<StkTableContext>(STK_TABLE_CONTEXT);
    let dataSource = $derived.by(() => (ctx ? ctx.getDataSource() : []) as any[]);

    let isCheckAll = $derived.by(() => {
        // 依赖行数据版本号：行勾选状态被原地修改（写穿）后重新计算
        ctx?.getRowVersion();
        return dataSource.length > 0 && dataSource.every((item: any) => !!item[__field]);
    });

    let isIndeterminate = $derived.by(() => {
        // 依赖行数据版本号：行勾选状态被原地修改（写穿）后重新计算
        ctx?.getRowVersion();
        const checkedCount = dataSource.filter((item: any) => !!item[__field]).length;
        return checkedCount > 0 && checkedCount < dataSource.length;
    });

    function handleChange(checked: boolean) {
        dataSource.forEach((item: any) => {
            item[__field] = checked;
        });
        // 行数据已原地修改（写穿到用户数据），通知表格刷新依赖行内容的状态
        ctx?.bumpRowVersion();
        __onSelectAll?.(checked);
    }
</script>

<CheckboxCell checked={isCheckAll} indeterminate={isIndeterminate} customComponent={__customComponent} onchange={handleChange} />
