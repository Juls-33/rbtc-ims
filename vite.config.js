import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'RBTC-IMS',
                short_name: 'RBTC',
                start_url: '/',
                display: 'standalone',
                theme_color: '#3D52A0',
                icons: [
                    { src: '/assets/logo.png', sizes: '192x192', type: 'image/png' },
                    { src: '/assets/logo.png', sizes: '512x512', type: 'image/png' }
                ]
            },
            workbox: {
                // Caches CSS, JS, and Images for offline access
                globPatterns: ['**/*.{js,css,html,png,svg,jpg}'],
                // Optional: Cache API responses for "Viewing" while offline
                runtimeCaching: [{
                    urlPattern: /^https:\/\/your-domain\.com\/api\/.*/i,
                    handler: 'NetworkFirst',
                    options: { cacheName: 'api-cache' }
                }]
            }
        })
    ],
});