# packages/auth — CLAUDE.md

## Purpose

Authentication and authorization primitives for the Yarlis ecosystem.
Designed to be **Firebase-agnostic** — consumers can plug in any auth provider.

## Architecture

```
src/
  interfaces/   — Provider-agnostic auth interfaces (AuthProvider, User, Session)
  middleware/    — Express/Next.js auth middleware
  guards/       — Route/API protection utilities
  pro/          — Pro features (SSO, RBAC, multi-tenant) — gated
  index.ts      — Free tier public exports
```

## Design Principles

1. **Provider-agnostic** — Define interfaces, not implementations
2. **Adapter pattern** — `FirebaseAuthAdapter`, `SupabaseAuthAdapter` implement `AuthProvider`
3. **No Firebase imports** — Firebase is a consumer concern, not a package concern
4. **Pro gating** — SSO, RBAC, multi-tenant auth behind `@sdods/auth/pro`

## Consumers

- **MyBotBox:** Firebase Auth via adapter
- **SmartRapidTriage:** Firebase Auth via adapter

## Testing

Mock the `AuthProvider` interface in tests. Never call real auth services.
