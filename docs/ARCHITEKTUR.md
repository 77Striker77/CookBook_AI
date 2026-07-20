# Architektur

## Überblick

```
                 ┌──────────────────────────────────────────────┐
                 │                GitHub-Repo                    │
                 │  = Obsidian-Vault (Markdown + Bilder)         │
                 │  = Quelle der Website                         │
                 │  = Briefkasten (Issues) + Automatik (Actions) │
                 └──────────────────────────────────────────────┘
   Einreichen                        │                       Lesen
┌───────────────┐    Issue     ┌─────┴──────┐   Build    ┌──────────────┐
│ Person 2:     │ ──────────▶  │ Import-    │ ─────────▶ │ GitHub Pages │
│ Link/Foto in  │   (Label     │ Action +   │  (Astro,   │ → Website    │
│ Formular      │   `import`)  │ Claude API │  Suche)    │ auf allen    │
└───────────────┘              │ → PR       │            │ Geräten (PWA)│
                               └─────┬──────┘            └──────────────┘
                                     │ Review (Agent + Person 1) → Merge
```

## Komponenten

### Website (Phase 1)

- **Astro** mit Content Collections: liest die Rezept-Markdown-Dateien direkt
  aus dem Vault; ein **Zod-Schema validiert das Frontmatter beim Build** —
  eine kaputte Datei kann nicht live gehen (automatisches Qualitäts-Gate).
- **Suche** laeuft clientseitig ueber Titel, Tags und Zutatennamen — die Karten
  tragen sie als data-Attribute. Pagefind war einmal im Build, wurde aber mit
  der eigenen Suchseite entfernt: 762 KB Index, den nichts mehr geladen hat.
  Bei deutlich mehr Rezepten waere es der naheliegende Weg zurueck.
- **PWA-Manifest** für Installation auf dem Homescreen.
- **Deployment:** GitHub Action baut bei jedem Push auf `main` und deployt
  auf GitHub Pages.

### Import-Pipeline (Inbox + Skill)

**Standardweg — ohne API-Key.** Einreichungen sammeln sich als offene Issues
(Label `import`, erstellt über das Issue-Formular mit Link, Foto-Upload, Notiz).
Der `/inbox`-Skill (`.claude/skills/inbox/`) arbeitet sie in einer
Claude-Code-Session ab:

1. **Inbox lesen:** offene `import`-Issues holen (GitHub-MCP).
2. **Materialbeschaffung je Einreichung:**
   - *Web:* Seite via WebFetch; Schema.org-`Recipe`-JSON-LD bevorzugt.
   - *Foto/Scan:* Anhang mit `curl` nach `kochbuch/anhang/` laden, mit dem
     Read-Tool als Bild auswerten (auch Handschrift).
   - *Instagram:* aus Caption/Beschreibung, soweit vorhanden (Ton/Video → Phase 3).
3. **Synthese in der Session** (das Session-Modell, kein API-Key): Rezept nach
   Vault-Schema; Unklares wird markiert, nicht geraten.
4. **Prüfen:** `npm run build` validiert das Schema; committen & pushen.
5. **Issue schließen** mit Hinweis auf die angelegte Datei.

**Kosten:** nur das Claude-Code-Abo — keine laufenden API-Kosten.

**Optionaler Vollautomatik-Schalter.** Für „Button → fertiger PR ohne Session"
existiert zusätzlich eine Action (`.github/workflows/import.yml`) mit dem
Skript `scripts/import-rezept.mjs` (Claude API, Modell via `CLAUDE_MODEL`,
Default `claude-opus-4-8`). **Standardmäßig aus** — aktiviert nur, wenn die
Repository-Variable `AUTO_IMPORT=true` gesetzt und das Secret
`ANTHROPIC_API_KEY` hinterlegt ist.

**Fallback Instagram:** Reicht die Caption nicht, das Video als Datei ins
Formular hochladen — die Bild-/Textauswertung ab dort ist identisch.

### Agents & Skills (im Repo unter `.claude/`)

Dieselbe Logik ist doppelt nutzbar: interaktiv in Claude-Code-Sessions und
automatisiert via GitHub Actions.

| Skill | Zweck |
|---|---|
| `/inbox` | Arbeitet alle offenen Einreichungen (Label `import`) in einer Session ab |
| `/neues-rezept <url\|datei>` | Manueller Import einer einzelnen Quelle |
| `/review-rezept [datei]` | Schema-, Plausibilitäts- und Duplikat-Check |
| `/koch-was [zutaten]` | Vorrats-Abgleich → Vorschläge aus dem Kochbuch |
| `/wochenplan` | Ausgewogener Wochenplan + Einkaufsliste |
| `/vault-pflege` | Bibliothekar: Tags konsolidieren, fehlende Bilder/Bewertungen finden |

Geplante Agent-Definitionen (`.claude/agents/`): `rezept-importeur`,
`rezept-pruefer`, `bibliothekar` — jeweils mit engem Werkzeug-Satz und dem
Schema aus `_meta/schema.md` als Vertrag.

## Kosten

| Posten | Kosten |
|---|---|
| GitHub (Repo, Issues, Actions, Pages) | 0 € (Free-Tier reicht locker) |
| Obsidian | 0 € (Sync via Git) |
| Astro, yt-dlp, whisper | 0 € (Open Source) |
| Claude API | ~1–5 ct pro Rezept-Import |
| Eigene Domain (optional) | ~10 €/Jahr |

## Sicherheit & Zugriff

- Repo kann **privat** bleiben; GitHub Pages aus privaten Repos erfordert
  GitHub Pro (~4 $/Monat) **oder** die Website wird über einen kostenlosen
  Alternativ-Host (Cloudflare Pages/Vercel, Free-Tier) aus dem privaten Repo
  gebaut. Entscheidung in Phase 1.
- API-Key liegt ausschließlich als GitHub Actions Secret, nie im Code.
