#!/usr/bin/env python3
"""Cookie-freier YouTube-Fallback über öffentliche Invidious/Piped-Spiegel.

Wird nur genutzt, wenn yt-dlp an YouTubes Bot-Sperre scheitert (Server-IPs).
Läuft auf offenem Netz (GitHub Actions), NICHT im gesperrten Session-Container.

Holt Titel, Autor und Beschreibung (bei Rezept-Kanälen steht das Rezept oft
komplett drin) und versucht zusätzlich, einen progressiven Video-Stream
(Bild+Ton) herunterzuladen, damit Standbilder und Transkript möglich sind.

Aufruf: youtube-invidious.py <YOUTUBE_URL> <OUT_DIR>
Schreibt (soweit erfolgreich): titel.txt, autor.txt, caption.txt, video.mp4
Exit 0, wenn wenigstens eine brauchbare Beschreibung ODER ein Video da ist.
"""
import json
import os
import re
import sys
import urllib.request

URL = sys.argv[1]
OUT = sys.argv[2]

# Öffentliche Spiegel — mehrere, da einzelne oft down/rate-limitiert sind.
INVIDIOUS = [
    "https://invidious.nerdvpn.de",
    "https://inv.nadeko.net",
    "https://yewtu.be",
    "https://invidious.jing.rocks",
    "https://iv.melmac.space",
    "https://invidious.privacyredirect.com",
]
PIPED = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.adminforge.de",
    "https://api.piped.private.coffee",
]

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
MAX_VIDEO_BYTES = 180 * 1024 * 1024  # Sicherheitslimit für den Stream-Download


def video_id(u):
    m = re.search(r"(?:v=|youtu\.be/|/shorts/|/embed/)([A-Za-z0-9_-]{11})", u)
    return m.group(1) if m else None


def get_json(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def write(name, text):
    if text and text.strip():
        open(os.path.join(OUT, name), "w").write(text.strip())
        return True
    return False


def download(url, dest, timeout=45):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=timeout) as r, open(dest, "wb") as f:
            total = 0
            while True:
                chunk = r.read(1 << 16)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_VIDEO_BYTES:
                    raise RuntimeError("Stream zu groß, abgebrochen")
                f.write(chunk)
        return total > 0
    except Exception as e:
        print(f"    Stream-Download fehlgeschlagen: {e}", file=sys.stderr)
        if os.path.exists(dest):
            os.remove(dest)
        return False


def try_invidious(vid):
    got_desc = False
    for base in INVIDIOUS:
        try:
            print(f"  Invidious: {base}")
            d = get_json(f"{base}/api/v1/videos/{vid}"
                         f"?fields=title,author,description,formatStreams")
        except Exception as e:
            print(f"    (nicht erreichbar: {e})", file=sys.stderr)
            continue
        if not d.get("title"):
            continue
        write("titel.txt", d.get("title"))
        write("autor.txt", d.get("author"))
        got_desc = write("caption.txt", d.get("description")) or got_desc
        # Progressiven Stream (Bild+Ton) nehmen, kleinste Auflösung zuerst.
        streams = [s for s in (d.get("formatStreams") or []) if s.get("url")]
        streams.sort(key=lambda s: int(s.get("height") or s.get("resolution", "0").rstrip("p") or 0)
                     if str(s.get("height") or s.get("resolution", "0").rstrip("p")).isdigit() else 9999)
        for s in streams:
            print(f"    Stream {s.get('resolution') or s.get('height')} — versuche Download")
            if download(s["url"], os.path.join(OUT, "video.mp4")):
                return True, got_desc
        if got_desc:
            return False, True
    return False, got_desc


def try_piped(vid):
    got_desc = False
    for base in PIPED:
        try:
            print(f"  Piped: {base}")
            d = get_json(f"{base}/streams/{vid}")
        except Exception as e:
            print(f"    (nicht erreichbar: {e})", file=sys.stderr)
            continue
        if not (d.get("title") or d.get("description")):
            continue
        write("titel.txt", d.get("title"))
        write("autor.txt", d.get("uploader"))
        got_desc = write("caption.txt", d.get("description")) or got_desc
        # Piped: videoStreams mit videoOnly=false sind progressiv (Bild+Ton).
        prog = [s for s in (d.get("videoStreams") or [])
                if s.get("url") and not s.get("videoOnly", True)]
        prog.sort(key=lambda s: s.get("height") or 0)
        for s in prog:
            print(f"    Stream {s.get('quality')} — versuche Download")
            if download(s["url"], os.path.join(OUT, "video.mp4")):
                return True, got_desc
        if got_desc:
            return False, True
    return False, got_desc


def main():
    vid = video_id(URL)
    if not vid:
        print("Keine Video-ID erkannt", file=sys.stderr)
        return 3
    os.makedirs(OUT, exist_ok=True)
    for fn in (try_invidious, try_piped):
        got_video, got_desc = fn(vid)
        if got_video:
            print("→ Video über Spiegel geladen (Bild+Ton).")
            return 0
        if got_desc:
            # Beschreibung ist da; weitere Spiegel nur noch für ein Video testen.
            continue
    caption = os.path.join(OUT, "caption.txt")
    if os.path.exists(caption) and len(open(caption).read().strip()) >= 120:
        print("→ Beschreibung über Spiegel geladen (kein Video).")
        return 0
    print("→ Über Spiegel nichts Brauchbares bekommen.", file=sys.stderr)
    return 3


if __name__ == "__main__":
    sys.exit(main())
