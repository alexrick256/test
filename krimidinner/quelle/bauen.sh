#!/bin/sh
# Erzeugt HTML und PDF. Aufruf: sh quelle/bauen.sh
set -e
cd "$(dirname "$0")"
python3 bau_material.py
[ -f bau_spielleiter.py ] && python3 bau_spielleiter.py
cd ..
CHROME=${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}
for f in Krimidinner_Spielmaterial Krimidinner_Spielleiter; do
  [ -f $f.html ] && $CHROME --headless --no-sandbox --disable-gpu --no-pdf-header-footer --print-to-pdf=$f.pdf $f.html 2>/dev/null
done
for f in *.pdf; do echo "$f: $(pdfinfo $f | grep Pages)"; done
