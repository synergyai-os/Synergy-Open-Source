# Make Org-Chart Components Work in Storybook for Visual Design Iteration

**Linear Ticket**: [SYOS-483](https://linear.app/younghumanclub/issue/SYOS-483)

**Goal**: Enable all org-chart components to render in Storybook with mock data, allowing visual design iteration without requiring Convex/server dependencies.

---

## Problem Analysis

### Current State

**Broken Story Files**: All org-chart story files are empty/commented out:

- `OrgChart.stories.svelte`: "requires UseOrgChart composable with Convex queries"
- `CircleDetailPanel.stories.svelte`: "requires UseOrgChart composable with Convex queries"
- `RoleDetailPanel.stories.svelte`: "requires UseOrgChart composable with Convex queries"
- Other story files: Partially working but need mock improvements

**Root Cause**: Components violate separation of concerns by calling `useQuery` directly instead of using composables.

### Pain Points

1. **Cannot iterate on design visually** - Need full Convex backend to see components
2. **Cannot test component variations** - No way to render different states
3. **Cannot share designs with team** - Storybook is primary design review tool
4. **Slow feedback loop** - Must run full app + backend to see UI changes

### User Impact

- Designer cannot visually tweak spacing, colors, layouts
- Developer cannot test edge cases (empty states, loading, errors)
- Team cannot review designs without running full application
- Slows down iteration cycle significantly

### Investigation

**Pattern Documentation Analyzed**:

- ✅ `dev-docs/2-areas/patterns/ui-patterns.md#L4920-4930` - Storybook with `.svelte` files
- ✅ Existing mock pattern: `.storybook/mocks/useActionItemsForm.svelte.ts`
- ✅ Context7 Svelte 5 docs: $props, $derived, component patterns

**Code Analysis**:

- ❌ **CRITICAL**: `CircleMembersPanel.svelte:27-36` - Calls `useQuery` directly
- ❌ **CRITICAL**: `CircleRolesPanel.svelte:40-48` - Calls `useQuery` directly
- ✅ `OrgChart.svelte`, `CircleDetailPanel.svelte`, `RoleDetailPanel.svelte` - Use composables correctly
- ⚠️ Missing mock composables for Storybook

---

## Approach Options

### Approach A: Extract Queries to Composables + Create Mocks

**How it works**:

1. Extract `useQuery` calls from components to new composables
2. Create mock composables that return static data
3. Story files import mock composables instead of real ones

**Pros**:

- ✅ Fixes separation of concerns violations (components render UI only)
- ✅ Enables unit testing (components testable without Convex)
- ✅ Enables Storybook (mock composables provide data)
- ✅ Follows established pattern (see `useActionItemsForm.svelte.ts`)
- ✅ Proper Svelte 5 architecture (extracting logic to `.svelte.ts`)

**Cons**:

- Requires extracting 2 composables (`useCircleMembers`, `useCircleRoles`)
- Requires creating 3 mock composables (for Storybook)
- More files to maintain

**Complexity**: Medium  
**Dependencies**: None - uses existing patterns

---

### Approach B: Conditional Mock Data in Components

**How it works**:

1. Add `mock` prop to components
2. If `mock === true`, use static data instead of `useQuery`
3. Story files pass `mock={true}`

**Pros**:

- ✅ Less files (no new composables)
- ✅ Quick to implement

**Cons**:

- ❌ **Does NOT fix separation of concerns** - components still have data fetching
- ❌ Components become harder to test (mock flag everywhere)
- ❌ Violates Svelte 5 best practices (mixing data + UI)
- ❌ Tech debt - mock logic pollutes component
- ❌ Doesn't enable unit testing

**Complexity**: Low  
**Dependencies**: None

---

### Approach C: Wrapper Components with Mock Context

**How it works**:

1. Create wrapper components that provide mock context
2. Real components read from context
3. Story files use wrapper components

**Pros**:

- ✅ No changes to existing components
- ✅ Context API pattern

**Cons**:

- ❌ **Does NOT fix separation of concerns** - components still have data fetching
- ❌ Complex setup (context providers, mock providers)
- ❌ Harder to maintain (wrapper components for everything)
- ❌ Doesn't enable unit testing

**Complexity**: Medium-High  
**Dependencies**: Context API patterns

---

## Recommendation

**Selected**: **Approach A (Extract Queries to Composables + Create Mocks)**

**Reasoning**:

1. **Fixes root cause** - Separation of concerns violations are CRITICAL (per code review)
2. **Enables testing** - Components can be unit tested without Convex
3. **Enables Storybook** - Mock composables provide clean data interface
4. **Follows Svelte 5 best practices** - "Extract logic to `.svelte.ts` files" (official docs)
5. **Matches existing pattern** - `useActionItemsForm.svelte.ts` already exists as example
6. **Future-proof** - Clean architecture scales better

**Trade-offs Accepted**:

- More files (~5 new files) - but cleaner architecture worth it
- One-time refactoring effort - pays off immediately with testability

**Risk Assessment**: **Low**

- Pattern already proven with ActionItemsList (SYOS-467)
- Existing mock composable template to follow
- TypeScript ensures type safety during refactor

---

## Current State

### Existing Code

**Components**:

- `src/lib/modules/org-chart/components/OrgChart.svelte` - Visualization (uses composable ✅)
- `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` - Detail panel (uses composable ✅)
- `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` - Role panel (uses composable ✅)
- `src/lib/modules/org-chart/components/circles/CircleMembersPanel.svelte` - Members (calls `useQuery` ❌)
- `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` - Roles (calls `useQuery` ❌)

**Composables**:

- `src/lib/modules/org-chart/composables/useOrgChart.svelte.ts` - Org chart state (DELETED by user)
- `src/lib/modules/org-chart/composables/useCircles.svelte.ts` - CRUD operations ✅

**Story Files**:

- All `.stories.svelte` files exist but are empty/commented out

**Mocks**:

- `.storybook/mocks/useActionItemsForm.svelte.ts` - Existing mock pattern ✅

### Dependencies

**Already Installed**:

- Storybook (`@storybook/addon-svelte-csf`)
- Svelte 5 (`svelte@^5.41.0`)
- D3.js (for OrgChart visualization)

**Patterns**:

- Separation of concerns: `dev-docs/2-areas/design/component-architecture.md#L377-L420`
- Storybook with .svelte: `dev-docs/2-areas/patterns/ui-patterns.md#L4920-4930`
- Existing mock: `.storybook/mocks/useActionItemsForm.svelte.ts`

### Constraints

- Must maintain existing component API (no breaking changes)
- Must support both real app usage and Storybook usage
- Must follow design token system (no hardcoded values)
- Must pass ESLint + TypeScript checks

---

## Technical Requirements

### 1. Extract Composables (Fix Separation of Concerns)

**New Composables**:

1. **`src/lib/modules/org-chart/composables/useCircleMembers.svelte.ts`**
   - Replaces direct `useQuery` in `CircleMembersPanel.svelte`
   - Queries: `api.organizations.getMembers`, `api.circles.getMembers`
   - Returns: `orgMembers`, `members`, `availableUsers` (filtered)

2. **`src/lib/modules/org-chart/composables/useCircleRoles.svelte.ts`**
   - Replaces direct `useQuery` in `CircleRolesPanel.svelte`
   - Queries: `api.circleRoles.getRoleFillers`
   - Returns: `roleFillers`, `availableUsers` (for role)

3. **`src/lib/modules/org-chart/composables/useOrgChart.svelte.ts`** (RESTORE)
   - User deleted this file - must recreate
   - Handles org chart state, selection, navigation
   - See backup or recreate from route usage

**Pattern Reference**: Follow `useActionItemsForm` structure

---

### 2. Create Mock Composables for Storybook

**New Mock Files**:

1. **`.storybook/mocks/useOrgChart.svelte.ts`**
   - Returns mock org chart state
   - Mock selection handlers (console.log)
   - Mock navigation stack

2. **`.storybook/mocks/useCircles.svelte.ts`**
   - Returns mock circles data
   - Mock CRUD operations (console.log)

3. **`.storybook/mocks/useCircleMembers.svelte.ts`**
   - Returns mock members/users

4. **`.storybook/mocks/useCircleRoles.svelte.ts`**
   - Returns mock roles/fillers

**Data Structure**: Use realistic mock data (3-5 circles, 5-10 members, 3-5 roles)

---

### 3. Update Components to Use Composables

**Files to Update**:

1. **`CircleMembersPanel.svelte`** (Lines 27-36)
   - Remove: Direct `useQuery(api.organizations.getMembers)`
   - Add: `const circleMembersData = useCircleMembers({ sessionId, organizationId, circleId })`
   - Access: `circleMembersData.availableUsers`

2. **`CircleRolesPanel.svelte`** (Lines 40-48)
   - Remove: Direct `useQuery(api.circleRoles.getRoleFillers)`
   - Add: `const circleRolesData = useCircleRoles({ sessionId, circleId, expandedRoleId })`
   - Access: `circleRolesData.roleFillers`

---

### 4. Create Functional Story Files

**Update All Story Files**:

1. **`OrgChart.stories.svelte`**

   ```svelte
   <script module>
     import { defineMeta } from '@storybook/addon-svelte-csf';
     import OrgChart from './OrgChart.svelte';
     import { useOrgChart } from '../../../.storybook/mocks/useOrgChart.svelte';

     const { Story } = defineMeta({
       component: OrgChart,
       title: 'Modules/OrgChart/OrgChart',
       tags: ['autodocs']
     });
   </script>

   <Story name="Default">
     {#snippet template()}
       {@const orgChart = useOrgChart({
         sessionId: () => 'mock-session',
         organizationId: () => 'mock-org-id' as any
       })}
       <div class="h-screen">
         <OrgChart {orgChart} />
       </div>
     {/snippet}
   </Story>

   <Story name="WithSelectedCircle">
     {#snippet template()}
       {@const orgChart = useOrgChart({
         sessionId: () => 'mock-session',
         organizationId: () => 'mock-org-id' as any
       })}
       <!-- Manually set selected circle for this story -->
       {(orgChart.selectCircle('mock-circle-1' as any), '')}
       <div class="h-screen">
         <OrgChart {orgChart} />
       </div>
     {/snippet}
   </Story>
   ```

2. **`CircleDetailPanel.stories.svelte`**
   - Similar structure with mock `useOrgChart`
   - Stories: Empty State, With Data, Loading State, Error State

3. **All other story files** (CategoryHeader, RoleCard, etc.)
   - Update with proper mock data
   - Use realistic prop values

---

### 5. Testing Requirements

**Manual Testing**:

- [ ] Run `npm run storybook`
- [ ] Verify all org-chart stories render
- [ ] Test interactions (clicking circles, opening panels)
- [ ] Verify design tokens applied correctly
- [ ] Test responsive layouts (mobile, tablet, desktop)

**Automated Testing** (Future):

- [ ] Storybook visual regression tests
- [ ] Component unit tests (with mock composables)

---

## Success Criteria

### Functional

✅ **All org-chart components render in Storybook**

- All 22 story files render without errors
- Components display mock data correctly
- Interactions work (buttons, clicks, navigation)

✅ **Design iteration works smoothly**

- Designer can change token values and see updates
- Can test different states (empty, loading, error, filled)
- Can compare variations side-by-side

✅ **Components remain functional in real app**

- No breaking changes to component APIs
- Real app uses real composables
- Storybook uses mock composables

### Performance

✅ **Storybook loads quickly**

- Stories render in < 2 seconds
- No Convex connection attempts
- No console errors

### UX

✅ **Clear story organization**

- Stories grouped by module/component
- Descriptive story names (Empty, Loading, Error, Filled)
- Controls for interactive props (where applicable)

### Quality

✅ **Code quality maintained**

- ✅ No `any` types (use proper `Id<'table'>` types)
- ✅ All `{#each}` blocks have keys
- ✅ Uses design tokens (no hardcoded values)
- ✅ Separation of concerns (components render UI only)
- ✅ TypeScript checks pass (`npm run check`)
- ✅ ESLint passes (`npm run lint`)

---

## Code Quality & Validation Strategy

### Svelte-specific validation

**For each `.svelte` file created/updated**:

1. **During implementation**:
   - Run `svelte-check` (type checking)
   - Run ESLint (syntax rules)
   - Run `svelte-autofixer` via Svelte MCP (best practices) ⭐

2. **Before commit**:
   - Run `/svelte-validate` on changed files
   - Verify all critical issues fixed

3. **Validation sequence**:

   ```bash
   # 1. TypeScript type checking
   npm run check

   # 2. Linting (syntax + best practices)
   npm run lint

   # 3. Svelte MCP autofixer (Svelte 5 best practices)
   # Run via Cursor command or MCP directly
   ```

### Quality gates

**Critical (MUST fix before merge)**:

- No `any` types (except test files)
- All `{#each}` blocks have keys
- Separation of concerns (no `useQuery` in components)
- TypeScript errors resolved
- ESLint errors resolved

**Best practice (SHOULD fix)**:

- JSDoc comments on public functions
- Loading skeleton states
- Accessibility attributes

**Pattern matches**:

- Follows `useActionItemsForm.svelte.ts` mock pattern
- Follows Svelte 5 composables pattern
- Uses design tokens consistently

**Why this matters**: Ensures components follow latest Svelte 5 best practices, catches anti-patterns early, maintains architectural consistency.

---

## Implementation Checklist

### Phase 1: Restore & Extract Composables (3 hours)

- [ ] **CRITICAL**: Restore `useOrgChart.svelte.ts` (user deleted it)
  - Check route usage: `src/routes/(authenticated)/org/chart/+page.svelte`
  - Recreate composable with same API
  - Fix `any` types (4 violations from code review)

- [ ] Create `useCircleMembers.svelte.ts`
  - Extract query logic from `CircleMembersPanel.svelte:27-36`
  - Returns: `{ orgMembers, members, availableUsers }`
  - Use proper TypeScript types (no `any`)

- [ ] Create `useCircleRoles.svelte.ts`
  - Extract query logic from `CircleRolesPanel.svelte:40-48`
  - Returns: `{ roleFillers, availableUsers }`
  - Use proper TypeScript types (no `any`)

- [ ] Update `CircleMembersPanel.svelte`
  - Replace direct `useQuery` with `useCircleMembers()`
  - Test in real app (verify no regressions)

- [ ] Update `CircleRolesPanel.svelte`
  - Replace direct `useQuery` with `useCircleRoles()`
  - Test in real app (verify no regressions)

- [ ] Run validation:
  ```bash
  npm run check  # TypeScript
  npm run lint   # ESLint
  ```

---

### Phase 2: Create Mock Composables (2 hours)

- [ ] Create `.storybook/mocks/useOrgChart.svelte.ts`
  - Follow `useActionItemsForm.svelte.ts` pattern
  - Return mock: `circles`, `selectedCircle`, `selectCircle()`, etc.
  - Use realistic mock data (3-5 circles with hierarchy)

- [ ] Create `.storybook/mocks/useCircles.svelte.ts`
  - Mock CRUD operations (console.log)
  - Return mock: `circles`, `circle`, `members`, `roles`
  - Use realistic mock data

- [ ] Create `.storybook/mocks/useCircleMembers.svelte.ts`
  - Return mock: `orgMembers`, `members`, `availableUsers`
  - 5-10 mock members with names, emails, roles

- [ ] Create `.storybook/mocks/useCircleRoles.svelte.ts`
  - Return mock: `roleFillers`, `availableUsers`
  - 3-5 mock roles with fillers

- [ ] Add barrel export `.storybook/mocks/index.ts`
  ```typescript
  export { useOrgChart } from './useOrgChart.svelte';
  export { useCircles } from './useCircles.svelte';
  export { useCircleMembers } from './useCircleMembers.svelte';
  export { useCircleRoles } from './useCircleRoles.svelte';
  ```

---

### Phase 3: Update Story Files (2 hours)

- [ ] Update `OrgChart.stories.svelte`
  - Import mock `useOrgChart`
  - Create stories: Default, WithSelectedCircle, EmptyState
  - Wrap in container div with height

- [ ] Update `CircleDetailPanel.stories.svelte`
  - Import mock `useOrgChart`
  - Create stories: Default, Loading, Error, EmptyState

- [ ] Update `RoleDetailPanel.stories.svelte`
  - Import mock `useOrgChart`
  - Create stories: Default, WithFillers, EmptyFillers

- [ ] Update `CircleMembersPanel.stories.svelte`
  - Use mock `useCircleMembers`
  - Create stories: Default, EmptyMembers, ManyMembers

- [ ] Update `CircleRolesPanel.stories.svelte`
  - Use mock `useCircleRoles`
  - Create stories: Default, EmptyRoles, ExpandedRole

- [ ] Update remaining story files (CategoryHeader, RoleCard, etc.)
  - Use realistic mock data
  - Create 2-3 variations per component

---

### Phase 4: Validation & Testing (1.5 hours)

- [ ] Run Storybook locally:

  ```bash
  npm run storybook
  ```

- [ ] Verify all stories render:
  - [ ] OrgChart stories (3 stories)
  - [ ] CircleDetailPanel stories (4 stories)
  - [ ] RoleDetailPanel stories (3 stories)
  - [ ] CircleMembersPanel stories (3 stories)
  - [ ] CircleRolesPanel stories (3 stories)
  - [ ] All other component stories

- [ ] Test interactions:
  - [ ] Click circles in OrgChart
  - [ ] Open detail panels
  - [ ] Navigate panel breadcrumbs
  - [ ] Expand role details
  - [ ] Add/remove members (console logs work)

- [ ] Test real app (verify no regressions):

  ```bash
  npm run dev
  ```

  - [ ] Navigate to `/org/chart`
  - [ ] Click circles, open panels
  - [ ] Verify all interactions work

- [ ] Run code quality checks:

  ```bash
  npm run ci:local  # Runs all checks
  ```

- [ ] Fix any issues found

---

### Phase 5: Documentation & Cleanup (30 min)

- [ ] Add JSDoc comments to new composables
- [ ] Remove debug console logs from `OrgChart.svelte:92-94`
- [ ] Update README if needed
- [ ] Create PR with summary of changes

---

## Total Time Estimate

- Phase 1 (Composables): 3 hours
- Phase 2 (Mocks): 2 hours
- Phase 3 (Stories): 2 hours
- Phase 4 (Testing): 1.5 hours
- Phase 5 (Docs): 0.5 hours

**Total**: ~9 hours

---

## Notes

### Critical Dependencies

**User deleted `useOrgChart.svelte.ts`** - This MUST be restored first:

- Check git history for backup
- OR recreate from route usage pattern
- Must fix 4 `any` type violations during restoration

### Design System Validation

**No validation needed** - components already use design tokens correctly (verified in code review).

### Migration Path

1. ✅ Extract composables (fixes separation of concerns)
2. ✅ Create mocks (enables Storybook)
3. ✅ Update stories (enables visual iteration)
4. ✅ Test both paths (real app + Storybook)

---

**Last Updated**: 2025-11-22  
**Status**: Ready for implementation  
**Ticket**: TBD (create after user confirms approach)
