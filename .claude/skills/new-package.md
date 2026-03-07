# Creating a New @sdods Package

## Steps

1. Create directory: `packages/<name>/`
2. Create `package.json`:
   ```json
   {
     "name": "@sdods/<name>",
     "version": "0.1.0",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsup src/index.ts --format cjs,esm --dts",
       "test": "vitest run",
       "lint": "biome check src/",
       "typecheck": "tsc --noEmit"
     }
   }
   ```
3. Create `src/index.ts` with public exports
4. Create `tsconfig.json` extending root config
5. Create `CHANGELOG.md`
6. Add tests in `src/__tests__/`
7. Run `pnpm install` from root to link
8. Verify: `turbo run build --filter=@sdods/<name>`

## Naming Convention

- Package name: lowercase, single word preferred (`auth`, `comms`, `core`)
- Scope: always `@sdods/`
- Files: kebab-case (`my-util.ts`)
