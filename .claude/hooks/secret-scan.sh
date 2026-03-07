#!/bin/bash
# Scan for leaked secrets in file content
INPUT=$(cat)
CONTENT=$(echo "$INPUT" | grep -oE '"new_string"\s*:\s*"[^"]+"' | head -1)

if echo "$CONTENT" | grep -qiE '(sk_live|sk_test|AKIA[A-Z0-9]{16}|ghp_[a-zA-Z0-9]{36}|AIza[a-zA-Z0-9_-]{35}|-----BEGIN (RSA |EC )?PRIVATE KEY)'; then
  echo "🚨 BLOCKED: Potential secret/credential detected in file content."
  echo "Never commit API keys, tokens, or private keys to shared packages."
  exit 1
fi
exit 0
