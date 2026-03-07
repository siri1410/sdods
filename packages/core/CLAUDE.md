# packages/core — CLAUDE.md

## Purpose

Core utilities and types shared across ALL @sdods packages. This is the foundation.

## Critical Rule: ZERO External Dependencies

This package must have **NO external dependencies** in `dependencies`.
Only `devDependencies` for build tooling (tsup, vitest, typescript).

Why: Every @sdods package depends on core. Any dependency added here
propagates to the entire ecosystem. Keep it pure.

## What Belongs Here

- Type definitions and interfaces
- Pure utility functions (string, date, object helpers)
- Error types and result patterns
- Configuration schemas
- Constants and enums

## What Does NOT Belong Here

- React components (use `@sdods/ui`)
- API clients or network calls
- Anything requiring runtime config
- Anything with side effects
