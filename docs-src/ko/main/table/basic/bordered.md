# 테두리

`bordered` 속성을 사용하여 테이블 테두리를 설정할 수 있습니다.

```svelte
<script lang="ts">
import { StkTable } from 'stk-table-svelte';
import type { StkTableColumn } from 'stk-table-svelte';

type Data = {
    name: string;
    age: number;
};

const columns: StkTableColumn<Data>[] = [
    { type: 'seq', title: 'No.', dataIndex: '' as any, width: 50 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age' },
];

let dataSource = $state<Data[]>([
    { name: 'Jack', age: 18 },
    { name: 'Tom', age: 20 },
    { name: 'Lucy', age: 22 },
]);
</script>

<StkTable bordered style="height: 200px" rowKey="name" {columns} {dataSource}></StkTable>
```
