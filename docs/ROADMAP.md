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

## Phase 3 — Königsdisziplin: Reels ✅ *(schlank gebaut)*

Bei **Instagram/TikTok** genügt der Link. Eine Action (`reel-vorbereiten.yml`)
holt auf GitHubs offenem Netz das Video und bereitet es vor; das Rezept baust du
dann per `/inbox` (kein API-Key, keine Kosten).

- [x] `reel-vorbereiten.yml`: yt-dlp-Download + ffmpeg (Standbilder) + Transkript
      (faster-whisper im Runner) → Material am Issue, committet nach `_reel-inbox/`
- [x] `/inbox` verarbeitet Frames + Transkript + Caption → Rezept
- [x] Plattform-genaue Fehlermeldung; Concurrency-Sperre gegen Doppelläufe
- [x] **YouTube bewusst NICHT automatisch:** YouTube blockt Server-IPs (Bot-
      Prüfung) und die öffentlichen Spiegel (Invidious/Piped) sind tot — ein
      Auto-Lauf würde nur scheitern. YouTube lieferst du direkt am Issue:
      **mp4 anhängen und/oder Beschreibung/Rezept einfügen**; `/inbox` verarbeitet
      die mp4 in der Session (Standbilder, optional Transkript) und baut aus der
      Beschreibung.
- [ ] **Optional, falls YouTube doch automatisch werden soll:** einmalig
      `YOUTUBE_COOKIES` als Secret hinterlegen und YouTube wieder in den Trigger
      von `reel-vorbereiten.yml` aufnehmen. Cookies laufen alle paar Wochen ab.
- [ ] **Nur falls nötig:** `INSTAGRAM_COOKIES` für login-pflichtige Reels.

## Phase 4 — Küchen-Hirn

- [x] **Einkauf direkt auf der Website** (`/einkauf`): das „+“ auf jeder Karte
      und „In den Kochplan“ im Rezept übernehmen die gewählte Portionszahl. Die
      Seite zeigt oben die gewählten Gerichte (Portions-Stepper, Entfernen) und
      darunter die Zutaten daraus — skaliert, zusammengezählt, **nach
      Warengruppen sortiert** (Laufweg durch den Markt statt alphabetisch),
      **ohne Vorratsware** (Salz stand in 9 von 18 Rezepten, dazu Wasser) und mit
      **eigenen Zeilen** für Milch, Kaffee, Spülmittel. Erledigtes rutscht nach
      unten. Rein clientseitig (localStorage), kein Backend. Aggregation in
      `src/lib/einkauf.ts`.
      *Nicht offline-tauglich* — es gibt keinen Service Worker, und er wurde
      bewusst verworfen.
- [ ] `vorrat/vorratskammer.md` + einfacher Pflege-Weg (auch mobil)
- [ ] `/koch-was`: Vorrats-Abgleich, „dir fehlen nur 2 Zutaten“
- [ ] Wochentage im Einkaufsbereich (waren kurz da, mit `/plan` wieder entfallen).
      Laut Mealies Nutzerumfrage planen viele lieber als Warteschlange als auf
      feste Tage — vor dem Bauen klären, was hier wirklich gebraucht wird.
- [ ] Vorschlags-Seite auf der Website (wöchentlich generiert)

## Phase 5 — Kür

- [x] **Kochmodus** (`/kochen/[slug]`): ein Schritt pro Bildschirm, Wischen und
      Pfeiltasten, Wake Lock, antippbare Timer aus dem Rezepttext (33 erkannt),
      Zutaten als Overlay mit Portionsrechner, am Ende „Gekocht ✓“ mit drei
      Bewertungsstufen. Die Schrittposition überlebt versehentliches Schließen.
- [ ] Statistiken („meistgekocht 2026“), Saisonales — **jetzt baubar**: das
      Koch-Gedächtnis (`window.WSKoch`) sammelt die Daten. Vorher war die
      Grundlage nicht erzeugbar, weil das Feld nur über Git befüllbar war.
- [ ] `/vault-pflege` als monatliche Routine
- [ ] Export als druckbares Jahrbuch

## Phase 6 — Umbau von Struktur und Optik ✅ *(20.07.2026)*

Ausgelöst durch die Rückmeldung, der Aufbau sei „unübersichtlich und mies
navigierbar“. Zwei Web-Recherchen gaben dem recht.

- [x] **Von sieben Bereichen auf drei.** Drei waren praktisch unerreichbar —
      `/register` lag vier Ebenen tief hinter einem Brotkrumen. NN/g (n=179):
      versteckte Navigation kostet über 20 % Auffindbarkeit.
      Verworfen: `/alle`, `/register`, `/verlauf`, `/suche`, `/plan`,
      `daten.json.ts`
- [x] **Koch-Gedächtnis** in localStorage plus Übertragung ins Repo über ein
      eigenes Issue-Template (`kochverlauf.yml`)
- [x] **Arbeitszeit statt Gesamtzeit** als Leitzahl auf Karten und Rezeptseite
- [x] **Schema aufgeräumt:** `geraete` als Enum (vorher drei Schreibweisen für
      eine Fritteuse), `hinzugefuegt` aus der Git-Historie nachgetragen,
      `schwierigkeit` gestrichen (12/5/1 — trennte nichts), `bewertung` auf drei
      Stufen
- [x] **Hell als Grundton**, Bildführung im Held, Navigation als echte Reiter mit
      `aria-current`
- [x] **Datenprüfung vor dem Build** (`scripts/pruefe-rezepte.mjs`): bricht ab,
      wenn ein Gerät zugewiesen ist, das im Rezepttext nicht vorkommt. Entstanden
      aus einem echten Fehler — ein Rezept trug `airfryer`, weil das Gerät in
      einem Querverweis auf ein anderes Rezept stand.

### Offen aus dieser Phase

- [ ] Mobil liegen Zutaten und Zubereitung auf der Rezeptseite untereinander.
      Der Kochmodus löst das fürs Kochen, die Leseseite nicht.
- [x] **Zwei-Geräte-Problem gelöst.** Der Plan liegt in localStorage, also auf
      einem Gerät — einer plant am Desktop, der andere steht im Laden ohne
      Liste. Der Teilen-Knopf erzeugt jetzt einen Link, der Gerichte samt
      Portionszahl und eigene Zeilen im URL-Hash trägt (`#plan=slug:4,…`).
      Der Hash geht nie an den Server, bleibt also auch auf GitHub Pages
      privat. Beim Öffnen wird die Liste **angeboten**, nie stillschweigend
      übernommen — sonst überschreibt ein alter Link den aktuellen Einkauf.
      Ohne `navigator.share` fällt der Knopf auf „Link kopieren" zurück.
