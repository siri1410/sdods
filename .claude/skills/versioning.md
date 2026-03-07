# Versioning & Publishing — @sdods Packages

## Semver Rules

- **Patch (0.1.x):** Bug fixes, internal refactors (no API change)
- **Minor (0.x.0):** New exports, additive features (backward compatible)
- **Major (x.0.0):** Breaking changes to public API, removed exports

## Process

1. Make changes and add tests
2. Update `CHANGELOG.md` with entry under `## [Unreleased]`
3. Bump version in `package.json`
4. Run full build: `turbo run build test lint typecheck`
5. Commit with conventional commit: `feat(@sdods/core): add utility`
6. Tag if publishing: `git tag @sdods/core@1.2.0`

## Changelog Format

```markdown
## [Unreleased]
### Added
- New `parseConfig` utility function
### Changed
- `formatDate` now accepts ISO strings
### Removed
- BREAKING: Removed deprecated `oldHelper`
```

## Publishing (when ready)

```bash
pnpm --filter @sdods/<name> publish --access public
```
