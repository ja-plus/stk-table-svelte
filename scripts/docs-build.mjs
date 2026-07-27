import { build } from 'vitepress';

// VitePress 2.x 底层使用 vite 8 / rolldown，构建结束后 rolldown 残留的
// 并行插件 worker（worker_threads）/ 原生线程不会被回收，导致 Node 进程
// 无法自然退出，`vitepress build` 会一直挂起（CI 流水线因此卡住不结束）。
// 这里改用编程式 API，在构建完成后主动退出进程。
const root = process.argv[2] || 'docs-src';

try {
    await build(root);
} catch (err) {
    console.error(err);
    process.exit(1);
}

// 留出极短窗口让管道中的剩余输出冲刷完毕，再强制退出
setTimeout(() => process.exit(0), 100);
