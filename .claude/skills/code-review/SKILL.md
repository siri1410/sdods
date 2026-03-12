# Code Review Skill

9-dimension PR review: security, performance, privacy, architecture, tests, types, style, docs, breaking-changes.

## Trigger
"review this PR", "review my code", "sireesh review"

## Dimensions
1. Security — auth bypass, injection, secret exposure
2. Performance — N+1 queries, missing indexes, unbounded loops
3. Privacy — PII in logs, email in analytics
4. Architecture — layer violations, tight coupling
5. Tests — coverage gaps, brittle assertions
6. Types — any abuse, missing generics
7. Style — naming, consistency
8. Docs — missing JSDoc on public API
9. Breaking changes — API contract, DB schema

## Output
- ✅ APPROVED / ⚠️ APPROVED WITH NOTES / 🔴 CHANGES REQUESTED
- Per-dimension findings with line references
- Verdict + recommended actions
