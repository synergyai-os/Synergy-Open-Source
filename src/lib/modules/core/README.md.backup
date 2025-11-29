# Core Module

**Team Ownership**: Core Team  
**Status**: ✅ Active  
**Feature Flag**: None (always enabled)

---

## Overview

The Core module provides foundational functionality shared across all modules. It includes global components, composables, and organization management features.

## Module Structure

```
core/
├── components/          # Global UI components
│   ├── AppTopBar.svelte
│   ├── GlobalActivityTracker.svelte
│   ├── QuickCreateModal.svelte
│   ├── Sidebar.svelte
│   ├── TagSelector.svelte
│   ├── ShareTagModal.svelte
│   ├── SidebarHeader.svelte
│   ├── CreateMenu.svelte
│   ├── CleanReadwiseButton.svelte
│   └── SettingsSidebarHeader.svelte
├── composables/        # Global composables
│   ├── useGlobalShortcuts.svelte.ts
│   ├── useLoadingOverlay.svelte.ts
│   ├── useNavigationStack.svelte.ts
│   └── useTagging.svelte.ts
├── organizations/      # Organization & team management
│   ├── components/
│   │   ├── CreateTeamModal.svelte
│   │   ├── OrganizationModals.svelte
│   │   ├── OrganizationSwitcher.svelte
│   │   └── WorkspaceSwitchOverlay.svelte
│   └── composables/
│       ├── useOrganizations.svelte.ts
│       ├── useTeams.svelte.ts
│       └── ...
├── api.ts              # Module API contract
└── manifest.ts        # Module registration
```

## API Contract

See [`api.ts`](./api.ts) for the complete `CoreModuleAPI` interface.

**Exposed Components**:

- `TagSelector` - Shared tag selection component

**Exposed Composables**:

- None (composables accessed via dependency injection)

## Dependencies

- **None** - Core module has no dependencies (foundation module)

## Usage

### Importing Components

```typescript
import TagSelector from '$lib/modules/core/components/TagSelector.svelte';
import Sidebar from '$lib/modules/core/components/Sidebar.svelte';
```

### Using Module API

```typescript
import { getModule } from '$lib/modules/registry';
import type { CoreModuleAPI } from '$lib/modules/core/api';

const coreModule = getModule('core');
const api = coreModule?.api as CoreModuleAPI | undefined;

if (api) {
	const TagSelector = api.TagSelector;
}
```

## Team Ownership

**Owner**: Core Team  
**Contact**: See Linear team assignments

**Responsibilities**:

- Maintain global components (Sidebar, AppTopBar, etc.)
- Maintain organization & team management features
- Ensure backward compatibility for other modules
- Review PRs that affect core functionality

## Testing

### Running Module Tests

```bash
# Run all core module tests
npm run test:unit:server -- src/lib/modules/core

# Run organizations submodule tests
npm run test:integration -- src/lib/modules/core/organizations/__tests__/

# Run specific test file
npm run test:unit:server -- src/lib/modules/core/organizations/__tests__/organizations.integration.test.ts
```

### Test Structure

```
core/
├── organizations/
│   └── __tests__/                      # ✅ Module test suite (colocated)
│       └── organizations.integration.test.ts
├── components/                         # Component tests colocated here (when added)
└── composables/                        # Composable tests colocated here (when added)
```

**See**: [Test Organization Strategy](../../../../dev-docs/2-areas/development/test-organization-strategy.md) for complete testing patterns.

## Testing

### Running Module Tests

```bash
# Run all core module tests (including organizations)
npm run test:unit:server -- src/lib/modules/core

# Run organizations tests specifically
npm run test:unit:server -- src/lib/modules/core/organizations/__tests__/

# Run specific test file
npm run test:unit:server -- src/lib/modules/core/organizations/__tests__/organizations.integration.test.ts

# Run in watch mode for development
npm run test:unit:server -- src/lib/modules/core --watch
```

### Test Structure

Module integration tests are colocated in `__tests__/` folders:

```
core/
└── organizations/
    └── __tests__/
        └── organizations.integration.test.ts
```

**Test Coverage**:

- ✅ Organization CRUD operations
- ✅ Organization membership management
- ✅ Organization invites
- ✅ RBAC permission checks

**See**: [Test Organization Strategy](../../../../dev-docs/2-areas/development/test-organization-strategy.md) for complete testing patterns.

## Development Guidelines

1. **Breaking Changes**: Coordinate with all module teams before making breaking changes
2. **New Components**: Add to `components/` folder, expose via `api.ts` if shared
3. **Composables**: Use `.svelte.ts` extension (required for Svelte 5 runes)
4. **Testing**: Ensure changes don't break dependent modules (add tests for new features)

## Related Documentation

- [System Architecture](../../../../dev-docs/2-areas/architecture/system-architecture.md)
- [Module System](../../../../dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)
- [Coding Standards](../../../../dev-docs/2-areas/development/coding-standards.md)
