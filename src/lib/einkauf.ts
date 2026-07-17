import { formatMenge } from './format';
import type { ParsedZutat } from './zutaten';

/**
 * Einkaufslisten-Aggregation.
 *
 * Nimmt die gewählten Kochplan-Rezepte (jeweils mit Basis- und Zielportionen)
 * und führt ihre Zutaten zu einer Einkaufsliste zusammen: Mengen werden auf die
 * Zielportionen skaliert und über den kanonischen Namen + Einheit summiert.
 * Nutzt denselben Parser/Formatierer wie die Rezeptseite — eine Quelle der Wahrheit.
 */

export const PLAN_KEY = 'ws-plan';
export const CHECK_KEY = 'ws-plan-haken';

export interface PlanEintrag {
  slug: string;
  titel: string;
  basis: number; // Basisportionen des Rezepts
  ziel: number; // gewählte Portionen im Plan
  zutaten: ParsedZutat[];
}

export interface EinkaufZeile {
  key: string; // stabiler Schlüssel fürs Abhaken (kanonisch + Einheit)
  kanonisch: string;
  einheit: string | null;
  text: string; // formatierte Menge, z. B. "3 EL" oder "nach Bedarf"
  herkunft: string[]; // Rezepttitel, die zu dieser Zeile beitragen
  ungenau: boolean; // ohne feste Menge (z. B. "Salz nach Geschmack")
}

interface MitMenge {
  kanonisch: string;
  einheit: string | null;
  min: number;
  max: number;
  herkunft: Set<string>;
}

// Einheiten, die man nur als ganze Einheit kauft (Stück, Zehe, Dose …). Solche
// Mengen werden fürs Einkaufen aufgerundet — eine halbe Zwiebel gibt's im Laden
// nicht. Gewichte/Volumen (g, ml, EL, TL, Prise …) bleiben fein.
const STUECKWEISE = new Set([
  'Stück', 'Stk', 'Zehe', 'Zehen', 'Dose', 'Dosen', 'Glas', 'Packung', 'Pck',
  'Päckchen', 'Scheibe', 'Scheiben', 'Kugel', 'Kugeln', 'Bund', 'Würfel',
  'Blatt', 'Blätter', 'Knolle', 'Stange', 'Stangen', 'Zweig', 'Zweige',
]);

const EPS = 1e-6;

// Manche Zutaten kauft man nicht einzeln: Eigelb und Eiweiß gibt es nur als
// ganzes Ei. Fürs Einkaufen werden sie auf "Ei" zusammengefasst und mitgezählt
// (1 Ei + 2 Eigelb = 3 Eier). Nur bei stückweisen Angaben — "50 g Eigelb"
// bleibt getrennt.
const EINKAUF_GRUPPE: Record<string, string> = {
  Eigelb: 'Ei',
  Eidotter: 'Ei',
  Eiweiß: 'Ei',
  Eiweiss: 'Ei',
  Eiklar: 'Ei',
};

function istStueckweise(einheit: string | null): boolean {
  return einheit === null || STUECKWEISE.has(einheit);
}

/** Einkaufs-Name: fasst z. B. Eigelb/Eiweiß auf "Ei" zusammen (nur stückweise). */
function einkaufsname(kanonisch: string, einheit: string | null): string {
  if (istStueckweise(einheit) && EINKAUF_GRUPPE[kanonisch]) return EINKAUF_GRUPPE[kanonisch];
  return kanonisch;
}

/** Rundet stückweise Mengen zum Einkaufen auf die nächste ganze Einheit auf. */
function aufrunden(wert: number, einheit: string | null): number {
  if (istStueckweise(einheit)) return Math.ceil(wert - EPS);
  return wert;
}

/** Führt die Zutaten aller Plan-Einträge zu einer summierten Einkaufsliste zusammen. */
export function aggregiere(eintraege: PlanEintrag[]): EinkaufZeile[] {
  const mitMenge = new Map<string, MitMenge>();
  const ohneMenge = new Map<string, Set<string>>();

  for (const e of eintraege) {
    const faktor = e.basis ? e.ziel / e.basis : 1;
    for (const z of e.zutaten) {
      if (z.skalierbar && z.menge !== null) {
        const kanonisch = einkaufsname(z.kanonisch, z.einheit);
        const key = `${kanonisch}|${z.einheit ?? ''}`;
        let rec = mitMenge.get(key);
        if (!rec) {
          rec = { kanonisch, einheit: z.einheit ?? null, min: 0, max: 0, herkunft: new Set() };
          mitMenge.set(key, rec);
        }
        rec.min += z.menge * faktor;
        rec.max += (z.mengeMax ?? z.menge) * faktor;
        rec.herkunft.add(e.titel);
      } else {
        const kanonisch = einkaufsname(z.kanonisch, z.einheit);
        let herkunft = ohneMenge.get(kanonisch);
        if (!herkunft) ohneMenge.set(kanonisch, (herkunft = new Set()));
        herkunft.add(e.titel);
      }
    }
  }

  const zeilen: EinkaufZeile[] = [];
  for (const rec of mitMenge.values()) {
    const min = aufrunden(rec.min, rec.einheit);
    const max = aufrunden(rec.max, rec.einheit);
    const bereich = max - min > 0.01;
    const mengeTxt = bereich ? `${formatMenge(min)}–${formatMenge(max)}` : formatMenge(min);
    zeilen.push({
      key: `${rec.kanonisch}|${rec.einheit ?? ''}`,
      kanonisch: rec.kanonisch,
      einheit: rec.einheit,
      text: [mengeTxt, rec.einheit].filter(Boolean).join(' '),
      herkunft: [...rec.herkunft],
      ungenau: false,
    });
  }

  // "Ohne feste Menge" nur zeigen, wenn die Zutat nicht schon mit Menge gelistet
  // ist (dann kauft man sie ohnehin) — z. B. "Salz nach Geschmack" fällt weg,
  // wenn ein Rezept "1 TL Salz" beisteuert.
  const schonGelistet = new Set(zeilen.map((z) => z.kanonisch));
  for (const [kanonisch, herkunft] of ohneMenge) {
    if (schonGelistet.has(kanonisch)) continue;
    zeilen.push({
      key: `${kanonisch}|~`,
      kanonisch,
      einheit: null,
      text: 'nach Bedarf',
      herkunft: [...herkunft],
      ungenau: true,
    });
  }

  zeilen.sort((a, b) => a.kanonisch.localeCompare(b.kanonisch, 'de'));
  return zeilen;
}

/** Einkaufsliste als reiner Text (für Kopieren/Teilen). */
export function alsText(zeilen: EinkaufZeile[]): string {
  return zeilen.map((z) => `- ${z.kanonisch}${z.text ? ` — ${z.text}` : ''}`).join('\n');
}
