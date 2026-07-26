# 列拖动更换顺序

* 配置 `headerDrag` 属性，可以启用列拖动更换顺序的功能。
* `columns` 配置 `onupdatecolumns` 回调回写。

```js
<StkTable
    headerDrag // [!code ++]
    {columns}
    onupdatecolumns={cols => (columns = cols)} // [!code ++]
></StkTable>
```

尝试拖动表头

<demo svelte="advanced/header-drag/HeaderDrag.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/advanced/header-drag/HeaderDrag.svelte"></demo>

## 通过事件更改顺序
```ts
/**
 * 表头列拖动事件
 * ```(dragStartKey: string, targetColKey: string)```
 */
oncolorderchange: (dragStartKey: string, targetColKey: string) => void;
```

这样，您可以不用配置 `onupdatecolumns` 回调，手动更新 `columns` 数组的顺序即可。

## API

### props.headerDrag

```ts
/** header drag config */
export type HeaderDragConfig<DT extends Record<string, any> = any> =
    | boolean
    | {
          /**
           * 列交换模式
           * - none - 不做任何事
           * - insert - 插入(默认值)
           * - swap - 交换
           */
          mode?: 'none' | 'insert' | 'swap';
          /** 禁用拖动的列 */
          disabled?: (col: StkTableColumn<DT>) => boolean;
      };
```

### emit
```ts
/**
 * 表头列拖动事件
 * ```(dragStartKey: string, targetColKey: string)```
 */
oncolorderchange: (dragStartKey: string, targetColKey: string) => void;
/**
 * 表头列拖动开始
 * ```(dragStartKey: string)```
 */
onthdragstart: (dragStartKey: string) => void;
/**
 * 表头列拖动drop
 * ```(targetColKey: string)```
 */
onthdrop: (targetColKey: string) => void;
```
