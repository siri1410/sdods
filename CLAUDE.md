# CLAUDE.md — @sdods (sdods.com)

Open-core ops dashboards + shared npm package ecosystem. Community + distribution channel.

## Published Packages
| Package | Version | Purpose |
|---------|---------|---------|
| @sdods/core | v1.x | Core utilities |
| @sdods/ui | v1.x | Dark-theme React components |
| @sdods/auth | v1.x | Auth (StandardSession, AuthProvider) |
| @sdods/payments | v1.x | Stripe wrapper |
| @sdods/observability | v0.x | Logging, metrics |
| @sdods/comms | v0.x | Notifications |
| @sdods/themes | v0.x | Design tokens |
| @sdods/marketing | v0.x | Landing page components |

## Repo Map
```
packages/@sdods/core/         → Core utilities
packages/@sdods/ui/           → React component library
packages/@sdods/auth/         → Auth package
packages/@sdods/payments/     → Stripe integration
apps/docs/                    → Documentation site
apps/storybook/               → Component playground
```

## Build & Publish
```bash
pnpm build           # build all packages
pnpm test            # run all tests
pnpm changeset       # bump version
pnpm publish         # publish to npm as yarlis1410
```

## Rules
1. All packages must have: README, TypeScript types, JSDoc on public API
2. Breaking changes require major version bump + migration guide
3. npm publish: use automation token (bypass 2FA)
4. Design tokens: always use CSS variables, never hardcode colors
5. Theme: #00C4D4 teal, #0F172A dark, Space Grotesk
