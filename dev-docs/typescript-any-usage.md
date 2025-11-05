# TypeScript `any` Usage Guidelines

## When to Use `any` vs Proper Types

### ❌ Avoid `any` When:
1. **You can use proper types** - Always prefer specific types
2. **Library exports types** - Use the library's types
3. **Types are simple** - Use `string`, `number`, `boolean`, etc.
4. **You control the data** - Define interfaces/types for your data

### ✅ Acceptable `any` Usage:

#### 1. **Complex Library Integrations**
When a library doesn't export proper types and creating accurate types would be extremely complex:

```typescript
// Convex function references - complex generic types
// Using FunctionReference is better, but sometimes `any` is pragmatic
const apiFunction = makeFunctionReference('module:function') as any;
```

**Better**: Use `FunctionReference` type when possible
**Acceptable**: Use `any` with a comment explaining why

#### 2. **Gradual Type Migration**
When migrating JavaScript to TypeScript:

```typescript
// TODO: Replace with proper type once schema is finalized
const item: any = await loadItem();
```

**Better**: Use `unknown` and type guard
**Acceptable**: Use `any` temporarily with TODO comment

#### 3. **Truly Dynamic/Heterogeneous Data**
When data structure is truly unknown or varies significantly:

```typescript
// Configuration object from external source - structure varies
const config: any = JSON.parse(externalConfig);
```

**Better**: Use `unknown` and validate
**Acceptable**: Use `any` if validation is impractical

#### 4. **Third-party Library Types Missing**
When a library doesn't have TypeScript types:

```typescript
// Library doesn't export types
import { someLibrary } from 'untyped-library';
const result: any = someLibrary.doSomething();
```

**Better**: Create `.d.ts` declaration file
**Acceptable**: Use `any` until types are available

---

## Best Practices

### Prefer `unknown` over `any`
`unknown` is type-safe - you must check/assert before using:

```typescript
// ✅ BETTER: Type-safe
function process(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
    return data.toUpperCase();
  }
  throw new Error('Invalid data');
}

// ❌ WORSE: No type safety
function process(data: any) {
  // TypeScript trusts you - no checks needed
  return data.toUpperCase(); // Could crash at runtime!
}
```

### Use Type Assertions Sparingly
Only when you're certain of the type:

```typescript
// ✅ OK: You know the type from context
const items = (queryResult?.data ?? []) as InboxItem[];

// ❌ BAD: Asserting without certainty
const item = someData as MyType; // Might not actually be MyType!
```

### Document Why `any` is Used
Always add a comment explaining:

```typescript
// Using `any` because convex-svelte doesn't export ConvexClient type
// and creating the full generic type would be overly complex
const client: any = useConvexClient();
```

---

## Current Codebase Strategy

### ✅ What We're Doing Right:
1. **Created shared types** (`src/lib/types/convex.ts`) for Convex types
2. **Using interfaces** for API functions
3. **Minimizing `any`** - only where truly necessary

### ⚠️ Remaining `any` Usage:
1. **InboxItemWithDetails** - Complex union type (TODO: create proper type)
2. **ConvexClient** - Simplified interface (library doesn't export type)
3. **Function references** - Using `FunctionReference` where possible

### 📝 Future Improvements:
1. Create proper union type for `InboxItemWithDetails` based on item.type
2. Check if convex-svelte exports ConvexClient type in future versions
3. Use `unknown` instead of `any` where validation is possible

---

## Summary

**Rule of Thumb**: 
- **Prefer proper types** whenever possible
- **Use `unknown`** if you need to accept anything but want type safety
- **Use `any`** only as a last resort, and always document why
- **Remove `any`** as you improve type coverage over time

**Goal**: Minimize `any`, but don't obsess. Pragmatic type safety is better than perfect types that never get written.

