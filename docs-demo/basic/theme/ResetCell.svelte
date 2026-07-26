<script lang="ts">
    // 对应 vue 版 action 列的 customCell：单行重置按钮
    let { class: className, tabindex, row, cssVarsState, getDefaults }: any = $props();

    const isModified = $derived.by(() => {
        if (row.children) return false;
        const defaults = getDefaults();
        return cssVarsState.cssVars[row.key] !== defaults[row.key];
    });

    function handleReset() {
        cssVarsState.cssVars[row.key] = getDefaults()[row.key];
    }
</script>

{#if row.children}
    <div class={className} {tabindex}></div>
{:else}
    <div class={className} {tabindex}>
        <button class="row-reset-btn" disabled={!isModified} onclick={handleReset}>↺</button>
    </div>
{/if}
