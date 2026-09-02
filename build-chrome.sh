#!/usr/bin/env bash
# build-chrome.sh — Linkaloop
# Assemble le paquet Chrome à partir de la base de code commune.
# À lancer depuis la racine du projet (le dossier contenant manifest.json).
#
# Structure attendue :
#   manifest.json          → manifest Firefox (source de vérité pour AMO)
#   manifest-chrome.json   → manifest Chrome
#   background-chrome.js   → wrapper service worker Chrome
#   (le reste des fichiers est commun aux deux navigateurs)
#
# Produit : dist/linkaloop-chrome.zip, prêt pour le Chrome Web Store.
# Pour Firefox, continuez d'utiliser : npx web-ext build

set -euo pipefail

STAGE="dist/chrome-staging"
OUT="dist/tabMidi-chrome.zip"

# Fichiers communs aux deux navigateurs
SHARED_FILES=(


    content.js

)

rm -rf "$STAGE" "$OUT"
mkdir -p "$STAGE"

for f in "${SHARED_FILES[@]}"; do
    cp "$f" "$STAGE/"
done

cp -r icons "$STAGE/icons"
cp background.js "$STAGE/"
cp manifest-chrome.json "$STAGE/manifest.json"

( cd "$STAGE" && zip -r -q "../$(basename "$OUT")" . )
rm -rf "$STAGE"

echo "OK → $OUT"