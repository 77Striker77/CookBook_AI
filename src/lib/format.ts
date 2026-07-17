// Browsersichere Zahlen-/Mengen-Helfer ohne Node-Abhängigkeiten.
// Bewusst getrennt von zutaten.ts, damit sie auch im Client-Bundle (Kochplan)
// nutzbar sind — zutaten.ts lädt Synonyme via node:fs und ist nur serverseitig.

/** Skaliert einen Basiswert von den Basis- auf die Zielportionen. */
export function skaliere(wert: number, basis: number, ziel: number): number {
  if (!basis) return wert;
  return (wert * ziel) / basis;
}

const BRUCH: Array<[number, string]> = [
  [0.25, '¼'], [0.5, '½'], [0.75, '¾'], [1 / 3, '⅓'], [2 / 3, '⅔'],
];

/** Formatiert eine Menge schön: nahe Brüche als Symbol, sonst gerundete Dezimalzahl. */
export function formatMenge(wert: number | null): string {
  if (wert === null || Number.isNaN(wert)) return '';
  const ganz = Math.floor(wert);
  const rest = wert - ganz;
  for (const [f, sym] of BRUCH) {
    if (Math.abs(rest - f) < 0.02) return ganz > 0 ? `${ganz} ${sym}` : sym;
  }
  const gerundet = Math.round(wert * 100) / 100;
  return String(gerundet).replace('.', ',');
}
