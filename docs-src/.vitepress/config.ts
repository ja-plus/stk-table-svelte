import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { defineConfig } from 'vitepress';
import { vitepressDemoPlugin } from 'vitepress-demo-plugin/markdown';
import { enConfig } from './src/config/en';
import { jaConfig } from './src/config/ja';
import { koConfig } from './src/config/ko';
import { zhConfig } from './src/config/zh';


// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/stk-table-svelte/',
    title: 'StkTableSvelte',
    description: '一个基于Svelte的高性能虚拟列表',
    lastUpdated: true,
    appearance: 'dark',
    head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/stk-table-svelte/assets/logo.svg' }]],
    locales: {
        root: {
            label: '中文',
            ...zhConfig,
        },
        en: {
            label: 'English',
            ...enConfig,
        },
        ja: {
            label: '日本語',
            ...jaConfig,
        },
        ko: {
            label: '한국어',
            ...koConfig,
        },
    },
    themeConfig: {
        logo: '/assets/logo.svg',
        search: {
            provider: 'local',
        },
    },
    markdown: {
        config(md) {
            md.use(vitepressDemoPlugin, {
                demoDir: path.resolve(__dirname, '../../docs-demo'),
            });
        },
    },
    vite: {
        plugins: [svelte()],
    },
});
