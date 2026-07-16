---
name: review-rezept
description: Prüft ein oder alle Rezepte im Vault auf Schema-Konformität, Plausibilität (Mengen, Zeiten, fehlende Schritte), Duplikate und saubere Zutaten-Normalisierung. Nutzen vor dem Merge eines neuen Rezepts oder zur Qualitätskontrolle.
---

# Rezept prüfen

Prüft `kochbuch/rezepte/<slug>.md` (oder alle Rezepte, wenn kein Slug genannt
ist). Bezugspunkte: `kochbuch/_meta/schema.md` und `kochbuch/_meta/synonyme.yaml`.

## Checks

1. **Schema:** `npm run build` ausführen. Bricht der Build ab, nennt er das
   fehlende/ungültige Feld — das ist der harte Schema-Check. Fehler beheben.

2. **Plausibilität:**
   - Hat jede Zutat aus der `zutaten`-Liste eine sinnvolle Menge/Einheit?
   - Kommen alle in der Zubereitung genannten Hauptzutaten in der Zutatenliste
     vor (und umgekehrt)? Fehlende Schritte oder verwaiste Zutaten melden.
   - Sind `zeit_gesamt` ≥ `zeit_aktiv` und beide realistisch?
   - Passt `kategorie` zum Gericht?

3. **Zutaten-Normalisierung:** Jede Zutat gegen `synonyme.yaml` prüfen. Zutaten,
   die als eigener Knoten auftauchen, obwohl sie eine Variante einer bestehenden
   sind (z. B. „Kirschtomaten“ vs. „Tomaten“), als Synonym ergänzen. Prüfen mit:
   `ls dist/zutat` nach dem Build — überraschende oder doppelte Slugs deuten auf
   fehlende Synonyme hin.

4. **Duplikate:** Gibt es bereits ein sehr ähnliches Rezept (gleicher Titel/
   gleiche Kernzutaten)? Falls ja, auf Zusammenführen oder Umbenennen hinweisen.

## Ergebnis

Kurze Liste: ✅ bestanden / ⚠️ Hinweise / ❌ Blocker. Bei Blockern konkret sagen,
welche Zeile im Rezept zu ändern ist. Keine stillschweigenden Korrekturen an
Mengen oder Zutaten — Unklarheiten dem User vorlegen.
