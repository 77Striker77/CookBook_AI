---
name: inbox
description: Arbeitet die Rezept-Inbox ab — alle offenen GitHub-Issues mit Label "import". Wertet je Einreichung Link/Foto/Scan/PDF vollständig aus (inkl. Bilder, Schaubilder, Maße), legt schema-konforme Rezepte samt Bildern im Vault an, prüft den Build und schließt die Issues. Nutzen, wenn der User "Inbox abarbeiten", "neue Rezepte einpflegen" o. Ä. möchte. Braucht keinen API-Key — läuft in dieser Session.
---

# Rezept-Inbox abarbeiten

Ziel: Alle offenen Einreichungen aus dem Briefkasten **vollständig und
originalgetreu** in Rezepte im Vault verwandeln — in dieser Session, ohne
Anthropic-API-Key. Bezugspunkte: `kochbuch/_meta/schema.md` (Schema) und
`kochbuch/_meta/synonyme.yaml` (Zutaten).

## Grundprinzip: nichts weglassen, nichts erfinden

Ein eingereichtes Rezept ist oft mehr als reiner Text. **Bevor du schreibst,
verschaffe dir einen vollständigen Blick auf die Quelle** und übernimm alles,
was zum Nachkochen gehört:

- **Fotos** (fertiges Gericht) → als Titelbild ins Rezept.
- **Schaubilder / Skizzen / Diagramme** (z. B. Schichtung, Schnittführung) →
  als Bild in den Rezepttext einbetten *oder* präzise beschreiben — niemals
  stillschweigend fallen lassen.
- **Maße, Mengen, Formeln, Temperaturen, Zeiten, Reihenfolgen, Warnhinweise** →
  wörtlich/inhaltsgetreu übernehmen.

Fasse **nicht zusammen** und **vereinfache nicht**. Fehlt eine Angabe wirklich,
kennzeichne das in „Notizen" — rate sie nicht. Prüfe am Ende: Ist jede Zutat,
jeder Schritt, jedes Maß und jede Abbildung aus der Quelle im Rezept vertreten?

## Ablauf

### 1. Inbox lesen
Offene Issues mit Label `import` holen (GitHub-MCP: `list_issues`, `state: OPEN`,
`labels: ["import"]`, Repo `77Striker77/CookBook_AI`). **Ist das leer**,
zusätzlich alle offenen Issues listen und die als Einreichung behandeln, deren
Body die Formular-Überschriften enthält (`### Link …`, `### … oder Foto / Scan`)
— das Label fehlt manchmal. Gibt es gar nichts, dem User Bescheid geben und
stoppen. Zeig dem User kurz die Liste (Nummer + Titel), bevor du loslegst.

### 2. Quelle vollständig sichten
Felder aus dem Issue-Body: „Link", „Foto / Scan", „Notiz". Die Notiz immer
mitberücksichtigen (Portionen, Änderungen, Kontext).

**Anhang herunterladen** (Foto/Scan/PDF): Die URL im Body zeigt auf
`github.com/user-attachments/…`. Direktes `curl` blockt der Proxy — stattdessen
**WebFetch** auf die URL; sie liefert einen Redirect auf eine signierte
`objects.githubusercontent.com`-URL (ca. 5 Min gültig). Diese dann mit
`curl -sSL` nach `kochbuch/anhang/<slug>-scan.<ext>` laden. Werkzeuge einmalig:
`apt-get update && apt-get install -y poppler-utils` (für PDFs).

Je nach Typ:

- **PDF:** **Jede Seite als Bild rendern und ansehen** — nicht auf `pdftotext`
  verlassen (verliert Fotos, Schaubilder, Layout):
  `pdftoppm -png -r 140 <scan.pdf> /tmp/seite` → jede `seite-*.png` mit dem
  Read-Tool öffnen. Für exakte Wortlaute zusätzlich `pdftotext -layout` nutzen.
- **Foto / Scan (jpg/png):** mit dem Read-Tool öffnen und auswerten (auch
  Handschrift).
- **Web-Link:** Seite mit WebFetch holen; bevorzugt `Recipe`-JSON-LD
  (Schema.org), sonst Seitentext. Das **Titelfoto** der Seite (og:image oder
  Hauptbild) als Bild mitnehmen (siehe Schritt 3).
- **Instagram-Reel / TikTok / YouTube / Video-Link:** Prüfe zuerst, ob die Reel-
  Vorbereitung schon gelaufen ist — dann liegt (nach `git pull`) ein Ordner
  `kochbuch/_reel-inbox/<nr>/` vor. Eine `status.txt` sagt, was drin ist:
  - **`voll`** — `frames/*.jpg` (eingeblendete Texte/Zutaten — **mit dem Read-Tool
    ansehen**), `transkript.txt` (Tonspur) und `caption.txt`/`titel.txt`/`autor.txt`.
    Rezept aus **Bildern + Transkript + Caption gemeinsam** bauen.
  - **`nur-beschreibung`** — kein Video/keine Frames (Quelle war bot-/login-
    geschützt, typisch bei YouTube auf Server-IPs), aber `caption.txt` mit der
    Beschreibung. Bei YouTube steht das Rezept dort oft komplett drin — daraus
    bauen. Es gibt dann **keine Schritt-Bilder** (das ist ok); für ein Titelbild
    ggf. eine Illustration bauen oder ohne Bild anlegen.
  Nach dem Einarbeiten den Ordner `kochbuch/_reel-inbox/<nr>/` löschen
  (`git rm -r`). Fehlt der Ordner ganz (Vorbereitung fehlgeschlagen), aus der
  Caption/den Issue-Kommentaren arbeiten soweit vorhanden — sonst **nicht raten**,
  Issue offen lassen.

### 3. Bilder ins Rezept holen
Rezepte zeigen `bild` (Titel) und Bilder im Text auf der Website an — nutze das.

- **Titelbild:** **bevorzugt ein echtes Foto** des fertigen Gerichts, wenn die
  Quelle eines hat (bei einem Kuchen z. B. ein appetitlicher Querschnitt). Die
  Website rahmt das Titelbild in einem festen Seitenverhältnis (`object-fit:
  cover`) — also nicht vorab verzerren/quetschen, lieber sauber **landscape**
  zuschneiden (Text-Overlays aus Reels wegschneiden). Gibt es **mehrere gute
  Kandidaten** (z. B. viele Video-Frames), 3–4 zugeschnittene Optionen bauen,
  dem User per SendUserFile zeigen und **per AskUserQuestion auswählen lassen** —
  nicht einfach eines festlegen. Nur wenn kein brauchbares Foto existiert, eine
  Illustration bauen.
- **Schritt-Bilder:** Passt ein Bild/Frame zu einem Zubereitungsschritt
  (Marinieren, Anbraten, Schichten, fertige Komponente …), **einbetten** —
  eingerückt unter dem jeweiligen Listenpunkt, damit die Nummerierung durchläuft:
  ```
  1. Schritt-Text …

     ![kurze Beschreibung](../anhang/<slug>-<name>.jpg)

  2. Nächster Schritt …
  ```
  Lieber ein paar aussagekräftige Bilder als gar keine — aber nur, wo sie den
  Schritt wirklich illustrieren.
  - *PDF:* die Foto-Region der Seite ausschneiden, z. B.
    `pdftoppm -jpeg -r 200 -f <seite> -l <seite> -x <X> -y <Y> -W <B> -H <H> -singlefile <scan.pdf> kochbuch/anhang/<slug>` (A4 @ 200 dpi ≈ 1654×2339 px).
    Den Ausschnitt mit dem Read-Tool prüfen und die Koordinaten anpassen, bis er sitzt.
  - *Web:* das Bild von der og:image-/Hauptbild-URL nach `kochbuch/anhang/<slug>.jpg` laden.
  - Im Frontmatter `bild: ../anhang/<slug>.jpg` setzen (Pfad **relativ zur
    Rezeptdatei**, mit `../`). Ein **PDF nie** als `bild` — nur echte Bilder
    (jpg/png/webp).
- **Schaubilder / Skizzen** aus dem Original genauso ausschneiden
  (`pdftoppm … -png …`) nach `kochbuch/anhang/<slug>-<name>.png` und im Rezept-
  text als Markdown-Bild einbetten: `![kurze Beschreibung](../anhang/<slug>-<name>.png)`.

**Grafiken im Website-Look neu bauen (bevorzugt bei Diagrammen/Skizzen).** Wenn
ein Schaubild informativ, aber im fremden Stil ist (oder ein Foto schief/
verzerrt), zeichne es **im Kochbuch-Look neu** statt den Rohausschnitt zu nehmen:
- Eine HTML-Datei mit **inline SVG** in der Palette schreiben (Grün `#3D7A4E`,
  Safran `#D99A2B`, Creme `#FBFAF7`, Tinte `#20261F`, Linie `#E0DFD4`; Serif für
  Überschriften). Denselben Informationsgehalt abbilden — nichts weglassen.
- Mit dem vorinstallierten Chromium zu einem scharfen PNG rendern
  (`playwright-core`, `deviceScaleFactor: 2`, `element.screenshot()`), nach
  `kochbuch/anhang/…png` speichern und einbinden.
- Jede erzeugte Grafik ansehen und Feinheiten (abgeschnittene Labels, Farben)
  korrigieren. Echte Fotos des Gerichts nur dann durch eine Illustration
  ersetzen, wenn das Foto unbrauchbar ist — die Originale bleiben im Scan/PDF.

### 4. Ins Schema übersetzen
`kochbuch/rezepte/<slug>.md` nach `_meta/schema.md`: Pflichtfelder `titel`,
`kategorie`, `portionen`, `zutaten`. Zutaten als lesbare Zeilen
`<Menge> <Einheit> <Zutat>, <Notiz>`; Zwischenüberschriften als `# …` (in YAML
quoten). Zubereitung als klare, nummerierungsfreie Schritte — **mit** allen
Maßen, Temperaturen, Formeln und eingebetteten Schaubildern. `quelle.typ`/`.url`/
`.autor` setzen, `status: entwurf`. Kategorie/Schwierigkeit nur aus den erlaubten
Werten. In „Notizen" auf die Original-Vorlage (`anhang/<slug>-scan.*`) verweisen
und Unklares kennzeichnen.

### 5. Zutaten normalisieren
Neue, sinnvolle Varianten in `synonyme.yaml` ergänzen (z. B. „Schoko-Kuvertüre" →
`Schokolade`), damit Verlinkung und Vorrats-Abgleich sauber bleiben.

### 6. Prüfen
`npm run build` (im Projekt-Root!) laufen lassen — validiert das Schema und
verarbeitet die Bilder. Fehler beheben, bis grün. Kurz `dist/zutat` gegen
`synonyme.yaml` prüfen (überraschende Doppel-Slugs = fehlendes Synonym).

### 7. Übernehmen & Issue schließen
Auf dem aktuellen Arbeitsbranch committen und pushen. Jedes eingearbeitete Issue
mit kurzem Kommentar schließen (GitHub-MCP: `add_issue_comment` + `issue_write`
`state: closed`), z. B. „Eingepflegt als `rezepte/<slug>.md` ✅". Konnte etwas
nicht ausgewertet werden, Issue **offen lassen** und im Kommentar sagen, was fehlt.

### 8. Zusammenfassen
Dem User auflisten: X eingepflegt (mit den übernommenen Bildern/Schaubildern),
Y offen geblieben (mit Grund).

## Wichtig

- **Vollständigkeit vor Kürze.** Lieber ein langes, exaktes Rezept als eine
  hübsche Vereinfachung. Schaubilder und Maße sind Teil des Rezepts.
- Keine stillen Mengen- oder Reihenfolge-Änderungen: Unsicheres dem User vorlegen.
- Ein kaputtes Rezept darf den Build nicht rot lassen (vor dem Push grün).
- Shell-Arbeitsverzeichnis im Blick behalten — `npm run build` gehört ins
  Projekt-Root, nicht nach `kochbuch/anhang`.
