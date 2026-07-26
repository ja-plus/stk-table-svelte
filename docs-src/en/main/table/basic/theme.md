# Theme
Built-in `light` and `dark` themes.

Switch theme by `props.theme` = `light`|`dark`. Corresponding to style selectors, `.stk-table.light` `.stk-table.dark` 

You can click the theme switch button in the top right corner of the page to see the effect.

<demo svelte="basic/stripe/Stripe.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/stripe/Stripe.svelte"></demo>

## CSS Variables

StkTable provides rich CSS variables that allow you to customize the table style. You can achieve personalized customization by overriding these variables.

### Interactive Demo

Below is an interactive demo where you can adjust CSS variables in real-time and see the effects:

<demo svelte="basic/theme/CssVarsDemo.svelte" github="https://github.com/ja-plus/stk-table-svelte/tree/master/docs-demo/basic/theme/CssVarsDemo.svelte"></demo>

### Usage Example

```svelte
<script>
let customVars = $state({
    '--row-height': '36px',
    '--border-color': '#e0e0e0',
    '--td-bgc': '#fafafa',
    '--th-bgc': '#f0f0f0',
    '--highlight-color': '#ff5722',
});

const tableStyle = $derived(
    Object.entries(customVars)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; '),
);
</script>

<StkTable style={tableStyle} {columns} dataSource={data} />
```

Or override via CSS:

```css
.my-custom-table {
    --row-height: 36px;
    --border-color: #e0e0e0;
    --td-bgc: #fafafa;
    --th-bgc: #f0f0f0;
    --highlight-color: #ff5722;
}
```
