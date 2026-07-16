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

## Phase 2 — Briefkasten (Inbox + Skill) ✅ *(erledigt)*

**Ziel:** Die zweite Person kann selbstständig einreichen; du pflegst per Skill ein.

- [x] Issue-Formular „Neues Rezept“ (Link, Foto-Upload, Notiz) als **Inbox**
- [x] „+ Rezept“-Button auf der Website → Formular
- [x] `/inbox`-Skill: arbeitet offene Einreichungen in einer Claude-Code-Session
      ab (Web-Link inkl. Schema.org, Foto/Scan via Bild-Auswertung) — **kein API-Key**
- [x] Schema-Check als Gate (Build-Validierung, CI auf PRs)
- [x] Optionaler Vollautomatik-Schalter (Action + `AUTO_IMPORT`/`ANTHROPIC_API_KEY`),
      standardmäßig aus

**So läuft's:** Einreichungen sammeln sich als offene Issues (Label `import`).
Wenn du magst, sagst du in einer Session `/inbox` — die Rezepte werden erzeugt,
geprüft und die Issues geschlossen. Kosten: nur dein Claude-Code-Abo.

## Phase 3 — Königsdisziplin: Instagram-Reels ✅ *(schlank gebaut)*

Nur den Reel-Link einwerfen genügt. Eine Action (`reel-vorbereiten.yml`) holt
auf GitHubs offenem Netz das Reel und bereitet es vor; das Rezept baust du dann
per `/inbox` (kein API-Key, keine Kosten).

- [x] `reel-vorbereiten.yml`: yt-dlp-Download + ffmpeg (Standbilder) + Transkript
      (faster-whisper im Runner) → Material am Issue, committet nach `_reel-inbox/`
- [x] `/inbox` verarbeitet Frames + Transkript + Caption → Rezept
- [x] Fallback: Video-Datei bzw. Text direkt ans Issue anhängen
- [ ] **Einmalig, nur falls nötig:** Instagram-Cookies als Secret
      `INSTAGRAM_COOKIES` (öffentliche Reels gehen oft ohne). Cookies laufen
      alle paar Wochen ab.

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
