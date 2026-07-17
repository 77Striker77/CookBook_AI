import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

/**
 * Zutaten-Parser & -Verlinkung.
 *
 * Rezepte listen Zutaten als lesbare Zeilen ("400 g gehackte Tomaten, aus der Dose").
 * Dieser Parser zerlegt jede Zeile in strukturierte Daten (Menge / Einheit / Zutat /
 * Notiz) und mappt den Namen über die Synonym-Tabelle auf einen kanonischen Namen.
 * Daraus entstehen: der Portionsrechner (Mengen skalieren) und die Zutaten-Seiten
 * (welches Rezept nutzt welche Zutat) — ganz ohne von Hand gesetzte Links.
 */

export interface ParsedZutat {
  roh: string; // Originalzeile
  menge: number | null; // Basiswert (bei Bereich: Untergrenze)
  mengeMax: number | null; // Obergrenze bei "6-8 Eier"
  einheit: string | null;
  name: string; // Anzeigename, z. B. "gehackte Tomaten"
  notiz: string | null; // z. B. "aus der Dose"
  kanonisch: string; // z. B. "Tomaten"
  slug: string; // z. B. "tomaten"
  skalierbar: boolean; // "nach Geschmack" wird nicht skaliert
  gruppe: string | null; // optionale Zwischenüberschrift
}

const EINHEITEN = [
  'mg', 'g', 'kg', 'ml', 'cl', 'dl', 'l',
  'EL', 'TL', 'Msp', 'Prise', 'Prisen', 'Spritzer', 'Schuss',
  'Stück', 'Stk', 'Bund', 'Zweig', 'Zweige', 'Blatt', 'Blätter',
  'Zehe', 'Zehen', 'Dose', 'Dosen', 'Glas', 'Packung', 'Pck', 'Päckchen',
  'Handvoll', 'Scheibe', 'Scheiben', 'Tasse', 'Tassen', 'Kugel', 'Kugeln',
  'Becher', 'Würfel', 'cm', 'Knolle', 'Stange', 'Stangen',
];

const OHNE_MENGE = /nach geschmack|nach belieben|etwas|n\.\s*b\.|zum \w+/i;

let synonymeCache: Map<string, string> | null = null;

function ladeSynonyme(): Map<string, string> {
  if (synonymeCache) return synonymeCache;
  const pfad = fileURLToPath(new URL('../../kochbuch/_meta/synonyme.yaml', import.meta.url));
  const map = new Map<string, string>();
  try {
    const daten = parseYaml(readFileSync(pfad, 'utf8')) as Record<string, string[]>;
    for (const [kanonisch, varianten] of Object.entries(daten ?? {})) {
      map.set(normalisiere(kanonisch), kanonisch);
      for (const v of varianten ?? []) map.set(normalisiere(v), kanonisch);
    }
  } catch {
    // Ohne Synonym-Datei fällt der Parser auf die Rohnamen zurück.
  }
  synonymeCache = map;
  return map;
}

function normalisiere(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function wertZuZahl(s: string): number {
  s = s.trim();
  // gemischter Bruch: "1 1/2"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  // Bruch: "1/2"
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  // Dezimal (Komma oder Punkt)
  return Number(s.replace(',', '.'));
}

const NUM = String.raw`\d+(?:[.,]\d+)?`;
const FRAC = String.raw`\d+\/\d+`;
const VAL = `(?:\\d+\\s+${FRAC}|${FRAC}|${NUM})`;
const MENGE_RE = new RegExp(`^\\s*(${VAL})(?:\\s*(?:-|–|bis)\\s*(${VAL}))?\\s*`);
const EINHEIT_RE = new RegExp(`^(${EINHEITEN.join('|')})\\b\\.?\\s+`, 'i');

/** Zerlegt eine einzelne Zutatenzeile. */
export function parseZeile(zeile: string, gruppe: string | null = null): ParsedZutat {
  const roh = zeile.trim();
  let rest = roh;
  let menge: number | null = null;
  let mengeMax: number | null = null;
  let einheit: string | null = null;

  const m = rest.match(MENGE_RE);
  if (m) {
    menge = wertZuZahl(m[1]);
    if (m[2]) mengeMax = wertZuZahl(m[2]);
    rest = rest.slice(m[0].length);
    const e = rest.match(EINHEIT_RE);
    if (e) {
      einheit = e[1];
      rest = rest.slice(e[0].length);
    }
  }

  // Notiz nach dem ersten Komma abtrennen; Klammern ebenfalls als Notiz.
  let name = rest.trim();
  let notiz: string | null = null;
  const komma = name.indexOf(',');
  if (komma >= 0) {
    notiz = name.slice(komma + 1).trim();
    name = name.slice(0, komma).trim();
  }
  const klammer = name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (klammer) {
    name = klammer[1].trim();
    notiz = [notiz, klammer[2].trim()].filter(Boolean).join(', ');
  }

  // Nachgestellte Mengenangaben ("Salz nach Geschmack") als Notiz abtrennen.
  const suffix = name.match(/^(.*?)\s+(nach\s+geschmack|nach\s+belieben|zum\s+\p{L}+)$/iu);
  if (suffix && suffix[1].trim()) {
    name = suffix[1].trim();
    notiz = [suffix[2].trim(), notiz].filter(Boolean).join(', ');
  }
  // Vorangestellte unbestimmte Mengen ("etwas Öl") als Notiz abtrennen.
  const prefix = name.match(/^(etwas|ein\s+wenig)\s+(.+)$/i);
  if (prefix) {
    name = prefix[2].trim();
    notiz = [prefix[1].trim(), notiz].filter(Boolean).join(', ');
  }

  const skalierbar = menge !== null && !OHNE_MENGE.test(roh);
  const kanonisch = ladeSynonyme().get(normalisiere(name)) ?? titelCase(name);

  return {
    roh, menge, mengeMax, einheit, name: name || roh, notiz,
    kanonisch, slug: slugify(kanonisch), skalierbar, gruppe,
  };
}

/** Parst eine ganze Zutatenliste; Zeilen mit führendem "#" sind Zwischenüberschriften. */
export function parseZutaten(zeilen: string[]): ParsedZutat[] {
  let gruppe: string | null = null;
  const out: ParsedZutat[] = [];
  for (const z of zeilen) {
    const t = z.trim();
    if (!t) continue;
    if (t.startsWith('#')) {
      gruppe = t.replace(/^#+\s*/, '').trim();
      continue;
    }
    out.push(parseZeile(t, gruppe));
  }
  return out;
}

function titelCase(s: string): string {
  return s.replace(/^\p{L}/u, (c) => c.toUpperCase());
}

/** Skaliert einen Basiswert auf die Zielportionen und formatiert ihn schön. */
export function skaliere(wert: number, basis: number, ziel: number): number {
  if (!basis) return wert;
  return (wert * ziel) / basis;
}

const BRUCH: Array<[number, string]> = [
  [0.25, '¼'], [0.5, '½'], [0.75, '¾'], [1 / 3, '⅓'], [2 / 3, '⅔'],
];

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
