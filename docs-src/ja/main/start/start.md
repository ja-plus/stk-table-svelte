# クイックスタート

## オンラインエディタで試す

[<span style="font-size: 16px;font-weight: bold;">オンライン編集例</span>](https://stackblitz.com/edit/vitejs-vite-ad91hh?file=src%2FDemo%2Findex.vue)

## npm インストール

```sh
$ npm install stk-table-svelte
```

## インポート

main
```ts
import 'stk-table-svelte/lib/style.css';
```

svelte コンポーネントを使用する場合はインポート（ts認識に有利）
```svelte
<script lang="ts">
import { StkTable } from 'stk-table-svelte';
</script>

<StkTable></StkTable>
```

## シンプルなデモ
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
};
const columns: StkTableColumn<DataType>[] = [
    { title: '名前', dataIndex: 'name', key: 'name' },
    { title: '年齢', dataIndex: 'age', key: 'age' },
];
const dataSource: DataType[] = [
    { id: 'k1', name: '田中', age: 18 },
    { id: 'k2', name: '佐藤', age: 19 },
    { id: 'k3', name: '鈴木', age: 20 },
];
let interval = 0;
onMount(() => {
    // 指定したidの行をハイライト
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

実行結果
<demo svelte="start/Start.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/start/Start.svelte"></demo>
