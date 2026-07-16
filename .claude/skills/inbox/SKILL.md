---
name: inbox
description: Arbeitet die Rezept-Inbox ab — alle offenen GitHub-Issues mit Label "import". Wertet je Einreichung Link/Foto/Notiz aus, legt schema-konforme Rezepte im Vault an, prüft den Build und schließt die Issues. Nutzen, wenn der User "Inbox abarbeiten", "neue Rezepte einpflegen" o. Ä. möchte. Braucht keinen API-Key — läuft in dieser Session.
---

# Rezept-Inbox abarbeiten

Ziel: Alle offenen Einreichungen aus dem Briefkasten in fertige Rezepte im
Vault verwandeln — in dieser Session, ohne Anthropic-API-Key. Bezugspunkte:
`kochbuch/_meta/schema.md` (Schema) und `kochbuch/_meta/synonyme.yaml` (Zutaten).

## Ablauf

1. **Inbox lesen.** Hole die offenen Issues mit Label `import` aus dem Repo
   (GitHub-MCP: `list_issues` mit `state: open`, `labels: ["import"]`, Repo
   `77Striker77/CookBook_AI`). Gibt es keine, dem User Bescheid geben und stoppen.
   Zeig dem User kurz die Liste (Nummer + Titel), bevor du loslegst.

2. **Pro Issue die Quelle auswerten** (Felder aus dem Issue-Body: „Link", „Foto
   / Scan", „Notiz"):
   - **Web-Link:** Seite mit WebFetch holen. Bevorzugt `Recipe`-JSON-LD
     (Schema.org) verwenden; sonst aus dem Seitentext extrahieren.
   - **Foto / Scan:** Die angehängte Bild-URL (`github.com/user-attachments/…`
     oder `user-images.githubusercontent.com/…`) mit `curl -L` nach
     `kochbuch/anhang/<slug>-scan.<ext>` herunterladen, dann mit dem Read-Tool
     als Bild öffnen und auswerten (auch Handschrift).
   - **Instagram-Reel:** Aus Caption/Beschreibung arbeiten, soweit vorhanden.
     Reicht das nicht (Info nur im Video/Ton), das Rezept **nicht raten** —
     im Issue nachfragen bzw. als offen kennzeichnen und überspringen.
   - **Notiz** immer mitberücksichtigen (Portionen, Änderungen, Kontext).

3. **Ins Schema übersetzen.** Schreibe `kochbuch/rezepte/<slug>.md` nach
   `_meta/schema.md`: Pflichtfelder `titel`, `kategorie`, `portionen`,
   `zutaten`. Zutaten als lesbare Zeilen `<Menge> <Einheit> <Zutat>, <Notiz>`;
   Zwischenüberschriften als `# …`. `quelle.typ`/`quelle.url` setzen,
   `status: entwurf`. Titelbild (falls vorhanden) als `anhang/<slug>.<ext>`
   ablegen und `bild:` setzen. **Nichts erfinden** — Unklares in „Notizen"
   kennzeichnen.

4. **Zutaten normalisieren.** Neue, sinnvolle Varianten in `synonyme.yaml`
   ergänzen (z. B. „Kirschtomaten" → `Tomaten`), damit Verlinkung und
   Vorrats-Abgleich sauber bleiben.

5. **Prüfen.** `npm run build` laufen lassen — der Build validiert das Schema.
   Fehler beheben, bis grün. Slugs unter `dist/zutat` kurz gegen `synonyme.yaml`
   prüfen (überraschende Doppel-Slugs = fehlendes Synonym).

6. **Übernehmen.** Auf dem aktuellen Arbeitsbranch committen und pushen (der
   User ist beim Review in dieser Session dabei — kein extra PR nötig, außer der
   User wünscht es).

7. **Issue schließen.** Jedes eingearbeitete Issue mit kurzem Kommentar
   schließen (GitHub-MCP: `add_issue_comment` + `issue_write`/close), z. B.
   „Eingepflegt als `rezepte/<slug>.md` ✅". Konnte etwas nicht ausgewertet
   werden, Issue **offen lassen** und im Kommentar sagen, was fehlt.

8. **Zusammenfassen.** Dem User am Ende auflisten: X eingepflegt, Y offen
   geblieben (mit Grund).

## Wichtig

- Kategorie/Schwierigkeit nur aus den erlaubten Werten (siehe schema.md).
- Bei mehreren Issues nacheinander sauber abarbeiten; ein kaputtes Rezept darf
  den Build nicht rot lassen (vor dem Push muss `npm run build` grün sein).
- Keine stillen Mengen-Änderungen: Unsicheres dem User vorlegen.
