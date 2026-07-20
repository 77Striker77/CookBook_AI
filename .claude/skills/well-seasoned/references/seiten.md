# Seiten — Abweichungen vom Master

`SKILL.md` ist die globale Wahrheit. Hier steht **nur, was je Seite davon
abweicht**. Beim Bauen einer Seite: erst hier nachsehen, dann den Master.
Steht hier nichts, gilt der Master unverändert.

**Warum es diese Ebene braucht:** Die Editorial-Richtung ist für Lesetext
gemacht. Ihre eigene Beschreibung schließt Kataloge und Dashboards ausdrücklich
aus — und Startseite, Wochenplan und Einkaufsliste sind genau das. Ohne
Seitenebene würde entweder die Rezeptseite zu nüchtern oder der Wochenplan zu
verspielt.

*(Der Fremd-Skill legt dafür einen Ordner mit einer Datei je Seite an. Bei fünf
Seiten mit je einer halben Seite Inhalt ist ein Ordner Overhead — deshalb eine
Datei mit fünf Abschnitten.)*

---

## Rezeptseite — `src/pages/rezept/[...slug].astro`

Die einzige Seite, auf der Editorial voll ausgespielt wird. Hier ist Lesetext
die Hauptsache.

**Erlaubt, was sonst nirgends erlaubt ist:**
- **Drop Cap** via `::first-letter` — genau einmal, auf dem Intro-Absatz.
  Nicht auf Zubereitungsschritten.
- **Pull-Quote-Behandlung** für den wichtigsten Küchen-Tipp aus den Notizen.
  Gleiche Optik wie ein Zitat, andere Semantik.
- **Full-Bleed-Titelbild.** Ersetzt die alte `object-fit: contain`-Box mit
  cremefarbenen Balken. Bild führt, wird nicht eingerahmt.
- Größte Display-Stufe (`--fs-display`) für den Rezepttitel.

**Layout:** Zutatenspalte und Zubereitung nebeneinander, Zutaten sticky.
Zubereitung auf `--w-measure` begrenzt, **nicht** auf Seitenbreite.

**Mobil — der wichtigste Fix der ganzen Seite:** Zutaten und Zubereitung dürfen
nicht untereinander liegen. Beim Kochen springt man ständig zwischen beiden;
aktuell scrollt man am großen Bild vorbei zu den Zutaten und dann weiter zur
Zubereitung. Umschalter oder eingeklappte Sticky-Leiste.

**Bild:** `<figure>` mit `<figcaption>` statt nacktem `<img>`.

**Offen:** `.add-plan` liegt als `<button>` im `<a>` — hier nicht relevant,
aber die Rezeptkarte auf der Startseite ist betroffen.

---

## Startseite — `src/pages/index.astro`

Strukturell ein **Katalog**. Editorial reduziert sich hier auf Typografie,
Kontrast und Raster.

**Verboten:** Drop Caps, Pull-Quotes, Fließtext-Ornamente jeder Art.

**Layout:** Weg vom uniformen `auto-fill, minmax(230px)`. Asymmetrische Reihen,
Größenhierarchie, Lead-Rezept groß (`.rcard--featured`). Kategorien als
nummerierte Rubriken („01 — Hauptgerichte").

**Breite:** `--w-page`, nicht `--w-measure`. Die Übersicht darf atmen.

**Filter-Chips:** typografisch statt als Pillen (`--r-xs` statt `--r-pill`).
Funktion bleibt unverändert.

**Zu beheben:**
- `.add-plan` aus dem `<a>` der Karte herauslösen — per Grid-Overlay
- Kategorie-Badge vom Bild in die Textzone verschieben (Kontrast auf Foto ist
  nicht garantiert)
- Kein Hover-Lift mehr; Zustandswechsel über den Rahmen, damit es auch per Tap
  funktioniert

**Ab ~60 Rezepten prüfen:** alle Karten liegen im DOM und werden per
`display:none` gefiltert. Bei 18 unkritisch.

---

## Wochenplan & Einkaufsliste — `src/pages/plan.astro`

Strukturell ein **Werkzeug**. Dichte schlägt Großzügigkeit.

**Verboten:** Display-Typo, Ornamente, große Bilder.

**Dichte:** engere Abstände als der Master vorgibt — hier zählt, wie viel
Liste auf einen Blick passt.

**Zutatenmengen** in Tabellenziffern, damit Kolonnen fluchten.

**Touch:** Die Einkaufsliste wird im Laden mit einer Hand bedient. Touch-Ziele
großzügig, Trefferfläche der Checkbox-Zeile über die ganze Zeilenbreite.

**Druckansicht bleibt erhalten.** Der `@media print`-Block ist funktional, kein
Beiwerk — die Liste wird ausgedruckt. Dunkle Flächen dürfen dort nie landen.

**Behoben durch `color-scheme`:** die nativen Checkboxen waren im Dark Mode
systemhell.

---

## Suche — `src/pages/suche.astro`

Fremdkomponente (Pagefind). Wir stylen sie über ihre CSS-Variablen, nicht per
Override ihrer Klassen.

**Aufgabe beim Umbau:** Die Pagefind-Variablen auf die neuen Semantic-Token
mappen. Aktuell zeigen sie auf die alten Namen.

**Deutsche Beschriftungen** prüfen — auch die Meldung „keine Treffer" gehört
zur Stimme.

**Offene Frage:** Startseiten-Titelsuche und Pagefind sind zwei getrennte
Sucherlebnisse. Zusammenführen wäre richtig, ist aber eigener Umfang — nicht
Teil des Redesigns.

---

## Zutatenseite — `src/pages/zutat/[slug].astro`

Katalog wie die Startseite, aber ohne Bilder.

**Karten:** `.rcard--compact` — ohne Thumbnail, ohne `.add-plan`, kleinerer
Titel.

**Kopfbereich** darf eine Display-Stufe tragen (der Zutatenname ist die
Überschrift), sonst nüchtern.
