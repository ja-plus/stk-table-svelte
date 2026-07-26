# 푸터 요약 행

* `props.footerData` 푸터 요약 행 데이터를 설정합니다.
* `props.footerConfig` 푸터 위치와 동작을 설정합니다.

`footerData`는 배열이며, 각 요소는 한 행의 푸터 데이터를 나타냅니다. 데이터 구조는 `dataSource`와 유사하며, 필드 이름은 열의 dataIndex에 대응합니다.

## 기본 사용법

`props.footerData`를 전달하면 됩니다:
```svelte
<script lang="ts">
let footerData = $state<Data[]>([
    { name: '총계', age: 84, salary: 26000, bonus: 7000, },
]);
</script>

<StkTable
    rowKey="name"
    {columns}
    {dataSource}
    footerData={footerData} //[!code ++]
></StkTable>
```

<demo svelte="basic/footer/Footer.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/footer/Footer.svelte"></demo>


## 상단에 고정하기

푸터를 테이블 상단에 고정할 수 있습니다:

```svelte
<StkTable
    footerData={footerData}
    footerConfig={{ position: 'top' }} //[!code ++]
></StkTable>
```

<demo svelte="basic/footer/FooterTop.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/footer/FooterTop.svelte"></demo>

## 다중 헤더 지원

푸터는 다중 헤더 아래에 올바르게 위치할 수 있습니다:

<demo svelte="basic/footer/FooterMultiHeader.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/footer/FooterMultiHeader.svelte"></demo>

## API

### FooterConfig

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| position | `'bottom'` \| `'top'` | `'bottom'` | 푸터 고정 위치 |

### FooterData

배열이며, 각 요소는 한 행의 푸터 데이터를 나타냅니다. 데이터 구조는 열 정의와 일치해야 합니다.
