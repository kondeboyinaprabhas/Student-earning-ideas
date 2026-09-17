// public/sw.js - Production-safe PWA Service Worker with Web Push & Safe Caching
const CACHE_NAME = 'sei-pwa-v1';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

// 1. Install Event: Pre-cache core offline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure, continuing:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up legacy caches & take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Safe fetch routing with strict bypasses for dynamic & admin data
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Strictly ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // B. Strictly bypass Firestore, Firebase Auth, Google APIs, and external analytics
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('firebaseinstallations.googleapis.com')
  ) {
    return;
  }

  // C. Strictly bypass Admin routes, API routes, and Next.js internal development hot-reload
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/_next/development/')
  ) {
    return;
  }

  // D. Stale-while-revalidate for static assets (images, icons, styles, fonts)
  const isStaticAsset = (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

// Navigation requests are left to the network (no caching)
});

// 4. Push Event: Handle incoming Web Push notifications
self.addEventListener('push', (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Student Earning Ideas',
        body: event.data.text() || 'New student earning update available!'
      };
    }
  }

  const title = data.title || 'Student Earning Ideas';
  const options = {
    body: data.message || data.body || 'Explore verified student earning blueprints & tools.',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    image: data.image || undefined,
    data: {
      url: data.url || data.link || '/',
      type: data.type || 'general',
      timestamp: Date.now(),
      ...data
    },
    vibrate: [120, 60, 120],
    tag: data.tag || 'sei-notification',
    renotify: true,
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 5. Notification Click Event: Focus or open window gracefully
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open on the same domain, focus and navigate it
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        const destUrl = new URL(targetUrl, self.location.origin);
        if (clientUrl.origin === destUrl.origin && 'focus' in client) {
          if (clientUrl.pathname !== destUrl.pathname) {
            client.navigate(destUrl.href);
          }
          return client.focus();
        }
      }

      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(new URL(targetUrl, self.location.origin).href);
      }
    })
  );
});
