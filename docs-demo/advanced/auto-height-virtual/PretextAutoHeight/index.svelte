<script lang="ts">
    import { onMount } from 'svelte';
    import type { StkTableColumn } from '../../../../src/StkTable/index';
    import StkTable from '../../../StkTable.svelte';
    import type { DataType } from './types';
    import { getIsZH } from '../../../hooks/getIsZH';

    const isZH = getIsZH();
    let stkTableRef: any;

    // 环境未安装 mockjs，用本地随机文本生成器等价替代 mockjs.Random 的 cparagraph/paragraph/datetime
    const CN_CHARS = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严';
    let seed = 20240602;
    function rand() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }
    function randInt(min: number, max: number) {
        return min + Math.floor(rand() * (max - min + 1));
    }
    function cword(len: number) {
        let s = '';
        for (let i = 0; i < len; i++) s += CN_CHARS[randInt(0, CN_CHARS.length - 1)];
        return s;
    }
    function word() {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        let s = '';
        const len = randInt(3, 10);
        for (let i = 0; i < len; i++) s += letters[randInt(0, 25)];
        return s;
    }
    function csentence(min: number, max: number) {
        return cword(randInt(min, max) * randInt(2, 6)) + '。';
    }
    function sentence(min: number, max: number) {
        const n = randInt(min, max) * randInt(3, 8);
        const words = new Array(n).fill(0).map(() => word());
        words[0] = words[0][0].toUpperCase() + words[0].slice(1);
        return words.join(' ') + '.';
    }
    function cparagraph(min: number, max: number) {
        const n = randInt(min, max);
        return new Array(n)
            .fill(0)
            .map(() => csentence(1, 5))
            .join('');
    }
    function paragraph(min: number, max: number) {
        const n = randInt(min, max);
        return new Array(n)
            .fill(0)
            .map(() => sentence(1, 5))
            .join(' ');
    }
    function datetime(format: string) {
        const y = randInt(2000, 2024);
        const M = randInt(1, 12);
        const d = randInt(1, 28);
        const pad = (n: number) => String(n).padStart(2, '0');
        return format.replace('yyyy', String(y)).replace('MM', pad(M)).replace('dd', pad(d));
    }

    const columns: StkTableColumn<DataType>[] = [
        { dataIndex: 'id', title: 'ID', width: 26, align: 'center' },
        { dataIndex: 'content', title: 'Content', width: 200 },
        { dataIndex: 'date', title: 'Date', width: 70, align: 'center' },
    ];

    const data = new Array(100).fill(0).map((_, i) => ({
        id: i,
        content: isZH ? cparagraph(1, 8) : paragraph(1, 3),
        date: isZH ? datetime('yyyy-MM-dd') : datetime('MM/dd/yyyy'),
    }));

    onMount(() => {
        preCalculateAllRowHeights();
    });

    // 环境未安装 @chenglou/pretext，用 canvas measureText 估算文本布局高度做等价替代
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d')!;

    /**
     * 计算文本在指定宽度下的高度（等价替代 pretext 的 prepare/layout）
     */
    function calculateHeightWithPretext(text: string, width: number): number {
        measureCtx.font = '14px system-ui';
        const textWidth = measureCtx.measureText(text).width;
        const lines = Math.max(Math.ceil(textWidth / width), 1);
        const height = lines * 20;
        return Math.max(height + 16, 36); // 加上 cell padding
    }

    /**
     * 预计算所有行的行高
     */
    function preCalculateAllRowHeights() {
        // 通过 DOM 获取第一个单元格的实际宽度
        const firstCell = document.querySelector(
            '.pretext-table [data-col-key="content"] .table-cell-wrapper',
        );
        const contentColumnWidth = firstCell ? firstCell.clientWidth : 184;
        data.forEach(row => {
            const height = calculateHeightWithPretext(row.content, contentColumnWidth);
            stkTableRef?.setAutoHeight(row.id, height);
        });
    }

    function autoResize() {
        preCalculateAllRowHeights();
    }
</script>

<StkTable
    bind:this={stkTableRef}
    class="pretext-table"
    rowKey="id"
    style="height: 400px"
    stripe
    virtual
    autoRowHeight
    rowHeight={50}
    {columns}
    dataSource={data}
    {autoResize}
></StkTable>

<style>
    :global(.v-head) {
        background-color: #333;
        font-weight: bold;
    }

    :global(.pretext-table.stk-table) {
        line-height: 20px;
    }
</style>
