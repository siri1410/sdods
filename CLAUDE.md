# CLAUDE.md — SDODS

## Purpose

SDODS (Software Development & Operations Data Systems) is an open-core monorepo
providing shared `@sdods/*` packages consumed by MyBotBox, SmartRapidTriage, and
the broader Yarlis ecosystem. Turborepo + pnpm workspace.

**Monetization:** Open Core — free core packages, paid Pro features via gated exports.

## Map

```
packages/
  auth/        — Firebase-agnostic auth interfaces & middleware
  comms/       — Messaging, notifications, channels
  core/        — Core utilities (ZERO external dependencies)
  marketing/   — Campaign, analytics, tracking primitives
  observability/ — Logging, metrics, tracing
  payments/    — Stripe/billing abstractions
  themes/      — Design tokens, theme engine
  ui/          — Shared React components
docs/
  architecture/ — System diagrams, ADRs
```

## Rules

1. **Semver strictly** — no breaking changes without major version bump
2. **pnpm only** — no npm/yarn; use `pnpm install`, `pnpm run`
3. **Turborepo** — use `turbo run build/test/lint` for orchestration
4. **Zero-dependency core** — `packages/core` must have NO external deps
5. **Export discipline** — every package has a clean public API via index.ts
6. **No secrets** — no API keys, tokens, or credentials in any package
7. **Tests required** — all exported functions must have unit tests
8. **Biome** — formatting and linting via Biome (`npx biome check --write .`)

## Commands

```bash
pnpm install              # Install all dependencies
turbo run build           # Build all packages
turbo run test            # Run all tests
turbo run lint            # Lint all packages
turbo run typecheck       # Type-check all packages
pnpm --filter @sdods/core build  # Build single package
```

## Where Truth Lives

| What              | Where                                    |
|-------------------|------------------------------------------|
| Package structure | `packages/*/package.json`                |
| Build config      | `turbo.json`                             |
| Workspace config  | `pnpm-workspace.yaml`                    |
| Architecture      | `docs/architecture/README.md`            |
| ADRs              | `docs/architecture/decisions/`           |
| CI/CD             | `.github/workflows/`                     |
| Versioning        | Each package's `CHANGELOG.md`            |
| Pro vs Free       | `docs/architecture/decisions/001-open-core-model.md` |
