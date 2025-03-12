import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/sass/app.scss', 'resources/js/app.js', 'resources/js/ReactApp.jsx'],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                }
            }
        }),
        react()
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
        },
    },
    server: {
        port: 5173,
        cors: {
            origin: '*', // Allow all origins
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        },
        proxy: {
            '/socket.io': {
                target: 'http://localhost:4000',
                ws: true,
                changeOrigin: true
            }
        },
        mimeTypes: {
            'application/javascript': ['js', 'jsx'],
            'text/vue': ['vue'],
            'text/jsx': ['jsx'],
        },
    },
});