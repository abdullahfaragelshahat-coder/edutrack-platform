import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    define: {
        // يجبر المشروع في الـ Production إنه يستخدم رابط الباك إند الـ HTTPS المباشر
        'process.env.VITE_API_BASE_URL': JSON.stringify('https://edutrack-api-jbo5-ten.vercel.app/api'),
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
