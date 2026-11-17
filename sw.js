// Guarda la app para que abra sin internet. Siempre intenta la red primero; usa la copia solo si falla.
const C = 'inv-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.hostname.endsWith('supabase.co')) return;   // los datos nunca se sirven de caché
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(C).then(x => x.put(r, c)); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: u.origin === location.origin }))
  );
});
