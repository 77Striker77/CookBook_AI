// Zerlegt den Rezeptkörper in einzelne Zubereitungsschritte.
//
// Warum nicht das gerenderte HTML zerschneiden: Der Kochmodus braucht die
// Schritte als Daten (Label, Text, Bild, erkannte Zeiten), nicht als Markup.
// Aus dem HTML ließe sich das nur per Regex zurückgewinnen — genau die
// fragile Doppel-Interpretation, die `daten.json.ts` schon einmal etabliert
// hat und die niemand pflegt.

export type Schritt = {
  /** Fortlaufende Nummer, 1-basiert. */
  nr: number;
  /** Fettes Label am Anfang („Würzen:“), falls vorhanden. */
  label: string | null;
  /** Anweisungstext ohne Label, Markdown-Reste entfernt. */
  text: string;
  /** Bildpfad relativ zur Rezeptdatei, falls im Schritt eines steht. */
  bild: string | null;
  /** Erkannte Zeitangaben in Minuten — Grundlage für antippbare Timer. */
  timer: { minuten: number; text: string }[];
  /** Überschrift des Abschnitts, in dem der Schritt steht (bei mehrteiligen Rezepten). */
  abschnitt: string | null;
};

/** Wandelt „1 h 20“, „90 Minuten“, „5–7 min“ in Minuten. Bei Spannen die Obergrenze. */
function minuten(roh: string): number | null {
  const s = roh.toLowerCase().replace(',', '.');
  const std = s.match(/(\d+(?:\.\d+)?)\s*(?:stunden?|std\.?|h)\b/);
  const min = s.match(/(\d+(?:\.\d+)?)\s*(?:minuten?|min\.?)\b/);
  let total = 0;
  if (std) total += parseFloat(std[1]) * 60;
  if (min) total += parseFloat(min[1]);
  return total > 0 ? Math.round(total) : null;
}

/**
 * Findet Zeitangaben im Schritttext. Nimmt bei Spannen („4–5 Stunden“,
 * „5 bis 7 Minuten“) die Obergrenze — beim Kochen ist der spätere Wert der
 * sichere: Ein zu früh klingelnder Timer ist schlimmer als ein zu später,
 * weil man dann trotzdem nachsehen muss.
 */
function timerFinden(text: string): { minuten: number; text: string }[] {
  const treffer: { minuten: number; text: string }[] = [];
  const muster =
    /(\d+(?:[.,]\d+)?)\s*(?:(?:–|-|bis)\s*(\d+(?:[.,]\d+)?)\s*)?(stunden?|std\.?|h|minuten?|min\.?)\b/gi;
  for (const m of text.matchAll(muster)) {
    const wert = m[2] ?? m[1]; // bei Spanne die Obergrenze
    const dauer = minuten(`${wert} ${m[3]}`);
    if (dauer && dauer >= 1 && dauer <= 24 * 60) {
      treffer.push({ minuten: dauer, text: m[0].trim() });
    }
  }
  // Doppelte Dauern im selben Schritt einmal reicht.
  return treffer.filter(
    (t, i) => treffer.findIndex((x) => x.minuten === t.minuten) === i,
  );
}

/**
 * Zerlegt den Markdown-Körper eines Rezepts in Schritte.
 *
 * Erwartete Form (so schreiben alle 18 Rezepte im Vault):
 *   ## Zubereitung
 *   1. **Label:** Anweisung.
 *
 *      ![Alt](../anhang/bild.jpg)
 *   2. …
 *
 * Mehrteilige Rezepte dürfen Zwischenüberschriften (###) tragen; die landen
 * als `abschnitt` an den folgenden Schritten.
 */
export function parseSchritte(roh: string): Schritt[] {
  // Zeilenenden vereinheitlichen. Der Vault enthält gemischt LF und CRLF
  // (Folge von core.autocrlf), und in JavaScript matcht `.` kein \r — ohne
  // diese Zeile scheitert die Schritt-Erkennung stillschweigend an jeder
  // Datei mit Windows-Zeilenenden.
  const body = roh.replace(/\r\n/g, '\n');

  // Normalfall: alles zwischen „## Zubereitung“ und der nächsten ##-Ebene.
  // Sonderfall: Rezepte ohne diese Überschrift gliedern die Zubereitung in
  // eigene Abschnitte (Streifenkuchen: „## Der Teig“, „## Backen“ …). Dann
  // alles vom ersten ## bis zu den Notizen nehmen und die Überschriften als
  // Abschnitte führen.
  let teil: string;
  const start = body.search(/^##\s+Zubereitung\s*$/m);
  if (start >= 0) {
    const rest = body.slice(start).replace(/^##\s+Zubereitung\s*$/m, '');
    const ende = rest.search(/^##\s+(?!#)/m);
    teil = ende >= 0 ? rest.slice(0, ende) : rest;
  } else {
    const erst = body.search(/^##\s+(?!#)/m);
    if (erst < 0) return [];
    const rest = body.slice(erst);
    const notizen = rest.search(/^##\s+Notizen/m);
    teil = notizen >= 0 ? rest.slice(0, notizen) : rest;
  }

  const schritte: Schritt[] = [];
  let abschnitt: string | null = null;
  let aktuell: string[] | null = null;

  const abschliessen = () => {
    if (!aktuell) return;
    const roh = aktuell.join('\n').trim();
    if (!roh) return;

    const bildM = roh.match(/!\[[^\]]*\]\(([^)]+)\)/);
    // Bildsyntax, Fettzeichen und Restmarkdown aus dem Fließtext entfernen.
    const ohneBild = roh.replace(/!\[[^\]]*\]\([^)]+\)/g, '').trim();
    const labelM = ohneBild.match(/^\*\*(.+?):?\*\*:?\s*/);
    const label = labelM ? labelM[1].replace(/:$/, '').trim() : null;
    const text = (labelM ? ohneBild.slice(labelM[0].length) : ohneBild)
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\s*\n\s*/g, ' ')
      .trim();

    schritte.push({
      nr: schritte.length + 1,
      label,
      text,
      bild: bildM ? bildM[1] : null,
      timer: timerFinden(text),
      abschnitt,
    });
    aktuell = null;
  };

  for (const zeile of teil.split('\n')) {
    const ueberschrift = zeile.match(/^#{2,}\s+(.+?)\s*$/);
    if (ueberschrift) {
      abschliessen();
      abschnitt = ueberschrift[1].trim();
      continue;
    }
    const neu = zeile.match(/^\s*\d+\.\s+(.*)$/);
    if (neu) {
      abschliessen();
      aktuell = [neu[1]];
      continue;
    }
    // Fortsetzungszeile (eingerückt oder leer) gehört zum laufenden Schritt.
    if (aktuell) aktuell.push(zeile.trim());
  }
  abschliessen();

  return schritte;
}
