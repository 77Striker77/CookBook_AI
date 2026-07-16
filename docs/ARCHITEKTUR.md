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
│ Formular      │   `import`)  │ Claude API │  Pagefind) │ auf allen    │
└───────────────┘              │ → PR       │            │ Geräten (PWA)│
                               └─────┬──────┘            └──────────────┘
                                     │ Review (Agent + Person 1) → Merge
```

## Komponenten

### Website (Phase 1)

- **Astro** mit Content Collections: liest die Rezept-Markdown-Dateien direkt
  aus dem Vault; ein **Zod-Schema validiert das Frontmatter beim Build** —
  eine kaputte Datei kann nicht live gehen (automatisches Qualitäts-Gate).
- **Pagefind** für client-seitige Volltextsuche (kein Server, kostenlos).
- **PWA-Manifest** für Installation auf dem Homescreen.
- **Deployment:** GitHub Action baut bei jedem Push auf `main` und deployt
  auf GitHub Pages.

### Import-Pipeline (Phasen 2–3)

Auslöser: Issue mit Label `import` (erstellt über ein Issue-Formular mit
Feldern für Link, Foto-Upload und optionale Notiz).

1. **Quellenerkennung:** Instagram / Web / Bild.
2. **Materialbeschaffung:**
   - *Web:* HTML laden, Schema.org-`Recipe`-JSON-LD bevorzugen.
   - *Instagram:* `yt-dlp` lädt Video + Caption; `ffmpeg` extrahiert
     Audio und Standbilder; Transkription via `faster-whisper` im Runner
     (kostenlos) oder API.
   - *Scan:* Bild aus dem Issue-Anhang.
3. **Synthese (Claude API):** Caption + Transkript + Bilder → strukturiertes
   Rezept nach Vault-Schema. Modell: `claude-sonnet-5` (gutes
   Preis-Leistungs-Verhältnis für Extraktion; Vision inklusive).
4. **PR-Erstellung:** Branch + Rezept-Datei + Titelbild + Vorschau-Kommentar
   im Issue.
5. **Review:** Review-Agent kommentiert Qualitätscheck (Schema, Mengen-/
   Zeiten-Plausibilität, Duplikatsuche); Person 1 merged.

**Fallback Instagram:** Schlägt der Auto-Download fehl, kann die Video-Datei
direkt ins Issue-Formular hochgeladen werden — Schritt 2 entfällt, Rest identisch.

### Agents & Skills (im Repo unter `.claude/`)

Dieselbe Logik ist doppelt nutzbar: interaktiv in Claude-Code-Sessions und
automatisiert via GitHub Actions.

| Skill | Zweck |
|---|---|
| `/neues-rezept <url\|datei>` | Manueller Import einer Quelle in einer Session |
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
| Astro, Pagefind, yt-dlp, whisper | 0 € (Open Source) |
| Claude API | ~1–5 ct pro Rezept-Import |
| Eigene Domain (optional) | ~10 €/Jahr |

## Sicherheit & Zugriff

- Repo kann **privat** bleiben; GitHub Pages aus privaten Repos erfordert
  GitHub Pro (~4 $/Monat) **oder** die Website wird über einen kostenlosen
  Alternativ-Host (Cloudflare Pages/Vercel, Free-Tier) aus dem privaten Repo
  gebaut. Entscheidung in Phase 1.
- API-Key liegt ausschließlich als GitHub Actions Secret, nie im Code.
