# Seiten — Abweichungen vom Master

`SKILL.md` ist die globale Wahrheit. Hier steht **nur, was je Seite davon
abweicht**. Beim Bauen einer Seite: erst hier nachsehen, dann den Master.
Steht hier nichts, gilt der Master unverändert.

## Der Seitenbaum

```
/                    Übersicht — minimales Dashboard, navigiert
/rezepte             alle Rezepte, Suche + Filter + Zutatenregister
/einkauf             gewählte Gerichte und ihre Zutaten
/rezept/[slug]       Detailseite
/kochen/[slug]       Kochmodus (Modus, kein Navigationsziel)
/zutat/[slug]        Rezepte mit dieser Zutat (nur ab 2 Treffern)
```

**Drei Bereiche, nicht mehr.** Vorher waren es sieben, davon drei praktisch
unerreichbar. Eine NN/g-Studie (n=179) misst für versteckte Navigation über
20 % weniger Auffindbarkeit; über fünf Punkte passen physisch nicht mehr mit
ordentlichen Touch-Targets in eine Leiste. Paprika, Mela, Crouton, Mealie,
Tandoor und RecipeSage kommen unabhängig auf denselben Kanon.

**Verworfen und nicht wiederbeleben:** `/alle`, `/register`, `/verlauf`,
`/suche`, `/plan`, `daten.json.ts`. Die Gründe stehen jeweils unten.

---

## Übersicht — `src/pages/index.astro`

Ein **Dashboard, das navigiert** — keine kuratierte Startseite.

**Aufbau:** Held mit Bildwand → Einkaufs-Band mit Zustand → Sprungmarken nach
Art und nach Aufwand. Fertig.

**Bildführung ist der Kern.** Das Muster „Portfolio Grid" aus der
Stildatenbank: neutraler Grund, das Werk spricht. Bei einem Kochbuch sind die
Fotos das Werk — vorher waren sie Beiwerk unter Text.

**Verboten — und zwar mit Anlauf:**
- **Nichts, was Nutzungsdaten voraussetzt.** Keine der zehn untersuchten
  Rezept-Apps tut das. „Zuletzt gekocht" ist bei null davon ein
  Startseitenelement.
- **Keine Tageszeit behaupten.** Es gab hier einmal einen Block „Heute Abend".
  Die Seite weiß nicht, ob Abend ist.
- **Keine Blöcke mit Trefferquote 1,0.** „Noch nie gekocht" traf auf 18 von 18
  Rezepten zu — das ist nicht leer, sondern bedeutungslos. Ein Empty-State-
  Muster ist darauf die falsche Behandlung; solche Blöcke gehören gestrichen.
- Kein Vollkatalog. Der ist einen Klick entfernt.

---

## Rezepte — `src/pages/rezepte.astro`

Der Vollkatalog. Strukturell ein **Werkzeug**, kein Magazin.

**Sortierung: zuletzt hinzugefügt zuerst.** Alphabetisch ist eine Ordnung ohne
Bedeutung — niemand sucht „bei B". Paprika, Mela, Mealie und RecipeSage setzen
übereinstimmend auf das Anlagedatum, und es funktioniert ab Rezept Nr. 1.

**Filterzustand gehört in die URL.** Sonst ist kein Filter teilbar oder als
Lesezeichen speicherbar, und der Zurück-Knopf verlässt die Seite statt den
Filter zu räumen. Filter sind **kombinierbar** und löschen einander nicht.

**Tags nach Häufigkeit, nie alphabetisch.** Ein `.sort().slice(0, 8)` zeigte
einmal sieben Tags mit je einem Treffer, während `hähnchen` (8) unerreichbar
war. Nur Tags ab zwei Rezepten.

**Zeit ist ein Filter, keine Gliederung.** In keiner untersuchten App ist Zeit
die Einstiegsachse — aber sie ist die Zahl, die am Feierabend entscheidet.
Deshalb prominent in der Leiste, nicht als Seitenstruktur.

**Zutatenregister am Listenende**, eingeklappt. Ein Register ist
durchblätterbar, eine Suche verlangt, dass man den Begriff schon kennt. Nur
Zutaten ab zwei Rezepten — 68 von 122 kommen genau einmal vor.

**Progressive Personalisierung:** Der Filter „lange nicht gekocht" erscheint
erst ab fünf Kocheinträgen. Vorher wäre er ein Filter mit Trefferquote 0 oder 1.

---

## Einkauf — `src/pages/einkauf.astro`

Gewählte Gerichte **und** ihre Zutaten auf einer Seite. Plan und Liste waren
einmal getrennt — das ist derselbe Vorgang, nicht zwei.

**Dichte schlägt Großzügigkeit.** Hier zählt, wie viel Liste auf einen Blick
passt. Keine Display-Typo, keine Bilder.

**Sortiert nach Warengruppen, nie alphabetisch.** Alphabetisch heißt: Butter
(Kühlregal) → Hähnchen (Fleisch) → Joghurt (Kühlregal) → Kartoffeln (Gemüse).
Man läuft den Markt dreimal ab. Reihenfolge in `einkauf.ts` = Laufweg.

**Vorratsware fliegt raus.** Salz steckt in 9 von 18 Rezepten, Pfeffer in 8,
dazu 700 ml Wasser aus der Hühnersuppe. Eine Liste mit Wasser darauf liest man
misstrauisch, und dann ist die ganze Aggregation entwertet.

**Eigene Zeilen sind Pflicht.** Ein echter Einkauf enthält Milch, Kaffee,
Spülmittel. Ohne diese Möglichkeit führt man daneben eine zweite Liste — und
sobald es die gibt, ist die erzeugte tot.

**Erledigtes rutscht nach unten**, Fortschritt steht oben. Sonst sieht die
Restliste bis zuletzt so lang aus wie am Anfang.

**Druckansicht bleibt funktional.** Die Liste wird ausgedruckt; dunkle Flächen
dürfen dort nie landen.

---

## Rezeptseite — `src/pages/rezept/[...slug].astro`

Die einzige Seite, auf der Lesetext die Hauptsache ist.

**Eckdaten: ein einziger Stil.** Hier standen einmal sechs Pillen in drei
Färbungen, wobei Orange abwechselnd „Zeit", „die Ziffer 2" und „Gerät" meinte.
Unterschieden wird über **Position und Größe**, nicht über Farbe. Der Akzent
gehört der Interaktion — die Tags sind Links und tragen ihn beim Hover.

**Arbeitszeit ist die Leitzahl**, nicht die Gesamtzeit. Das Vanilleeis stand
als „5 h 10 min" da und ist mit 10 Minuten Arbeit das faulste Rezept im Buch.

**Zubereitung auf `--w-measure`**, nicht auf Seitenbreite.

**Mobil, weiterhin offen:** Zutaten und Zubereitung liegen untereinander. Beim
Kochen springt man ständig zwischen beiden. Der Kochmodus löst das für den
Kochvorgang; die Leseseite nicht.

### Portionsrechner: was er NICHT tut

Er skaliert die **Zutatenliste**, nicht den Fließtext. Bewusste Entscheidung,
keine Lücke.

Ein Trockenlauf über alle 18 Rezepte fand 32 Mengenangaben im Fließtext.
Skaliert werden dürften **fünf**. Der Rest: Makros pro Portion (`43 g
Protein`), Umrechnungstabellen (`1 Tasse Reis ≈ 200 g`), Gefäßgrößen
(`6 Gläser à 125 ml`), feste Toleranzen (`20 g Toleranz`), Gesamtausbeute
(`ergibt gut 1 Liter Eis`), Notizen über das Original (`bei 1,2 kg
Tafelspitz`). Selbst auf nummerierte Schritte beschränkt wären 2 von 7 falsch.

**Eine stille Umrechnung mit dieser Fehlerquote ist schlimmer als gar keine.**

Stattdessen: Weicht die Portionszahl ab, erscheint ein Hinweis und die
betroffenen Stellen werden markiert. Zeiten, Temperaturen, Stückzahlen und
Kalorien bleiben unmarkiert.

---

## Kochmodus — `src/pages/kochen/[slug].astro`

Ein **Modus innerhalb eines Rezepts**, kein Navigationsziel. Deshalb nicht in
der Kopfzeile.

Eigene Regeln, weil andere Bedingungen gelten: nasse Finger, Abstand zum
Gerät, Unterbrechungen. Ein Schritt füllt den Bildschirm, Steuerung unten im
Daumenbereich, Seitenkopfzeile ausgeblendet.

**Wake Lock ist nicht optional** — ohne ihn geht das Display mitten im Kochen
aus.

**Timer:** Bei Spannen („10–15 Minuten") gilt die **Obergrenze**. Ein zu früh
klingelnder Timer ist schlimmer als ein zu später, weil man dann trotzdem
nachsehen muss.

**Der Abschluss ist der Zweck.** „Gekocht ✓" am Ende ist der einzige Moment,
in dem die Daten vorliegen und die Motivation da ist. Mealie hat denselben
Knopf an einer schlechteren Stelle und berichtet in der eigenen Umfrage, dass
ihn niemand benutzt.

---

## Zutatenseite — `src/pages/zutat/[slug].astro`

Wird **nur ab zwei Rezepten** erzeugt. Eine Seite `/zutat/wasser` mit einem
Treffer beantwortet keine Frage und kostet Build-Zeit — von 122 kanonischen
Zutaten kommen 68 genau einmal vor. Das hat die Seitenzahl von 122 auf 54
gesenkt.

Karten wie im Katalog, kein eigener Stil. Vorher lag hier eine zweite,
abweichende Karten-Implementierung.
