<script lang="ts">
    // 对应 vue 版 value 列的 customCell：按变量类型渲染 color/number/text 输入框
    let { class: className, tabindex, row, cssVarsState }: any = $props();

    const numVal = $derived.by(() => {
        const val = cssVarsState.cssVars[row.key] as string;
        const match = val?.match(/^([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    });

    function handleColorChange(e: Event) {
        const target = e.target as HTMLInputElement;
        cssVarsState.cssVars[row.key] = target.value;
    }

    function handleNumberChange(e: Event) {
        const target = e.target as HTMLInputElement;
        cssVarsState.cssVars[row.key] = `${target.value}${row.unit}`;
    }

    function handleTextChange(e: Event) {
        const target = e.target as HTMLInputElement;
        cssVarsState.cssVars[row.key] = target.value;
    }
</script>

{#if row.children}
    <div class={className} {tabindex}></div>
{:else}
    <div class={className} {tabindex}>
        <div class="control-cell">
            {#if row.type === 'color'}
                <input type="color" class="color-input" value={cssVarsState.cssVars[row.key]} onchange={handleColorChange} />
            {:else if row.type === 'number'}
                <input type="number" class="number-input" value={numVal} onchange={handleNumberChange} />
                <span class="unit-label">{' ' + row.unit}</span>
            {:else}
                <input type="text" class="text-input" value={cssVarsState.cssVars[row.key]} onchange={handleTextChange} />
            {/if}
        </div>
    </div>
{/if}
