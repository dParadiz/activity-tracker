import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {VitePWA} from 'vite-plugin-pwa';
import * as dotenv from 'dotenv';

// Load environment variables explicitly
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'production'}` });


// https://vite.dev/config/
export default defineConfig(({mode}) => {
    console.log(`Build mode: ${mode}, NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`Envs: ${process.env.VITE_APP_BASE}`);
    const basePath = mode === 'production' ?  process.env.VITE_APP_BASE : '/';
    return {
        base: basePath,
        plugins: [
            vue({
                isProduction: true,
                script: {
                    defineModel: true,
                    propsDestructure: true
                }
            }),
            vueDevTools(),
            VitePWA({
                registerType: 'autoUpdate', // Automatically updates the service worker
                manifest: {
                    name: 'Activity Tracker',
                    short_name: 'ATracker',
                    start_url:basePath, // Use base path dynamically
                    display: 'standalone',
                    background_color: '#ffffff',
                    theme_color: '#0d6efd',
                    icons: [
                        {
                            src: basePath + 'icons/icon-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: basePath + 'icons/icon-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                        },
                    ],
                    screenshots: [
                        {
                            "src": basePath + 'screenshots/wide-screenshot.png',
                            "sizes": '1745x770',
                            "type": 'image/png',
                            "form_factor": 'wide',
                        },
                        {
                            "src": basePath + "screenshots/mobile-screenshot.png",
                            "sizes": "402x759",
                            "type": "image/png" // Default form factor (typically mobile)
                        }

                    ],
                },
            }),
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
            cors: true,
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
            base: basePath,

            outDir: 'docs/',
            emptyOutDir: true, // also necessary
        }
    }
})