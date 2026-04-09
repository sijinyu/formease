#!/bin/bash
# Capture store screenshots using Chrome headless
# Usage: bash store/capture.sh

STORE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Capturing screenshot (1280x800)..."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --screenshot="$STORE_DIR/screenshot-1280x800.png" \
  --window-size=1280,800 \
  --force-device-scale-factor=1 \
  --hide-scrollbars \
  "file://$STORE_DIR/screenshot-1280x800.html" 2>/dev/null

echo "Capturing promo tile (440x280)..."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --screenshot="$STORE_DIR/promo-440x280.png" \
  --window-size=440,280 \
  --force-device-scale-factor=1 \
  --hide-scrollbars \
  "file://$STORE_DIR/promo-440x280.html" 2>/dev/null

echo ""
if [ -f "$STORE_DIR/screenshot-1280x800.png" ]; then
  echo "screenshot-1280x800.png created"
else
  echo "FAILED: screenshot-1280x800.png"
fi

if [ -f "$STORE_DIR/promo-440x280.png" ]; then
  echo "promo-440x280.png created"
else
  echo "FAILED: promo-440x280.png"
fi
