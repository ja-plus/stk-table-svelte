<script lang="ts" generics="T">
    let {
        text,
        options = [],
        name = /**hash */ Math.random().toString(36).substring(7),
        value = $bindable(),
        onchange,
    }: {
        text: string;
        options?: { label: string; value: T }[];
        name?: string;
        value?: T;
        onchange?: (value: T | undefined) => void;
    } = $props();

    function handleInputChange() {
        onchange?.(value);
    }
</script>

<div class="radio-group">
    <span class="main-label">{text}:</span>
    {#each options as option, i (i)}
        <label>
            <input type="radio" {name} bind:group={value} value={option.value} onchange={handleInputChange} />
            <span>{option.label}</span>
        </label>
    {/each}
</div>

<style>
    .main-label {
        font-weight: bold;
    }
</style>
