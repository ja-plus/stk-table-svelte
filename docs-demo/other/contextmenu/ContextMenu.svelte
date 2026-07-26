<script lang="ts">
    import { onMount } from 'svelte';
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import StkTable from '../../StkTable.svelte';

    type Data = {
        id: number;
        name: string;
        age: number;
        department: string;
    };

    let stkTableRef = $state<StkTable | null>(null);

    const columns: StkTableColumn<Data>[] = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', width: 120 },
        { title: 'Age', dataIndex: 'age', width: 80 },
        { title: 'Department', dataIndex: 'department', width: 120 },
    ];

    let dataSource = $state<Data[]>([
        { id: 1, name: 'Zhang San', age: 18, department: 'Technical Department' },
        { id: 2, name: 'Li Si', age: 20, department: 'Marketing Department' },
        { id: 3, name: 'Wang Wu', age: 22, department: 'Technical Department' },
        { id: 4, name: 'Zhao Liu', age: 24, department: 'Finance Department' },
        { id: 5, name: 'Qian Qi', age: 26, department: 'Technical Department' },
    ]);

    // 本地最小上下文菜单实现（等价替代 ja-contextmenu，暗色主题由 vitepress CSS 变量自动跟随）
    let menuVisible = $state(false);
    let menuX = $state(0);
    let menuY = $state(0);
    let menuPayload = $state<Data | null>(null);

    type MenuItem = {
        label: string | ((payload: Data) => string);
        onclick: (e: Event, payload: Data) => void;
    };
    const menuItems: MenuItem[] = [
        {
            label: 'View Details',
            onclick: (e: Event, payload: Data) => {
                alert(`View details of ${payload.name}`);
            },
        },
        {
            label: (payload: Data) => `Delete ${payload.name}`,
            onclick: (e: Event, payload: Data) => {
                if (confirm(`Are you sure to delete the record of ${payload.name}?`)) {
                    dataSource = dataSource.filter(item => item.id !== payload.id);
                }
            },
        },
    ];

    function showMenu(event: MouseEvent, payload: Data) {
        event.preventDefault();
        menuPayload = payload;
        menuX = event.clientX;
        menuY = event.clientY;
        menuVisible = true;
    }

    function hideMenu() {
        menuVisible = false;
    }

    function onMenuItemClick(e: Event, item: MenuItem) {
        if (menuPayload) item.onclick(e, menuPayload);
        hideMenu();
    }

    function onRowMenu(event: MouseEvent, row: Data) {
        stkTableRef?.setCurrentRow(row);
        showMenu(event, row);
    }

    onMount(() => {
        window.addEventListener('click', hideMenu);
        window.addEventListener('scroll', hideMenu, true);
        return () => {
            window.removeEventListener('click', hideMenu);
            window.removeEventListener('scroll', hideMenu, true);
        };
    });
</script>

<StkTable
    bind:this={stkTableRef}
    style="height: 200px"
    rowKey="id"
    {columns}
    {dataSource}
    onrowmenu={onRowMenu}
></StkTable>

{#if menuVisible && menuPayload}
    <ul class="demo-contextmenu" style="left: {menuX}px; top: {menuY}px">
        {#each menuItems as item}
            <li class="demo-contextmenu__item">
                <button type="button" onclick={e => onMenuItemClick(e, item)}>
                    {typeof item.label === 'function' ? item.label(menuPayload) : item.label}
                </button>
            </li>
        {/each}
    </ul>
{/if}

<style>
    .demo-contextmenu {
        position: fixed;
        z-index: 1000;
        margin: 0;
        padding: 4px 0;
        list-style: none;
        min-width: 140px;
        background-color: var(--vp-c-bg-elv, #fff);
        color: var(--vp-c-text-1, #333);
        border: 1px solid var(--vp-c-divider, #e5e5e5);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .demo-contextmenu__item button {
        display: block;
        width: 100%;
        padding: 6px 16px;
        text-align: left;
        background: none;
        border: none;
        color: inherit;
        font-size: 14px;
        cursor: pointer;
    }

    .demo-contextmenu__item button:hover {
        background-color: var(--vp-c-default-soft, #f0f9ff);
    }
</style>
