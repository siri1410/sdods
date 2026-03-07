#!/bin/bash
# WARN when editing core/ or auth/ — breaking changes affect downstream consumers
INPUT=$(cat)
FILE=$(echo "$INPUT" | grep -oE '"file_path"\s*:\s*"[^"]+"' | head -1 | sed 's/.*"file_path"\s*:\s*"//;s/"//')

if echo "$FILE" | grep -qE '^packages/(core|auth)/'; then
  echo "⚠️  WARNING: Editing $FILE — this is a critical shared package."
  echo "Breaking changes here affect MyBotBox and SmartRapidTriage."
  echo "Ensure backward compatibility or bump major version."
fi
exit 0
