# 커스텀 셀

* `StkTableColumn['customCell']`를 통해 **테이블 본문** 셀 콘텐츠를 커스텀할 수 있습니다.
* `StkTableColumn['customHeaderCell']`를 통해 **테이블 헤더** 셀 콘텐츠를 커스텀할 수 있습니다.

`customCell`과 `customHeaderCell`의 사용 방식은 기본적으로 동일하며, 아래에서는 `customCell`을 예제로 설명합니다.

::: warning 권장
* `customCell`에는 외부 요소(div, span 등)로 감싸는 것을 권장합니다. 그렇지 않으면 &lt;td&gt; 하위 노드가 `TextNode`여서 레이아웃 문제가 발생할 수 있습니다.
* `customCell`의 루트 요소에는 **신중하게** `inline`/`inline-block`/`inline-flex` 등의 인라인 요소를 설정하지 마세요. 이 레이아웃은 **가상 리스트**에서 행 높이를撑开할 수 있습니다.
:::

### Svelte 컴포넌트를 사용하여
Svelte 컴포넌트를 전달하는 것을 지원하며, 컴포넌트의 props는 `CustomCellProps` 타입으로 특별히 정의해야 합니다.

::: tip 모범 사례
columns를 별도의 파일에 작성하여 내보내서 사용하세요.
:::

::: code-group
```ts [column.ts]
import { StkTableColumn } from 'stk-table-svelte/src/StkTable/index';
import type { DataType } from './types';
import YieldCell from './YieldCell.svelte';
export const columns: StkTableColumn<DataType> = [{
    title: '수익률',
    dataIndex: 'yield',
    customCell: YieldCell
}]
```
```svelte [YieldCell.svelte]
<script lang="ts">
    import type { DataType } from './types';
    import type { CustomCellProps } from 'stk-table-svelte/src/StkTable/types/index';

    // svelte는 속성 투과(attribute fallthrough)가 없어 class/tabindex를 명시적으로 수신하여 적용해야 합니다
    let { class: classNameProp, tabindex, cellValue }: CustomCellProps<DataType> & { class?: string; tabindex?: number } = $props();

    let className = $derived.by(() => {
        let name = '';
        if (cellValue > 0) {
            name = 'color-up';
        } else if (cellValue < 0) {
            name = 'color-down';
        }
        return name;
    });
</script>

<span class="{classNameProp} {className}" {tabindex}>{cellValue > 0 ? '+' : ''}{(cellValue * 100).toFixed(4)}%</span>

<style>
    :global(.color-up) {
        color: #2fc87b;
    }
    :global(.color-down) {
        color: #ff2b48;
    }
</style>
```
```ts [types.ts]
export type DataType = {
    name: string;
    yield: number;
};

```
:::

<demo svelte="advanced/custom-cell/CustomCell/index.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/custom-cell/CustomCell/index.svelte"></demo>

### 컴포넌트가 수신하는 props
Svelte에는 vue의 속성 투과(attribute fallthrough) 메커니즘이 없어, `customCell` 컴포넌트는 다음 props를 수신합니다. 그중 `class`, `tabindex`는 명시적으로 수신하여 루트 요소에 적용해야 합니다:

| prop | 설명 |
|---|---|
| class | 셀 콘텐츠 class, 루트 요소에 적용 필요 |
| tabindex | 키보드 내비게이션에 필요한 tabindex, 루트 요소에 적용 필요 |
| col | 열 설정 |
| row | 행 데이터 |
| rowIndex | 행 인덱스 |
| colIndex | 열 인덱스 |
| cellValue | `row[col.dataIndex]`의 값 |
| expanded | 현재 행이 전개되었는지 여부 |
| treeExpanded | 트리 노드 현재 행이 전개되었는지 여부 |
| onTriangleClick | 트리 노드 전개/접기 콜백 (`type: 'tree-node'` 열) |
| onDragStart | 행 드래그 시작 콜백 (`type: 'dragRow'` 열) |



## API
| 속성 | props | 기본값 | 설명 |
|---|---|---|---|
| customCell | Component&lt;Partial&lt;CustomCellProps&gt;&gt; | - | 커스텀 셀 렌더링 컴포넌트 |
| customHeaderCell | Component&lt;Partial&lt;CustomHeaderCellProps&gt;&gt; | - | 커스텀 테이블 헤더 렌더링 컴포넌트 |

### types
customCell props 타입
```ts
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** row[col.dataIndex]의 값 */
    cellValue: any;
    rowIndex: number;
    /** 
     * 열 인덱스(0부터 시작).
     * 
     * 주의:
     * virtual-x에서, 그렇지 않으면 가상 리스트 내의 열 인덱스를 나타냅니다
     */
    colIndex: number;
    /**
     * 현재 행이 전개되었는지 여부
     * - 미전개: null
     * - 전개됨: 열 설정 반환
     */
    expanded?: StkTableColumn<any>;
    /** 트리 노드 현재 행이 전개되었는지 여부 */
    treeExpanded?: boolean;
};

export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    /** 
     * 열 인덱스(0부터 시작).
     * 
     * 주의:
     * virtual-x에서, 그렇지 않으면 가상 리스트 내의 열 인덱스를 나타냅니다
     */
    colIndex: number;
};

```
