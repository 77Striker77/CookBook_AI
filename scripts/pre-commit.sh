#!/bin/sh
# ---------------------------------------------------------------------------
# Blockiert Commits, die wie Zugangsschluessel aussehende Zeichenketten
# enthalten. Das Repo ist oeffentlich - ein einmal gepushter Key gilt als
# kompromittiert, auch wenn er sofort wieder entfernt wird.
#
# Umgehen (nur bei sicherem Fehlalarm):  git commit --no-verify
# ---------------------------------------------------------------------------

RED=$(printf '\033[31m'); YEL=$(printf '\033[33m'); OFF=$(printf '\033[0m')
treffer=0

# Nur hinzugefuegte Zeilen der vorgemerkten Aenderungen pruefen.
staged=$(git diff --cached --name-only --diff-filter=ACM)
[ -z "$staged" ] && exit 0

melde() {
  if [ "$treffer" -eq 0 ]; then
    printf '\n%sCommit gestoppt: moeglicher Zugangsschluessel gefunden%s\n\n' "$RED" "$OFF"
  fi
  treffer=$((treffer + 1))
  printf '  %s%s%s\n    %s\n\n' "$YEL" "$1" "$OFF" "$2"
}

for datei in $staged; do
  [ -f "$datei" ] || continue

  # Binaerdateien ueberspringen
  git diff --cached --numstat -- "$datei" | grep -q '^-' && continue

  neue=$(git diff --cached -U0 -- "$datei" | grep '^+' | grep -v '^+++')
  [ -z "$neue" ] && continue

  # Platzhalter und Beispiele nicht melden
  pruef=$(printf '%s\n' "$neue" | grep -viE 'dein-key|your-key|placeholder|example|beispiel|einsetzen|xxx+|\.\.\.|<[a-z-]+>|hier-')

  [ -z "$pruef" ] && continue

  fund=$(printf '%s\n' "$pruef" | grep -oiE \
    'AIza[0-9A-Za-z_-]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|sk-ant-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{32,}|xox[baprs]-[A-Za-z0-9-]{10,}' \
    | head -1)
  if [ -n "$fund" ]; then
    melde "$datei" "sieht aus wie ein Anbieter-Token: $(printf '%s' "$fund" | cut -c1-12)…"
    continue
  fi

  fund=$(printf '%s\n' "$pruef" \
    | grep -oiE '(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|password)[[:space:]]*[:=][[:space:]]*.{12,}' \
    | head -1)
  if [ -n "$fund" ]; then
    melde "$datei" "Zuweisung mit Geheimnis-Charakter: $(printf '%s' "$fund" | cut -c1-40)…"
  fi
done

if [ "$treffer" -gt 0 ]; then
  printf '%sSchluessel gehoeren nach ~/.claude/.env - ausserhalb jedes Repos.%s\n' "$YEL" "$OFF"
  printf 'Fehlalarm? Dann:  git commit --no-verify\n\n'
  exit 1
fi

exit 0
