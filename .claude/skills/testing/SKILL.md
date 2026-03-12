# Testing Skill

Run, fix, and write tests for this project.

## Trigger
"run tests", "fix failing tests", "write tests for X"

## Commands
- E2E: `npx playwright test --project=chromium`
- Unit: `npm test` or `pnpm test`
- Smoke: `./scripts/health-check.sh`

## Rules
- Selectors in selectors.ts, never in spec files
- Test accounts: e2e-test@rapidtriage.me / E2ETest2026!
- Never test against production data
- Fix root cause, not the assertion
