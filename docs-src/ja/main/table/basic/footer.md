# フッター集計行 <Badge type="tip" text="^0.11.0" />

* `props.footerData` でフッター集計行データを設定します。
* `props.footerConfig` でフッター位置と動作を設定します。

`footerData` は配列で、各要素はフッター行を表します。データ構造は `dataSource` 类似しており、フィールド名は列のdataIndexに対応しています。

## 基本使用

`props.footerData` を直接渡します：
```svelte
<script lang="ts">
let footerData = $state<Data[]>([
    { name: '合計', age: 84, salary: 26000, bonus: 7000, },
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

## 上部に吸着

フッターをテーブル上部に吸着させます：

```svelte
<StkTable
    footerData={footerData}
    footerConfig={{ position: 'top' }} //[!code ++]
></StkTable>
```

<demo svelte="basic/footer/FooterTop.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/footer/FooterTop.svelte"></demo>

## マルチレベルヘッダーサポート

フッターはマルチレベルヘッダーの下で正しく位置合わせされます：

<demo svelte="basic/footer/FooterMultiHeader.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/footer/FooterMultiHeader.svelte"></demo>

## API

### FooterConfig

| プロパティ | 型 | デフォルト | 説明 |
|----------|------|---------|-------------|
| position | `'bottom'` \| `'top'` | `'bottom'` | フッター吸着位置 |

### FooterData

配列で、各要素はフッター行を表します。データ構造は列定義と一致している必要があります。
