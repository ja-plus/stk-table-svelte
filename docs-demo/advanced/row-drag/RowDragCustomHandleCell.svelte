<script lang="ts" module>
    // vue 版此单元格用 h() 内联渲染函数实现；svelte 拆为独立组件文件。
    // 拖拽落点的数据重排回调由父组件通过 setOnDropRow 注册。
    type DropHandler = (sourceIndex: number, endIndex: number) => void;
    let onDropRow: DropHandler = () => {};
    export function setOnDropRow(fn: DropHandler) {
        onDropRow = fn;
    }
</script>

<script lang="ts">
    let {
        class: classNameProp,
        tabindex,
        rowIndex,
    }: { class?: string; tabindex?: number; rowIndex?: number } = $props();

    function handleDragStart(e: DragEvent, startIndex: number) {
        const target = e.target as HTMLElement;
        const tr = target.closest('tr');
        if (tr) {
            e.dataTransfer?.setDragImage(tr, 50, 10);
            tr.style.opacity = '0.5';
        }
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('sourceIndex', String(startIndex)); // 保存拖动开始的位置
        }
    }

    function handleDragEnd(e: DragEvent) {
        const target = e.target as HTMLElement;
        const tr = target.closest('tr');
        if (tr) {
            tr.style.opacity = '1';
        }
    }
    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
    }
    function handleDragEnter(e: DragEvent) {
        addHoverStyle(e.target as HTMLElement);
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        const target = e.target as HTMLElement;
        if (target.classList.contains('custom-drag-handle')) {
            removeHoverStyle(target);
        }
    }

    function handleDrop(e: DragEvent, endIndex: number) {
        removeHoverStyle(e.target as HTMLElement);
        const sourceIndex = Number(e.dataTransfer?.getData('sourceIndex'));
        if (isNaN(sourceIndex) || sourceIndex === endIndex) return;
        onDropRow(sourceIndex, endIndex);
    }

    function addHoverStyle(target: HTMLElement) {
        const tr = target.closest('tr');
        if (tr) {
            tr.style.boxShadow = 'inset 0 -2px 0 0 #1d63d9';
        }
    }
    function removeHoverStyle(target: HTMLElement) {
        const tr = target.closest('tr');
        if (tr) {
            tr.style.removeProperty('box-shadow');
        }
    }
</script>

<div
    draggable="true"
    class="{classNameProp} custom-drag-handle"
    {tabindex}
    role="button"
    ondragstart={e => handleDragStart(e, rowIndex!)}
    ondragover={e => handleDragOver(e)}
    ondragleave={e => handleDragLeave(e)}
    ondragenter={e => handleDragEnter(e)}
    ondragend={e => handleDragEnd(e)}
    ondrop={e => handleDrop(e, rowIndex!)}
>
    <div class="point-wrapper">
        <div class="point"></div>
        <div class="point"></div>
        <div class="point"></div>
        <div class="point"></div>
    </div>
</div>
