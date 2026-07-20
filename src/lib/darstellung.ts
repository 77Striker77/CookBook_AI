// Darstellungshelfer: Kategorie-Label, Zeitformatierung und die beiden
// Achsen, die den Alltag tragen — Arbeitszeit und Wartezeit.

export function katLabel(kategorie: string): string {
  return kategorie.charAt(0).toUpperCase() + kategorie.slice(1);
}

export function zeitLabel(minuten?: number): string | null {
  if (!minuten) return null;
  if (minuten < 60) return `${minuten} min`;
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/**
 * Die wichtigste Zahl auf jeder Karte ist die ARBEITSZEIT, nicht die
 * Gesamtzeit. Beispiel aus dem Bestand: Das Vanilleeis braucht 310 Minuten
 * gesamt, aber nur 10 Minuten Arbeit — angezeigt als „5 h 10 min" sah es aus
 * wie das aufwendigste Rezept und war das faulste.
 */
export function arbeitLabel(aktiv?: number, gesamt?: number): string | null {
  if (!aktiv && !gesamt) return null;
  if (!aktiv) return zeitLabel(gesamt);
  if (!gesamt || gesamt <= aktiv) return `${zeitLabel(aktiv)} Arbeit`;
  return `${zeitLabel(aktiv)} Arbeit · ${zeitLabel(gesamt)} gesamt`;
}

export type Warteklasse = 'dabei' | 'kurz' | 'halbe' | 'einplanen';

/**
 * Wartezeit = gesamt − aktiv, als absolute Differenz.
 *
 * Bewusst NICHT der Quotient aktiv/gesamt: Über die 17 Rezepte mit Zeiten
 * liegt der zwischen 0,25 und 0,58 in einem lückenlosen Kontinuum — jede
 * Grenze wäre gesetzt statt gefunden. Schlimmer noch, er normiert weg, worauf
 * es ankommt: Hühnersuppe (0,27) und Honey-Smokey-Hähnchen (0,33) liegen fast
 * gleichauf, aber die eine kostet 40 Minuten Arbeit über 2½ Stunden, die
 * andere 10 Minuten über eine halbe.
 *
 * Die Differenz verteilt sich dagegen sauber auf 2 / 6 / 5 / 4 Rezepte.
 */
export function warteklasse(aktiv?: number, gesamt?: number): Warteklasse | null {
  if (aktiv == null || gesamt == null) return null;
  const warten = Math.max(0, gesamt - aktiv);
  if (warten < 15) return 'dabei';
  if (warten < 30) return 'kurz';
  if (warten < 60) return 'halbe';
  return 'einplanen';
}

export const WARTE_LABEL: Record<Warteklasse, string> = {
  dabei: 'Durchgehend dabei',
  kurz: 'Kurz warten',
  halbe: 'Halbe Stunde warten',
  einplanen: 'Muss man einplanen',
};

/** Kurzform für die Karte. */
export const WARTE_KURZ: Record<Warteklasse, string> = {
  dabei: 'am Stück',
  kurz: 'kurz warten',
  halbe: 'mit Wartezeit',
  einplanen: 'mit Vorlauf',
};

/* Hier stand eine Komponenten-Zählung: „4 Komponenten" auf der Rezeptkarte,
   gedacht als Antwort auf „wie viele Sachen muss ich gleichzeitig
   fertigkriegen?". Sie ist entfernt worden, weil die Zahl beim Draufschauen
   niemandem etwas gesagt hat — sie brauchte eine Erklärung, um verständlich
   zu sein, und eine Kennzahl mit Fußnote ist keine.

   Die `#`-Überschriften in den Zutatenlisten bleiben; sie gliedern die Liste
   und werden auf Rezeptseite und im Kochmodus angezeigt (siehe
   `mitGruppen()` in lib/zutaten.ts). Sie zählen nur nichts mehr. */

export const GERAET_LABEL: Record<string, string> = {
  airfryer: 'Airfryer',
  ofen: 'Ofen',
  herd: 'Herd',
  mixer: 'Mixer',
  eismaschine: 'Eismaschine',
};
