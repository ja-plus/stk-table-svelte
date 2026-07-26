# 开始

## 在线编辑器尝试

[<span style="font-size: 16px;font-weight: bold;">在线编辑示例</span>](https://stackblitz.com/edit/vitejs-vite-ad91hh?file=src%2FDemo%2Findex.vue)

## npm 安装

```sh
$ npm install stk-table-svelte
```

## 引入

main
```ts
import 'stk-table-svelte/lib/style.css';
```

svelte 组件使用的时候引入，利于ts识别。
```svelte
<script lang="ts">
import { StkTable } from 'stk-table-svelte';
</script>

<StkTable></StkTable>
```

## 简单demo
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

运行结果
<demo svelte="start/Start.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/start/Start.svelte"></demo>


