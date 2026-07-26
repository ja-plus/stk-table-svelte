# Scroll Row by Row
When scrolling the table vertically, only **whole rows** are scrolled, not pixels. This ensures that the table rows are always aligned, improving readability.

Configure `props.scrollRowByRow` to enable this feature.

| Value | Description |
| ---- | ---- |
| boolean | Whether to enable |
| "scrollbar" | Only triggered when dragging the scrollbar. If dragging the scrollbar causes a white screen, this method can be used to reduce the impact |

Scroll the table below and you'll see that the position of the table rows remains relatively unchanged.

<demo svelte="basic/scroll-row-by-row/ScrollRowByRow.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/scroll-row-by-row/ScrollRowByRow.svelte"></demo>
