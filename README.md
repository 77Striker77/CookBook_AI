# Unser Kochbuch 🍳

Ein gemeinsames, digitales Kochbuch für 2+ Personen — erreichbar von jedem Gerät.

**Das Prinzip:** Ein Obsidian-Vault als Datenzentrum (Markdown in diesem Git-Repo),
eine automatisch gebaute Website für den Alltag, und ein „Rezept-Briefkasten“, über
den neue Rezepte per Link, Instagram-Reel oder Scan eingeworfen werden — den Rest
erledigen KI-Agents.

## Status

🚧 **Konzeptphase.** Dieses Repo enthält aktuell das System-Design; die Umsetzung
folgt nach Freigabe des Pitches (siehe [Roadmap](docs/ROADMAP.md), Phase 1).

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
