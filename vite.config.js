import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/sass/app.scss', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react()
    ],
    server: {
        port: 5173,
        cors: {
            origin: '*', // Allow all origins
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        },
        mimeTypes: {
            'application/javascript': ['js', 'jsx'],
            'text/jsx': ['jsx'], // Add this line
        },
    },
});