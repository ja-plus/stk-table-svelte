<script lang="ts">
    let {
        checked = false,
        indeterminate = false,
        customComponent = undefined,
        onchange,
    }: {
        /** 当前是否选中 */
        checked?: boolean;
        /** 是否半选状态 */
        indeterminate?: boolean;
        /** 自定义 checkbox 组件 */
        customComponent?: any;
        onchange?: (checked: boolean) => void;
    } = $props();

    /** 防重保护：部分 UI 库会同时触发多个事件 */
    let _lastValue: boolean | undefined = $state(undefined);

    function handleChange(e: any) {
        let next: boolean;
        if (typeof e === 'boolean') {
            next = e;
        } else if (e?.target?.checked !== undefined) {
            next = e.target.checked;
        } else {
            next = !!e;
        }
        if (next === _lastValue) return;
        _lastValue = next;
        onchange?.(next);
    }

    /** indeterminate 是 DOM property，无法通过 attribute 设置 */
    function indeterminateAction(node: HTMLInputElement, value: boolean) {
        node.indeterminate = value;
        return {
            update(v: boolean) {
                node.indeterminate = v;
            },
        };
    }
</script>

<div class="stk-checkbox-cell">
    {#if customComponent}
        <svelte:component
            this={customComponent}
            model-value={checked}
            {checked}
            {indeterminate}
            onchange={handleChange}
            onclick={(e: MouseEvent) => e.stopPropagation()}
        />
    {:else}
        <input
            type="checkbox"
            {checked}
            use:indeterminateAction={indeterminate}
            class="stk-checkbox-native"
            onchange={handleChange}
            onclick={(e: MouseEvent) => e.stopPropagation()}
        />
    {/if}
</div>
