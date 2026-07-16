# Vault-Struktur & Rezept-Schema

Der Vault ist bewusst **flach**: Kategorien und Eigenschaften leben nicht in
Ordnern, sondern im Frontmatter jeder Datei. Das macht Filter, Suche und den
späteren Vorrats-Abgleich trivial — und Obsidian kann per Dataview beliebige
Ansichten daraus bauen.

## Ordnerstruktur

```
kochbuch/                 ← Obsidian-Vault (= Repo-Unterordner)
├── rezepte/              ← eine Datei pro Rezept, flach
│   ├── shakshuka.md
│   └── omas-linsensuppe.md
├── sammlungen/           ← Menüs, Favoriten, Wochenpläne (Dataview)
│   └── wochenplan.md
├── vorrat/
│   └── vorratskammer.md  ← was zuhause ist (Phase 4)
├── anhang/               ← Bilder & Scans (Dateiname = Rezept-Slug)
└── _meta/
    ├── templates/
    │   └── rezept.md     ← Obsidian-Template für neue Rezepte
    ├── schema.md         ← dieses Schema, maschinenlesbar referenziert
    └── tags.md           ← kontrollierte Tag-Liste (der Bibliothekar wacht darüber)
```

## Rezept-Schema (Frontmatter)

```yaml
---
titel: Shakshuka                  # Pflicht
kategorie: hauptgericht           # Pflicht: hauptgericht | frühstück | dessert |
                                  #          beilage | suppe | salat | snack |
                                  #          backen | getränk | grundrezept
küche: israelisch                 # optional, Freitext
tags: [vegetarisch, schnell, pfanne]  # aus _meta/tags.md
portionen: 2                      # Pflicht, Basis für den Portionsrechner
zeit_aktiv: 15                    # Minuten Hands-on
zeit_gesamt: 30                   # Pflicht, Minuten inkl. Warten
schwierigkeit: einfach            # einfach | mittel | aufwendig
quelle:
  typ: instagram                  # instagram | web | scan | eigen | familie
  url: https://www.instagram.com/reel/…   # wenn vorhanden
  autor: "@kochhandle"            # optional
bild: anhang/shakshuka.jpg        # Titelbild
bewertung:                        # 1–5, erst nach dem Kochen setzen
gekocht: []                       # Liste von Daten, z. B. [2026-07-02]
status: entwurf                   # entwurf | geprüft  (Import erzeugt „entwurf“)
---
```

**Validierung:** Der Website-Build prüft dieses Schema (Zod). Pflichtfelder
fehlen oder ein unbekannter `kategorie`-Wert → Build schlägt fehl, der PR
kann nicht gemerged werden.

## Rezept-Body (feste Sektionen)

```markdown
## Zutaten

- 1 EL Olivenöl
- 1 Zwiebel, gewürfelt
- 400 g gehackte Tomaten
- 4 Eier

### Für die Garnitur          ← Untergruppen erlaubt

- 1 Handvoll Petersilie

## Zubereitung

1. Zwiebel im Öl glasig anbraten.
2. Tomaten zugeben, salzen, 10 Minuten offen einkochen.
3. Mulden formen, Eier hineingleiten lassen, 6–8 Minuten stocken lassen.

## Notizen & Varianten

- Mit Feta noch besser.
```

**Regeln für die Zutatenliste** (wichtig für Portionsrechner und
Vorrats-Abgleich):

- Format pro Zeile: `- <Menge> <Einheit> <Zutat>[, <Zubereitung>]`
- Mengen als Zahl (auch `0.5` oder `1/2`), Einheiten aus einer festen Liste
  (g, kg, ml, l, EL, TL, Stück, Prise, Bund, Dose, …)
- „nach Geschmack“ ist als Menge erlaubt und wird nicht skaliert

## Sammlungen & Vorrat

- **Sammlungen** sind normale Notizen mit Dataview-Blöcken oder simplen
  Linklisten (`[[shakshuka]]`), z. B. „Weihnachtsmenü“, „Schnelle Feierabendküche“.
- **`vorratskammer.md`** ist eine einfache Checkliste von Zutaten (eine pro
  Zeile, gleiche Einheiten-Konventionen). Der `/koch-was`-Skill gleicht sie
  fuzzy gegen alle Zutatenlisten ab — exakte Datenbank-Normalisierung ist
  bewusst nicht nötig, das übernimmt die KI.

## Namenskonventionen

- Dateiname = Slug des Titels, kleingeschrieben, Bindestriche: `omas-linsensuppe.md`
- Bilder: `anhang/<slug>.jpg` (Titelbild), weitere als `<slug>-2.jpg` usw.
- Scans behalten ihr Original zusätzlich: `anhang/<slug>-scan.jpg`
