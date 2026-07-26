<script lang="ts">
    let {
        label,
        suffix = '',
        value = $bindable(0),
        ...rest
    }: {
        label: string;
        suffix?: string;
        value?: number;
        [key: string]: any;
    } = $props();
</script>

<div style="display: inline-flex; align-items: center; margin-right: 10px">
    <span>{label}</span>
    <input bind:value type="range" {...rest} />
    <span>{value} {suffix}</span>
</div>
