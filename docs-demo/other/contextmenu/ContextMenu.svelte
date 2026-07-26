<script lang="ts">
    import type { StkTableColumn } from '../../../src/StkTable/index';
    import ContextMenu from 'ja-contextmenu';
    import type { MenuOption } from 'ja-contextmenu/lib/types/MenuOption';
    import StkTable from '../../StkTable.svelte';

    import 'ja-contextmenu/styles/dark.css';

    // vue 版通过 vitepress useData().isDark 获取暗色主题，svelte 版监听 html class
    let isDark = $state(false);
    $effect(() => {
        const html = document.documentElement;
        const update = () => (isDark = html.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    });

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

    const contextMenu = new ContextMenu({
        theme: () => (isDark ? 'dark' : ('' as any)),
    });

    const menuOption: MenuOption<Data> = {
        items: [
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
        ],
    };

    const menu = contextMenu.create(menuOption);

    function onRowMenu(event: MouseEvent, row: Data) {
        stkTableRef?.setCurrentRow(row);
        menu.show(event, row);
    }
</script>

<StkTable
    bind:this={stkTableRef}
    style="height: 200px"
    rowKey="id"
    {columns}
    {dataSource}
    onrowmenu={onRowMenu}
></StkTable>
