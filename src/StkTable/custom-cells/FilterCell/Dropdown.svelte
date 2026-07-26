<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import StkTable from '../../StkTable.svelte';
    import type { StkTableColumn } from '../../types/index';
    import { bindComponentProps } from '../utils/bindComponent';
    import type { FilterOption } from './types';
    import DropdownCheckbox from './DropdownCheckbox.svelte';
    import { SvelteSet } from 'svelte/reactivity';

    let theme = $state<'light' | 'dark'>('light');
    const checkedTempValueSet = new SvelteSet<FilterOption['value']>();

    const columns: StkTableColumn<FilterOption>[] = [
        {
            title: '',
            dataIndex: 'value',
            width: 30,
            className: 'stk-filter-dropdown-checkbox',
            customCell: bindComponentProps(DropdownCheckbox, { __set: checkedTempValueSet }),
        },
        { title: '', dataIndex: 'label' },
    ];

    let visible = $state(false);
    let position = $state<{ x: number; y: number }>({ x: 0, y: 0 });
    let options = $state.raw<FilterOption[]>([]);

    let dropdownEl = $state<HTMLDivElement | undefined>(undefined);

    const DROPDOWN_DEFAULT_WIDTH = 300; // 默认宽度（用于首次计算）
    const DROPDOWN_DEFAULT_HEIGHT = 400; // 默认高度（用于首次计算）
    const PADDING = 6; // 与屏幕边缘的安全距离

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onDestroy(() => {
        document.removeEventListener('click', handleClickOutside);
    });

    let onConfirmFn: (values: FilterOption['value'][]) => void;

    function getDropdownSize() {
        if (!dropdownEl) {
            return [DROPDOWN_DEFAULT_WIDTH, DROPDOWN_DEFAULT_HEIGHT] as const;
        }
        const rect = dropdownEl.getBoundingClientRect();
        return [rect.width || DROPDOWN_DEFAULT_WIDTH, rect.height || DROPDOWN_DEFAULT_HEIGHT] as const;
    }

    function calculatePosition(docPos: { x: number; y: number; height?: number }) {
        // docPos 是相对于文档的坐标（已包含滚动偏移）
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;

        const [dropdownWidth, dropdownHeight] = getDropdownSize();

        let finalX = docPos.x;
        let finalY = docPos.y;

        // 检测是否超出右边界（相对于视口）
        const relativeX = docPos.x - scrollLeft;
        if (relativeX + dropdownWidth > viewportWidth - PADDING) {
            finalX = viewportWidth - dropdownWidth - PADDING + scrollLeft;
        }

        // 检测是否超出下边界（相对于视口）
        const relativeY = docPos.y - scrollTop;
        if (relativeY + dropdownHeight > viewportHeight - PADDING) {
            // 如果下方空间不足，尝试在上方显示
            const triggerHeight = docPos.height || 30;
            if (relativeY - triggerHeight >= dropdownHeight + PADDING) {
                // 上方空间足够，在触发元素上方显示
                finalY = docPos.y - triggerHeight - dropdownHeight - PADDING;
            } else {
                // 上方空间也不足，使用最大可用空间（从视口顶部开始）
                finalY = PADDING + scrollTop;
            }
        }

        // 确保不会超出左边界和上边界
        finalX = Math.max(PADDING + scrollLeft, finalX);
        finalY = Math.max(PADDING + scrollTop, finalY);

        return { x: finalX, y: finalY };
    }

    export async function show(pos: { x: number; y: number; height?: number }, opt: FilterOption[], onConfirm: (values: FilterOption['value'][]) => void) {
        if (dropdownEl) {
            dropdownEl.style.visibility = 'hidden';
        }
        visible = true;
        options = opt || [];
        initChecked();
        onConfirmFn = onConfirm;
        await tick();
        position = calculatePosition(pos);
        if (dropdownEl) {
            dropdownEl.style.visibility = 'visible';
        }
    }

    async function handleClickOutside(e: MouseEvent) {
        if (!visible || dropdownEl?.contains(e.target as Node)) return;
        hide();
    }

    function initChecked() {
        options.forEach(opt => {
            if (opt.selected) {
                checkedTempValueSet.add(opt.value);
            }
        });
    }

    function updateChecked(checked: boolean, row: FilterOption) {
        if (checked) {
            checkedTempValueSet.add(row.value);
        } else {
            checkedTempValueSet.delete(row.value);
        }
    }

    function confirm() {
        options.forEach(opt => (opt.selected = checkedTempValueSet.has(opt.value)));
        onConfirmFn(Array.from(checkedTempValueSet));
        hide();
    }

    export function hide() {
        visible = false;
        options = [];
        checkedTempValueSet.clear();
    }

    function handleRowClick(e: MouseEvent, row: FilterOption) {
        const selected = checkedTempValueSet.has(row.value);
        updateChecked(!selected, row);
    }

    export function setTheme(t: 'light' | 'dark') {
        theme = t;
    }

    function handleClear() {
        checkedTempValueSet.clear();
        confirm();
    }

    export function isVisible() {
        return visible;
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={dropdownEl}
    class="stk-filter-dropdown stk-filter-dropdown--{theme}"
    style="top:{position.y}px;left:{position.x}px;{visible ? '' : 'display:none;'}"
    onclick={(e: MouseEvent) => e.stopPropagation()}
    role="dialog"
>
    <StkTable
        rowKey="id"
        headless
        virtual
        noDataFull
        {theme}
        rowActive={false}
        rowHeight={20}
        bordered={false}
        {columns}
        dataSource={options}
        onrowclick={handleRowClick}
    />
    <footer>
        <button onclick={handleClear}>↺</button>
        <button onclick={confirm}>✓</button>
    </footer>
</div>
