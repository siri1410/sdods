#!/bin/bash
# Pre-commit: lint → typecheck → build (all packages must pass)
set -e
echo "🔍 Running pre-commit checks..."

echo "→ Lint..."
turbo run lint --no-cache 2>&1 || { echo "❌ Lint failed"; exit 1; }

echo "→ Typecheck..."
turbo run typecheck --no-cache 2>&1 || { echo "❌ Typecheck failed"; exit 1; }

echo "→ Build..."
turbo run build --no-cache 2>&1 || { echo "❌ Build failed"; exit 1; }

echo "✅ All pre-commit checks passed"
exit 0
