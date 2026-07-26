<script lang="ts">
    let {
        text = '--',
        checked = $bindable(false),
        onchange,
    }: {
        text?: string;
        checked?: boolean;
        onchange?: (value: boolean) => void;
    } = $props();

    function handleChange(e: Event) {
        const target = e.target as HTMLInputElement;
        onchange?.(target.checked);
    }
</script>

<label>
    <input bind:checked type="checkbox" onchange={handleChange} />
    <span>{text}</span>
</label>
