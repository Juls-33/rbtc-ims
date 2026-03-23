import '../css/app.css';
import './bootstrap';

import { router, createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { db } from './db';
import axios from 'axios';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// --- GLOBAL OFFLINE INTERCEPTOR ---
router.on('before', (event) => {
    const visit = event.detail.visit;
    const { method, data, url } = visit;

    // Only intercept data-writing requests (CRUD) when offline
    if (!navigator.onLine && ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
        
        // 1. FIX: Convert URL object to string to avoid DataCloneError
        const urlString = url.toString();

        // 2. FIX: Ensure data is a plain object (Dexie cannot clone File or complex objects)
        // If your form has a file upload, offline saving for that file will be skipped here.
        const plainData = data instanceof FormData ? Object.fromEntries(data) : data;

        db.request_outbox.add({
            url: urlString,
            method: method.toLowerCase(),
            data: plainData,
            timestamp: Date.now()
        });

        // 3. Stop the actual network request
        event.preventDefault();

        // 4. FIX: THE "UNLOCK" LOGIC
        // Manually trigger the finish callbacks so the modal closes and buttons reset.
        if (visit.onSuccess) visit.onSuccess({ props: {} });
        if (visit.onFinish) visit.onFinish(visit);

        alert('Offline: Changes saved locally. They will sync automatically when internet is restored.');
    }
});

// --- GLOBAL BACKGROUND SYNCER ---
async function syncOfflineRequests() {
    if (!navigator.onLine) return;

    try {
        const pendingRequests = await db.request_outbox.toArray();
        if (pendingRequests.length === 0) return;

        for (const req of pendingRequests) {
            try {
                await axios({
                    method: req.method,
                    url: req.url,
                    data: req.data
                });
                await db.request_outbox.delete(req.id);
            } catch (e) {
                console.error("Sync failed for request:", req.url, e);
            }
        }
        
        // Optional: Notify user that sync finished
        console.log("Offline data synchronized with server.");
    } catch (err) {
        console.error("Critical error during sync process:", err);
    }
}

window.addEventListener('online', syncOfflineRequests);

// Run sync on load
syncOfflineRequests();