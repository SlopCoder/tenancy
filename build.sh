#!/usr/bin/env bash
# build.sh — Regenerate tenancy.html (the single-file build) from the dev files.
# Run from the project root: ./build.sh

set -euo pipefail

OUT="tenancy.html"
CSS_FILE="css/main.css"
JS_FILES=(js/state.js js/audio.js js/items.js js/ui.js js/engine.js js/scenes.js js/main.js)

# Take index.html and replace the <link rel="stylesheet" href="css/main.css"> with the inlined CSS,
# and the module-loading script tags with the concatenated JS.

{
  # Header up to the stylesheet link
  awk '/<link rel="stylesheet" href="css\/main.css">/{exit} {print}' index.html

  # Inline CSS
  echo "<style>"
  cat "$CSS_FILE"
  echo "</style>"

  # Body from </head> up to (but not including) the first dev script tag
  awk '
    /<\/head>/{p=1}
    p && /<script src="js\//{exit}
    p {print}
  ' index.html

  # Inline all JS
  echo "<script>"
  for f in "${JS_FILES[@]}"; do
    cat "$f"
    echo ""
  done
  echo "</script>"

  # Tail (closing body + html)
  echo "</body>"
  echo "</html>"
} > "$OUT"

echo "Built $OUT ($(wc -l < $OUT) lines, $(du -h $OUT | cut -f1))"
