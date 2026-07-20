---
name: well-seasoned
description: Gestaltung, Sprache und Barrierefreiheit von "Well Seasoned" — Designrichtung (Editorial/Kochbuch-Magazin), Design-Tokens, Layout-Regeln, Textstimme und Prüflisten. Nutzen bei jeder Änderung an src/ (Layout, CSS, Astro-Seiten), beim Schreiben von UI-Texten, beim Anlegen oder Überarbeiten von Rezepten und vor jedem Merge einer sichtbaren Änderung.
---

# Well Seasoned — Gestaltung & Sprache

Verbindlich für alles, was der Nutzer sieht oder liest. Details in `references/`.

**Hier stehen die Entscheidungen dieses Projekts.** Die Methode dahinter — wie
man Kontrast misst, Skalen herleitet, Theming ohne Duplikate baut, eine Stimme
destilliert — steht projektunabhängig im Skill `frontend-handwerk`. Bei
Grundsatzfragen dort nachsehen, nicht hier neu erfinden.

## Was das hier ist

Ein privates Kochbuch für zwei Personen. Astro 5, statisch, GitHub Pages,
Vanilla-CSS in einer Datei, **kein JS-Framework**. Kein Tailwind, kein React,
kein shadcn, kein CSS-Build-Step. Wenn eine Empfehlung von außen das
vorschlägt: ablehnen, sie kennt dieses Projekt nicht.

## Designrichtung: Editorial / Kochbuch-Magazin

Hochkontrast, asymmetrisches Raster, **Fotos führen**, große Display-Typo,
kantig statt weich, Trennung über **Linien und Weißraum statt Schatten**.
Vorbild ist ein gedrucktes Kochbuch, keine Rezept-App.

Fünf Regeln, aus denen der Rest folgt:

1. **Unterschiedliche Breiten für unterschiedliche Inhalte.** Übersicht darf
   breit atmen (`--w-page`), Lesetext bleibt bei ~70 Zeichen (`--w-measure`).
   Alles auf eine Breite zu normen ist der Hauptgrund, warum die alte Fassung
   auf großen Bildschirmen eingeschnürt wirkte.
2. **Kein Karten-Einerlei.** Nicht jeder Block ist eine Karte mit Radius und
   Schatten. Größenhierarchie und Rahmen tragen die Struktur.
3. **Akzent nur für Interaktion.** Vermillion markiert, was man anfassen kann
   oder was gerade aktiv ist — nie als Dekorfläche.
4. **Editorial-Ornamente nur im Lesetext.** Drop Cap und Pull-Quote gehören auf
   die Rezeptseite (einmal pro Seite). Startseite, Wochenplan und
   Einkaufsliste sind strukturell Katalog und Werkzeug — dort nur Typografie,
   Kontrast und Raster, keine Ornamente.
5. **Kein Verlass auf Hover.** In der Küche gibt es keinen Mauszeiger. Jede
   Interaktion muss per Tap funktionieren und sichtbar quittiert werden.

## Tokens

`references/tokens.css` ist die Referenzfassung. Architektur (zwei Schichten,
lokale Component-Tokens, `light-dark()`-Theming) siehe `frontend-handwerk`.
Projektspezifisch gilt zusätzlich:

- **Kein Hex direkt im Astro-Template.** Immer über Semantic-Token.
- Alles bleibt in **einer** CSS-Datei, solange sie unter ~400 Zeilen liegt.

### Farbe — geprüfte Werte

Kontrast gemessen, nicht geschätzt:

| Rolle | Hell | Kontrast | Dunkel |
|---|---|---|---|
| Text | `#0C0A09` auf `#FAFAF9` | 18.92:1 | `#E9EAE2` auf `#1C1917` — 14.43:1 |
| Gedämpft | `#57534E` | 7.30:1 | `#A8A29E` — 6.93:1 |
| Linie dekorativ | `#D6D3D1` | 1.43:1 | — |
| Linie interaktiv | `#78716C` | 4.59:1 | — |
| Akzent Fläche | `#FF3D00` | 3.40:1 | 4.93:1 |
| Akzent Text | `#C2410C` | 4.96:1 | `#FF3D00` reicht hier |

**Der Akzent ist zweistufig, und das ist kein Versehen:** `#FF3D00` erreicht auf
hellem Grund nur 3.40:1 — genug für Flächen und Rahmen (Schwelle 3:1), zu wenig
für Text (Schwelle 4.5:1). Für Text auf hellem Grund `#C2410C` nehmen. Im
Dark Mode entfällt die Unterscheidung, dort trägt `#FF3D00` auch Text.

`--color-line` (1.43:1) ist bewusst schwach und darf **nur dekorativ trennen**.
Sobald ein Rahmen ein Bedienelement begrenzt — Eingabefeld, Chip, Button —
gehört `--color-line-strong` hin, sonst wird WCAG 1.4.11 verletzt.

### Schrift

`Fraunces` (Display, variabel, `WONK`/`SOFT`-Achsen) + `Source Serif 4`
(Lesetext, variabel) + System-Sans für UI-Kleinkram. Beide Webfonts haben
`latin-ext`, also **ä ö ü ß**. Preload nicht vergessen, `font-display: swap`.

Nicht nehmen: Playfair Display (überall im Einsatz, zu hoher Strichkontrast für
Fließtext), Cormorant (zu zart für die Küche), Instrument Serif (nur zwei
Schnitte, kein Bold).

**Ziffern:** Mediävalziffern im Fließtext, Tabellenziffern in Mengen und Zeiten.

```css
.zubereitung      { font-variant-numeric: oldstyle-num; }
.menge, .ek-menge { font-variant-numeric: tabular-nums lining-nums; }
```

## Sprache

Kurzfassung — vollständig in `references/stimme.md`:

**Grundhaltung: Zwei Leute, die zusammen kochen, schreiben sich Notizen.**
Kein Publikum, keine Begrüßung, keine Begeisterung auf Vorrat.

- Oberfläche **duzt** ("Öffne ein Rezept"), Zubereitungsschritte stehen im
  **unpersönlichen Infinitiv** ("Butter in eine Pfanne geben"). Das ist die eine
  bewusste Registerabweichung.
- **Fett markiert genau eine Sorte Information:** die Größe, an der der Schritt
  scheitern kann — Zeit, Temperatur, Menge.
- **Emoji sind Funktionsträger:** 🛒 Kochplan · 🎲 Zufall · 🔍 Suche · ⏱ Zeit ·
  ◐ Theme · ✓ erledigt · ★ Bewertung. Sonst keine, nie im Fließtext.
  ⚠️ **Offene Entscheidung, beim Umbau zu prüfen:** Drei unabhängige Quellen
  raten von Emoji als strukturellen Icons ab (schriftabhängig,
  plattforminkonsistent, nicht über Tokens steuerbar), und die
  Editorial-Richtung bevorzugt ohnehin Wort-Labels gegenüber Icons. Im neuen
  Layout ansehen und dann entscheiden — ★ und ✓ sind Symbole, keine Emoji,
  und dürfen in jedem Fall bleiben.
- **Verbotene Wörter:** „einfach mal", „lecker", „genial", „unwiderstehlich",
  „Ups", „leider", „bitte beachten Sie", „Nutzer", „Klick hier".
- Kein Ausrufezeichen außer „Genießen!" am Ende einer Zubereitung.

**Testfrage:** Klingt das nach einer Rezept-App aus dem Store? Dann streichen.

## Barrierefreiheit

Allgemeine Regeln in `frontend-handwerk/references/a11y.md`. Für dieses
Projekt kommt eines dazu, und es wiegt schwer:

**Gekocht wird mit nassen und fettigen Fingern.** Touch-Ziele deshalb eher
48px als 44px, und kein Zustand darf ausschließlich über Hover erreichbar
sein. Ein Hover-Lift als Karten-Feedback ist hier nicht nur unschön, sondern
funktionslos.

Drei bekannte offene Mängel, die beim Umbau mitgehen:
- `.add-plan` liegt als `<button>` im `<a>` der Rezeptkarte — verschachtelt
- Checkboxen der Einkaufsliste sind im Dark Mode systemhell — löst `color-scheme`
- Kein Skip-Link, obwohl fünf Nav-Elemente vor `<main>` liegen

Vollständige Prüfliste in `references/pruefliste.md`, vor jedem Merge
durchgehen.

## Bewegung

Sparsam. Ohne JS-Bibliothek — `animation-timeline: view()` für Scroll-Reveal,
Astro View Transitions für Seitenwechsel. Dauern: 200ms Micro, 300ms Reveal.
Easing `cubic-bezier(0.25, 0, 0, 1)`.

Kein Parallax auf Text. Reveal-Effekte dürfen Inhalt **nie** per Default
unsichtbar machen — die Seite muss ohne JS vollständig lesbar bleiben.

## Referenzen

| Datei | Inhalt |
|---|---|
| `references/tokens.css` | Vollständiger Token-Block, übernahmefertig |
| `references/stimme.md` | Stimmen-Leitfaden mit Regeln je Textsorte |
| `references/komponenten.md` | Bauteil-Spezifikationen (Anatomie, Zustände) |
| `references/pruefliste.md` | Prüfliste Barrierefreiheit + Konsistenz |
| `references/og-bilder.md` | Open-Graph-Vorschaubilder: Maße und Umsetzung |
