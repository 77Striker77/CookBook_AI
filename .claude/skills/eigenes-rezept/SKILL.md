---
name: eigenes-rezept
description: Nimmt ein eigenes Rezept im Gespräch auf — führt in kleinen Runden durch alle Aspekte (Zutaten, Ablauf, Zeiten, Geräte, Varianten, Bilder), hakt bei Unklarem nach und schreibt am Ende eine schema-konforme Datei in kochbuch/rezepte/. Nutzen, wenn der User ein Rezept aus dem Kopf, aus der Erinnerung oder „aus meiner Küche" erfassen will — ohne Link, Foto oder Scan.
---

# Eigenes Rezept im Interview aufnehmen

Der User hat das Rezept im Kopf, nicht auf Papier. Dein Job: es vollständig
herausfragen — ohne ihn mit einem Fragebogen zu erschlagen.

Schema und Konventionen: `kochbuch/_meta/schema.md`. Kanonische Zutatennamen:
`kochbuch/_meta/synonyme.yaml`. Vorlage: `kochbuch/_meta/templates/rezept.md`.

## Die zwei Regeln, die alles andere bestimmen

**1. Immer nur eine Runde.** Pro Nachricht **ein Themenblock, höchstens 3
Fragen**. Nie den ganzen Fragenkatalog zeigen — auch nicht „damit du schon mal
weißt, was kommt". Wer alles auf einmal sieht, antwortet auf nichts richtig.

**2. Vollständig heißt vollständig.** Jede Runde wird erst geschlossen, wenn
sie keine Lücke mehr hat. Vage Antworten sind Lücken: „etwas Öl", „bis es gut
aussieht", „normale Pfanne", „nicht zu lange". Zu jeder davon **einmal
nachhaken** — konkret und mit Vorschlag, nicht als offene Frage:

> „Etwas Öl" — sind das eher 1 EL zum Anbraten oder ein Boden voll zum
> Ausbacken?

Wenn der User es wirklich nicht weiß, ist das eine gültige Antwort. Dann
**nicht raten**: Feld weglassen und die Unsicherheit im Rezept sichtbar machen
(Notiz oder „nach Gefühl"), so wie es `/neues-rezept` auch hält.

### Immer mit Vorschlag fragen

Die wirksamste Technik im ganzen Skill. Eine offene Frage („wie viel Ajvar?")
bringt „ein paar Löffel". Eine Frage mit konkreter Zahl zum Korrigieren bringt
den echten Wert — sofort und ohne Nachdenken:

> Ajvar 3 EL, Olivenöl 4 EL, Tomatenmark 1 EL — sag einfach, was daneben liegt.

Im ersten Lauf dieses Skills lag der Vorschlag „3 EL Ajvar" um **Faktor 60**
neben der Wahrheit (ein halbes Glas, 175 g). Ohne die Zahl zum Widersprechen
wäre das nie herausgekommen — mit ihr kam es in einer Antwort.

Danebenliegen ist also kein Problem, sondern der Zweck. Nur: Der Vorschlag ist
eine **Frage**, keine Setzung. Was der User nicht bestätigt, kommt nicht ins
Rezept.

### Unbeantwortete Fragen sofort wiederholen

Fragen werden überlesen, besonders die dritte in einer Liste. Prüfe vor jeder
neuen Runde, ob die letzte vollständig beantwortet wurde — und stell die
offene Frage **in der nächsten Nachricht ganz oben** noch einmal, statt sie
hinten anzuhängen. Wandert sie ans Ende, wird sie wieder überlesen.

Beim ersten Lauf ging die Frage „rote oder weiße Zwiebel?" dreimal unter, weil
sie jedes Mal als letzter Punkt stand.

## Ablauf

Jede Runde: kurz spiegeln, was du verstanden hast → die Frage(n) → weiter.
Antwortet der User breiter als gefragt, **alles aufnehmen** und die schon
beantworteten Fragen der Folgerunden überspringen. Niemand mag Fragen, die er
gerade beantwortet hat.

### Runde 1 — Was ist es?
Titel/Gericht, was es ungefähr ist, für wie viele Portionen er es kocht.
Kategorie über `AskUserQuestion` anbieten (Werte nur aus schema.md).

### Runde 2 — Zutaten, roh
„Zähl mir alles auf, was reinkommt — in beliebiger Reihenfolge, Mengen wo du
sie weißt." Erst sammeln, nicht sortieren.

### Runde 3 — Zutaten, nachgehakt
Die Rohliste durchgehen und **jede Lücke einzeln** klären: fehlende Mengen,
fehlende Einheiten, „etwas/ein bisschen", unklare Sorten (welche Tomaten —
Dose, passiert, frisch?), Vorbereitung („gewürfelt", „geraspelt"). Zutaten, die
im Ablauf später auftauchen, aber hier fehlen, nachtragen.

Fasse die Liste danach **einmal geschlossen** zusammen und lass sie bestätigen.

**`#`-Überschriften nur setzen, wo sie beim Lesen helfen.** Bei einem Gericht
aus mehreren Teilen (Hähnchen / Reis / Sauce) sind sie Gold wert, bei einer
15-zeiligen Salatliste sind sie Bürokratie. Im Zweifel weglassen — die
Reihenfolge der Zutaten und Notizen wie „fein gehackt" tragen die Struktur
schon.

### Runde 4 — Ablauf
„Erzähl mir den Ablauf, so wie du kochst." Frei erzählen lassen, mitschreiben.

### Runde 5 — Ablauf, nachgehakt
Das ist die wichtigste Runde. Hier stecken die Lücken, die ein Rezept
unbrauchbar machen. Der Katalog steht in
[references/nachfragen.md](references/nachfragen.md) — durchgehen, aber nur
das fragen, was **dieses** Rezept betrifft, und wieder in kleinen Häppchen.

### Runde 6 — Zeiten & Geräte
`zeit_aktiv` (Hände dran) und `zeit_gesamt` (inkl. Warten, Marinieren, Ruhen,
Kühlen). Geräte als Enum-Feld `geraete` — Regeln und die Querverweis-Falle
stehen in `.claude/skills/neues-rezept/SKILL.md`.

### Runde 7 — Drumherum
Küche, Tags, Schwierigkeit, Beilagen, Aufbewahren/Aufwärmen/Einfrieren,
Varianten, woher das Rezept stammt (`quelle.typ: eigen` oder `familie`,
`quelle.autor` z. B. „Oma Erna").

### Runde 8 — Bilder
Siehe unten.

### Runde 9 — Schreiben und prüfen
Datei `kochbuch/rezepte/<slug>.md` schreiben (Slug: klein, Umlaute
umgeschrieben, Bindestriche). Zutaten gegen `synonyme.yaml` normalisieren,
sinnvolle neue Varianten dort ergänzen. Dann `/review-rezept <slug>` bzw.
`npm run build` — Fehler beheben, bis grün.

## Zwischenstand sichern

Ein Interview kann lang werden. **Nach Runde 5** einmal die Datei anlegen
(`status: entwurf`, was da ist) und danach nach jeder Runde aktualisieren.
Bricht das Gespräch ab, ist die Arbeit nicht weg — und der User kann später mit
„mach beim Streifenkuchen weiter" wieder einsteigen.

Sag nach dem ersten Schreiben einmal kurz, dass der Zwischenstand liegt und wo.

## Bilder

Ein Rezept ohne Bild sieht auf der Website leer aus — aber ein falsches Bild
ist schlimmer als keins.

**Reihenfolge der Möglichkeiten:**

1. **Eigenes Foto** — immer die erste Wahl. Fragen, ob er eins hat; auch ein
   altes Handyfoto vom letzten Mal reicht. Ablegen als
   `kochbuch/anhang/<slug>.jpg`, im Frontmatter `bild: ../anhang/<slug>.jpg`
   (relativ zur Rezeptdatei, mit `../`).
2. **Schritt-Fotos** — wenn er mehrere hat, die zu einzelnen Schritten passen:
   als `kochbuch/anhang/<slug>-<schritt>.jpg` und im Text einbetten
   (`![kurze Beschreibung](../anhang/<slug>-<name>.jpg)`).
3. **Skizze/Schaubild** — bei allem Räumlichen (Schichtung, Schnittführung,
   Anordnung im Blech) selbst eins erzeugen statt es zu beschreiben. Siehe
   `/inbox` für das Vorgehen.
4. **Bild aus dem Internet** — nur als *Platzhalter*, und nur unter den Regeln
   unten.

### Bilder aus dem Internet — die Regeln

Vorschlagen darfst du sie aktiv („ich hab kein Foto von dir — soll ich als
Platzhalter eins suchen?"). Aber:

- **Nur frei lizenziertes Material.** Suche gezielt auf Wikimedia Commons,
  Pexels, Unsplash oder Openverse. Kein „irgendein Bild aus der Bildersuche" —
  das ist fremdes Eigentum, auch wenn die Seite privat ist.
- **Nie als sein Gericht ausgeben.** In `Notizen & Varianten` einen Satz mit
  Quelle und Lizenz, z. B.: *„Titelbild ist ein Platzhalter (Foto: Name,
  Wikimedia Commons, CC BY-SA 4.0) — wird beim nächsten Kochen durch ein
  eigenes ersetzt."*
- **Erst zeigen, dann übernehmen.** 2–3 Kandidaten mit Link vorschlagen und
  ihn wählen lassen. Nichts stillschweigend herunterladen.
- Bild lokal ablegen (`curl -sSL` nach `kochbuch/anhang/…`), nie fremde URLs
  einbinden — die sind irgendwann tot.

Will der User keins: völlig in Ordnung, `bild` weglassen. Kein Bild ist ein
gültiger Zustand, kein Mangel.

## Am Ende

Kurz zusammenfassen: Titel, Kategorie, Portionen, Zahl der Zutaten und
Schritte, Bildlage — und **explizit die offen gebliebenen Punkte** („Backzeit
war unsicher, steht als Bereich drin"). Das ist die Liste, die er beim ersten
Nachkochen abhakt.
