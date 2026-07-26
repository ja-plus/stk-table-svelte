# Start

## Try Online Editor

[<span style="font-size: 16px;font-weight: bold;">Online Editing Example</span>](https://stackblitz.com/edit/vitejs-vite-ad91hh?file=src%2FDemo%2Findex.vue)

## npm Installation

```sh
$ npm install stk-table-svelte
```

## Import

main
```ts
import 'stk-table-svelte/lib/style.css';
```

Import when using svelte components, beneficial for ts recognition.
```svelte
<script lang="ts">
import { StkTable } from 'stk-table-svelte';
</script>

<StkTable></StkTable>
```

## Simple Demo
```svelte
<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { StkTable } from 'stk-table-svelte';
import type { StkTableColumn } from 'stk-table-svelte';

let stkTableRef: StkTable | undefined;

type DataType = {
    id: string;
    name: string;
    age: number;
    address: string;
};
const columns: StkTableColumn<DataType>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age', align: 'right' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
];
const dataSource: DataType[] = [
    { id: 'k1', name: 'Tom', age: 18, address: 'Beijing' },
    { id: 'k2', name: 'Jerry', age: 19, address: 'Shanghai' },
    { id: 'k3', name: 'Jack', age: 20, address: 'London' },
    { id: 'k4', name: 'Rose', age: 22, address: 'New York' },
];
let interval = 0;
onMount(() => {
    interval = window.setInterval(() => {
        stkTableRef?.setHighlightDimRow(['k1']);
    }, 2000);
});

onDestroy(() => {
    window.clearInterval(interval);
});
</script>

<StkTable bind:this={stkTableRef} rowKey="id" {columns} {dataSource}></StkTable>
```

Running Result
<demo svelte="start/Start.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/start/Start.svelte"></demo>


