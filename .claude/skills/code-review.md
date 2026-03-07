# Code Review — @sdods Packages

## Focus Areas

1. **API Surface** — Review all exports in `index.ts`. Every public function/type is a contract.
2. **Backward Compatibility** — Check if changes break existing consumers (MyBotBox, SmartRapidTriage).
3. **Export Hygiene** — No internal types leaked. Use `export type` for type-only exports.
4. **Dependency Check** — New deps must be justified. `core` must remain zero-dependency.
5. **Test Coverage** — All new exports must have corresponding tests.
6. **Changelog** — Breaking changes require CHANGELOG.md entry and major version bump.

## Review Checklist

- [ ] No breaking changes to existing exports
- [ ] New exports are documented with JSDoc
- [ ] Types are properly exported
- [ ] Tests cover happy path + edge cases
- [ ] No secrets or hardcoded credentials
- [ ] Package builds cleanly (`turbo run build --filter=@sdods/<pkg>`)
