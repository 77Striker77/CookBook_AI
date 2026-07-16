const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Baut einen Link relativ zum konfigurierten base-Pfad (für GitHub Pages Unterordner). */
export function url(pfad: string): string {
  const p = pfad.startsWith('/') ? pfad : `/${pfad}`;
  return `${BASE}${p}` || '/';
}
