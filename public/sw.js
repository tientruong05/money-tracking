// Minimal app-shell service worker (PRD 3.3). Stale-while-revalidate for same-origin
// GET requests: serves from cache instantly when offline/available, and refreshes the
// cache in the background whenever the network is reachable. Handwritten instead of a
// bundler-based tool (Workbox/Serwist) since those don't yet support this project's
// Turbopack dev/build pipeline — see app/sw-register.tsx for why.
const CACHE_NAME = "money-tracker-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache Supabase/API calls — those must reflect real network state.
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);

      return cached ?? networkFetch;
    })
  );
});
