#!/bin/bash
# Block dangerous operations
if echo "$CLAUDE_TOOL_INPUT" | grep -qE "rm -rf /|DROP TABLE|DELETE FROM|sudo rm"; then
  echo "⛔ Blocked: dangerous operation detected" >&2
  exit 1
fi
exit 0
