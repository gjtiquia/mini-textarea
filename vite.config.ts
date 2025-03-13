import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                'service-worker': resolve(__dirname, 'src/service-worker.ts'),
            },
            output: {
                entryFileNames: (assetInfo) => {
                    return assetInfo.name === 'service-worker' ? '[name].js' : 'assets/[name]-[hash].js';
                },
            },
        },
    },
}); 