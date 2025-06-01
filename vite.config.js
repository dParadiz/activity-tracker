import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue({
            isProduction: true,
            script: {
                defineModel: true,
                propsDestructure: true
            }
        }),
        vueDevTools(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern",
                quietDeps: true, // Suppress Sass deprecation warnings
            },
        },
    },
    server: {
        host: true,
        cors: true, // For local frameapp
    },
    build: {
        // Generate relative paths for assets
        assetsDir: './assets',
        rollupOptions: {
            output: {
                assetFileNames: '[name]-[hash][extname]',
                chunkFileNames: '[name]-[hash].js',
                entryFileNames: '[name]-[hash].js',
            },
        },
        base: './', // Use relative paths
        outDir: 'docs/',
        emptyOutDir: true, // also necessary
    },



})