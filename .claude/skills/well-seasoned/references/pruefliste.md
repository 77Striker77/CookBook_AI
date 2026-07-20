# Prüfliste — vor jedem Merge einer sichtbaren Änderung

## Barrierefreiheit — nicht verhandelbar

### Bedienung in der Küche
- [ ] **Kein Verlass auf Hover.** Jede Interaktion funktioniert per Tap.
      *Wichtigste Regel überhaupt — am Tablet mit fettigen Fingern gibt es
      keinen Mauszeiger.*
- [ ] Touch-Ziele **≥44×44px** (in der Küche eher 48px), Abstand **≥8px**
- [ ] `touch-action: manipulation` gesetzt — sonst 300ms Verzögerung
- [ ] Sichtbares Feedback beim Antippen (Aktivzustand, nicht nur Hover)

### Tastatur und Screenreader
- [ ] `:focus-visible` sichtbar auf **allem** Interaktiven
- [ ] Nie `outline: none` ohne gleichwertigen Ersatz
- [ ] Tab-Reihenfolge entspricht der visuellen Reihenfolge
- [ ] **Keine verschachtelten interaktiven Elemente** (kein `<button>` in `<a>`)
- [ ] Skip-Link zum Inhalt vorhanden — der Header hat fünf Nav-Elemente vor `<main>`
- [ ] Icon-only-Buttons haben `aria-label`
- [ ] Dynamische Zähler (Plan-Badge) in `aria-live="polite"`
- [ ] Überschriften h1→h2→h3 ohne Sprünge
- [ ] Semantisches HTML: `<nav>`, `<main>`, `<article>`, `<figure>`
- [ ] Inhaltsbilder haben beschreibende `alt`-Texte

### Farbe und Kontrast
- [ ] Text ≥4.5:1, Bedienelement-Rahmen ≥3:1
- [ ] **In beiden Themes geprüft**, nicht nur im hellen
- [ ] Akzent-Text auf hellem Grund nutzt `--color-accent-text` (`#C2410C`),
      **nicht** `--color-accent` (`#FF3D00` = nur 3.40:1)
- [ ] Rahmen um Bedienelemente nutzt `--color-line-strong`, nicht `--color-line`
- [ ] Keine Information allein über Farbe — immer Icon oder Text dazu
- [ ] `color-scheme` gesetzt, damit native Checkboxen dem Theme folgen

### Bewegung
- [ ] `prefers-reduced-motion` respektiert
- [ ] Kein Parallax auf Text
- [ ] Reveal-Effekte machen Inhalt **nie** per Default unsichtbar — die Seite
      muss ohne JS vollständig lesbar bleiben
- [ ] Höchstens 1–2 animierte Elemente pro Ansicht
- [ ] Nur `transform` und `opacity` animieren

### Layout
- [ ] Kein horizontaler Scroll bei 320px Breite
- [ ] `aspect-ratio` auf Bildcontainern — kein Layout-Shift beim Laden
- [ ] Bei 320 / 375 / 414 / 768 / 1024 / 1440 px geprüft
- [ ] `dvh` statt `100vh`
- [ ] Breite Tabellen in `overflow-x: auto`-Wrapper

## Konsistenz

### Visuell
- [ ] Nur Semantic-Tokens — **kein Hex direkt im Astro-Template**
- [ ] Komponenten greifen nicht auf Primitive-Tokens zu
- [ ] Neue Farbe? Nur in der `light-dark()`-Zeile, nirgends dupliziert
- [ ] Überschriften `--ff-display`, Lesetext `--ff-body`, UI `--ff-ui` —
      keine vierte Familie
- [ ] Radius: Default ist `--r-none`. Ausnahmen begründet
- [ ] Kein `box-shadow` außer bei echt schwebenden Elementen
- [ ] Abstände aus der Neuner-Skala, keine freien px-Werte
- [ ] Kategorie-Darstellung für jede neue Kategorie in `darstellung.ts` ergänzt

### Typografie
- [ ] Lesetext bei ~70 Zeichen (`--w-measure`), nicht auf voller Breite
- [ ] Mediävalziffern im Fließtext, Tabellenziffern in Mengen und Zeiten
- [ ] Fonts mit `font-display: swap` und Preload
- [ ] Versalien haben `letter-spacing`

### Sprache
Vollständig in `stimme.md`. Schnellprüfung:
- [ ] Oberfläche duzt, Zubereitungsschritte im unpersönlichen Infinitiv
- [ ] Kein Ausrufezeichen außer „Genießen!"
- [ ] Buttons: Verb-Infinitiv, ≤3 Wörter, kein Punkt
- [ ] Leerer Zustand: Feststellung + konkreter nächster Handgriff
- [ ] Fehlermeldung nennt keine technische Ursache ohne Handlungsnutzen
- [ ] Kein Wort aus der Verbotsliste
- [ ] Emoji nur aus dem Funktionssatz

### Rezepte
- [ ] Schritt-Label fett, Handlung benannt, Infinitiv-Anweisung
- [ ] Jede kritische Zeit / Temperatur / Menge fett
- [ ] Zeitangaben mit Erkennungsmerkmal („bis … goldbraun")
- [ ] Geschätzte oder umgerechnete Werte in den Notizen ausgewiesen
- [ ] Quelle mit Typ, Autor und Original-Link vollständig
- [ ] Bild unter 1 MB, hart bei 5 MB
- [ ] Bildsprache konsistent: Gericht mittig, natürliches Licht, kein Filter,
      kein Text im Bild

## Orte, die bei Textänderungen mitgeprüft werden

- [ ] `src/layouts/Base.astro` — Navigation, Footer, Titelmuster
- [ ] `src/pages/index.astro` — Hero, Chips, Zähler, Leerzustand
- [ ] `src/pages/plan.astro` — Intro, Leerzustand, Werkzeuge, Meldungen
- [ ] `src/pages/suche.astro` — Pagefind-Übersetzungen, noscript
- [ ] `src/pages/rezept/[...slug].astro` — Fakten, Quellenzeile, Plan-Button
- [ ] `.github/ISSUE_TEMPLATE/neues-rezept.yml` — der Briefkasten ist auch Oberfläche
- [ ] `README.md` + `docs/` — der Erklärton gehört zur Stimme

## Abschluss

- [ ] `npm run build` läuft grün
- [ ] Alle 18 Rezeptseiten stichprobenartig durchgeklickt
- [ ] Beide Themes einmal durchgeschaltet
