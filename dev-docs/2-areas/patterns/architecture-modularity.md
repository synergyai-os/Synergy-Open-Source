# Architecture Modularity Patterns

Patterns for enforcing module boundaries and dependency injection across feature modules.

---

## #L10: Module APIs via Context (No Cross-Module Imports) [🟡 IMPORTANT]

**Keywords**: cross-module import, module api, context, dependency injection, createContext, setContext, getContext, ProjectsModuleAPI, no-cross-module-imports

**Symptom**:
- `eslint-disable synergyos/no-cross-module-imports` is added to bypass lint
- A module (e.g., meetings) imports components/composables from another module (e.g., projects, org-chart)
- Lint fails on `synergyos/no-cross-module-imports`

**Root Cause**: Modules are tightly coupled because they import each other's internals. There is no injected module API or shared UI layer, forcing cross-module imports to get needed logic or components.

**Fix (preferred)**: Provide a module API via Svelte context at the layout boundary and consume it inside the dependent module.

```ts
// Provider (e.g., workspace layout)
import { createContext } from 'svelte';
import type { ProjectsModuleAPI } from '$lib/modules/projects/api';
import { useTasks } from '$lib/modules/projects/composables/useTasks.svelte';
import { useTaskForm } from '$lib/modules/projects/composables/useTaskForm.svelte';

export const [getProjectsContext, setProjectsContext] = createContext<ProjectsModuleAPI>();

const projectsApi: ProjectsModuleAPI = { useTasks, useTaskForm };
setProjectsContext(projectsApi);
```

```ts
// Consumer (e.g., meetings component)
import { getProjectsContext } from '$lib/modules/projects/context';

const projects = getProjectsContext();
const data = projects.useTasks({ agendaItemId, sessionId, workspaceId, circleId });
const form = projects.useTaskForm({ sessionId, workspaceId, meetingId, agendaItemId, circleId, members: () => data.members, roles: () => data.roles });
```

**Checklist**:
- Provide module APIs at a layout/composition boundary (workspace layout) using `createContext`
- Consume APIs via getters, not direct `$lib/modules/*` imports
- Move reusable UI into shared layers (`$lib/components/molecules`) instead of importing from another module
- Remove `eslint-disable synergyos/no-cross-module-imports`; keep the rule enforced

**Why it prevents recurrence**: Context-provided APIs and shared UI layers keep module boundaries intact, avoid cycles, and preserve the lint guardrail. Modules remain independently maintainable while still sharing capabilities through explicit contracts.

---

## #L70: Core Domain Logic in `convex/core` (Pure + Tests) [🟡 IMPORTANT]

**Keywords**: convex core, pure functions, lead detection, duplicate role name, template isRequired, archive guard, authority pattern, unit tests

**Symptom**:
- Business rules live inside Convex queries/mutations (e.g., `circleRoles.ts`), mixed with DB I/O
- Lead detection/duplicate-name logic duplicated across handlers
- Hard to unit test (requires Convex context/DB mocking)
- Archive guard for Lead roles hand-coded in multiple places

**Root Cause**: Domain rules were never extracted into core. Application-layer functions mix persistence with pure rules, preventing isolated testing and reuse.

**Fix**:
- Extract pure helpers into `convex/core/{domain}` (no Convex imports, side-effect free)
  - Example: `roles/detection.ts` (Lead detection from template `isRequired`)
  - `roles/validation.ts` (trimmed, case-insensitive duplicate-name checks)
  - `roles/lead.ts` (Lead counting + circle-type lead requirement map)
- Add `index.ts` and README describing contracts; re-export from `convex/core/index.ts`
- Keep DB operations in application layer (e.g., `convex/circleRoles.ts`) and call core helpers
- Add unit tests under core (Vitest server project) covering:
  - Templates required/optional/missing (Lead detection)
  - Duplicate names (trimmed, case-insensitive, exclude current role)
  - Lead requirement defaults and overrides; missing template handling
- Optimize DB calls when counting (fetch templates once, map by id)

**Example (before)**:
```ts
// ❌ Inline, untested, repeated in mutations
const role = await ctx.db.get(roleId);
if (role?.templateId) {
  const template = await ctx.db.get(role.templateId);
  if (template?.isRequired === true) { /* lead */ }
}
// Duplicate-name check scattered in create/update/quickUpdate
```

**Example (after)**:
```ts
// ✅ Core helpers are pure
import { isLeadTemplate, hasDuplicateRoleName, countLeadRoles } from './core/roles';

const templateMap = new Map(templateIds.map((id) => [id, await ctx.db.get(id)]));
const leadCount = countLeadRoles(roles, (id) => templateMap.get(id));

if (hasDuplicateRoleName(trimmedName, existingRoles, currentRoleId)) {
  throw new Error('A role with this name already exists in this circle');
}
```

**Checklist**:
1) No Convex/server imports inside `convex/core/{domain}`  
2) Core exports types + functions via domain `index.ts` and `convex/core/index.ts`  
3) DB ops stay in application layer; only pure logic in core  
4) Unit tests cover required/optional/missing template paths, duplicate names (trim/case), lead requirement defaults/overrides  
5) README documents domain scope and import rules  

**When to Use**:
- Any new domain logic in Convex (roles, proposals, circles, authority)
- Refactoring mixed DB + logic for testability or reuse

**Related**:
- Authority module pattern (`convex/core/authority`)

---

## #L140: Infrastructure Importing from Core (Layer Violation) [🔴 CRITICAL]

**Keywords**: architecture layers, infrastructure imports core, dependency violation, Principle #5, CIRCLE_TYPES, constants, layer boundaries, authority vs RBAC

**Symptom**:
- Infrastructure file (e.g., `infrastructure/rbac/orgChart.ts`) imports from Core (e.g., `core/circles`)
- ESLint or type errors mentioning circular dependencies or layer violations
- Hardcoded string literals used to avoid importing constants
- Code in wrong architectural layer (e.g., organizational logic in RBAC infrastructure)

**Root Cause**: Misunderstanding of layer responsibilities. Infrastructure is at the **bottom** of the dependency chain and cannot import from Core. The code is in the wrong layer because it needs Core domain concepts.

**Architecture Principle #5**: `infrastructure/ ← core/ ← features/` — never reversed

```
Dependency Flow (allowed):
  Application → Features → Core → Infrastructure
              ↓          ↓      ↓
          (can import)  (can import)  (bottom layer)

Violation:
  Infrastructure → Core  ❌ NOT ALLOWED
```

**Decision Framework**: Which layer does this code belong in?

| Question | Infrastructure | Core | Features |
|----------|---------------|------|----------|
| Does it need domain constants? (e.g., `CIRCLE_TYPES`) | ❌ Move to Core | ✅ Belongs here | Maybe |
| Is it about **organizational authority**? (who can do what in the org) | ❌ Move to Core | ✅ `core/authority/` | No |
| Is it about **system capabilities**? (billing, admin features) | ✅ Belongs here | No | No |
| Is it cross-cutting infrastructure? (auth, errors, session) | ✅ Belongs here | No | No |

**Fix (Option 1 - Recommended)**: Move file to correct layer

```bash
# Example: Quick edit is authority, not RBAC
mv convex/infrastructure/rbac/orgChart.ts convex/core/authority/quickEdit.ts
mv convex/infrastructure/rbac/orgChart.test.ts convex/core/authority/quickEdit.test.ts

# Update imports in consuming files
# convex/core/circles/circleLifecycle.ts:
- import { requireQuickEditPermissionForPerson } from '../../infrastructure/rbac/orgChart';
+ import { requireQuickEditPermissionForPerson } from '../authority/quickEdit';

# Frontend API paths also change:
- api.infrastructure.rbac.orgChart.getQuickEditStatusQuery
+ api.core.authority.quickEdit.getQuickEditStatusQuery
```

**Fix (Option 2 - If code truly belongs in infrastructure)**: Refactor to remove Core dependency

Options:
1. **Move constants to infrastructure** (rare - only if they're truly foundational)
2. **Pass values as parameters** (dependency inversion - caller provides domain values)
3. **Use string literals** (last resort, violates Principle #20 "no magic values")

**Example (SYOS-971)**: `orgChart.ts` quick edit authority

**Before** (❌ Architecture violation):
```typescript
// convex/infrastructure/rbac/orgChart.ts
import { CIRCLE_TYPES } from '../../core/circles';  // ❌ Infrastructure importing Core

export async function canQuickEdit(ctx, userId, circle) {
  if (circle.leadAuthority === LEAD_AUTHORITY.CONVENES) {  // Needs Core constant
    return { allowed: false };
  }
}
```

**After** (✅ Fixed):
```typescript
// convex/core/authority/quickEdit.ts  ← Moved to Core
import { CIRCLE_TYPES } from '../circles';  // ✅ Core can import Core

export async function canQuickEdit(ctx, userId, circle) {
  if (circle.leadAuthority === LEAD_AUTHORITY.CONVENES) {  // Now allowed
    return { allowed: false };
  }
}
```

**Why the move?**
- Quick edit is an **authority decision** (organizational) not an **RBAC capability** (system)
- "Can I edit this circle?" depends on org structure (circle type, workspace settings)
- RBAC should handle system features (billing, admin access, workspace settings)
- Authority belongs in Core where it can access domain concepts

**Checklist**:
1. Identify the violation: Is infrastructure importing from core?
2. Ask: Is this organizational logic or system capability logic?
3. If organizational → Move to `core/authority/` or appropriate core domain
4. If system capability → Refactor to remove core dependency (parameters/constants)
5. Update all imports in consuming files (backend + frontend)
6. Update tests and move test files to match
7. Verify: `npm run check` passes, no circular dependencies

**Authority vs RBAC Quick Reference**:

| Authority (Core) | RBAC (Infrastructure) |
|------------------|----------------------|
| Who can approve proposals | Who can access billing settings |
| Who can assign roles in a circle | Who can invite users to workspace |
| Who can edit circle structure | Who can manage workspace settings |
| Organizational permissions | System capabilities |
| Changes frequently (governance) | Changes rarely (admin action) |
| Lives in `core/authority/` | Lives in `infrastructure/rbac/` |

**Why it prevents recurrence**: Understanding the architecture layers and the distinction between organizational authority (Core) and system capabilities (Infrastructure) prevents placing code in the wrong layer. When code needs Core concepts, it belongs in Core.

**Related Tickets**: SYOS-971

---

## #L200: Foundation Hardening (Functional Factories, Typed Errors, URL Helpers) [🟢 REFERENCE]

**Keywords**: functional factories, classes, logger, typed errors, error factories, type guards, localhost fallback, app URL, PUBLIC_APP_URL, Convex layering scaffolds

**Symptom**: Codebase uses classes, untyped errors, and hardcoded localhost fallbacks that violate architectural principles.

**Root Cause**: Legacy patterns that don't align with Principle #11 (zero classes) and Principle #20 (no hardcoded magic values).

**Fix Patterns**:

### 1. Favor Functional Factories Over Classes (Principle #11)

**Example**: `logger` built via `createLogger()` to preserve API while staying class-free.

```typescript
// ✅ CORRECT: Functional factory
export function createLogger(name: string) {
  return {
    info: (message: string) => console.log(`[${name}] ${message}`),
    error: (message: string) => console.error(`[${name}] ${message}`)
  };
}

// ❌ WRONG: Class-based
export class Logger {
  constructor(private name: string) {}
  info(message: string) { /* ... */ }
}
```

### 2. Use Typed Error Factories Plus Type Guards Instead of Subclasses

**Example**: `createWorkOSError` + `isWorkOSError` keeps status codes and names without relying on `instanceof`.

```typescript
// ✅ CORRECT: Typed error factory
export function createWorkOSError(message: string, statusCode: number) {
  return {
    name: 'WorkOSError',
    message,
    statusCode
  };
}

export function isWorkOSError(error: unknown): error is WorkOSError {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'WorkOSError';
}

// ❌ WRONG: Error subclass
export class WorkOSError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}
```

### 3. Remove Localhost Fallbacks for App URLs (Principle #20)

**Require `PUBLIC_APP_URL` and surface a clear error**; build invite links via a helper (`getPublicAppUrl`) rather than `|| 'http://localhost:5173'`.

```typescript
// ✅ CORRECT: Require env var, no fallback
export function getPublicAppUrl(): string {
  const url = import.meta.env.PUBLIC_APP_URL;
  if (!url) {
    throw new Error('PUBLIC_APP_URL environment variable is required');
  }
  return url;
}

// ❌ WRONG: Localhost fallback
const appUrl = import.meta.env.PUBLIC_APP_URL || 'http://localhost:5173';
```

### 4. Enforce Convex Layering Scaffolds

**Keep `convex/features/` and `convex/infrastructure/` directories present even if empty**, to guide dependency flow (Principle #5).

**Key Principles**:
1. **Zero classes** - Use functional factories instead
2. **Typed errors** - Use factories + type guards, not subclasses
3. **No magic values** - Require env vars, don't fallback to localhost
4. **Layer structure** - Keep empty directories to guide dependencies

**Apply when**: 
- Refactoring legacy code to align with architecture principles
- Creating new infrastructure utilities
- Building error handling systems
- Setting up environment configuration

**Related**: 
- Principle #11: Zero classes
- Principle #20: No hardcoded magic values
- Principle #5: Layer dependencies

**Related Tickets**: SYOS-706

