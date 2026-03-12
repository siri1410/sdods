#!/bin/bash
# Log tool usage for audit (no PII)
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] tool=$CLAUDE_TOOL_NAME" >> .claude/audit.log 2>/dev/null || true
exit 0
