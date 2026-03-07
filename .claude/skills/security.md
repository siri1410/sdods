# Security — @sdods Packages

## Rules

1. **No secrets in code** — no API keys, tokens, passwords, or credentials
2. **No .env files** in packages — consumers provide their own config
3. **Dependency audit** — run `pnpm audit` before adding new dependencies
4. **Minimal dependencies** — fewer deps = smaller attack surface
5. **No eval/Function constructor** — no dynamic code execution
6. **Input validation** — all public functions must validate inputs

## Dependency Policy

- Prefer well-maintained packages (>1000 weekly downloads, recent updates)
- Pin exact versions for critical deps
- Run `pnpm audit` in CI
- `packages/core` must have ZERO external dependencies

## Scanning

```bash
pnpm audit                    # Check for known vulnerabilities
grep -rn 'sk_live\|sk_test\|AKIA\|ghp_\|AIza' packages/  # Manual secret scan
```
