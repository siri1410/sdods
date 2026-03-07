# /status — SDODS Monorepo Status

Check the health of all packages:

1. Run `turbo run build --dry-run` to see the dependency graph
2. Run `turbo run typecheck` to verify all packages compile
3. Run `turbo run test` to check test status
4. List any packages with version 0.0.x (not yet released)
5. Check for uncommitted changes: `git status`
6. Report summary table: package | version | build | tests | status
