# Realtime Merge Cells

Use the `areaSelection` feature to select multiple cells, then right-click to open a context menu for merging or splitting cells in realtime.

## Implementation Approach

1. Enable the `areaSelection` feature and listen to the `onareaselectionchange` event to get selection ranges
2. Listen to the `onrowmenu` event (right-click) to show a custom context menu
3. On "Merge Cells" click, convert the selection range into `rowspan`/`colspan` info stored in a Map
4. The `mergeCells` callback in column config reads merge info from the Map
5. On "Split Cells" click, remove merge info within the selection range

<demo svelte="demos/RealtimeMergeCells/index.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/demos/RealtimeMergeCells/index.svelte"></demo>

## Core Logic

```typescript
// Merge state storage key: `${rowId}__${colIndex}` value: { rowspan, colspan }
const mergeMap = new SvelteMap<string, { rowspan: number; colspan: number }>();

// mergeCells callback in column config
function mergeCells({ row, col }) {
  const colIndex = columns.findIndex(c => c.dataIndex === col.dataIndex);
  return mergeMap.get(`${row.id}__${colIndex}`);
}

// Merge selected cells
function mergeSelectedCells() {
  const range = selectionRanges.at(-1);
  const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
  const startRow = dataSource[minRow];

  // Clear existing merge info within range to avoid conflicts
  for (let r = minRow; r <= maxRow; r++)
    for (let c = minCol; c <= maxCol; c++)
      mergeMap.delete(`${dataSource[r].id}__${c}`);

  // Set merge info on the top-left cell
  mergeMap.set(`${startRow.id}__${minCol}`, {
    rowspan: maxRow - minRow + 1,
    colspan: maxCol - minCol + 1,
  });

  // Force table re-render
  dataSource = dataSource.slice();
}

// Split selected cells
function splitSelectedCells() {
  for (const range of selectionRanges) {
    const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
    for (let r = minRow; r <= maxRow; r++)
      for (let c = minCol; c <= maxCol; c++)
        mergeMap.delete(`${dataSource[r].id}__${c}`);
  }
  dataSource = dataSource.slice();
}
```

::: tip Notes
1. After merging, only the top-left cell content is displayed. Covered cell data remains in the data source and will be restored after splitting
2. A new merge operation automatically clears existing merge info within the selection range to avoid conflicts
3. This approach also works with virtual scrolling mode
:::
