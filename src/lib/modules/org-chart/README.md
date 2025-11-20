# Org Chart Module

**Team Ownership**: Org Chart Team  
**Status**: ✅ Active  
**Feature Flag**: `org_module_beta` (organization-based)

---

## Overview

The Org Chart module provides organizational structure visualization, circle management, and role assignment.

## Module Structure

```
org-chart/
├── components/         # Org chart-specific UI components
│   ├── CategoryHeader.svelte
│   ├── CircleDetailHeader.svelte
│   ├── CircleDetailPanel.svelte
│   ├── OrgChart.svelte
│   ├── PanelBreadcrumbBar.svelte
│   ├── RoleCard.svelte
│   ├── RoleDetailHeader.svelte
│   ├── RoleDetailPanel.svelte
│   └── circles/
│       ├── CircleMembersPanel.svelte
│       ├── CircleRolesPanel.svelte
│       └── CreateCircleModal.svelte
├── composables/       # Org chart-specific composables
│   ├── useCircles.svelte.ts
│   └── useOrgChart.svelte.ts
├── api.ts             # Module API contract
├── feature-flags.ts   # Feature flag definitions
└── manifest.ts        # Module registration
```

## API Contract

See [`api.ts`](./api.ts) for the complete `OrgChartModuleAPI` interface.

**Exposed Composables**:

- `useOrgChart` - Org chart data and navigation

## Dependencies

- **Core** - Uses organization context and shared components

## Feature Flag

**Flag**: `org_module_beta`  
**Scope**: Organization-based  
**Default**: Disabled (requires explicit enablement per organization)

## Usage

### Using Module API

```typescript
import { getContext } from 'svelte';
import type { OrgChartModuleAPI } from '$lib/modules/org-chart/api';

const orgChartAPI = getContext<OrgChartModuleAPI | undefined>('org-chart-api');
if (orgChartAPI) {
	const orgChart = orgChartAPI.useOrgChart({ sessionId: getSessionId });
}
```

## Team Ownership

**Owner**: Org Chart Team  
**Contact**: See Linear team assignments

**Responsibilities**:

- Maintain org chart functionality
- Manage circle and role features
- Review PRs affecting org-chart module
- Coordinate with Core module for shared components

## Development Guidelines

1. **Module Boundaries**: Don't import from other feature modules
2. **Feature Flags**: Always check feature flag before rendering
3. **Composables**: Use `.svelte.ts` extension (required for Svelte 5 runes)
4. **Testing**: Add tests for new features
5. **Performance**: Optimize for large organizational structures

## Testing

### Running Module Tests

```bash
# Run all org-chart module tests
npm run test:unit:server -- src/lib/modules/org-chart

# Run specific test file
npm run test:unit:server -- src/lib/modules/org-chart/__tests__/circles.integration.test.ts

# Run in watch mode for development
npm run test:unit:server -- src/lib/modules/org-chart --watch
```

### Test Structure

Module integration tests are colocated in `__tests__/` folder:

```
org-chart/
└── __tests__/
    ├── circles.integration.test.ts
    └── circleRoles.integration.test.ts
```

**Test Coverage**:

- ✅ Circle CRUD operations
- ✅ Circle roles and permissions
- ✅ Organizational structure management

**See**: [Test Organization Strategy](../../../../dev-docs/2-areas/development/test-organization-strategy.md) for complete testing patterns.

## Related Documentation

- [System Architecture](../../../../dev-docs/2-areas/architecture/system-architecture.md)
- [Module System](../../../../dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)
- [Feature Flags](../../../../dev-docs/2-areas/patterns/feature-flags.md)
