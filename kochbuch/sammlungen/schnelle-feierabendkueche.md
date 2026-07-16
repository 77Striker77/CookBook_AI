# Schnelle Feierabendküche

Rezepte, die in ≤ 30 Minuten fertig sind — für Abende ohne Zeit.

- [[shakshuka]]
- [[gruene-pasta-mit-erbsen]]

> In Obsidian per Dataview automatisierbar, z. B.:
> ```dataview
> TABLE zeit_gesamt AS "Minuten", kategorie
> FROM "rezepte"
> WHERE zeit_gesamt <= 30
> SORT zeit_gesamt ASC
> ```
