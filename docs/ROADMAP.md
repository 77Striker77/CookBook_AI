# Roadmap

Jede Phase liefert etwas sofort Benutzbares. Reihenfolge ist bewusst:
erst das Fundament fühlen, dann die Import-Maschine bauen.

## Phase 1 — Fundament ✅ *(erledigt)*

**Ziel:** Das Kochbuch ist benutzbar und fühlt sich gut an.

- [x] Vault-Struktur anlegen (`kochbuch/` gemäß VAULT-STRUKTUR.md)
- [x] Schema als Zod-Definition + `_meta/schema.md`
- [x] Obsidian-Template `_meta/templates/rezept.md`
- [x] Zutaten-Parser mit kanonischer Verlinkung + Synonym-Tabelle
- [~] Start-Rezepte erfassen — **3 Beispiele da, echte Lieblingsrezepte folgen**
- [x] Astro-Website: Grid, Filterchips, Rezeptseite, Pagefind-Suche
- [x] Zutaten-Seiten (welches Rezept nutzt welche Zutat)
- [x] Portionsrechner auf der Rezeptseite
- [x] PWA-Manifest
- [x] Deployment-Workflow (GitHub Pages; base/site per Env konfigurierbar)
- [x] Skills: `/neues-rezept` (manuell), `/review-rezept`

**Offen / Entscheidungen:** Repo privat? (→ ggf. Cloudflare Pages statt
GitHub Pages). Eigene Domain? Echte Lieblingsrezepte als Startbestand.

## Phase 2 — Briefkasten

**Ziel:** Die zweite Person kann selbstständig einreichen.

- [ ] Issue-Formular „Neues Rezept“ (Link, Foto-Upload, Notiz)
- [ ] „+“-Button auf der Website → vorausgefülltes Formular
- [ ] Import-Action: Web-Links (Schema.org, sonst Claude-Extraktion)
- [ ] Import-Action: Scans/Fotos (Claude Vision)
- [ ] PR-Erstellung mit Vorschau-Kommentar im Issue
- [ ] Review-Agent als PR-Check

## Phase 3 — Königsdisziplin: Instagram-Reels

- [ ] yt-dlp-Download + ffmpeg (Audio, Standbilder)
- [ ] Transkription (faster-whisper im Runner)
- [ ] Synthese Caption + Transkript + Frames → Rezept
- [ ] Fallback: Video-Datei direkt im Formular hochladen

## Phase 4 — Küchen-Hirn

- [ ] `vorrat/vorratskammer.md` + einfacher Pflege-Weg (auch mobil)
- [ ] `/koch-was`: Vorrats-Abgleich, „dir fehlen nur 2 Zutaten“
- [ ] `/wochenplan` + Einkaufsliste
- [ ] Vorschlags-Seite auf der Website (wöchentlich generiert)

## Phase 5 — Kür

- [ ] Kochmodus: Schritt-für-Schritt, Timer, Wake Lock
- [ ] Statistiken („meistgekocht 2026“), Saisonales
- [ ] `/vault-pflege` als monatliche Routine
- [ ] Export als druckbares Jahrbuch
