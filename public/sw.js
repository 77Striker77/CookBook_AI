/* Offline-Gedaechtnis: einmal geoeffnete Seiten und ihre Bilder bleiben auf
   dem Geraet — das Kochbuch funktioniert auch, wenn das Kuechen-WLAN nicht tut.

   Strategie:
   - Navigationen: NETZ ZUERST. Neue und geaenderte Rezepte kommen immer an;
     nur ohne Verbindung faellt es auf den Gerätespeicher zurueck, und wenn
     auch der die Seite nicht kennt, auf /offline.
   - Gehashte Assets (/_astro/, /fonts/, Bilder): CACHE ZUERST. Die Dateinamen
     aendern sich bei jeder Inhaltsaenderung, der Cache kann also nie veralten.
   - Bei neuem VERSION-Wert werden alte Caches beim Aktivieren geraeumt. */

const VERSION = 'v1';
const SEITEN = `seiten-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

// Alle Pfade relativ zum Scope, damit der base-Pfad (/CookBook_AI) mitkommt.
const amScope = (pfad) => new URL(pfad, self.registration.scope).href;

self.addEventListener('install', (e) => {
  // Grundausstattung: Offline-Hinweis, Uebersicht und Katalog gehen immer.
  e.waitUntil(
    caches
      .open(SEITEN)
      .then((c) => c.addAll([amScope('offline/'), amScope('./'), amScope('rezepte/')]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((alle) =>
        Promise.all(alle.filter((k) => k !== SEITEN && k !== ASSETS).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

/* Der Asset-Cache waechst mit jedem angesehenen Rezept. 600 Eintraege reichen
   fuer weit ueber 100 Rezepte samt Bildvarianten; darueber fliegt das
   Aelteste (FIFO — echte Nutzungsreihenfolge ist den Aufwand nicht wert). */
async function begrenzen(name, max) {
  const c = await caches.open(name);
  const drin = await c.keys();
  if (drin.length > max) await c.delete(drin[0]);
}

self.addEventListener('fetch', (e) => {
  const anfrage = e.request;
  if (anfrage.method !== 'GET') return;
  const ziel = new URL(anfrage.url);
  if (ziel.origin !== self.location.origin) return;

  if (anfrage.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const antwort = await fetch(anfrage);
          const c = await caches.open(SEITEN);
          c.put(anfrage, antwort.clone());
          return antwort;
        } catch {
          return (
            (await caches.match(anfrage)) ??
            (await caches.match(amScope('offline/'))) ??
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  const gehasht =
    ziel.pathname.includes('/_astro/') ||
    ziel.pathname.includes('/fonts/') ||
    anfrage.destination === 'image';
  if (gehasht) {
    e.respondWith(
      (async () => {
        const drin = await caches.match(anfrage);
        if (drin) return drin;
        const antwort = await fetch(anfrage);
        if (antwort.ok) {
          const c = await caches.open(ASSETS);
          c.put(anfrage, antwort.clone());
          begrenzen(ASSETS, 600);
        }
        return antwort;
      })(),
    );
  }
});
