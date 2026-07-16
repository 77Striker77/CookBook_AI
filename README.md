# Unser Kochbuch 🍳

Ein gemeinsames, digitales Kochbuch für 2+ Personen — erreichbar von jedem Gerät.

**Das Prinzip:** Ein Obsidian-Vault als Datenzentrum (Markdown in diesem Git-Repo),
eine automatisch gebaute Website für den Alltag, und ein „Rezept-Briefkasten“, über
den neue Rezepte per Link, Instagram-Reel oder Scan eingeworfen werden — den Rest
erledigen KI-Agents.

## Status

✅ **Phase 1 (Fundament) steht.** Vault-Struktur, validiertes Schema,
Zutaten-Parser mit automatischer Verlinkung, 3 Startrezepte und die Website
(Grid, Filter, Portionsrechner, Zutaten-Seiten, Volltextsuche, PWA) sind da und
bauen grün. Als Nächstes: Phase 2 (Rezept-Briefkasten). Siehe [Roadmap](docs/ROADMAP.md).

## Lokal starten

```bash
npm install
npm run dev      # Vorschau unter http://localhost:4321
npm run build    # baut die Website nach dist/ (inkl. Suchindex)
```

Die Rezepte liegen in `kochbuch/rezepte/` — das ist gleichzeitig der
Obsidian-Vault. Öffne den Ordner `kochbuch/` in Obsidian, um zu stöbern und zu
verwalten.

## Projektstruktur

```
kochbuch/          ← Obsidian-Vault = Datenbasis (Rezepte, Vorrat, Meta)
src/               ← Astro-Website (liest aus dem Vault)
  content.config.ts  Schema-Validierung (Zod)
  lib/zutaten.ts     Zutaten-Parser & kanonische Verlinkung
  pages/             Startseite, Rezept-, Zutaten-, Suchseite
.claude/skills/    ← /neues-rezept und /review-rezept
.github/workflows/ ← Build & Deploy auf GitHub Pages
docs/              ← Konzept, Architektur, Roadmap
```

## Dokumente

| Dokument | Inhalt |
|---|---|
| [docs/KONZEPT.md](docs/KONZEPT.md) | Die Idee, die drei Säulen, getroffene Entscheidungen |
| [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md) | Tech-Stack, Import-Pipeline, Agents & Skills, Kosten |
| [docs/VAULT-STRUKTUR.md](docs/VAULT-STRUKTUR.md) | Ordnerstruktur, Rezept-Schema, Vorlagen |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phasenplan von Fundament bis Kür |

## Die drei Säulen in einem Satz

1. **Datenzentrum:** Obsidian-Vault im Git-Repo — jedes Rezept eine Markdown-Datei
   mit striktem Schema, versioniert, exportierbar, für immer lesbar.
2. **Alltag:** Statische Website (Astro + GitHub Pages, kostenlos) mit Suche,
   Filtern, Portionsrechner und Kochmodus — als PWA auf jedem Homescreen.
3. **Wachstum:** Issue-Formular als Briefkasten → GitHub Action → Claude API
   analysiert Link/Reel/Scan → fertiges Rezept als Pull Request → Review → live.
