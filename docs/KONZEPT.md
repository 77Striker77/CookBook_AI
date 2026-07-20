# Konzept: Unser Kochbuch

> Ein Vault, eine Website, ein Briefkasten.

## Ausgangslage & Ziele

Wir kochen täglich und sammeln Rezepte aus verschiedensten Quellen: Links zu
Blogs, Instagram-Reels (bei denen die Description oft unvollständig ist — Ton
und Bild müssen ausgewertet werden) und ausgedruckte Rezepte, die gescannt
werden müssen. Gewünscht ist:

- **Erreichbarkeit:** von überall, von jedem Endgerät, für mindestens 2 Personen
- **Struktur:** durchdachter, sauberer Aufbau; gut erweiterbar
- **Datenzentrum:** zugänglich und umfangreich, in Obsidian-Struktur
- **Erweiterung:** möglichst einfach — Link oder Foto einwerfen genügt
- **Später:** „Was haben wir zuhause?“ → Vorschläge aus dem eigenen Kochbuch

## Getroffene Entscheidungen (16.07.2026)

| Frage | Entscheidung |
|---|---|
| Hosting | Statische Website aus dem Repo (GitHub Pages, kostenlos) |
| Rolle von Obsidian | Datenformat + Power-Tool; Alltag läuft über den Browser |
| KI-Import (Reels, Scans) | Inbox + `/inbox`-Skill in einer Claude-Code-Session (kein API-Key, keine laufenden Kosten). Vollautomatik per API bleibt als optionaler Schalter. |
| Nutzerprofil | Eine Person technisch (verwaltet Git/Reviews), eine nicht (bekommt den einfachen Einreich-Weg) |

## Die drei Säulen

### 1. Datenzentrum: Obsidian-Vault im Git-Repo

Jedes Rezept ist eine Markdown-Datei mit YAML-Frontmatter nach striktem Schema
(siehe [VAULT-STRUKTUR.md](VAULT-STRUKTUR.md)). Das Repo **ist** der Vault:

- Git = Versionsgeschichte, Backup und Sync in einem
- Kein Lock-in: nur Text und Bilder, in 20 Jahren noch lesbar
- Obsidian dient als Power-Tool zum Stöbern, Verlinken und Verwalten
  (Dataview-Abfragen, Graph, Templates)

### 2. Alltag: Website auf jedem Gerät

Bei jedem Merge baut GitHub Actions die Website neu (Astro) und deployt sie
auf GitHub Pages. Features:

**Drei Bereiche** — mehr nicht. Die Navigation folgt dem Muster, auf das
Paprika, Mela, Crouton, Mealie und Tandoor unabhängig voneinander kommen:

| Bereich | Aufgabe |
|---|---|
| **Übersicht** (`/`) | Minimales Dashboard: Bildwand, Einkaufs-Zustand, Sprungmarken nach Art und Aufwand |
| **Rezepte** (`/rezepte`) | Alle Rezepte, zuletzt hinzugefügt zuerst. Suche, kombinierbare Filter mit URL-Zustand, Zutatenregister |
| **Einkauf** (`/einkauf`) | Gewählte Gerichte und die Zutaten daraus — nach Warengruppen, ohne Vorratsware, mit eigenen Zeilen |

Dazu, außerhalb der Navigation:

- **Rezeptseite** mit Portionsrechner. Er skaliert die Zutatenliste; weicht die
  Portionszahl ab, weist ein Hinweis darauf hin, dass die Mengen im Fließtext
  unverändert bleiben (Begründung in `.claude/skills/well-seasoned/references/seiten.md`)
- **Kochmodus** (`/kochen/[slug]`): ein Schritt pro Bildschirm, Wake Lock,
  antippbare Timer aus dem Rezepttext, am Ende „Gekocht ✓" mit drei
  Bewertungsstufen
- **Zutatenseiten** für Zutaten in mindestens zwei Rezepten

**Was es bewusst nicht gibt:** keinen Service Worker und damit keine
Offline-Fähigkeit — wurde geprüft und nicht gebraucht. Das Manifest macht die
Seite installierbar, mehr nicht.

### 3. Wachstum: der Rezept-Briefkasten

Neue Rezepte werden über ein GitHub-Issue-Formular eingeworfen (verlinkt als
„+“-Button auf der Website). Drei Eingänge, ein Ausgang:

| Eingang | Auswertung |
|---|---|
| **Instagram-Reel** | Video-Download → Ton-Transkription → Standbild-Analyse → Zusammenführung mit Caption |
| **Web-Link** | Schema.org-Rezeptdaten direkt lesen; sonst KI-Extraktion aus der Seite |
| **Scan/Foto** | Claude Vision liest auch Handschrift und strukturiert ins Schema |

Die Einreichungen landen als offene Issues in einer **Inbox**. Beim nächsten
Durchgang sagt die technische Person in einer Claude-Code-Session `/inbox` —
die Rezepte werden ausgewertet, ins Schema gebracht, der Build prüft sie, und
die Issues werden geschlossen. Kein API-Key, keine laufenden Kosten. (Ein
optionaler Vollautomatik-Schalter über die Claude API bleibt für später drin.)

## Später: das Küchen-Hirn

> **Stand:** Noch nicht gebaut. Der Abschnitt beschreibt die Absicht, nicht
> den Ist-Zustand.

`vorrat/vorratskammer.md` hält fest, was zuhause ist. Ein Skill gleicht den
Vorrat mit den Zutatenlisten aller Rezepte ab und beantwortet „Was koche ich
heute?“ — inklusive „dir fehlen nur 2 Zutaten“. Darauf bauen Wochenplan und
Einkaufsliste auf.

## Ehrliche Risiken

- **Instagram wehrt sich manchmal:** Auto-Download von Reels funktioniert
  meistens (yt-dlp), aber Instagram ändert gern die Spielregeln.
  **Fallback:** Video selbst als Datei in den Briefkasten werfen — die
  Auswertung ab dort ist identisch.
- **GitHub-Account nötig:** Die zweite Person braucht einen kostenlosen
  GitHub-Account fürs Einreichen (einmalige Einrichtung, danach nur noch
  ein Lesezeichen).
- **API-Kosten:** bewusst akzeptiert, ~1–5 ct pro Import; ohne Import-Nutzung
  fallen keine Kosten an.

## Das Gedächtnis der Seite (20.07.2026)

`gekocht` und `bewertung` liegen im Frontmatter, also in Git. Der Moment des
Ausfüllens ist aber „gerade gegessen, Handy in der Hand" — und laut
Nutzerprofil oben ist eine der beiden Personen nicht technisch. Ein Feld, das
Klonen, Editieren, Committen und einen Build verlangt, bleibt leer. Genau das
war der Fall: 0 Einträge bei 18 Rezepten.

Deshalb zwei Ebenen:

1. **Sofort:** `window.WSKoch` schreibt nach localStorage. Der Kochmodus trägt
   am Ende mit einem Tap ein, und der Wert erscheint eine Sekunde später auf
   der Rezeptseite.
2. **Dauerhaft:** Ein Knopf erzeugt daraus eine vorbefüllte Einreichung über
   das Issue-Template `kochverlauf.yml`. Der Agent schreibt sie ins
   Frontmatter — derselbe Briefkasten-Weg wie beim Rezeptimport.

Bewertung mit drei Stufen (`nochmal` · `ok` · `nein`) statt fünf Sternen. Dass
0 von 18 Rezepten bewertet waren, war die Antwort und nicht das Symptom: zwei
Menschen vergeben keine konsistente 1–5-Skala.
