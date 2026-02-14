# 🏗️ SDODS - Software Development & Operations Data Systems

> **Open-source building blocks for AI-first applications**

[![npm version](https://img.shields.io/npm/v/@sdods/core.svg)](https://www.npmjs.com/package/@sdods/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

---

## 📦 Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`@sdods/core`](./packages/core) | Shared utilities, types, and helpers | [![npm](https://img.shields.io/npm/v/@sdods/core.svg)](https://www.npmjs.com/package/@sdods/core) |
| [`@sdods/auth`](./packages/auth) | Authentication abstraction (Firebase, Auth0, custom) | [![npm](https://img.shields.io/npm/v/@sdods/auth.svg)](https://www.npmjs.com/package/@sdods/auth) |
| [`@sdods/ui`](./packages/ui) | React component library with theming | [![npm](https://img.shields.io/npm/v/@sdods/ui.svg)](https://www.npmjs.com/package/@sdods/ui) |
| [`@sdods/observability`](./packages/observability) | Logging, tracing, metrics (OpenTelemetry) | [![npm](https://img.shields.io/npm/v/@sdods/observability.svg)](https://www.npmjs.com/package/@sdods/observability) |

---

## 🚀 Quick Start

```bash
# Install packages
pnpm add @sdods/auth @sdods/ui @sdods/observability

# Or with npm
npm install @sdods/auth @sdods/ui @sdods/observability
```

### Authentication

```typescript
import { createAuthProvider, FirebaseAdapter } from '@sdods/auth';

const auth = createAuthProvider({
  adapter: new FirebaseAdapter({
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
  }),
});

// Sign in
await auth.signIn({ email, password });

// Get current user
const user = await auth.getCurrentUser();

// Sign out
await auth.signOut();
```

### UI Components

```tsx
import { Button, Card, ThemeProvider } from '@sdods/ui';

function App() {
  return (
    <ThemeProvider theme="yarlis">
      <Card>
        <h1>Welcome</h1>
        <Button variant="primary">Get Started</Button>
      </Card>
    </ThemeProvider>
  );
}
```

### Observability

```typescript
import { Logger, Tracer, Metrics } from '@sdods/observability';

// Structured logging
const logger = new Logger({ service: 'my-app' });
logger.info('User signed in', { userId: '123' });

// Distributed tracing
const tracer = new Tracer({ service: 'my-app' });
const span = tracer.startSpan('process-order');
// ... do work
span.end();

// Metrics
const metrics = new Metrics({ service: 'my-app' });
metrics.counter('orders_processed').inc();
```

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Application                       │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│  @sdods/    │  @sdods/    │  @sdods/    │  @sdods/         │
│    auth     │     ui      │observability│    core          │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ Firebase    │ React       │ OpenTelemetry│ TypeScript      │
│ Auth0       │ Tailwind    │ Sentry       │ Utilities       │
│ Custom JWT  │ Radix UI    │ PostHog      │ Types           │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

---

## 🎯 Design Principles

1. **Provider Agnostic** — Swap Firebase for Auth0 without code changes
2. **Type Safe** — Full TypeScript with strict mode
3. **Tree Shakeable** — Import only what you need
4. **Framework Flexible** — Works with Next.js, Remix, Vite
5. **Observable by Default** — Built-in telemetry hooks

---

## 📖 Documentation

- [Getting Started](./docs/getting-started.md)
- [Authentication Guide](./docs/auth.md)
- [UI Components](./docs/ui.md)
- [Observability](./docs/observability.md)
- [API Reference](./docs/api.md)

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```bash
# Clone repo
git clone https://github.com/siri1410/sdods.git
cd sdods

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build
```

---

## 📜 License

MIT © [Yarlis](https://yarlis.com)

---

<p align="center">
  Built with ❤️ by <a href="https://yarlis.com">Yarlis</a>
</p>
