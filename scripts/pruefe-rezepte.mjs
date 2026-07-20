#!/usr/bin/env node
/**
 * Datenprüfung für den Vault. Läuft vor jedem Build.
 *
 * Das Schema (src/content.config.ts) prüft Syntax und erlaubte Werte — es kann
 * aber nicht wissen, ob ein Wert inhaltlich stimmt. Genau daran ist einmal
 * etwas durchgerutscht: „One-Pan Greek Chicken Rice Bowls" trug das Gerät
 * `airfryer`, weil in einem Querverweis stand „…anderes Rezept mit Spießen
 * und Kartoffeln aus dem Airfryer". Das Gerät gehörte zum verlinkten Gericht.
 *
 * Fehler brechen den Build ab, Warnungen nicht.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REZ = 'kochbuch/rezepte';

// Ein Beleg reicht — aber nur außerhalb von Querverweisen.
//
// Erst hatte ich hier zwei verlangt, weil die falsche Zuweisung genau eine
// Fundstelle hatte. Das war die falsche Schlussfolgerung: „Alternativ im Ofen
// 20 Minuten backen" ist eine völlig legitime einzelne Erwähnung, und bei
// „Greek Chicken Bowl" ist der Ofen mit einer Nennung sogar die Hauptmethode.
//
// Nicht die Anzahl unterscheidet, sondern der ORT: Eine Kochanweisung zählt,
// ein Verweis auf ein anderes Rezept nicht. Genau das filtert
// textOhneVerweise() heraus — die Zählschwelle war nur ein Hilfsmittel dafür
// und hätte zwei richtige Rezepte blockiert.
const MIN_BELEGE = 1;

const GERAET_MUSTER = {
  airfryer: /airfryer|air[- ]?fryer|hei[sß]{1,2}luftfritteuse/gi,
  ofen: /\bofen\b|umluft|ober-?\/?unterhitze|backblech|\bblech\b|vorgeheizt/gi,
  herd: /\bherd\b|kochfeld|\bpfanne\b|\btopf\b/gi,
  mixer: /\bmixer\b|p[üu]rierstab|food ?processor|standmixer/gi,
  eismaschine: /eismaschine/gi,
};

const fehler = [];
const warnung = [];

/** Entfernt Markdown-Links und Bildsyntax — dort stehen Querverweise auf
 *  ANDERE Rezepte, deren Geräte nicht zu diesem gehören. */
function textOhneVerweise(koerper) {
  return koerper
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')       // Bilder
    .replace(/^.*\]\([^)]*\.md\).*$/gm, ' ')     // Zeilen mit Rezept-Querverweis
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');    // sonstige Links: Text behalten
}

function frontmatter(roh) {
  const s = roh.replace(/\r\n/g, '\n');
  const t = s.split('---\n', 3);
  return t.length >= 3 ? { fm: t[1], koerper: t[2] } : { fm: '', koerper: s };
}

const dateien = readdirSync(REZ).filter((f) => f.endsWith('.md')).sort();

for (const name of dateien) {
  const roh = readFileSync(join(REZ, name), 'utf8');
  const { fm, koerper } = frontmatter(roh);
  const text = textOhneVerweise(koerper);
  const ort = `${name}`;

  const feld = (n) => (fm.match(new RegExp(`^${n}:\\s*(.*)$`, 'm')) ?? [])[1]?.trim() ?? '';
  const zahl = (n) => {
    const v = feld(n);
    return v === '' ? null : Number(v);
  };

  // --- Geräte gegen den Rezepttext ---
  const rohListe = (feld('geraete').match(/\[(.*)\]/) ?? [])[1] ?? '';
  const zugewiesen = rohListe.split(',').map((g) => g.trim()).filter(Boolean);

  for (const g of zugewiesen) {
    const muster = GERAET_MUSTER[g];
    if (!muster) {
      fehler.push(`${ort}: unbekanntes Gerät „${g}"`);
      continue;
    }
    const n = (text.match(muster) ?? []).length;
    if (n === 0) {
      fehler.push(`${ort}: Gerät „${g}" zugewiesen, kommt im Rezepttext aber nicht vor`);
    } else if (n < MIN_BELEGE) {
      fehler.push(
        `${ort}: Gerät „${g}" hat nur ${n} Fundstelle im Text — zu wenig. ` +
          `Steht sie in einem Querverweis auf ein anderes Rezept?`,
      );
    }
  }
  // Umgekehrt: deutliche Belege, aber nicht zugewiesen
  for (const [g, muster] of Object.entries(GERAET_MUSTER)) {
    if (zugewiesen.includes(g)) continue;
    const n = (text.match(muster) ?? []).length;
    if (n >= 3 && g !== 'herd') {
      warnung.push(`${ort}: „${g}" kommt ${n}× im Text vor, ist aber nicht in geraete eingetragen`);
    }
  }

  // --- Zeiten ---
  const aktiv = zahl('zeit_aktiv');
  const gesamt = zahl('zeit_gesamt');
  if (aktiv === null && gesamt === null) {
    warnung.push(`${ort}: keine Zeitangaben — das Rezept erscheint in keinem Zeitfilter`);
  } else if (aktiv !== null && gesamt !== null && aktiv > gesamt) {
    fehler.push(`${ort}: zeit_aktiv (${aktiv}) ist größer als zeit_gesamt (${gesamt})`);
  }

  // --- Pflichtangaben für die Anzeige ---
  if (!feld('küche')) warnung.push(`${ort}: küche fehlt — bricht die Küchen-Achse`);
  if (!feld('bild')) warnung.push(`${ort}: kein Bild — fällt auf Karten und beim Teilen auf`);
  if (!feld('hinzugefuegt')) warnung.push(`${ort}: hinzugefuegt fehlt — Sortierung „zuletzt dazu" stimmt nicht`);

  // --- Tags: keine Geräte, keine Kategorie-Dopplung ---
  const tags = ((feld('tags').match(/\[(.*)\]/) ?? [])[1] ?? '')
    .split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  const kategorie = feld('kategorie');
  for (const t of tags) {
    if (/^(airfryer|air-fryer|hei[sß]{1,2}luftfritteuse|ofen|blech)$/.test(t)) {
      fehler.push(`${ort}: „${t}" gehört ins Feld geraete, nicht in tags`);
    }
    if (t === kategorie) {
      warnung.push(`${ort}: Tag „${t}" wiederholt nur die Kategorie`);
    }
  }

  // --- Zubereitung vorhanden? ---
  if (!/^\d+\.\s+/m.test(koerper)) {
    fehler.push(`${ort}: keine nummerierten Zubereitungsschritte — der Kochmodus bleibt leer`);
  }
}

// --- Ausgabe ---
const gruen = '\x1b[32m', rot = '\x1b[31m', gelb = '\x1b[33m', aus = '\x1b[0m';
console.log(`\nRezeptprüfung: ${dateien.length} Dateien`);

if (warnung.length) {
  console.log(`\n${gelb}${warnung.length} Warnung${warnung.length === 1 ? '' : 'en'}${aus}`);
  for (const w of warnung) console.log(`  · ${w}`);
}

if (fehler.length) {
  console.log(`\n${rot}${fehler.length} Fehler — Build abgebrochen${aus}`);
  for (const f of fehler) console.log(`  ✗ ${f}`);
  console.log('');
  process.exit(1);
}

console.log(`${gruen}✓ keine Fehler${aus}\n`);
