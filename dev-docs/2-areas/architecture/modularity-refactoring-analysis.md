# Modularity Refactoring Analysis

**Status**: 🟡 Analysis Complete - Ready for Implementation Planning  
**Date**: 2025-01-XX  
**Purpose**: Identify areas requiring refactoring to achieve true modularity

---

## Executive Summary

**Current State**: Modules exist (Inbox, Meetings, Org Chart, Flashcards, Circles) with feature flags for enablement, but **module boundaries are not enforced**. Direct imports, shared composables, and upfront data loading create tight coupling.

**Target State**: Independent modules with clear contracts, loose coupling, and true independent development/deployment/enablement.

**Key Findings**:
- 🔴 **Critical**: `useOrganizations` composable creates tight coupling (imported in 20+ files)
- 🔴 **Critical**: Layout server loads data for all modules upfront (prevents independent enablement)
- 🟡 **High**: Direct imports between modules (no API contracts)
- 🟡 **High**: Shared utilities/types create implicit dependencies
- 🟢 **Medium**: Feature flag system exists but needs module registry integration

---

## Modularity Principles Assessment

| Principle | Current State | Target State | Gap |
|-----------|--------------|--------------|-----|
| **Independent Development** | 🟡 Partial | ✅ Full | Module boundaries not enforced, merge conflicts possible |
| **Independent Deployment** | 🔴 Not Supported | ✅ Planned | All modules deploy together |
| **Independent Enablement** | 🟡 Via Flags | ✅ Via Flags + Registry | Flags exist but modules still load data upfront |
| **Clear Contracts** | 🔴 None | ✅ Defined APIs | Direct imports, no interfaces |
| **Loose Coupling** | 🔴 Tight | ✅ Loose | Shared composables, direct imports |

---

## Module Inventory

### Current Modules

| Module | Feature Flag | Status | Dependencies | Coupling Level |
|--------|-------------|--------|--------------|----------------|
| **Inbox** | None (always enabled) | ✅ Active | None (core) | Low |
| **Meetings** | `meetings-module` | ✅ Active | Org module (context) | Medium |
| **Org Chart** | `org_module_beta` | ✅ Active | Circles (visualization) | Medium |
| **Flashcards** | None (always enabled) | ✅ Active | Inbox (source highlights) | Medium |
| **Circles** | Schema only | 🟡 Partial | Org module (context) | Medium |

**Note**: Dependencies are logical/architectural. Actual code coupling is higher due to direct imports.

---

## Critical Refactoring Areas

### 1. 🔴 CRITICAL: `useOrganizations` Tight Coupling

**Problem**: `useOrganizations` composable is imported in 20+ files across all modules, creating a single point of coupling.

**Impact**: 
- Cannot develop modules independently
- Changes to `useOrganizations` affect all modules
- Testing requires full org context
- Prevents independent deployment

**Evidence**:
```typescript
// Found in 20+ files:
import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
import { useOrganizations } from '$lib/composables/useOrganizations.svelte';
```

**Affected Modules**:
- ✅ Inbox (`ReadwiseDetail.svelte`)
- ✅ Meetings (`+page.svelte`)
- ✅ Org Chart (`+page.svelte`)
- ✅ Flashcards (`+page.svelte`, `FlashcardMetadata.svelte`)
- ✅ Circles (`CircleMembersPanel.svelte`)
- ✅ Settings (`+page.svelte`)
- ✅ Tags (`+page.svelte`)
- ✅ Sidebar (`Sidebar.svelte`, `SidebarHeader.svelte`)
- ✅ Layout (`+layout.svelte`)

**Refactoring Strategy**:

1. **Create Module API Contract** ✅ **COMPLETE (SYOS-295)**:
   ```typescript
   // src/lib/modules/core/organizations/api.ts
   export interface OrganizationsModuleAPI {
     // Reactive properties (getters)
     get organizations(): OrganizationSummary[];
     get activeOrganizationId(): string | null;
     get activeOrganization(): OrganizationSummary | null;
     // ... other properties
     
     // Actions (methods)
     setActiveOrganization(organizationId: string | null): void;
     createOrganization(name: string, slug?: string): Promise<void>;
     // ... other methods
   }
   ```

2. **Wrap Implementation** ✅ **COMPLETE (SYOS-295)**:
   ```typescript
   // src/lib/composables/useOrganizations.svelte.ts
   export function useOrganizations(...) {
     // ... internal implementation unchanged ...
     
     // Return value implements OrganizationsModuleAPI interface
     const api: OrganizationsModuleAPI = {
       get organizations() { return queries.organizations; },
       // ... all getters and methods ...
     };
     
     return api; // Backward compatible - existing code still works
   }
   ```

3. **Dependency Injection Pattern** ✅ **PROOF OF CONCEPT (SYOS-295)**:
   ```typescript
   // Instead of direct import:
   import type { OrganizationsModuleAPI } from '$lib/composables/useOrganizations.svelte';
   // OR: import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/api';
   
   // Use interface type (enables loose coupling):
   const organizations = getContext<OrganizationsModuleAPI | undefined>('organizations');
   
   // Component depends on interface, not internal implementation
   // Changes to useOrganizations internals don't break dependent modules
   ```

4. **Module Registry** (Future - separate ticket):
   ```typescript
   // src/lib/modules/registry.ts
   export const moduleRegistry = {
     organizations: organizationsModule,
     inbox: inboxModule,
     meetings: meetingsModule,
     // ...
   };
   ```

**Status**: ✅ **Phase 1 Complete** - API contract created, composable wrapped, proof of concept implemented  
**Next Steps**: Incremental migration of remaining 33+ files (separate ticket)

**Priority**: 🔴 **P0 - Blocking independent development**

---

### 2. 🔴 CRITICAL: Layout Server Upfront Data Loading

**Problem**: `+layout.server.ts` loads data for all modules upfront, even when modules are disabled.

**Impact**:
- Cannot independently enable/disable modules
- Unnecessary database queries for disabled modules
- Slower page loads (loads everything)
- Prevents true module isolation

**Current Code** (`src/routes/(authenticated)/+layout.server.ts`):
```typescript
// Loads data for ALL modules upfront:
let circlesEnabled = false;
let meetingsEnabled = false;
// ... loads organizations, teams, permissions, tags for ALL modules
```

**Refactoring Strategy**:

1. **Lazy Module Loading**:
   ```typescript
   // Only load data for enabled modules
   const enabledModules = await getEnabledModules(sessionId);
   
   if (enabledModules.includes('meetings')) {
     // Load meetings data
   }
   ```

2. **Module-Specific Layout Loaders**:
   ```typescript
   // src/lib/modules/meetings/+layout.server.ts
   export const load: ModuleLayoutLoad = async ({ sessionId }) => {
     // Only loads meetings-specific data
   };
   ```

3. **Conditional Data Loading**:
   ```typescript
   // Check feature flags BEFORE loading data
   const meetingsEnabled = await checkFlag('meetings-module', sessionId);
   const meetingsData = meetingsEnabled 
     ? await loadMeetingsData(sessionId)
     : null;
   ```

**Priority**: 🔴 **P0 - Blocking independent enablement**

---

### 3. 🟡 HIGH: Direct Imports Between Modules

**Problem**: Modules directly import from each other, creating tight coupling.

**Examples**:
- `FlashcardMetadata.svelte` imports `TagSelector` from inbox module
- `ReadwiseDetail.svelte` imports `UseOrganizations` type
- `QuickCreateModal.svelte` imports `TagSelector` from inbox

**Impact**:
- Cannot remove modules without breaking others
- Changes in one module affect others
- Prevents independent deployment
- Hard to test modules in isolation

**Refactoring Strategy**:

1. **Shared Component Library**:
   ```typescript
   // Move shared components to core:
   // src/lib/components/core/TagSelector.svelte
   // Used by: Inbox, Flashcards, QuickCreate
   ```

2. **Module API Contracts**:
   ```typescript
   // src/lib/modules/inbox/api.ts
   export interface InboxModuleAPI {
     TagSelector: Component;
     useTags(): TagsQuery;
   }
   ```

3. **Dependency Injection**:
   ```typescript
   // Instead of:
   import TagSelector from '$lib/components/inbox/TagSelector.svelte';
   
   // Use:
   const inboxAPI = getContext<InboxModuleAPI>('inbox-api');
   const TagSelector = inboxAPI.TagSelector;
   ```

**Priority**: 🟡 **P1 - High impact on maintainability**

---

### 4. 🟡 HIGH: Shared Utilities/Types Create Implicit Dependencies

**Problem**: Shared utilities (`src/lib/utils/`, `src/lib/types/`) create implicit dependencies between modules.

**Examples**:
- `src/lib/types/convex.ts` - Used by all modules
- `src/lib/utils/toast.ts` - Used across modules
- `src/lib/utils/orgChartTransform.ts` - Used by org chart and circles

**Impact**:
- Changes to shared utilities affect all modules
- Hard to version modules independently
- Implicit dependencies not visible in imports

**Refactoring Strategy**:

1. **Core Module**:
   ```typescript
   // src/lib/modules/core/
   // - types/
   // - utils/
   // - components/ui/
   ```

2. **Module-Specific Utilities**:
   ```typescript
   // src/lib/modules/inbox/utils/
   // src/lib/modules/meetings/utils/
   // Keep module-specific code in modules
   ```

3. **Explicit Dependencies**:
   ```typescript
   // Module manifest declares dependencies:
   // src/lib/modules/meetings/manifest.ts
   export const meetingsModule = {
     dependencies: ['core', 'organizations'],
     // ...
   };
   ```

**Priority**: 🟡 **P1 - High impact on maintainability**

---

### 5. 🟢 MEDIUM: Feature Flag System Needs Module Registry Integration

**Problem**: Feature flags exist but aren't integrated with module registry/discovery.

**Current State**:
- Feature flags in `convex/featureFlags.ts` and `src/lib/featureFlags.ts`
- Flags checked manually in components
- No automatic module enablement/discovery

**Refactoring Strategy**:

1. **Module Registry with Flags**:
   ```typescript
   // src/lib/modules/registry.ts
   export const moduleRegistry = {
     meetings: {
       flag: 'meetings-module',
       enabled: (sessionId) => checkFlag('meetings-module', sessionId),
       load: () => import('./meetings'),
     },
     // ...
   };
   ```

2. **Automatic Module Loading**:
   ```typescript
   // Auto-load enabled modules:
   const enabledModules = await Promise.all(
     Object.entries(moduleRegistry).map(async ([name, module]) => {
       const enabled = await module.enabled(sessionId);
       return enabled ? { name, module: await module.load() } : null;
     })
   );
   ```

**Priority**: 🟢 **P2 - Nice to have, improves DX**

---

## Refactoring Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Establish module boundaries and contracts

1. ✅ Create module directory structure
2. ✅ Define module API contracts
3. ✅ Create module registry
4. ✅ Extract core module (organizations, auth, shared utilities)

**Deliverables**:
- `src/lib/modules/core/` - Core module
- `src/lib/modules/registry.ts` - Module registry
- Module API contracts for each module

---

### Phase 2: Decouple `useOrganizations` (Weeks 3-4)

**Goal**: Remove tight coupling from `useOrganizations`

1. ✅ Create `OrganizationsModuleAPI` interface (SYOS-295)
2. ✅ Refactor `useOrganizations` to implement API (SYOS-295)
3. ✅ Proof of concept: Update 1-2 files to use interface (SYOS-295)
4. ⏳ Incremental migration: Update remaining 33+ files (separate ticket)
5. ⏳ Add module context provider (future)

**Deliverables**:
- ✅ `OrganizationsModuleAPI` interface (`src/lib/modules/core/organizations/api.ts`)
- ✅ `useOrganizations` wrapped to return interface (backward compatible)
- ✅ Proof of concept: `Sidebar.svelte` uses interface type
- ⏳ All 33+ files migrated (incremental, separate ticket)

---

### Phase 3: Lazy Module Loading (Weeks 5-6)

**Goal**: Load modules only when enabled

1. ✅ Refactor layout server to lazy load
2. ✅ Create module-specific layout loaders
3. ✅ Implement conditional data loading
4. ✅ Add module loading indicators

**Deliverables**:
- Lazy-loaded layout server
- Module-specific loaders
- Performance improvements

---

### Phase 4: Module Boundaries Enforcement (Weeks 7-8)

**Goal**: Enforce module boundaries in CI

1. ✅ Add ESLint rule to prevent cross-module imports
2. ✅ Create module dependency graph
3. ✅ Add CI checks for boundary violations
4. ✅ Document module contracts

**Deliverables**:
- ESLint rules for module boundaries
- CI checks
- Module dependency documentation

---

### Phase 5: Independent Deployment (Future)

**Goal**: Deploy modules separately

1. ⏳ Module versioning system
2. ⏳ Per-module build outputs
3. ⏳ Module deployment pipeline
4. ⏳ Runtime module loading

**Deliverables**:
- Module versioning
- Independent deployment pipeline

---

## Module Structure Proposal

```
src/lib/modules/
├── core/                    # Core module (always enabled)
│   ├── api.ts              # CoreModuleAPI interface
│   ├── organizations/      # Organizations functionality
│   │   ├── api.ts         # OrganizationsModuleAPI
│   │   ├── composables/
│   │   └── components/
│   ├── auth/              # Authentication
│   ├── types/             # Shared types
│   └── utils/             # Shared utilities
│
├── inbox/                  # Inbox module
│   ├── manifest.ts        # Module metadata, dependencies
│   ├── api.ts            # InboxModuleAPI interface
│   ├── composables/
│   ├── components/
│   └── routes/           # Module-specific routes
│
├── meetings/              # Meetings module
│   ├── manifest.ts
│   ├── api.ts
│   ├── composables/
│   ├── components/
│   └── routes/
│
├── flashcards/            # Flashcards module
├── org-chart/             # Org Chart module
├── circles/               # Circles module
│
└── registry.ts            # Module registry and discovery
```

---

## Module API Contract Example

```typescript
// src/lib/modules/inbox/api.ts
export interface InboxModuleAPI {
  // Components
  TagSelector: Component;
  InboxCard: Component;
  
  // Composables
  useInboxItems: (options?: InboxItemsOptions) => UseInboxItems;
  useInboxSync: (options?: InboxSyncOptions) => UseInboxSync;
  
  // Queries
  listInboxItems: (args: ListInboxItemsArgs) => Promise<InboxItem[]>;
  
  // Events
  onItemSelected: (callback: (item: InboxItem) => void) => () => void;
}

// src/lib/modules/inbox/manifest.ts
export const inboxModule = {
  name: 'inbox',
  version: '1.0.0',
  dependencies: ['core'],
  featureFlag: null, // Always enabled
  api: inboxModuleAPI,
  load: () => import('./index'),
};
```

---

## Success Metrics

**Independent Development**:
- ✅ Zero merge conflicts between module teams
- ✅ Modules can be developed in parallel
- ✅ Module changes don't affect other modules

**Independent Enablement**:
- ✅ Modules load only when enabled
- ✅ Disabled modules don't load data/queries
- ✅ Feature flags control module visibility

**Clear Contracts**:
- ✅ All module communication via APIs
- ✅ No direct imports between modules
- ✅ Module contracts documented

**Loose Coupling**:
- ✅ Modules can be removed without breaking others
- ✅ Changes isolated to single modules
- ✅ Dependency graph visible and minimal

---

## Risks & Mitigations

**Risk**: Refactoring breaks existing functionality
- **Mitigation**: Incremental refactoring, feature flags for new code, comprehensive testing

**Risk**: Performance degradation from dependency injection
- **Mitigation**: Benchmark before/after, optimize hot paths, use lazy loading

**Risk**: Developer confusion with new patterns
- **Mitigation**: Clear documentation, examples, gradual migration

**Risk**: Module registry becomes bottleneck
- **Mitigation**: Keep registry lightweight, cache enabled modules, lazy load APIs

---

## Next Steps

1. **Review & Approve**: Review this analysis with team
2. **Create Linear Ticket**: Create ticket for Phase 1 (Foundation)
3. **Start Implementation**: Begin with module structure and core module extraction
4. **Iterate**: Implement phases incrementally with testing at each step

---

## Related Documentation

- [System Architecture](system-architecture.md) - Current architecture overview
- [Feature Flags Pattern](../patterns/feature-flags.md) - Feature flag system
- [Modularity Strategy](system-architecture.md#32-modularity-strategy) - High-level strategy

---

**Last Updated**: 2025-01-XX  
**Next Review**: After Phase 1 completion  
**Owner**: Architecture Team

