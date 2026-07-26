<script lang="ts">
    let { row, __set }: { row?: any; col?: any; cellValue?: any; __set?: Set<any> } = $props();
    let checked = $derived(__set?.has(row?.value) ?? false);
</script>

<input type="checkbox" checked={checked} />
