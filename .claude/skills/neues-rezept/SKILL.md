---
name: neues-rezept
description: Importiert ein Rezept aus einer Quelle (Web-Link, Instagram-Reel, Foto/Scan oder eingefügtem Text) in den Vault. Erzeugt eine schema-konforme Markdown-Datei in kochbuch/rezepte/. Nutzen, wenn der User ein Rezept hinzufügen/erfassen/importieren möchte.
---

# Neues Rezept importieren

Ziel: aus einer beliebigen Quelle eine schema-konforme Datei
`kochbuch/rezepte/<slug>.md` erzeugen. Schema und Konventionen stehen in
`kochbuch/_meta/schema.md`, die kanonischen Zutatennamen in
`kochbuch/_meta/synonyme.yaml`.

## Ablauf

1. **Quelle bestimmen** aus dem Argument/der Nachricht:
   - **Web-Link:** Seite laden (WebFetch). Zuerst nach `Recipe`-JSON-LD
     (Schema.org) suchen — enthält oft Zutaten und Schritte strukturiert.
     Sonst Rezept aus dem Seitentext extrahieren.
   - **Instagram-Reel:** Wenn die Caption vollständig ist, daraus arbeiten.
     Sonst — oder wenn eine Videodatei mitgegeben wurde — Ton transkribieren
     und Standbilder auswerten, dann alles zusammenführen. Fehlt Zugriff auf
     das Video, den User um die Videodatei oder eine Zusammenfassung bitten.
   - **Foto/Scan:** Bild mit Vision auslesen (auch Handschrift). Originalbild
     als `kochbuch/anhang/<slug>-scan.jpg` ablegen.
   - **Text:** direkt strukturieren.

2. **Ins Schema übersetzen.** Pflichtfelder: `titel`, `kategorie`,
   `portionen`, `zutaten`. Zutaten als lesbare Zeilen im Format
   `<Menge> <Einheit> <Zutat>, <Notiz>` (siehe schema.md). Mengen wenn möglich
   für die angegebenen Portionen. `quelle.typ` und `quelle.url` setzen.
   `status: entwurf`. `bewertung` und `gekocht` leer lassen.

3. **Zutaten normalisieren.** Für jede Zutat prüfen, ob ihr kanonischer Name
   in `synonyme.yaml` steht. Neue, sinnvolle Varianten dort ergänzen, damit die
   Verlinkung und der Vorrats-Abgleich sauber bleiben.

4. **Datei schreiben** nach `kochbuch/rezepte/<slug>.md`. Slug = Titel
   kleingeschrieben, Umlaute umschrieben, Bindestriche.

5. **Prüfen:** `/review-rezept <slug>` aufrufen bzw. `npm run build` laufen
   lassen. Der Build validiert das Schema; Fehler beheben.

6. **Zusammenfassen:** dem User Titel, Kategorie, Portionen, erkannte Zutaten
   und offene Punkte (z. B. „Menge unklar“) nennen.

## Wichtig

- Nichts erfinden. Fehlt eine Menge oder Zeit, Feld weglassen und im Zutaten-
  bzw. Notiztext kennzeichnen, statt zu raten.
- Kategorie und Schwierigkeit nur aus den erlaubten Werten (siehe schema.md).
