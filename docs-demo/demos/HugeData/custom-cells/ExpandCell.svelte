<script lang="ts">
    import type { CustomCellProps } from '../../../../src/StkTable/types/index';
    import { emitter } from '../event';
    import type { DataType } from '../types';
    import { useI18n } from '../../../hooks/useI18n/index';
    const { t } = useI18n();
    let props: CustomCellProps<DataType> & { class?: string; tabindex?: number } = $props();
    function handleClick() {
        emitter.emit('toggle-expand', props.row);
    }
    const BestText = t('Best');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="expand-cell {props.class ?? ''}" tabindex={props.tabindex} onclick={handleClick}>
    <span class="triangle-arrow" class:expand={props.row._isExpand}></span>
    <span class="text">{BestText}</span>
</div>

<style lang="less">
.expand-cell {
    cursor: pointer;
}
.triangle-arrow {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 5px solid;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    &.expand {
        transform: rotate(90deg);
    }
}
.text {
    margin-left: 5px;
}
</style>
