#!/usr/bin/env bash
# Bereitet ein Reel/Video für die Rezept-Einarbeitung vor: lädt es (auf offenem
# Netz, z. B. GitHub Actions), zieht Videobilder und transkribiert die Tonspur.
# Ergebnis-Ordner enthält frames/, transkript.txt, caption.txt, titel/autor.
# Nutzt nur freie Werkzeuge (yt-dlp, ffmpeg, faster-whisper) — keine Claude API.
#
# Aufruf: reel-prepare.sh <LINK> <OUT_DIR>
# Optional: COOKIES_FILE=<pfad> (für login-pflichtige Reels).

set -uo pipefail
LINK="${1:?Link fehlt}"
OUT="${2:?Ausgabeordner fehlt}"
mkdir -p "$OUT/frames"

YTDLP=(yt-dlp --no-warnings --no-playlist)
if [ -n "${COOKIES_FILE:-}" ] && [ -s "${COOKIES_FILE:-}" ]; then
  YTDLP+=(--cookies "$COOKIES_FILE")
fi

echo "→ Metadaten"
"${YTDLP[@]}" --skip-download --print "%(title)s"       "$LINK" > "$OUT/titel.txt"   2>/dev/null || true
"${YTDLP[@]}" --skip-download --print "%(uploader)s"    "$LINK" > "$OUT/autor.txt"   2>/dev/null || true
"${YTDLP[@]}" --skip-download --print "%(description)s" "$LINK" > "$OUT/caption.txt" 2>/dev/null || true

echo "→ Video laden"
if ! "${YTDLP[@]}" -o "$OUT/video.%(ext)s" -f "mp4/bestvideo*+bestaudio/best" "$LINK" 2>"$OUT/ytdlp.log"; then
  echo "DOWNLOAD_FAILED"
  sed -n '1,20p' "$OUT/ytdlp.log" >&2 || true
  exit 3
fi
VID="$(ls "$OUT"/video.* 2>/dev/null | head -1)"
[ -n "$VID" ] || { echo "KEINE_VIDEODATEI"; exit 3; }

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

echo "OK: $(ls "$OUT/frames" | wc -l) Bilder, Transkript $(wc -c < "$OUT/transkript.txt") Zeichen"
