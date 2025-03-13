import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // Base public path - important for service worker scope
    base: '/',
    build: {
        // Ensure sourcemaps for easier debugging
        sourcemap: true,
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
    server: {
        // PWAs work better with HTTPS, enable if you have certificates
        // https: true
    },
    // Copy manifest and other static assets to build output
    publicDir: 'public',
}); 