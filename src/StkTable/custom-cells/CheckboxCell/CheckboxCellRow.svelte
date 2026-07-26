<script lang="ts">
    import { getContext } from 'svelte';
    import { STK_TABLE_CONTEXT, type StkTableContext } from '../../const';
    import CheckboxCell from './CheckboxCell.svelte';

    let {
        row,
        __field = '_isChecked',
        __customComponent = undefined,
        __onChange = undefined,
    }: {
        row?: any;
        col?: any;
        cellValue?: any;
        rowIndex?: number;
        colIndex?: number;
        expanded?: any;
        treeExpanded?: any;
        __field?: string;
        __customComponent?: any;
        __onChange?: (checked: boolean, row: any) => void;
    } = $props();

    /** 从 StkTable 上下文获取能力（行数据写穿后通知表格刷新表头状态） */
    const ctx = getContext<StkTableContext | undefined>(STK_TABLE_CONTEXT);

    let checked = $derived(!!row?.[__field]);

    function handleChange(next: boolean) {
        if (row) {
            row[__field] = next;
        }
        // 行数据已原地修改（写穿到用户数据），通知表格刷新依赖行内容的状态（如表头全选）
        ctx?.bumpRowVersion();
        __onChange?.(next, row);
    }
</script>

<CheckboxCell {checked} customComponent={__customComponent} onchange={handleChange} />
