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
  const ohneMenge = new Map<string, { herkunft: Set<string>; noten: Set<string> }>();

  for (const e of eintraege) {
    const faktor = e.basis ? e.ziel / e.basis : 1;
    for (const z of e.zutaten) {
      const kanonisch = einkaufsname(z.kanonisch, z.einheit);
      if (z.menge !== null) {
        // Menge vorhanden → mit Menge listen. Nur skalieren, wenn skalierbar;
        // feste Angaben (z. B. "zum Anbraten") gehen unskaliert (Faktor 1) ein.
        const f = z.skalierbar ? faktor : 1;
        const key = `${kanonisch}|${z.einheit ?? ''}`;
        let rec = mitMenge.get(key);
        if (!rec) {
          rec = { kanonisch, einheit: z.einheit ?? null, min: 0, max: 0, herkunft: new Set() };
          mitMenge.set(key, rec);
        }
        rec.min += z.menge * f;
        rec.max += (z.mengeMax ?? z.menge) * f;
        rec.herkunft.add(e.titel);
      } else {
        // Wirklich ohne Zahl (z. B. "Salz nach Geschmack"): Rezept-Notiz merken.
        let rec = ohneMenge.get(kanonisch);
        if (!rec) ohneMenge.set(kanonisch, (rec = { herkunft: new Set(), noten: new Set() }));
        rec.herkunft.add(e.titel);
        if (z.notiz) rec.noten.add(z.notiz);
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
  for (const [kanonisch, rec] of ohneMenge) {
    if (schonGelistet.has(kanonisch)) continue;
    // Statt eines erfundenen "nach Bedarf" die echte Rezept-Notiz zeigen
    // (z. B. "nach Geschmack", "optional") — nur wenn eindeutig, sonst leer.
    const noten = [...rec.noten];
    zeilen.push({
      key: `${kanonisch}|~`,
      kanonisch,
      einheit: null,
      text: noten.length === 1 ? noten[0] : '',
      herkunft: [...rec.herkunft],
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

/* ============================================================================
   Warengruppen und Vorratsware
   ========================================================================= */

/**
 * Vorratsware — steht ohnehin im Schrank und muss nicht auf die Liste.
 *
 * Grund: Salz kommt in 9 der 18 Rezepte vor, Pfeffer in 8, dazu Öl und in der
 * Hühnersuppe „700 ml Wasser". Wer drei Rezepte einplant, bekam eine Liste,
 * auf der Wasser stand — ab da denkt man jede Zeile misstrauisch mit, und die
 * ganze Aggregation ist entwertet.
 *
 * Bewusst konservativ gehalten: Nur was praktisch immer da ist. Mehl und
 * Zucker stehen NICHT drin — die gehen aus.
 */
export const VORRAT = new Set([
  'wasser', 'salz', 'pfeffer', 'schwarzer pfeffer', 'olivenöl', 'öl',
  'sonnenblumenöl', 'rapsöl', 'pflanzenöl', 'essig', 'weißweinessig',
  'paprikapulver', 'knoblauchpulver', 'zwiebelpulver', 'currypulver',
  'oregano', 'thymian', 'rosmarin', 'kreuzkümmel', 'koriander, gemahlen',
  'muskatnuss', 'zimt', 'chili', 'chiliflocken', 'piment', 'nelken',
  'selleriesamen', 'lorbeerblatt', 'backpulver', 'natron', 'vanillezucker',
]);

/**
 * Reihenfolge der Warengruppen = Laufweg durch den Markt.
 *
 * Vorher war die Liste alphabetisch sortiert: Butter (Kühlregal) → Hähnchen
 * (Fleisch) → Joghurt (Kühlregal) → Kartoffeln (Gemüse) → Knoblauch (Gemüse)
 * → Mehl (Trocken). Man lief den Laden dreimal ab.
 */
export const GRUPPEN = [
  'Obst & Gemüse',
  'Fleisch & Fisch',
  'Kühlregal',
  'Trocken & Konserven',
  'Backen',
  'Tiefkühl',
  'Getränke',
  'Sonstiges',
] as const;
export type Gruppe = (typeof GRUPPEN)[number];

// Stichwörter je Gruppe. Bewusst als Teilstring-Treffer, damit
// „Hähnchenoberschenkel" und „Hähnchenbrust" beide unter Fleisch landen.
const GRUPPEN_WORTE: [Gruppe, string[]][] = [
  ['Obst & Gemüse', ['zwiebel', 'knoblauch', 'karotte', 'möhre', 'kartoffel', 'tomate',
    'gurke', 'paprika', 'salat', 'rotkohl', 'petersilie', 'zitrone', 'orange', 'limette',
    'granatapfel', 'blaubeer', 'apfel', 'banane', 'lauch', 'sellerie', 'ingwer',
    'champignon', 'pilz', 'spinat', 'rucola', 'dill', 'schnittlauch', 'minze',
    'koriander', 'basilikum', 'avocado', 'mais', 'brokkoli', 'zucchini', 'aubergine']],
  ['Fleisch & Fisch', ['hähnchen', 'huhn', 'hühner', 'pute', 'rind', 'hack', 'schwein',
    'speck', 'schinken', 'wurst', 'lachs', 'fisch', 'garnele', 'braten', 'filet',
    'kotelett', 'steak']],
  ['Kühlregal', ['milch', 'sahne', 'joghurt', 'quark', 'schmand', 'frischkäse', 'käse',
    'butter', 'ei', 'eier', 'feta', 'mozzarella', 'parmesan', 'creme fraiche',
    'crème fraîche', 'margarine', 'hefe']],
  ['Backen', ['mehl', 'zucker', 'puderzucker', 'stärke', 'kakao', 'schokolade',
    'marzipan', 'gelatine', 'kondensmilch', 'marmelade', 'gelee', 'vanille']],
  ['Tiefkühl', ['tiefkühl', 'tk-', 'eiswürfel']],
  ['Getränke', ['wein', 'bier', 'brühe', 'fond', 'saft', 'cola']],
  ['Trocken & Konserven', ['reis', 'nudel', 'pasta', 'couscous', 'bulgur', 'linsen',
    'bohnen', 'kichererbsen', 'passierte tomaten', 'tomatenmark', 'kokosmilch',
    'brot', 'toast', 'fladenbrot', 'burger', 'semmelbrösel', 'panko', 'honig',
    'senf', 'ketchup', 'mayonnaise', 'sauce', 'soße', 'sesam', 'nuss', 'mandel',
    'haferflocken', 'öl', 'essig']],
];

/**
 * Ordnet eine Zutat einer Warengruppe zu. Ohne Treffer: „Sonstiges".
 *
 * Kurze Stichwörter (≤3 Zeichen) matchen nur auf Wortgrenzen. Sonst landet
 * „Reis" im Kühlregal, weil „ei" darin steckt — und „Fleisch" gleich mit.
 * Längere Stichwörter dürfen als Teilstring greifen, damit
 * „Hähnchenoberschenkel" und „Hähnchenbrust" beide unter Fleisch fallen.
 */
export function gruppeFuer(kanonisch: string): Gruppe {
  const n = kanonisch.toLowerCase();
  const trifft = (w: string) =>
    w.length <= 3
      ? new RegExp(`(^|[^a-zäöüß])${w}([^a-zäöüß]|$)`, 'i').test(n)
      : n.includes(w);
  for (const [gruppe, worte] of GRUPPEN_WORTE) {
    if (worte.some(trifft)) return gruppe;
  }
  return 'Sonstiges';
}

/** Ist das Vorratsware, die nicht auf die Einkaufsliste gehört? */
export function istVorrat(kanonisch: string): boolean {
  return VORRAT.has(kanonisch.toLowerCase().trim());
}
