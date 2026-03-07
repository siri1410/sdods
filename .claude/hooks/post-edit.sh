#!/bin/bash
# Auto-format edited files with Biome
INPUT=$(cat)
FILE=$(echo "$INPUT" | grep -oE '"file_path"\s*:\s*"[^"]+"' | head -1 | sed 's/.*"file_path"\s*:\s*"//;s/"//')

if [[ "$FILE" =~ \.(ts|tsx|js|jsx|json)$ ]]; then
  npx biome check --write --unsafe "$FILE" 2>/dev/null || true
fi
exit 0
