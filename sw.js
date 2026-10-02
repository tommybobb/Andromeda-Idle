// Service worker: lets the game load offline once it has been visited.
// Network first so updates arrive immediately, falling back to the cache.

const CACHE = 'andromeda-idle-v1';

const CORE = [
  './',
  'index.html',
  'css/style.css',
  'manifest.webmanifest',
  'assets/icon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'js/main.js',
  'js/core/xp.js',
  'js/core/util.js',
  'js/core/events.js',
  'js/data/items.js',
  'js/data/skills.js',
  'js/data/ships.js',
  'js/data/research.js',
  'js/data/companions.js',
  'js/data/shop.js',
  'js/data/achievements.js',
  'js/data/profile.js',
  'js/game/state.js',
  'js/game/modifiers.js',
  'js/game/progress.js',
  'js/game/bank.js',
  'js/game/engine.js',
  'js/game/exploration.js',
  'js/game/farming.js',
  'js/game/hangar.js',
  'js/game/services.js',
  'js/game/offline.js',
  'js/game/save.js',
  'js/ui/app.js',
  'js/ui/bind.js',
  'js/ui/icons.js',
  'js/ui/modal.js',
  'js/ui/parts.js',
  'js/ui/scene.js',
  'js/ui/session.js',
  'js/ui/starfield.js',
  'js/ui/toast.js',
  'js/ui/pages/bridge.js',
  'js/ui/pages/cargo.js',
  'js/ui/pages/commander.js',
  'js/ui/pages/hangar.js',
  'js/ui/pages/logbook.js',
  'js/ui/pages/market.js',
  'js/ui/pages/piloting.js',
  'js/ui/pages/settings.js',
  'js/ui/pages/skill.js',
  'js/ui/pages/stats.js',
  'js/ui/pages/xenobiology.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (new URL(req.url).origin === location.origin || req.url.includes('fonts.g'))) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))),
  );
});
