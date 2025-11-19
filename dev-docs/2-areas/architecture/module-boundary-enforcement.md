# Module Boundary Enforcement

**Status**: ✅ Active  
**Last Updated**: 2025-11-19  
**Related**: [SYOS-307](https://linear.app/younghumanclub/issue/SYOS-307)

---

## Overview

Module boundary enforcement prevents cross-module imports to maintain loose coupling between modules. Modules should communicate via API contracts (dependency injection), not direct imports.

**ESLint Rule**: `synergyos/no-cross-module-imports`

---

## Rule Behavior

### ❌ BLOCKED: Cross-Module Imports

```typescript
// ❌ ERROR: Cross-module import
// From: src/lib/modules/meetings/...
// To: src/lib/modules/inbox/...
import { something } from '$lib/modules/inbox/api';
```

**Error Message**:
```
Cross-module import detected: "meetings" → "inbox". 
Modules should communicate via API contracts. 
Use dependency injection via context (getContext) or import from core module instead.
```

### ✅ ALLOWED: Type-Only Imports

Type imports are always allowed (compile-time only, no runtime coupling):

```typescript
// ✅ ALLOWED: Type-only import (compile-time only)
import type { InboxModuleAPI } from '$lib/modules/inbox/api';
```

### ✅ ALLOWED: Core Module Imports

Core module imports are always allowed from any module:

```typescript
// ✅ ALLOWED: Core module import
import { TagSelector } from '$lib/modules/core/components/TagSelector.svelte';
import type { CoreModuleAPI } from '$lib/modules/core/api';
```

### ✅ ALLOWED: Same-Module Imports

Imports within the same module are allowed:

```typescript
// ✅ ALLOWED: Same-module import
// From: src/lib/modules/inbox/...
// To: src/lib/modules/inbox/...
import { useInboxItems } from '$lib/modules/inbox/composables/useInboxItems.svelte';
```

### ✅ ALLOWED: Shared Component Imports

Shared components are allowed (not module-specific):

```typescript
// ✅ ALLOWED: Shared component import
import Button from '$lib/components/ui/Button.svelte';
import TagSelector from '$lib/components/core/TagSelector.svelte';
```

### ✅ ALLOWED: Files Outside Modules

The rule only applies to files within `src/lib/modules/`. Files outside modules (e.g., routes, components) are not restricted:

```typescript
// ✅ ALLOWED: Layout file importing from modules (outside module directory)
// From: src/routes/(authenticated)/+layout.svelte
import { createInboxModuleAPI } from '$lib/modules/inbox/api';
import { createCoreModuleAPI } from '$lib/modules/core/api';
```

---

## How to Fix Violations

### Option 1: Use Dependency Injection (Recommended)

Instead of direct imports, use dependency injection via Svelte context:

```typescript
// ❌ WRONG: Direct import
import TagSelector from '$lib/modules/inbox/components/TagSelector.svelte';

// ✅ CORRECT: Dependency injection
import { getContext } from 'svelte';
import type { CoreModuleAPI } from '$lib/modules/core/api';

const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
const TagSelector = coreAPI?.TagSelector;
```

**See**: `dev-docs/2-areas/architecture/modularity-refactoring-analysis.md` for complete migration guide

### Option 2: Move to Core Module

If a component/utility is used by multiple modules, move it to the core module:

```typescript
// ❌ WRONG: Component in inbox module, used by meetings
// src/lib/modules/inbox/components/TagSelector.svelte

// ✅ CORRECT: Component in core module
// src/lib/modules/core/components/TagSelector.svelte
```

### Option 3: Use Type-Only Import

If you only need types (not runtime values), use type-only imports:

```typescript
// ✅ ALLOWED: Type-only import
import type { InboxModuleAPI } from '$lib/modules/inbox/api';
```

---

## Rule Configuration

The rule is configured in `eslint.config.js`:

```javascript
plugins: {
  'synergyos': {
    rules: {
      'no-cross-module-imports': noCrossModuleImports
    }
  }
},
rules: {
  'synergyos/no-cross-module-imports': 'error'
}
```

**Severity**: `error` (blocks CI)

---

## Testing

The rule is automatically tested in CI (`npm run lint`). To test locally:

```bash
npm run lint
```

To test a specific file:

```bash
npx eslint src/lib/modules/meetings/some-file.ts
```

---

## Related Documentation

- **Modularity Analysis**: `dev-docs/2-areas/architecture/modularity-refactoring-analysis.md`
- **System Architecture**: `dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system`
- **ESLint Rule**: `eslint-rules/no-cross-module-imports.js`
- **CI Workflow**: `.github/workflows/quality-gates.yml`

---

## Implementation Details

**Rule File**: `eslint-rules/no-cross-module-imports.js`

**Detection Logic**:
1. Extracts source module from file path (`src/lib/modules/{module}/...`)
2. Extracts target module from import path (`$lib/modules/{module}/...`)
3. Blocks if different modules (except core)
4. Allows type-only imports (compile-time only)
5. Allows same-module imports
6. Allows core module imports
7. Allows shared component imports (`$lib/components/ui/`, `$lib/components/core/`)

**Module Detection**:
- Source module: Extracted from file path using regex `/src\/lib\/modules\/([^/]+)/`
- Target module: Extracted from import path using regex `/\$lib\/modules\/([^/]+)/`

---

## Success Criteria

- ✅ ESLint rule created
- ✅ Rule prevents cross-module imports
- ✅ Rule allows core module imports
- ✅ Rule allows same-module imports
- ✅ Rule allows shared component imports
- ✅ Rule allows type-only imports
- ✅ CI fails on violations
- ✅ Existing codebase passes (after SYOS-308)
- ✅ Rule documented

