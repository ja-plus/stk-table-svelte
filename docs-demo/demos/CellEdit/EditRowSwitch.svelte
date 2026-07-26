<script lang="ts">
    import type { CustomCellProps } from '../../../src/StkTable/types/index';
    import type { RowDataType } from './type';

    let props: CustomCellProps<RowDataType> & { class?: string; tabindex?: number } = $props();

    function handleChange(e: Event) {
        const isChecked = (e.target as HTMLInputElement).checked;
        const { row } = props;
        row._isEditing = isChecked;
    }
</script>

<div class="editable-status-cell {props.class ?? ''}" tabindex={props.tabindex}>
    <input checked={props.row._isEditing} type="checkbox" onchange={handleChange} />
</div>

<style lang="less">
.editable-status-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>
