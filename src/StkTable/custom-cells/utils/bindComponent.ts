/**
 * 将编译后的 Svelte 组件包装为预绑定部分 props 的新组件。
 *
 * Svelte 5 编译产物本质是 `(anchor, props) => exports` 函数（`mount` 内部即直接调用），
 * 因此可以通过函数包装实现类似 Vue `h(Comp, boundProps)` 的 props 闭包绑定，
 * 且渲染/销毁完全跟随外层块的生命周期（虚拟滚动移除时自动清理）。
 */
export function bindComponentProps(Base: any, boundProps: Record<string, any>): any {
    return function BoundComponent(this: void, anchor: any, props: any) {
        return Base(anchor, { ...boundProps, ...props });
    };
}
