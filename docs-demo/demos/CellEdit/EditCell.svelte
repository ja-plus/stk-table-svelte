<script lang="ts" generics="T extends { _isEditing?: boolean }">
    import type { CustomCellProps } from '../../../src/StkTable/types/index';

    let props: CustomCellProps<T> & { class?: string; tabindex?: number } = $props();

    let editValue = $state(props.cellValue);
    let inputRef: HTMLInputElement | undefined = $state();

    $effect(() => {
        editValue = props.cellValue;
    });
    let isEditing = $state(false);
    /**是否在行编辑模式 */
    const isEditMode = $derived(props.row._isEditing);

    const editing = $derived(isEditMode || isEditing);

    function startEditing() {
        isEditing = true;
        // 延迟设置焦点，确保输入框已经渲染
        setTimeout(() => {
            inputRef?.focus();
        }, 0);
    }

    function finishEditing(e: Event) {
        isEditing = false;
        const newValue = (e.target as HTMLInputElement).value;
        setCellValue(newValue);
    }

    function cancelEditing() {
        // 行编辑模式不用取消
        if (isEditMode) return;
        if (!isEditing) return;
        isEditing = false;
        if (inputRef) {
            inputRef.value = editValue;
        }
    }

    /** 如果在编辑模式，则实时更新 */
    function handleChange(e: Event) {
        if (isEditMode) {
            finishEditing(e);
        }
    }

    function setCellValue(v: string) {
        const { row, col } = props;
        (row[col.dataIndex] as any) = v;
    }
</script>

<div
    class="edit-cell {props.class ?? ''}"
    tabindex={props.tabindex}
    title={editing ? '回车保存' : '双击编辑'}
    ondblclick={startEditing}
>
    {#if !editing}
        {props.cellValue}
    {:else}
        <input
            bind:this={inputRef}
            class="edit-input"
            value={editValue}
            onblur={cancelEditing}
            onchange={handleChange}
            onkeyup={(e: KeyboardEvent) => {
                if (e.key === 'Enter') finishEditing(e);
                else if (e.key === 'Escape') cancelEditing();
            }}
        />
    {/if}
</div>

<style lang="less">
.edit-cell {
    height: 100%;
    display: flex;
    align-items: center;
    cursor: default;

    .edit-input {
        width: 100%;
        font-size: inherit;
        line-height: 2;
        box-sizing: border-box;
        outline: none;
        padding: 0 8px;
    }
}
</style>
