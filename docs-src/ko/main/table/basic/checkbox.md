# 다중 선택상자
## 내장 확장 기능 사용
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## 직접 구현

`customCell`과 `customHeaderCell` 설정 항목을 통해 다중 선택상자 기능을 구현합니다. 이 방식은 매우 유연하여 다양한 비즈니스 요구를 충족시킬 수 있습니다.
## 예시

<demo svelte="basic/checkbox/Checkbox.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/checkbox/Checkbox.svelte"></demo>

## 코드 구현

columns 설정에 다중 선택상자를 표시하는 커스텀 열을 추가합니다:

```svelte
<!-- CheckboxHeaderCell.svelte -->
<script lang="ts">
    let { dataSource }: any = $props();

    const isCheckAll = $derived(dataSource.length > 0 && dataSource.every((item: any) => item._isChecked));

    const isCheckPartial = $derived.by(() => {
        const checkedCount = dataSource.filter((item: any) => item._isChecked).length;
        return checkedCount > 0 && checkedCount < dataSource.length;
    });

    function handleChange(e: Event) {
        const checked = (e.target as HTMLInputElement).checked;
        dataSource.forEach((item: any) => {
            item._isChecked = checked;
        });
    }
</script>

<span>
    <input
        type="checkbox"
        style="vertical-align:middle"
        checked={isCheckAll}
        indeterminate={isCheckPartial}
        onchange={handleChange}
    />
</span>

<!-- CheckboxCell.svelte -->
<script lang="ts">
    let { row }: any = $props();

    function handleChange(e: Event) {
        row._isChecked = (e.target as HTMLInputElement).checked;
    }
</script>

<div style="display:flex;align-items:center;justify-content:center">
    <input type="checkbox" checked={row._isChecked} onchange={handleChange} />
</div>
```

```ts
// columns 설정
{
    customHeaderCell: bindComponentProps(CheckboxHeaderCell, { dataSource }),
    customCell: CheckboxCell,
}
```
input 요소 외부에 부모 요소를 추가하여 수직 중앙 정렬합니다.

프로젝트에서 사용하는 svelte 컴포넌트 라이브러리 (shadcn-svelte, Skeleton, Flowbite Svelte 등) 의 `Checkbox` 컴포넌트로 `input` 을 대체하여 다중 선택상자를 구현하고, 프로젝트 전체 스타일 통일을 유지할 수 있습니다.
