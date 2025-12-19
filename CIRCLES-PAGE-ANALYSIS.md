# Circles Page Analysis & Migration Plan

## Overview

This document analyzes where `/w/[slug]/circles` route is used and what should be migrated or removed when deleting this page.

**Current Route**: `src/routes/(authenticated)/w/[slug]/circles/+page.svelte`  
**Replacement**: `src/routes/(authenticated)/w/[slug]/chart/+page.svelte` (org-chart visualization)

**Note**: The org-chart visualization route (`/w/[slug]/chart`) is the logical replacement as it provides visual hierarchy browsing of circles.

---

## Current Circles Page Functionality

The circles page (`/w/[slug]/circles`) provides:

1. **List View**: Table showing all circles with columns:
   - Name
   - Purpose
   - Parent circle name
   - Member count

2. **Create Circle**: Button to open `CreateCircleModal`

3. **Navigation**: Clicking a row navigates to `/w/[slug]/circles/[id]` (circle detail page)

4. **Empty State**: Shows when no circles exist

---

## What Should STAY (Infrastructure/Reusable)

### ✅ Keep These Components & Composables

1. **`useCircles` composable** (`src/lib/infrastructure/organizational-model/composables/useCircles.svelte.ts`)
   - Used by multiple pages including circle detail page (`/circles/[id]`)
   - Used by org-chart module components
   - Core infrastructure - should remain

2. **`CreateCircleModal` component** (`src/lib/infrastructure/organizational-model/components/CreateCircleModal.svelte`)
   - Reusable modal for creating circles
   - Can be used from org-chart visualization or settings page
   - Should remain

3. **Circle Detail Page** (`src/routes/(authenticated)/w/[slug]/circles/[id]/+page.svelte`)
   - Provides detailed view of a single circle
   - Shows members and roles panels
   - Should remain (or migrate to org-chart module)

4. **Circle Panel Components**:
   - `CircleMembersPanel` (`src/lib/modules/org-chart/components/circles/CircleMembersPanel.svelte`)
   - `CircleRolesPanel` (`src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte`)
   - Used by circle detail page and org-chart module

---

## What Should GO (Route-Specific)

### ❌ Delete These Files

1. **Circles List Page**:
   - `src/routes/(authenticated)/w/[slug]/circles/+page.svelte` (main file to delete)
   - `src/routes/(authenticated)/w/[slug]/circles/+page.ts` (if exists - check for data loading)

### ⚠️ Update These References

All links/navigation to `/w/[slug]/circles` should be updated to point to `/w/[slug]/settings/org-chart` (or `/w/[slug]/chart` if org-chart visualization is preferred).

---

## References to Update

### 1. Sidebar Navigation (2 locations)

**File**: `src/lib/modules/core/components/Sidebar.svelte`

**Lines 724-732** (Legacy section - mobile):

```svelte
<NavItem
	href={resolveRoute(
		activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/circles` : '/auth/redirect'
	)}
	iconType="circles"
	label="Circles"
	title="Circles"
	collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
/>
```

**Lines 1100-1109** (Legacy section - desktop):

```svelte
<NavItem
	href={resolveRoute(
		activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/circles` : '/auth/redirect'
	)}
	iconType="circles"
	label="Circles"
	title="Circles"
	collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
/>
```

**Action**: Update both to point to `/w/${activeWorkspaceSlug()}/chart`

---

### 2. Org Chart Page "Back" Button

**File**: `src/routes/(authenticated)/w/[slug]/chart/+page.svelte`

**Lines 84-96**:

```svelte
<button
	class="py-nav-item text-button hover:bg-hover-solid rounded-button text-secondary hover:text-primary px-2"
	onclick={() => {
		const slug = workspaceSlug();
		if (slug) {
			goto(resolveRoute(`/w/${slug}/circles`));
		} else {
			goto(resolveRoute('/auth/redirect'));
		}
	}}
>
	← Back to Circles
</button>
```

**Action**: Remove this button entirely (no circles page to go back to)

---

### 3. Circle Detail Page "Back" Button

**File**: `src/routes/(authenticated)/w/[slug]/circles/[id]/+page.svelte`

**Lines 187-199**:

```svelte
<button
	onclick={() => {
		const slug = workspaceSlug();
		if (slug) {
			goto(resolveRoute(`/w/${slug}/circles`));
		} else {
			goto(resolveRoute('/auth/redirect'));
		}
	}}
	class="text-on-solid py-nav-item text-button rounded-button bg-accent-primary hover:bg-accent-hover mt-4 px-2 font-medium"
>
	Back to Circles
</button>
```

**Action**: Update to `/w/${slug}/chart` (org-chart visualization)

---

### 4. Onboarding Redirects (Multiple Files)

These redirect users to circles page after completing onboarding steps:

#### a. `src/routes/(authenticated)/onboarding/complete/+page.svelte`

**Line 115**: `goto(resolveRoute(`/w/${slug}/circles`));`

#### b. `src/routes/(authenticated)/onboarding/welcome/+page.svelte`

**Line 32**: `goto(resolveRoute(`/w/${slug}/circles`));`

#### c. `src/routes/(authenticated)/onboarding/terminology/+page.server.ts`

**Line 45**: `throw redirect(302, `/w/${workspace.slug}/circles`);`

#### d. `src/routes/(authenticated)/onboarding/invite/+page.server.ts`

**Line 45**: `throw redirect(302, `/w/${workspace.slug}/circles`);`

#### e. `src/routes/(authenticated)/onboarding/complete/+page.server.ts`

**Line 45**: `throw redirect(302, `/w/${workspace.slug}/circles`);`

#### f. `src/routes/(authenticated)/onboarding/circle/+page.server.ts`

**Line 45**: `throw redirect(302, `/w/${workspace.slug}/circles`);`

#### g. `src/routes/(authenticated)/+layout.server.ts`

**Line 73**: `throw redirect(302, `/w/${workspace.slug}/circles`);`

#### h. `src/routes/(authenticated)/onboarding/+page.server.ts`

**Line 64**: `throw redirect(302, `/w/${firstWorkspace.slug}/circles`);`

**Action**: Update all to `/w/${workspace.slug}/chart`

---

### 5. Legacy `/org/circles` Routes (3 locations)

**Note**: These use legacy route pattern `/org/circles?org=${workspaceId}` (not `/w/[slug]/circles`). These routes don't exist as files and may need separate handling:

- `src/routes/invite/+page.svelte` (Line 79)
- `src/routes/auth/verify-email/+server.ts` (Line 169)
- `src/routes/auth/login/+server.ts` (Line 254)

**Action**: These redirects use `workspaceId` instead of `slug`, so they may need:

- Query workspace slug from ID before redirecting
- Or redirect to a handler that converts ID to slug
- Or update to use `/w/[slug]/chart` pattern if slug is available

**Status**: ⚠️ Needs investigation - different route pattern, may require workspace lookup

---

## Migration Considerations

### 1. Functionality Gap

The circles list page provides:

- **Table view** of all circles
- **Quick navigation** to circle details
- **Create circle** action

The org-chart settings page (`/settings/org-chart`) currently provides:

- **Lead requirement configuration** by circle type
- **Admin-only** settings

**Question**: Should the settings page be enhanced to include circle list/management, or should users navigate to `/chart` (org-chart visualization) instead?

### 2. User Experience

- **List view** (`/circles`) → Good for quick scanning and management
- **Visualization** (`/chart`) → Good for understanding hierarchy
- **Settings** (`/settings/org-chart`) → Good for configuration

**Replacement Strategy**: Redirecting to `/chart` (org-chart visualization) provides a natural replacement for circle browsing with visual hierarchy.

### 3. Circle Detail Page

The circle detail page (`/circles/[id]`) should likely:

- **Option A**: Remain at current route (if still accessible via org-chart)
- **Option B**: Migrate to `/chart/[id]` or `/org-chart/[id]` route
- **Option C**: Be accessible only via org-chart visualization (no direct URL)

---

## Summary Checklist

### Files to Delete

- [ ] `src/routes/(authenticated)/w/[slug]/circles/+page.svelte`
- [ ] `src/routes/(authenticated)/w/[slug]/circles/+page.ts` (if exists)

### Files to Update (10+ locations)

- [ ] `src/lib/modules/core/components/Sidebar.svelte` (2 locations)
- [ ] `src/routes/(authenticated)/w/[slug]/chart/+page.svelte` (1 location)
- [ ] `src/routes/(authenticated)/w/[slug]/circles/[id]/+page.svelte` (1 location)
- [ ] `src/routes/(authenticated)/onboarding/complete/+page.svelte` (1 location)
- [ ] `src/routes/(authenticated)/onboarding/welcome/+page.svelte` (1 location)
- [ ] `src/routes/(authenticated)/onboarding/terminology/+page.server.ts` (1 location)
- [ ] `src/routes/(authenticated)/onboarding/invite/+page.server.ts` (1 location)
- [ ] `src/routes/(authenticated)/onboarding/complete/+page.server.ts` (1 location)
- [ ] `src/routes/(authenticated)/onboarding/circle/+page.server.ts` (1 location)
- [ ] `src/routes/(authenticated)/+layout.server.ts` (1 location)
- [ ] `src/routes/(authenticated)/onboarding/+page.server.ts` (1 location)
- [ ] `src/routes/invite/+page.svelte` (1 location - different route pattern)

### Components/Composables to Keep

- ✅ `useCircles` composable
- ✅ `CreateCircleModal` component
- ✅ Circle detail page (`/circles/[id]`) - consider migration path
- ✅ Circle panel components (CircleMembersPanel, CircleRolesPanel)

---

## Questions to Resolve

1. **What happens to circle detail page (`/circles/[id]`)?**
   - Keep at current route? (can be accessed via org-chart detail panels)
   - Migrate to new route?
   - Accessible only via org-chart visualization?

2. **Should sidebar "Circles" nav item be removed or updated?**
   - Update to point to `/chart` (org-chart visualization)
   - Or remove if org-chart is already in sidebar
