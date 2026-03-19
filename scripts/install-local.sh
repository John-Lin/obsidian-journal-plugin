#!/bin/bash
set -euo pipefail

PLUGIN_ID="obsidian-journal-plugin"
VAULT_PLUGINS="$HOME/Documents/Obsidian Vault/.obsidian/plugins"
TARGET="$VAULT_PLUGINS/$PLUGIN_ID"

npm run build

mkdir -p "$TARGET"
cp dist/main.js "$TARGET/main.js"
cp manifest.json "$TARGET/manifest.json"

echo "Installed to $TARGET"
echo "Restart Obsidian or reload plugins to activate."
