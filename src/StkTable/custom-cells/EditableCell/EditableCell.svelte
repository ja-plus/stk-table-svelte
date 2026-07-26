<script lang="ts">
    import { tick, untrack, getContext } from 'svelte';
    import { STK_TABLE_CONTEXT, type StkTableContext } from '../../const';

    let {
        row,
        col,
        cellValue,
        trigger = 'dblclick',
        onChange,
    }: {
        row?: any;
        col?: any;
        cellValue?: any;
        rowIndex?: number;
        colIndex?: number;
        expanded?: any;
        treeExpanded?: any;
        /** 触发编辑的事件，默认 'dblclick' */
        trigger?: 'dblclick' | 'click';
        /** 值变更回调 */
        onChange?: (newValue: any, row?: any, dataIndex?: string) => void;
    } = $props();

    let editValue = $state<any>(cellValue);
    let isEditing = $state(false);
    let inputRef = $state<HTMLInputElement | undefined>(undefined);
    let rootRef = $state<HTMLElement | undefined>(undefined);

    /** 从 StkTable 上下文获取能力（行数据写穿后通知表格） */
    const ctx = getContext<StkTableContext | undefined>(STK_TABLE_CONTEXT);

    // 展示值基于 editValue：编辑提交后 cellValue prop 可能未及时更新（行数据为原始引用），
    // editValue 始终反映最新值（外部更新时由下方 effect 同步）
    let displayText = $derived(editValue !== undefined && editValue !== null ? editValue : '');

    // cellValue 外部变化时同步（编辑中不打断）
    $effect(() => {
        cellValue;
        // 仅依赖 cellValue（untrack isEditing）：避免编辑提交后 isEditing 变化导致用旧的 cellValue 覆盖 editValue
        if (!untrack(() => isEditing)) {
            editValue = cellValue;
        }
    });

    function onTrigger(e: MouseEvent) {
        if (e.type !== trigger) return;
        startEditing();
    }

    function startEditing() {
        editValue = cellValue;
        isEditing = true;
        tick().then(() => {
            inputRef?.focus();
        });
    }

    function finishEditing() {
        isEditing = false;
        const newValue = editValue;
        setCellValue(newValue);
        // 行数据已原地修改（写穿到用户数据），通知表格刷新依赖行内容的状态
        ctx?.bumpRowVersion();
        onChange?.(newValue, row, col?.dataIndex);
        refocusContainer();
    }

    function cancelEditing() {
        isEditing = false;
        editValue = cellValue;
        refocusContainer();
    }

    function onBlur() {
        if (!isEditing) return;
        finishEditing();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            finishEditing();
        } else if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            e.stopPropagation();
            cancelEditing();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.stopPropagation();
        } else if (e.key === 'Tab') {
            finishEditing();
        } else {
            e.stopPropagation();
        }
    }

    function setCellValue(v: any) {
        if (row && col) {
            row[col.dataIndex] = v;
        }
    }

    function refocusContainer() {
        const el = rootRef?.closest?.('.stk-table') as HTMLElement | null;
        el?.focus();
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={rootRef} class="stk-editable-cell" ondblclick={onTrigger} onclick={onTrigger} role="cell">
    {#if !isEditing}
        {displayText}
    {:else}
        <input
            bind:this={inputRef}
            class="stk-editable-cell-input"
            value={editValue}
            onblur={onBlur}
            oninput={(e: Event) => (editValue = (e.target as HTMLInputElement).value)}
            onkeydown={onKeydown}
        />
    {/if}
</div>
