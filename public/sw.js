/**
 * Empty Service Worker
 * 
 * This file exists to silence 404 errors in the console caused by the browser 
 * attempting to update service workers from previous projects hosted on localhost:3000.
 */
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    // Unregister itself if not needed
    self.registration.unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => {
            clients.forEach(client => client.navigate(client.url));
        });
});
