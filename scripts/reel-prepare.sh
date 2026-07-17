#!/usr/bin/env bash
# Bereitet ein Reel/Video für die Rezept-Einarbeitung vor: lädt es (auf offenem
# Netz, z. B. GitHub Actions), zieht Videobilder und transkribiert die Tonspur.
# Ergebnis-Ordner enthält frames/, transkript.txt, caption.txt, titel/autor und
# status.txt (voll | nur-beschreibung | fehlgeschlagen).
# Nutzt nur freie Werkzeuge (yt-dlp, ffmpeg, faster-whisper) — keine Claude API.
#
# Aufruf: reel-prepare.sh <LINK> <OUT_DIR>
# Optional: COOKIES_FILE=<pfad> (für login-/bot-geschützte Quellen).

set -uo pipefail
LINK="${1:?Link fehlt}"
OUT="${2:?Ausgabeordner fehlt}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$OUT/frames"

# Plattform erkennen — steuert Player-Clients (YouTube) und die spätere Meldung.
PLATFORM="sonstige"
case "$LINK" in
  *instagram.com*)          PLATFORM="instagram" ;;
  *tiktok.com*)             PLATFORM="tiktok" ;;
  *youtube.com*|*youtu.be*) PLATFORM="youtube" ;;
esac
echo "$PLATFORM" > "$OUT/plattform.txt"

YTDLP=(yt-dlp --no-warnings --no-playlist)
if [ -n "${COOKIES_FILE:-}" ] && [ -s "${COOKIES_FILE:-}" ]; then
  YTDLP+=(--cookies "$COOKIES_FILE")
fi
# YouTube blockt Datacenter-IPs (GitHub Actions) gern mit „Sign in to confirm
# you're not a bot". Alternative Player-Clients kommen oft ohne Cookies durch.
if [ "$PLATFORM" = "youtube" ]; then
  YTDLP+=(--extractor-args "youtube:player_client=tv,mweb,web_safari,android")
fi

caption_len() { tr -d '[:space:]' < "$OUT/caption.txt" 2>/dev/null | wc -c; }

echo "→ Metadaten"
"${YTDLP[@]}" --skip-download --print "%(title)s"       "$LINK" > "$OUT/titel.txt"   2>/dev/null || true
"${YTDLP[@]}" --skip-download --print "%(uploader)s"    "$LINK" > "$OUT/autor.txt"   2>/dev/null || true
"${YTDLP[@]}" --skip-download --print "%(description)s" "$LINK" > "$OUT/caption.txt" 2>/dev/null || true
# „NA" von yt-dlp als leer behandeln.
for f in titel autor caption; do
  if [ "$(tr -d '[:space:]' < "$OUT/$f.txt" 2>/dev/null)" = "NA" ]; then : > "$OUT/$f.txt"; fi
done

echo "→ Video laden"
"${YTDLP[@]}" -o "$OUT/video.%(ext)s" -f "mp4/bestvideo*+bestaudio/best" "$LINK" 2>"$OUT/ytdlp.log" || {
  echo "  yt-dlp-Download fehlgeschlagen"
  sed -n '1,20p' "$OUT/ytdlp.log" >&2 || true
}
VID="$(ls "$OUT"/video.* 2>/dev/null | head -1)"

# Cookie-freier Umweg: Bei YouTube ohne Video über öffentliche Invidious/Piped-
# Spiegel Beschreibung (und wenn möglich einen Bild+Ton-Stream) holen.
if [ -z "$VID" ] && [ "$PLATFORM" = "youtube" ]; then
  echo "→ yt-dlp blockiert — versuche Spiegel (Invidious/Piped, cookie-frei)"
  python3 "$SCRIPT_DIR/youtube-invidious.py" "$LINK" "$OUT" || true
  VID="$(ls "$OUT"/video.* 2>/dev/null | head -1)"
fi

if [ -n "$VID" ]; then
  echo "→ Videobilder (Szenenwechsel, skaliert)"
  ffmpeg -y -i "$VID" -vf "select='gt(scene,0.2)+eq(n,0)',scale=720:-1" -vsync vfr -frames:v 30 "$OUT/frames/f_%03d.jpg" 2>/dev/null || true
  if [ -z "$(ls -A "$OUT/frames" 2>/dev/null)" ]; then
    echo "  (Fallback: 1 Bild/Sekunde)"
    ffmpeg -y -i "$VID" -vf "fps=1,scale=720:-1" -frames:v 30 "$OUT/frames/f_%03d.jpg" 2>/dev/null || true
  fi

  echo "→ Tonspur transkribieren"
  ffmpeg -y -i "$VID" -vn -ac 1 -ar 16000 "$OUT/audio.wav" 2>/dev/null || true
  python3 - "$OUT/audio.wav" "$OUT/transkript.txt" <<'PY'
import sys, os
audio, out = sys.argv[1], sys.argv[2]
try:
    if not os.path.exists(audio):
        raise RuntimeError("keine Audiospur")
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio, vad_filter=False)
    text = " ".join(s.text.strip() for s in segments).strip()
    open(out, "w").write(text or "(kein Ton/keine Sprache erkannt)")
except Exception as e:
    open(out, "w").write(f"(Transkription fehlgeschlagen: {e})")
PY

  echo "→ Große Dateien entfernen (nur Bilder/Text bleiben)"
  rm -f "$VID" "$OUT/audio.wav" "$OUT/ytdlp.log"
  echo "voll" > "$OUT/status.txt"
  echo "OK: $(ls "$OUT/frames" | wc -l) Bilder, Transkript $(wc -c < "$OUT/transkript.txt") Zeichen"
  exit 0
fi

# Kein Video, aber brauchbare Beschreibung? Reicht als Textquelle (Rezept steht
# bei YouTube oft komplett in der Beschreibung).
if [ "$(caption_len)" -ge 120 ]; then
  echo "→ Kein Video, aber Beschreibung vorhanden ($(caption_len) Zeichen) — als Textquelle nutzen."
  echo "nur-beschreibung" > "$OUT/status.txt"
  rm -f "$OUT/ytdlp.log"
  rmdir "$OUT/frames" 2>/dev/null || true
  echo "OK (nur Beschreibung): $(caption_len) Zeichen Caption"
  exit 0
fi

echo "fehlgeschlagen" > "$OUT/status.txt"
exit 3
