# /publish — Publish @sdods Package

Publish a package to npm:

1. Ask which package to publish (or accept as argument)
2. Verify CHANGELOG.md is updated
3. Verify version bump in package.json
4. Run full checks: `turbo run build test lint typecheck --filter=@sdods/<pkg>`
5. Confirm with user before publishing
6. Run: `pnpm --filter @sdods/<pkg> publish --access public`
7. Create git tag: `git tag @sdods/<pkg>@<version>`
8. Push tag: `git push origin @sdods/<pkg>@<version>`
