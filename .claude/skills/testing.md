# Testing Requirements — @sdods Packages

## Rules

1. **All exported functions** must have unit tests
2. **Test framework:** Vitest
3. **Location:** `src/__tests__/` or colocated `*.test.ts` files
4. **Coverage target:** 80% for new packages, increasing over time
5. **No network calls** in unit tests — mock all external dependencies

## Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../index';

describe('myFunction', () => {
  it('should handle the happy path', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(() => myFunction('')).toThrow();
  });
});
```

## Running Tests

```bash
turbo run test                          # All packages
turbo run test --filter=@sdods/core     # Single package
pnpm --filter @sdods/core test -- --watch  # Watch mode
```
