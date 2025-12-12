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

