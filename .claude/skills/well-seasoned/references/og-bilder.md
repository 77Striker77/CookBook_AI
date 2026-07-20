# Open-Graph-Vorschaubilder

## Problem

`src/layouts/Base.astro` enthält keine `og:`- oder `twitter:`-Tags. Wer einen
Rezeptlink in WhatsApp oder Signal schickt, bekommt eine nackte URL ohne
Vorschau — obwohl jedes der 18 Rezepte ein Foto hat.

## Lösung: vorhandene Rezeptfotos, nicht generieren

Wenn jemand einen Rezeptlink teilt, soll die Vorschau **dieses Gericht**
zeigen. Ein generiertes Bild wäre eine Verschlechterung. Es braucht keinen
API-Key und keinen externen Dienst.

`site` ist in `astro.config.mjs` bereits gesetzt — die Voraussetzung für
absolute URLs ist erfüllt. **Relative Pfade werden von WhatsApp ignoriert.**

## Maße und Regeln

| Punkt | Wert |
|---|---|
| Zielmaß | **1200 × 630 px** (~1.9:1) — erwartet von WhatsApp, Signal, Telegram, Facebook, LinkedIn |
| Twitter | `summary_large_image` mit demselben Bild. Kein zweites Derivat nötig |
| Safe Zone | Kritischer Inhalt in den **zentralen 80 %** — Clients beschneiden unterschiedlich |
| Textgröße im Bild | Headline ≥48px bei 1200px Breite, sonst in der Chat-Vorschau unlesbar |
| Zeilen | Max. 3 Zeilen, max. 7 Wörter pro Zeile — relevant bei langen deutschen Rezepttiteln |
| Prüfung | Bei 50 % Zoom ansehen: noch lesbar? |

## Umsetzung

**Rezeptseiten:** Foto über `astro:assets` auf 1200×630 ableiten, absolute URL
über `Astro.site` bilden, als `og:image` setzen. Etwa acht Zeilen in
`Base.astro` plus eine optionale `bild`-Prop, die die Rezeptseiten durchreichen.

Nötige Tags: `og:title`, `og:description`, `og:image`, `og:type`, `og:url`,
`og:site_name`, `twitter:card`.

**Seiten ohne eigenes Foto** (Startseite, Suche, Plan): eine HTML-Karte in der
Editorial-Typografie bauen und einmalig per Playwright oder Puppeteer als PNG
rendern, dann nach `public/` legen. Node 22 ist vorhanden, kein Key nötig,
einmaliger Aufwand.

Wichtig beim Screenshot: `deviceScaleFactor: 2` und einige Sekunden Verzögerung
vor der Aufnahme, damit Schriften und Bilder fertig gerendert sind. Fonts lokal
einbinden, nicht per CDN.

## Bildgenerierung — bewusst nicht

Geprüft und verworfen. Der Weg wäre Google Gemini (`GEMINI_API_KEY`, dazu eine
Python-Installation, die auf diesem Rechner fehlt). Es gibt keinen
Anwendungsfall:

- **Logo** existiert als Wortmarke in Text (`Base.astro`) — skaliert
  verlustfrei, folgt dem Theme, ist durchsuchbar. Ein Bild wäre schlechter.
- **PWA-Icon** existiert als handgeschriebenes SVG.
- **Vorschaubilder** sollen echte Gerichte zeigen, siehe oben.
- **Illustrationen** in einem persönlichen Kochbuch, dessen Wert in den
  selbstgekochten Gerichten liegt, wären aktiv schädlich.

Falls doch einmal Icons gebraucht werden (Zeit, Portionen, Ofen, Pfanne):
SVG ist Text und lässt sich direkt schreiben — dafür ist kein Bilddienst nötig.
Regeln: `viewBox="0 0 24 24"`, `currentColor` statt fester Farben, `<title>`
für Screenreader, bei 24px entwerfen und bei 16px gegenprüfen.
