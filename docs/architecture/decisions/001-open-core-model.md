# ADR-001: Open Core Model

## Status

Accepted

## Context

SDODS provides shared packages for the Yarlis ecosystem. We need a monetization
strategy that balances community adoption with revenue generation.

## Decision

Adopt an **Open Core** model:

### Free Tier (MIT License)
- `@sdods/core` — utilities, helpers, types
- `@sdods/ui` — base React components
- `@sdods/themes` — design tokens, theme engine
- `@sdods/observability` — logging, metrics basics

### Pro Tier (Commercial License)
- `@sdods/auth` — advanced auth (SSO, RBAC, multi-tenant)
- `@sdods/comms` — advanced messaging (queues, webhooks, real-time)
- `@sdods/payments` — Stripe integration, subscription management
- `@sdods/marketing` — campaign engine, analytics, A/B testing

### Implementation

Pro features are gated via separate export paths:
```typescript
// Free — always available
import { BaseAuth } from '@sdods/auth';

// Pro — requires license key validation
import { SSOProvider, RBACEngine } from '@sdods/auth/pro';
```

## Consequences

- Community can adopt free packages, building ecosystem trust
- Revenue from Pro features funds continued development
- Clear separation prevents accidental feature leakage
- Consumers (MyBotBox, SRT) use Pro internally via workspace license
