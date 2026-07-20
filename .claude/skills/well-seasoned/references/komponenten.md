# Bauteile

Ein Abschnitt pro Bauteil. Zweck: die Zustände einer Komponente stehen an
**einer** Stelle — in der CSS-Datei liegen sie über fünf Regeln verstreut und
gehen beim Umbau verloren.

Format je Bauteil: Anatomie · erlaubte Tokens · Varianten · Zustände ·
Barrierefreiheit. Keine Größen-Tabelle (wir haben keine Größenvarianten) und
kein Loading-State (statische Seite, keine asynchronen Zustände).

---

## `.rcard` — Rezeptkarte

Verlinkter Einstieg in ein Rezept. Erscheint im `.grid` auf Startseite,
Kategorie- und Zutatenseiten.

### Anatomie

```
┌────────────────────────────────────┐
│                              [ + ] │  .add-plan   float, r-pill
│           Titelbild 16:10          │  .thumb      object-fit: cover
│                                    │
├────────────────────────────────────┤  Trennlinie statt Schatten (bw-hair)
│  KATEGORIE                         │  .kat        Versalien, fs-2xs, tr-caps
│  Ofen-Kebab                        │  .title      Display, fs-xl, lh-snug
│  ★★★★☆   45 Min · 4 Portionen      │  .stars + .meta
└────────────────────────────────────┘
```

### Erlaubte Tokens

| Rolle | Token |
|---|---|
| Fläche | `--color-surface-raised` |
| Rahmen | `--bw-hair` / `--color-line` |
| Rahmen hover/focus | `--color-ink` |
| Titel | `--ff-display`, `--fs-xl`, `--fw-semibold`, `--lh-snug`, `--color-ink` |
| Meta | `--fs-sm`, `--color-ink-muted` |
| Sterne | `--fs-xs`, `--color-accent` |
| Kategorie-Badge | `--fs-2xs`, `--tr-caps`, `--color-ink-muted` |
| Radius | `--r-none` — nur `.add-plan` bekommt `--r-pill` |
| Innenabstand | `--sp-xs` / `--sp-sm` |
| Elevation | `--elev-0` — **die Karte trägt keinen Schatten** |
| Transition | `--dur-fast` `--ease`, nur `border-color` |

### Varianten

| Variante | Auslöser | Abweichung |
|---|---|---|
| `default` | – | wie oben |
| `.rcard--featured` | erstes Element der Startseite | `grid-column: span 2`, Titel `--fs-h3`, Bild 21:9 |
| `.rcard--compact` | Zutatenseite, Suchergebnis | ohne `.thumb`, ohne `.add-plan`, Titel `--fs-md` |

### Zustände

| Zustand | Rahmen | Sonstiges |
|---|---|---|
| default | `--color-line` | – |
| hover | `--color-ink` | **kein** `translateY` |
| focus-visible | – | Outline `--bw` `--color-accent`, Offset 2px |
| geplant | `--color-accent` | `.add-plan` gefüllt, Zeichen `✓` |

### Abweichung vom alten Stand

`box-shadow` und `transform: translateY(-2px)` entfallen ersatzlos. Der Hover
läuft über den Rahmenwechsel. Das ist „Trennung über Linien statt Schatten" auf
Bauteilebene — und es funktioniert im Gegensatz zum Hover-Lift auch per Tap.

### Barrierefreiheit

- ⚠️ **Offener Mangel:** Die ganze Karte ist ein `<a>`, `.add-plan` liegt als
  `<button>` darin. Verschachtelte Interaktive sind ungültiges HTML und per
  Tastatur nicht sauber bedienbar. **Beim Umbau auflösen** — Button aus dem
  `<a>` heraus, per Grid-Overlay auf die gleiche Position legen.
- `.kat` lag bisher auf dem Bild mit `rgba(0,0,0,.4)` — Kontrast damit
  bildabhängig und nicht garantiert. Editorial-Lösung: Badge unter das Bild in
  die Textzone verschieben. Löst beide Probleme auf einmal.
- `.add-plan` braucht `aria-label` und `aria-pressed`, Trefferfläche ≥44px.

---

## Noch zu spezifizieren

Gleiches Format anwenden, sobald das Bauteil umgebaut wird:

- `.zutaten li` — Zutatenzeile (Menge, Name, Notiz, Gruppentrenner)
- `.chip` — Filter. Kandidat für lokale Component-Tokens, hat zwei Zustände
  die je drei Eigenschaften ändern:

  ```css
  .chip {
    --chip-bg: var(--color-surface);
    --chip-fg: var(--color-ink-muted);
    --chip-br: var(--color-line-strong);
    background: var(--chip-bg); color: var(--chip-fg);
    border: var(--bw-hair) solid var(--chip-br);
  }
  .chip[aria-pressed="true"] {
    --chip-bg: var(--color-accent);
    --chip-fg: var(--color-accent-ink);
    --chip-br: var(--color-accent);
  }
  ```

  Eine Zeile pro Variante statt drei. So sehen Component-Tokens richtig aus:
  lokal im Regelblock, nicht in `:root`.

- `.stepper` — Portionsregler. Aktuell 30px, muss auf ≥44px
- `.ek-item` — Einkaufslisten-Zeile. Checkbox folgt jetzt via `color-scheme`
  dem Theme
- `.btn` — Button, Varianten `primary` / `ghost` / `small`
- `.fact` — Faktenpille auf der Rezeptseite
