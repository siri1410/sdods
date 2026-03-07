# SDODS Architecture

## Package Dependency Graph

```
@sdods/ui ──────┬── @sdods/themes
                └── @sdods/core

@sdods/auth ────── @sdods/core

@sdods/comms ───── @sdods/core

@sdods/payments ── @sdods/core

@sdods/marketing ─ @sdods/core

@sdods/observability ── @sdods/core

@sdods/themes ──── @sdods/core

@sdods/core ────── (zero dependencies)
```

## Consumer Repos

| Repo              | Packages Used                                    |
|-------------------|--------------------------------------------------|
| MyBotBox          | auth, comms, core, payments, ui, themes, observability |
| SmartRapidTriage  | auth, core, comms, ui, themes, observability     |

## Package Tiers

- **Free (Open Source):** core, ui, themes, observability
- **Pro (Licensed):** auth/pro, comms/pro, payments/pro, marketing

See `decisions/001-open-core-model.md` for the full open-core strategy.
