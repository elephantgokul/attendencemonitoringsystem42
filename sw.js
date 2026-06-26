/* =========================================================
   sw.js - Service Worker
   Caches the static app shell so the UI can install as a PWA
   and still open (login/marking screens) when offline.
   Live attendance data always goes to the network — it is
   NEVER cached, since Daily_Attendance must stay accurate.
   ========================================================= */

const CACHE_NAME = "vlsi-attendance-v1";

const PRECACHE_URLS = [
  "./",
  "./login.html",
  "./dashboard.html",
  "./advisor.html",
  "./hod.html",
  "./css/style.css",
  "./js/script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // NEVER intercept Google Apps Script / JSONP data calls — always live.
  if (url.hostname.includes("script.google.com") || url.hostname.includes("googleusercontent.com")) {
    return;
  }

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
