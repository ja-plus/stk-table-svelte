# 기본

* `props.columns` 열 설정.
* `props.dataSource` 데이터 소스 설정.
* `props.rowKey` 행 고유 식별자 설정.
* css style 테이블 높이 설정.

```svelte
<script lang="ts">
import { StkTable } from 'stk-table-svelte';
import type { StkTableColumn } from 'stk-table-svelte';

type Data = {
    name: string;
    age: number;
    address: string;
    gender: 'male' | 'female';
};

const columns: StkTableColumn<Data>[] = [
    { type: 'seq', title: 'No.', dataIndex: '' as any, width: 50 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age', headerAlign: 'right', align: 'right' },
    { title: 'Gender', dataIndex: 'gender', align: 'center' },
    { title: 'Address', dataIndex: 'address' },
];

let dataSource = $state<Data[]>([
    { name: `Jack`, age: 18, address: `Beijing Forbidden City `, gender: 'male' },
    { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
    { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
    { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
]);
</script>

<StkTable style="height: 200px" rowKey="name" {columns} {dataSource}></StkTable>
```

<demo svelte="basic/Basic.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/Basic.svelte"></demo>
