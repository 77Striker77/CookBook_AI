# Stimme — Well Seasoned

Abgeleitet aus den vorhandenen Texten des Projekts (README, Oberfläche,
Rezepte), nicht aus einer Vorlage. Wenn ein neuer Text sich hier nicht
wiederfindet, ist der Text falsch — nicht der Leitfaden.

## Grundhaltung

**Zwei Leute, die zusammen kochen, schreiben sich gegenseitig Notizen.**

Well Seasoned hat kein Publikum. Jeder Text richtet sich an jemanden, der schon
weiß, worum es geht, und der gerade etwas vorhat — kochen, einkaufen, ein
Rezept suchen. Daraus folgt alles: keine Begrüßung, keine Erklärung des
Offensichtlichen, keine Begeisterung auf Vorrat. Der Text nimmt so wenig Platz
wie möglich ein und gibt so viel Sicherheit wie nötig.

Der Ton ist warm, weil er vertraut ist — nicht weil er freundliche Wörter benutzt.

## Ton-Achsen

| Achse | Position | Bedeutung |
|---|---|---|
| Formal ↔ Kumpelhaft | 75 % kumpelhaft | Konsequentes Du, Alltagssprache, kein Chat-Slang |
| Knapp ↔ Ausführlich | 10 % — **außer im Rezeptschritt** | UI so kurz wie grammatisch möglich. In Zubereitung und Notizen gewinnt Vollständigkeit, dort kostet eine fehlende Angabe ein misslungenes Essen |
| Sachlich ↔ Verspielt | 35 % | Grundton sachlich, seltene kurze Augenzwinkern nur wo nichts auf dem Spiel steht |
| Zurückhaltend ↔ Enthusiastisch | 20 % | Kein Rezept wird angepriesen. Beschrieben wird, was es ist |
| Anleitend ↔ Erzählend | 5 % | Keine Vorgeschichte, keine Reise nach Italien. Herkunft steht als Quellenzeile, nicht als Anekdote |

## Voice Chart

| Trait | Bedeutung | Do | Don't |
|---|---|---|---|
| **Vertraut, nicht anbiedernd** | Wir schreiben, als kennten wir den Leser — weil wir ihn kennen. Aber wir tun nicht auf gut Freund. | „Dein Kochplan ist noch leer." | „Hoppla! Hier ist ja noch gar nichts los 😅" |
| **Präzise, nicht pedantisch** | Jede Zahl, die den Ausgang beeinflusst, steht da und ist fett. Alles andere darf ungefähr bleiben. | „Im Airfryer **17 Minuten bei 180 °C** garen." | „17,0 Minuten bei exakt 180 Grad Celsius" |
| **Knapp, nicht schroff** | Wir kürzen Wörter, nicht Wärme. | „Nichts gefunden — Filter zurücksetzen?" | „Keine Treffer." |
| **Selbstironisch, nicht albern** | Wir stehen zu wackeligen Angaben, statt sie zu kaschieren. | „marinieren, so lange die Geduld reicht (mindestens 30 Minuten, gern länger)" | „marinieren, bis der Hunger siegt 🤪" |
| **Ehrlich, nicht entschuldigend** | Lücken werden benannt: einmal, sachlich, ohne Bedauern. | „**Portionen (4) geschätzt** — bei größerem Hunger eher 3." | „Leider konnten wir die genaue Portionsanzahl nicht ermitteln." |

## Sprachliche Grundregeln

- **Anrede: Du.** Durchgehend in der Oberfläche, auch im Imperativ.
- **Zubereitungsschritte: unpersönlicher Infinitiv.** „Butter und gehackten
  Knoblauch in eine Pfanne geben." — *nicht* „Gib Butter in eine Pfanne."
  In den **Notizen** darunter wird wieder geduzt.
- **Der Gedankenstrich (—) ist unser Satzzeichen.** Trägt Nachtrag,
  Einschränkung, Pointe. Höchstens einer pro Satz.
- **Typografie:** „…" statt „...", typografische Anführungszeichen, geschützter
  Abstand in „180 °C", Dezimalkomma.
- **Fett markiert genau eine Sorte Information:** die Größe, an der der Schritt
  scheitern kann — Zeit, Temperatur, Menge, Fassungsvermögen. Fett ist kein
  Betonungsmittel für Stimmung.
- **Emoji sind Funktionsträger, nie Dekoration.** Fest gebunden:
  🛒 Kochplan · 🎲 Zufall · 🔍 Suche · ⏱ Zeit · ◐ Hell/Dunkel · ✓ erledigt ·
  ★ Bewertung. In Fließtext und Rezeptschritten stehen keine Emoji.
- **Kein Denglisch in der Oberfläche.** „Löschen", nicht „Clear". Etablierte
  Küchenanglizismen bleiben (Airfryer, Bowl, Meal-Prep).
- **Kein Ausrufezeichen** außer „Genießen!" am Ende einer Zubereitung.

**Verbotene Wörter:** „einfach mal", „lecker", „genial", „unwiderstehlich",
„Klick hier", „Oops", „Ups", „leider", „bitte beachten Sie", „Nutzer".

## Regeln je Textsorte

### Buttons und Aktionen
Verb im Infinitiv, ein bis drei Wörter, kein Punkt, kein „jetzt". Objekt nur
nennen, wenn es ohne Kontext mehrdeutig wäre.

> ✅ `Kopieren` · `Drucken` · `Plan leeren` · `Haken zurücksetzen`
> ❌ `Jetzt kopieren!` · `Liste kopieren` (Kontext eindeutig) · `OK`

Zustands-Buttons spiegeln den erreichten Zustand mit ✓ und Präposition:
`In den Kochplan` → `✓ Im Kochplan` · `+` → `✓`

### Leere Zustände
Zwei Sätze, nie mehr. Satz 1 stellt nüchtern fest. Satz 2 nennt den konkreten
nächsten Handgriff — mit dem echten Namen des Elements, das man antippen soll.

> ✅ „Dein Kochplan ist noch leer." / „Öffne ein Rezept und tippe auf
> **🛒 In den Kochplan** — oder nutze das **+** auf den Rezeptkarten."
> ❌ „Hier ist noch nichts. Füge dein erstes Rezept hinzu und leg los!"

Der leere Filterzustand ist kürzer, weil er im Vorbeigehen passiert:
> ✅ „Nichts gefunden — Filter zurücksetzen?"

### Fehler- und Grenzmeldungen
Nie entschuldigen, nie „Fehler" schreiben, nie technische Ursachen nennen,
außer sie sind handlungsrelevant. Erfolgs- und Fehlermeldung müssen im selben
Register stehen.

> ✅ `Kopiert ✓` / `Ging nicht`
> ❌ `Kopiert ✓` / `Fehler: Zugriff auf die Zwischenablage verweigert`

Bei dauerhaften Einschränkungen: was nicht geht, dann was stattdessen geht.
> ✅ „Für die Volltextsuche wird JavaScript benötigt. Du kannst stattdessen auf
> der Startseite nach Titeln filtern."

Bestätigungsdialoge nur bei Datenverlust, als eine Frage ohne Warnwort:
> ✅ „Kompletten Kochplan leeren?" ❌ „Achtung! Möchtest du wirklich…"

### Rezept-Schrittanweisungen
Aufbau: `**Fett-Label:** Anweisung im Infinitiv.` Das Label ist ein bis drei
Wörter und benennt die **Handlung**, nicht die Zutat — „**Panieren:**",
„**Käse schmelzen:**". Optionales markieren: „**Optional — Zusätze:**".

Ein Schritt = eine abgeschlossene Handlung am Herd. Lieber ein Schritt mit vier
Sätzen als vier Schritte mit je einem, wenn man dabei nicht vom Topf weggeht.

Jede Zeitangabe bekommt ihr Erkennungsmerkmal — die Zeit ist die Schätzung,
das Merkmal ist die Wahrheit:
> ✅ „ca. **5 Minuten** rösten, bis sie goldbraun werden"
> ❌ „5 Minuten rösten."

Alternativen für abweichende Ausstattung stehen im Schritt, nicht in den Notizen:
> ✅ „Im Airfryer **17 Minuten bei 180 °C** garen. Alternativ im Ofen
> **20 Minuten bei 180 °C** backen."

Der letzte Schritt heißt „**Anrichten:**" oder „**Servieren:**" und darf mit
„Genießen!" enden.

### Notizen & Varianten
Stichpunkte mit fettem Stichwort. Dorthin gehören: Quelle, Makros, geschätzte
oder umgerechnete Werte, Was-passt-dazu, Was-schiefgehen-kann. Unsicherheiten
werden hier ausgesprochen, nicht versteckt.

> ✅ „Die Sahne braucht **mindestens 32 % Fett**, sonst wird das Eis nicht cremig."
> ✅ „Mengen aus US-Einheiten umgerechnet (1 Tasse Reis ≈ 200 g)."

### Rezept-Intro
Ein bis zwei Sätze. Satz 1: was es ist, als Aufzählung der Hauptkomponenten mit
Doppelpunkt. Satz 2 optional: die eine Zahl, die den Ausschlag gibt.

> ✅ „One-Pan-Feierabendessen im Shawarma-Stil: würzig mariniertes Hähnchen,
> goldener Zwiebel-Reis-Pilaw, ein frischer Sumak-Salat und eine cremige
> Knoblauchsauce — alles aus einer Pfanne."
> ❌ „Dieses Gericht wird euch umhauen! Perfekt für den Feierabend."

### Kategorien und Tags
**Kategorie:** ein deutsches Substantiv, Singular, kein Artikel, kein Zusatz.
Bestand: Hauptgericht, Suppe, Frühstück, Dessert, Beilage, Salat, Snack,
Backen, Getränk, Grundrezept. Keine kreativen Umbenennungen, keine Emoji.

**Tags:** klein, mit Bindestrich, beschreibend, dürfen mehrteilig sein —
`high-protein`, `ohne-eismaschine`, `meal-prep`, `im-glas`.

### Zähler und Platzhalter
> ✅ `18 Rezepte` / `12 von 18 Rezepten`
> ✅ `Rezept oder Zutat suchen …` ❌ `Hier tippen`

## Ton nach Kontext

| Kontext | Verschiebung |
|---|---|
| Startseite / Hero | Etwas wärmer, ein Hauch Einladung |
| Zubereitungsschritt | Maximal sachlich, unpersönlich, präzise |
| Notizen / Varianten | Wieder Du, ehrlich, einräumend |
| Leerer Zustand | Ruhig, hilfsbereit, konkret |
| Fehler | Kürzest, ohne Drama |
| README / docs | Erklärend, strukturiert, weiter Du/Wir |

## Testfragen vor dem Veröffentlichen

1. Würden wir das so zueinander sagen, während einer am Herd steht?
2. Steht ein Wort da, das nichts tut?
3. Ist jede Zahl, an der der Schritt scheitern kann, fett?
4. Entschuldigt sich der Text irgendwo?
5. Klingt das nach einer Rezept-App aus dem Store? Dann streichen.
