import { mount } from 'svelte';

let DropdownIns: any = null;

/**
 * 获取全局唯一的筛选下拉实例（懒挂载到 body）。
 * 等价于 Vue 版本的 createApp(Dropdown).mount(div)。
 */
export async function getDropdownIns() {
    if (!DropdownIns) {
        const div = document.createElement('div');
        div.classList.add('stk-filter-dropdown-wrapper');
        document.body.appendChild(div);

        const DropdownComp = await import('./Dropdown.svelte').then(module => module.default);
        DropdownIns = mount(DropdownComp, { target: div });
    }
    return DropdownIns;
}
