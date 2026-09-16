/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

// App shell (HTML/JS/CSS) — safe to cache-first, injected at build time by vite-plugin-pwa.
precacheAndRoute(self.__WB_MANIFEST);

// Weather/auth data must always be live — never served stale from the cache.
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/"),
  new NetworkOnly()
);

type PushPayload = { title: string; body: string; url?: string };

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json() as PushPayload;

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      data: { url: payload.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// Matches the "autoUpdate" registerType behavior: activate a new service worker version
// immediately rather than waiting for all tabs to close.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
