<script lang="ts">
    // 对应 vue 版 action 列的 customHeaderCell：重置全部按钮
    let { resetTitle, onReset }: any = $props();
</script>

<button class="row-reset-btn" title={resetTitle} onclick={() => onReset()}>↺</button>
