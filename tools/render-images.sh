#!/usr/bin/env bash
# Re-renders the social preview images and PNG icons from tools/og/*.html
# using headless Microsoft Edge (or Chrome). Run from the repo root:  bash tools/render-images.sh
set -euo pipefail

BROWSER="${BROWSER:-/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe}"
ROOT="$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)"
OUT="$ROOT/assets/img"

shot() { # url output width height
  "$BROWSER" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --default-background-color=00000000 --virtual-time-budget=6000 \
    --window-size="$3,$4" --screenshot="$2" "$1" >/dev/null 2>&1
  echo "wrote $2"
}

for v in default thermoforge vaultforge; do
  shot "file:///$ROOT/tools/og/og.html#$v" "$OUT/og-$v.png" 1200 630
done
icon() { # variant-size output
  "$BROWSER" --headless=new --disable-gpu --virtual-time-budget=3000 --dump-dom \
    "file:///$ROOT/tools/og/icon.html#$1" 2>/dev/null \
    | sed -n 's:.*<pre id="out">\([^<]*\)</pre>.*:\1:p' | base64 -d > "$2"
  echo "wrote $2"
}

icon full-180 "$OUT/apple-touch-icon.png"
icon small-32 "$OUT/favicon-32.png"
