# Rezept-Schema (der Vertrag)

Jedes Rezept in `rezepte/` ist eine Markdown-Datei mit YAML-Frontmatter nach
diesem Schema. Der Website-Build validiert es automatisch — fehlt ein
Pflichtfeld oder ist ein Wert ungültig, schlägt der Build fehl und das Rezept
kann nicht live gehen. Die maschinelle Prüfung steht in `src/content.config.ts`.

## Frontmatter-Felder

| Feld | Pflicht | Typ / Werte |
|---|---|---|
| `titel` | ✅ | Text |
| `kategorie` | ✅ | hauptgericht, frühstück, dessert, beilage, suppe, salat, snack, backen, getränk, grundrezept |
| `küche` | – | Text (z. B. „italienisch“) |
| `tags` | – | Liste, z. B. `[vegetarisch, schnell]` |
| `portionen` | ✅ (Default 2) | ganze Zahl > 0 — Basis für den Portionsrechner |
| `zeit_aktiv` | – | Minuten Hands-on |
| `zeit_gesamt` | – | Minuten inkl. Warten |
| `schwierigkeit` | – | einfach, mittel, aufwendig |
| `zutaten` | ✅ | Liste lesbarer Zeilen (siehe unten) |
| `quelle.typ` | – | instagram, web, scan, eigen, familie |
| `quelle.url` | – | URL zum Original |
| `quelle.autor` | – | Text |
| `bild` | – | Pfad zu einem Bild in `anhang/` |
| `bewertung` | – | 1–5 (erst nach dem Kochen) |
| `gekocht` | – | Liste von Daten, z. B. `[2026-07-02]` |
| `status` | – | entwurf (Default) oder geprüft |

## Zutaten-Zeilen

Zutaten stehen als lesbare Liste im Feld `zutaten`. Der Parser
(`src/lib/zutaten.ts`) zerlegt jede Zeile automatisch in Menge, Einheit, Zutat
und Notiz und verlinkt die Zutat kanonisch (siehe `synonyme.yaml`).

Format pro Zeile: `<Menge> <Einheit> <Zutat>[, <Notiz>]`

```yaml
zutaten:
  - 400 g gehackte Tomaten, aus der Dose   # Menge+Einheit+Notiz
  - 4 Eier                                 # Menge ohne Einheit
  - 6-8 Kirschtomaten                      # Bereich wird mitskaliert
  - 1 Bund Petersilie
  - Salz nach Geschmack                    # wird nicht skaliert
  - "# Für die Sauce"                      # Zwischenüberschrift (mit #)
```

- **Mengen:** ganze Zahlen, Dezimal (`1.5` oder `1,5`), Brüche (`1/2`),
  gemischt (`1 1/2`) oder Bereiche (`6-8`).
- **Einheiten:** g, kg, ml, l, EL, TL, Prise, Stück, Bund, Zehe, Dose, … —
  weglassen, wenn keine sinnvoll ist (`4 Eier`).
- **Notiz:** alles nach dem ersten Komma (oder in Klammern).
- **Ohne Menge:** „nach Geschmack“, „etwas …“ werden erkannt und nicht skaliert.

## Body

Nach dem Frontmatter folgen feste Abschnitte:

```markdown
## Zubereitung

1. Erster Schritt …
2. Zweiter Schritt …

## Notizen & Varianten

- Freitext.
```
