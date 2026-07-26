# 빠른 시작

## 온라인 에디터에서 시도하기

[<span style="font-size: 16px;font-weight: bold;">온라인 편집 예시</span>](https://stackblitz.com/edit/vitejs-vite-ad91hh?file=src%2FDemo%2Findex.vue)

## npm 설치

```sh
$ npm install stk-table-svelte
```

## 가져오기

main
```ts
import 'stk-table-svelte/lib/style.css';
```

svelte 컴포넌트를 사용하는 경우 가져오기 (ts 인식에有利)
```svelte
<script lang="ts">
import { StkTable } from 'stk-table-svelte';
</script>

<StkTable></StkTable>
```

## 간단한 데모
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
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '나이', dataIndex: 'age', key: 'age' },
];
const dataSource: DataType[] = [
    { id: 'k1', name: '김철수', age: 18 },
    { id: 'k2', name: '이영희', age: 19 },
    { id: 'k3', name: '박민수', age: 20 },
];
let interval = 0;
onMount(() => {
    // 지정한 id의 행 강조
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

실행 결과
<demo svelte="start/Start.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/start/Start.svelte"></demo>
