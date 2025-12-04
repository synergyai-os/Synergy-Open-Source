# RBAC Role Management UI - Implementation Plan

**Linear Ticket**: [SYOS-649](https://linear.app/younghumanclub/issue/SYOS-649)  
**Created**: 2025-01-27  
**Updated**: 2025-12-04 (Tickets Created)  
**Status**: Ready for Implementation  
**Related**: SYOS-645 (Quick Edit Mode), RBAC System

---

## Problem Statement

Our RBAC system supports **role scoping** (system-level, workspace-scoped, circle-scoped) but the UI doesn't expose this capability. Users cannot:

1. **In Workspace Settings** (`/w/[slug]/settings/`):
   - View which users have which roles in their workspace
   - Assign workspace-scoped RBAC roles to users (e.g., Org Designer)
   - See role permissions and understand what each role grants

2. **In System Admin** (`/admin/rbac`):
   - Configure role scope when assigning roles (currently only supports global assignment)
   - Understand the difference between system roles vs workspace-scoped roles

**Impact**: Users cannot properly configure RBAC permissions, preventing features like Quick Edit Mode (SYOS-645) from working because roles aren't assigned with proper scoping.

---

## Validated Codebase State

### ✅ Backend (Already Implemented)

#### Schema (`convex/schema.ts`)

```typescript
// userRoles table - ALREADY supports scoping
userRoles: defineTable({
  userId: v.id('users'),
  roleId: v.id('roles'),
  workspaceId: v.optional(v.id('workspaces')),  // ✅ Workspace scope
  circleId: v.optional(v.id('circles')),         // ✅ Circle scope
  resourceType: v.optional(v.string()),
  resourceId: v.optional(v.string()),
  assignedBy: v.id('users'),
  assignedAt: v.number(),
  expiresAt: v.optional(v.number()),
  revokedAt: v.optional(v.number())
})
```

#### Existing Mutations (`convex/rbac/roles.ts`)

```typescript
// ✅ assignRole - ALREADY supports workspaceId and circleId
export const assignRole = mutation({
  args: {
    sessionId: v.string(),
    userId: v.id('users'),
    roleSlug: v.string(),
    workspaceId: v.optional(v.id('workspaces')),  // ✅ UI doesn't expose
    circleId: v.optional(v.id('circles')),        // ✅ UI doesn't expose
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    expiresAt: v.optional(v.number())
  },
  handler: async (ctx, args) => { /* ... */ }
});

// ✅ revokeRole - Exists
export const revokeRole = mutation({
  args: { sessionId: v.string(), userRoleId: v.id('userRoles') },
  handler: async (ctx, args) => { /* ... */ }
});
```

#### Existing Queries (`convex/rbac/queries.ts`)

```typescript
// ✅ getUserRBACDetails - Returns system + workspace roles
export const getUserRBACDetails = query({
  args: {
    sessionId: v.string(),
    workspaceId: v.optional(v.id('workspaces'))
  },
  handler: async (ctx, args) => {
    // Returns: { systemRoles, workspaceRoles, activeWorkspaceRoles }
  }
});
```

### ✅ Frontend Infrastructure (Exists)

#### Location: `src/lib/infrastructure/rbac/`

```
src/lib/infrastructure/rbac/
├── components/
│   ├── index.ts
│   ├── PermissionButton.svelte      // ✅ Button with permission check
│   ├── PermissionGate.svelte        // ✅ Conditional render by permission
│   └── README.md
└── composables/
    └── usePermissions.svelte.ts     // ✅ Reactive permission checking
```

#### usePermissions Composable (Validated)

```typescript
// src/lib/infrastructure/rbac/composables/usePermissions.svelte.ts
export interface UsePermissionsParams {
  sessionId: () => string | null;
  userId?: () => Id<'users'> | null;
  workspaceId?: () => Id<'workspaces'> | null;  // ✅ Supports workspace context
  circleId?: () => Id<'circles'> | null;        // ✅ Supports circle context
  initialPermissions?: Array<{ permissionSlug, scope, roleSlug, roleName }>;
}

// Usage
const permissions = usePermissions({
  sessionId: () => $page.data.sessionId,
  workspaceId: () => activeWorkspaceId
});

permissions.can('users.change-roles')  // ✅ Check permission
```

### ✅ UI Patterns (Validated from Admin RBAC Page)

**Dialog Pattern** (`/admin/rbac/+page.svelte` lines 956-1358):

- Uses `Dialog` from `bits-ui`
- State: `let modalOpen = $state(false)`
- Form state: `let fieldValue = $state('')`
- Loading state: `let loading = $state(false)`
- Error state: `let error = $state<string | null>(null)`

**Assign Role Modal** (lines 1191-1261):

- User selector: `<select>` bound to userId
- Role selector: `<select>` bound to roleId
- **Missing**: Workspace/Circle scope selectors

### ✅ Workspace Settings Structure (Validated)

```
src/routes/(authenticated)/w/[slug]/settings/
├── +layout.svelte              // ✅ Uses WorkspaceSettingsSidebar
├── +page.svelte                // ✅ General settings (theme, API keys)
├── +page.server.ts
├── branding/                   // ✅ Branding settings
│   ├── +page.server.ts
│   └── +page.svelte
└── org-chart/                  // ✅ Org chart settings
    ├── +page.server.ts
    └── +page.svelte
```

**WorkspaceSettingsSidebar** (`src/lib/modules/core/components/WorkspaceSettingsSidebar.svelte`):

- Navigation structure exists
- Uses `sidebarRecipe()` for styling
- **Need to add**: Roles navigation link

---

## New Concept: CircleRole-Scoped Permissions

### Understanding the Requirement

The existing RBAC system has:

- **User → RBAC Role** (e.g., User has "Org Designer" role)
- **RBAC Role → Permissions** (e.g., "Org Designer" can do `circles.update`)

The **new concept** (`circlerole-scope`) adds:

- **User → CircleRole Assignment** (e.g., User fills "Circle Lead" role in Marketing circle)
- **CircleRole → Permissions** (Circle Lead gets `circles.update` for their circle only)

### How This Differs from Current Implementation

| Current                                 | New (CircleRole-Scope)                           |
| --------------------------------------- | ------------------------------------------------ |
| Permissions come from RBAC roles        | Permissions come from organizational roles       |
| User-centric: "John is an Org Designer" | Role-centric: "John is Circle Lead of Marketing" |
| Explicit role assignment                | Implicit via circleRole fill                     |

### Implementation Options

**Option A: RBAC Role Auto-Assignment**

- When user is assigned to "Circle Lead" circleRole, auto-assign "circle-lead" RBAC role with circleId scope
- Uses existing `userRoles.circleId` field
- **Pro**: Works with existing permission system
- **Con**: Two systems to keep in sync

**Option B: CircleRole → Permission Mapping**

- New table: `circleRolePermissions` (like roleTemplates → permissions)
- Permission check includes circleRole assignments
- **Pro**: Cleaner model
- **Con**: More backend work

**Recommendation**: Option A for MVP. Auto-assign RBAC roles when circleRole assigned.

---

## Implementation Phases

### Phase 1: Workspace Settings Role Management (Primary Goal)

**Purpose**: Allow workspace admins to manage RBAC roles for their workspace members.

#### 1.1 Backend: New Queries

**New File**: `convex/workspaceRoles.ts`

```typescript
import { query } from './_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';

// Return type for workspace role assignments
interface WorkspaceMemberWithRoles {
  userId: Id<'users'>;
  userName: string | null;
  userEmail: string;
  roles: Array<{
    userRoleId: Id<'userRoles'>;
    roleId: Id<'roles'>;
    roleSlug: string;
    roleName: string;
    scope: 'system' | 'workspace' | 'circle';
    circleId?: Id<'circles'>;
    circleName?: string;
    assignedAt: number;
    expiresAt?: number;
  }>;
}

/**
 * Get all workspace members with their role assignments
 */
export const getWorkspaceMembersWithRoles = query({
  args: {
    sessionId: v.string(),
    workspaceId: v.id('workspaces')
  },
  handler: async (ctx, args): Promise<WorkspaceMemberWithRoles[]> => {
    // 1. Validate session
    await validateSessionAndGetUserId(ctx, args.sessionId);

    // 2. Get workspace members
    const members = await ctx.db
      .query('workspaceMembers')
      .withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();

    // 3. For each member, get their roles (system + workspace-scoped)
    const result: WorkspaceMemberWithRoles[] = [];
    const now = Date.now();

    for (const member of members) {
      const user = await ctx.db.get(member.userId);
      if (!user) continue;

      // Get all active user roles
      const userRoles = await ctx.db
        .query('userRoles')
        .withIndex('by_user', (q) => q.eq('userId', member.userId))
        .collect();

      // Filter active roles and enrich with details
      const roles: WorkspaceMemberWithRoles['roles'] = [];

      for (const ur of userRoles) {
        // Skip revoked or expired
        if (ur.revokedAt) continue;
        if (ur.expiresAt && ur.expiresAt < now) continue;

        // Skip if workspace-scoped but different workspace
        if (ur.workspaceId && ur.workspaceId !== args.workspaceId) continue;

        // Get role details
        const role = await ctx.db.get(ur.roleId);
        if (!role) continue;

        // Determine scope type
        let scope: 'system' | 'workspace' | 'circle' = 'system';
        let circleName: string | undefined;

        if (ur.circleId) {
          scope = 'circle';
          const circle = await ctx.db.get(ur.circleId);
          circleName = circle?.name;
        } else if (ur.workspaceId) {
          scope = 'workspace';
        }

        roles.push({
          userRoleId: ur._id,
          roleId: role._id,
          roleSlug: role.slug,
          roleName: role.name,
          scope,
          circleId: ur.circleId,
          circleName,
          assignedAt: ur.assignedAt,
          expiresAt: ur.expiresAt
        });
      }

      result.push({
        userId: member.userId,
        userName: user.name ?? null,
        userEmail: user.email,
        roles
      });
    }

    return result;
  }
});

/**
 * Get roles that can be assigned at workspace level
 * Excludes system-only roles
 */
export const getAssignableRoles = query({
  args: {
    sessionId: v.string()
  },
  handler: async (ctx, args) => {
    await validateSessionAndGetUserId(ctx, args.sessionId);

    const roles = await ctx.db.query('roles').collect();

    return roles.map((role) => ({
      _id: role._id,
      slug: role.slug,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem
    }));
  }
});
```

#### 1.2 Frontend: New Route

**New Files**:

- `src/routes/(authenticated)/w/[slug]/settings/roles/+page.server.ts`
- `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte`

**+page.server.ts**:

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();
  return {
    sessionId: parentData.sessionId,
    workspaceId: parentData.workspaceId
  };
};
```

**+page.svelte** (Minimal Functional):

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Button, Badge, FormInput, Heading, Text } from '$lib/components/atoms';
	import { Dialog } from 'bits-ui';

	let { data }: { data: PageData } = $props();

	const convexClient = browser ? useConvexClient() : null;
	const sessionId = $derived(data.sessionId);
	const workspaceId = $derived(data.workspaceId as Id<'workspaces'>);

	// Queries
	const membersQuery =
		browser && sessionId && workspaceId
			? useQuery(api.workspaceRoles.getWorkspaceMembersWithRoles, () => ({
					sessionId,
					workspaceId
				}))
			: null;

	const rolesQuery =
		browser && sessionId
			? useQuery(api.workspaceRoles.getAssignableRoles, () => ({ sessionId }))
			: null;

	const members = $derived(membersQuery?.data ?? []);
	const availableRoles = $derived(rolesQuery?.data ?? []);

	// Modal state
	let assignModalOpen = $state(false);
	let selectedUserId = $state<string>('');
	let selectedRoleId = $state<string>('');
	let scopeType = $state<'workspace' | 'circle'>('workspace');
	let selectedCircleId = $state<string>('');
	let assignLoading = $state(false);
	let assignError = $state<string | null>(null);

	async function handleAssignRole() {
		if (!convexClient || !sessionId || !selectedUserId || !selectedRoleId) {
			assignError = 'Please select a user and role';
			return;
		}

		assignLoading = true;
		assignError = null;

		try {
			const role = availableRoles.find((r) => r._id === selectedRoleId);
			if (!role) throw new Error('Role not found');

			await convexClient.mutation(api.rbac.roles.assignRole, {
				sessionId,
				userId: selectedUserId as Id<'users'>,
				roleSlug: role.slug,
				workspaceId: workspaceId,
				circleId:
					scopeType === 'circle' && selectedCircleId
						? (selectedCircleId as Id<'circles'>)
						: undefined
			});

			// Reset form
			selectedUserId = '';
			selectedRoleId = '';
			scopeType = 'workspace';
			selectedCircleId = '';
			assignModalOpen = false;
		} catch (error) {
			assignError = error instanceof Error ? error.message : 'Failed to assign role';
		} finally {
			assignLoading = false;
		}
	}

	async function handleRevokeRole(userRoleId: string) {
		if (!convexClient || !sessionId) return;
		if (!confirm('Are you sure you want to remove this role?')) return;

		try {
			await convexClient.mutation(api.rbac.roles.revokeRole, {
				sessionId,
				userRoleId: userRoleId as Id<'userRoles'>
			});
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to remove role');
		}
	}
</script>

<div class="h-full overflow-y-auto bg-base">
	<div class="mx-auto max-w-4xl px-page py-page">
		<!-- Header -->
		<div class="flex items-center justify-between mb-section">
			<div>
				<Heading level={1}>Role Management</Heading>
				<Text variant="body" size="sm" color="secondary" class="mt-fieldGroup">
					Manage RBAC roles for workspace members
				</Text>
			</div>
			<Button variant="primary" onclick={() => (assignModalOpen = true)}>Assign Role</Button>
		</div>

		<!-- Info Banner -->
		<div
			class="border-accent-primary/20 bg-accent-primary/10 rounded-card border card-padding mb-section"
		>
			<Text variant="body" size="sm" color="secondary">
				Roles control what users can do. <strong>System roles</strong> apply globally.
				<strong>Workspace roles</strong> apply only to this workspace.
			</Text>
		</div>

		<!-- Members List -->
		<div class="flex flex-col gap-form">
			{#each members as member (member.userId)}
				<div class="border-base rounded-card border bg-surface card-padding">
					<div class="flex items-start justify-between gap-form">
						<div class="min-w-0 flex-1">
							<Text variant="body" size="sm" color="primary" class="font-medium">
								{member.userName || member.userEmail}
							</Text>
							<Text variant="body" size="sm" color="secondary">
								{member.userEmail}
							</Text>

							<!-- User's Roles -->
							{#if member.roles.length > 0}
								<div class="flex flex-wrap gap-fieldGroup mt-fieldGroup">
									{#each member.roles as role (role.userRoleId)}
										<div class="flex items-center gap-1">
											<Badge
												variant={role.scope === 'system'
													? 'system'
													: role.scope === 'workspace'
														? 'default'
														: 'custom'}
											>
												{role.roleName}
												{#if role.scope === 'workspace'}
													<span class="opacity-70">(Workspace)</span>
												{:else if role.scope === 'circle'}
													<span class="opacity-70">({role.circleName})</span>
												{:else}
													<span class="opacity-70">(System)</span>
												{/if}
											</Badge>
											<button
												type="button"
												onclick={() => handleRevokeRole(role.userRoleId)}
												class="text-tertiary transition-colors hover:text-error"
												title="Remove role"
											>
												<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
									{/each}
								</div>
							{:else}
								<Text variant="body" size="sm" color="tertiary" class="mt-fieldGroup">
									No roles assigned
								</Text>
							{/if}
						</div>

						<Button
							variant="secondary"
							onclick={() => {
								selectedUserId = member.userId;
								assignModalOpen = true;
							}}
						>
							Add Role
						</Button>
					</div>
				</div>
			{/each}

			{#if members.length === 0}
				<div class="py-page text-center">
					<Text variant="body" color="secondary">No workspace members found</Text>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Assign Role Modal -->
<Dialog.Root bind:open={assignModalOpen}>
	<Dialog.Content
		class="border-base shadow-card-hover w-[min(500px,90vw)] rounded-card border bg-surface text-primary"
	>
		<div class="space-y-form px-page py-page">
			<div>
				<Dialog.Title class="text-h3 font-semibold text-primary">Assign Role</Dialog.Title>
				<Dialog.Description class="text-small text-secondary mt-fieldGroup">
					Assign an RBAC role to a workspace member
				</Dialog.Description>
			</div>

			<div class="space-y-form">
				<!-- User Selector -->
				<div>
					<label for="user-select" class="text-small mb-fieldGroup block font-medium text-primary">
						User
					</label>
					<select
						id="user-select"
						bind:value={selectedUserId}
						class="border-base bg-input text-small focus:ring-accent-primary w-full rounded-input border px-input py-input text-primary focus:ring-2 focus:outline-none"
					>
						<option value="">Select a user...</option>
						{#each members as member (member.userId)}
							<option value={member.userId}>
								{member.userName || member.userEmail}
							</option>
						{/each}
					</select>
				</div>

				<!-- Role Selector -->
				<div>
					<label for="role-select" class="text-small mb-fieldGroup block font-medium text-primary">
						Role
					</label>
					<select
						id="role-select"
						bind:value={selectedRoleId}
						class="border-base bg-input text-small focus:ring-accent-primary w-full rounded-input border px-input py-input text-primary focus:ring-2 focus:outline-none"
					>
						<option value="">Select a role...</option>
						{#each availableRoles as role (role._id)}
							<option value={role._id}>
								{role.name} ({role.slug})
							</option>
						{/each}
					</select>
				</div>

				<!-- Scope Selector -->
				<div>
					<label class="text-small mb-fieldGroup block font-medium text-primary"> Scope </label>
					<div class="space-y-fieldGroup">
						<label class="flex items-center gap-fieldGroup">
							<input
								type="radio"
								name="scope"
								value="workspace"
								bind:group={scopeType}
								class="focus:ring-accent-primary text-accent-primary"
							/>
							<span class="text-small text-primary">This workspace only</span>
						</label>
						<label class="flex items-center gap-fieldGroup">
							<input
								type="radio"
								name="scope"
								value="circle"
								bind:group={scopeType}
								class="focus:ring-accent-primary text-accent-primary"
								disabled
							/>
							<span class="text-small text-tertiary">Specific circle (coming soon)</span>
						</label>
					</div>
				</div>

				{#if assignError}
					<div class="border-error/20 bg-error/5 px-card py-card rounded-button border">
						<Text variant="body" size="sm" color="error">{assignError}</Text>
					</div>
				{/if}
			</div>

			<div class="pt-form flex items-center justify-end gap-2">
				<Dialog.Close
					type="button"
					class="border-base text-small rounded-button border px-button py-button font-medium text-secondary hover:text-primary"
				>
					Cancel
				</Dialog.Close>
				<Button variant="primary" onclick={handleAssignRole} disabled={assignLoading}>
					{assignLoading ? 'Assigning...' : 'Assign Role'}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
```

#### 1.3 Update Navigation

**Update**: `src/lib/modules/core/components/WorkspaceSettingsSidebar.svelte`

Add Roles navigation link after Org Chart:

```svelte
<!-- Roles Settings (NEW) -->
<a
	href={rolesPath}
	class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
	class:bg-sidebar-hover={isActive(rolesPath)}
>
	<Icon type="users" size="sm" color="default" class="flex-shrink-0" />
	<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">Roles</Text>
</a>
```

### Phase 2: Enhance Admin RBAC Page

**Purpose**: Add scope selectors to the existing admin assign role modal.

#### 2.1 Update Assign Role Modal

Enhance `/admin/rbac/+page.svelte` lines 1191-1261 to add:

- Scope type radio buttons (System / Workspace / Circle)
- Workspace selector (when workspace scope selected)
- Circle selector (when circle scope selected)

```svelte
<!-- Add after Role selector -->

<!-- Scope Type -->
<div>
	<label class="text-small mb-content-section block font-medium text-primary">Scope</label>
	<div class="space-y-icon">
		<label class="flex items-center gap-2">
			<input type="radio" name="scope" value="system" bind:group={assignScopeType} />
			<span class="text-small text-primary">System-wide (all workspaces)</span>
		</label>
		<label class="flex items-center gap-2">
			<input type="radio" name="scope" value="workspace" bind:group={assignScopeType} />
			<span class="text-small text-primary">Workspace-scoped</span>
		</label>
		<label class="flex items-center gap-2">
			<input type="radio" name="scope" value="circle" bind:group={assignScopeType} />
			<span class="text-small text-primary">Circle-scoped</span>
		</label>
	</div>
</div>

<!-- Workspace Selector (shown when workspace or circle scope) -->
{#if assignScopeType === 'workspace' || assignScopeType === 'circle'}
	<div>
		<label
			for="assign-workspace-select"
			class="text-small mb-content-section block font-medium text-primary"
		>
			Workspace
		</label>
		<select
			id="assign-workspace-select"
			bind:value={assignWorkspaceId}
			class="border-base bg-input text-small focus:ring-accent-primary w-full rounded-input border px-input-x py-input-y text-primary focus:ring-2 focus:outline-none"
		>
			<option value="">Select a workspace...</option>
			{#each allWorkspaces as workspace (workspace._id)}
				<option value={workspace._id}>{workspace.name}</option>
			{/each}
		</select>
	</div>
{/if}

<!-- Circle Selector (shown when circle scope) -->
{#if assignScopeType === 'circle' && assignWorkspaceId}
	<div>
		<label
			for="assign-circle-select"
			class="text-small mb-content-section block font-medium text-primary"
		>
			Circle
		</label>
		<select
			id="assign-circle-select"
			bind:value={assignCircleId}
			class="border-base bg-input text-small focus:ring-accent-primary w-full rounded-input border px-input-x py-input-y text-primary focus:ring-2 focus:outline-none"
		>
			<option value="">Select a circle...</option>
			{#each filteredCircles as circle (circle._id)}
				<option value={circle._id}>{circle.name}</option>
			{/each}
		</select>
	</div>
{/if}
```

#### 2.2 New Backend Queries (Admin)

**Update**: `convex/admin/rbac.ts`

```typescript
// Add: List all workspaces (for admin dropdown)
export const listWorkspaces = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args.sessionId);
    return ctx.db.query('workspaces').collect();
  }
});

// Add: List circles by workspace (for admin dropdown)
export const listCirclesByWorkspace = query({
  args: {
    sessionId: v.string(),
    workspaceId: v.id('workspaces')
  },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args.sessionId);
    return ctx.db
      .query('circles')
      .withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();
  }
});

// Update: assignRoleToUser to accept scope parameters
// (Already supported in rbac.roles.assignRole, but admin.rbac.assignRoleToUser needs updating)
```

### Phase 3: CircleRole-Scoped Permissions (Circle Lead Feature)

**Purpose**: Circle Lead can assign users to roles within their circle.

**Validation Test Case**:

- ✅ Circle Lead assigns user to role in their circle → Success
- ❌ Non-Circle Lead tries to assign → Permission denied
- ✅ Org Designer assigns (has workspace-level permission) → Success (test conflict resolution)

#### 3.1 Schema Changes

```typescript
// Add to roleTemplates table
roleTemplates: defineTable({
  // ... existing fields
  rbacPermissions: v.optional(v.array(v.object({
    permissionSlug: v.string(),  // e.g., "users.change-roles"
    scope: v.union(v.literal('all'), v.literal('own'))
  }))),  // NEW: Maps organizational role → RBAC permissions
})

// Add to userRoles table (for tracking source of auto-assigned roles)
userRoles: defineTable({
  // ... existing fields
  sourceCircleRoleId: v.optional(v.id('userCircleRoles')),  // NEW: Track which circleRole granted this
}).index('by_source_circle_role', ['sourceCircleRoleId'])  // NEW: For efficient cleanup
```

#### 3.2 Backend Trigger (Auto-Assignment)

**Location**: `convex/circleRoles.ts` - in the `assignUserToRole` mutation

```typescript
// In circleRoles.assignUserToRole mutation
async function handleUserCircleRoleCreated(
  ctx: MutationCtx,
  userCircleRole: { userId, circleRoleId, assignedBy },
  circleRole: { templateId, circleId, workspaceId }
) {
  if (!circleRole.templateId) return;

  // Get template with RBAC permissions
  const template = await ctx.db.get(circleRole.templateId);
  if (!template?.rbacPermissions?.length) return;

  // CircleRole → RBAC is ALWAYS enabled (default behavior)
  // This is independent of Quick Edit Mode

  // Auto-assign RBAC permissions for this role
  for (const perm of template.rbacPermissions) {
    // Find permission by slug
    const permission = await ctx.db
      .query('permissions')
      .withIndex('by_slug', (q) => q.eq('slug', perm.permissionSlug))
      .first();
    if (!permission) continue;

    // Find the corresponding RBAC role (e.g., "circle-lead" role)
    const rbacRole = await ctx.db
      .query('roles')
      .withIndex('by_slug', (q) => q.eq('slug', 'circle-lead'))
      .first();
    if (!rbacRole) continue;

    // Check if user already has this role with this scope
    const existingRole = await ctx.db
      .query('userRoles')
      .withIndex('by_user_role', (q) =>
        q.eq('userId', userCircleRole.userId).eq('roleId', rbacRole._id)
      )
      .filter((q) => q.and(
        q.eq(q.field('circleId'), circleRole.circleId),
        q.eq(q.field('revokedAt'), undefined)
      ))
      .first();

    if (!existingRole) {
      // Auto-assign RBAC role with circle scope
      // Track sourceCircleRoleId for precise cleanup when user is removed
      await ctx.db.insert('userRoles', {
        userId: userCircleRole.userId,
        roleId: rbacRole._id,
        workspaceId: circleRole.workspaceId,
        circleId: circleRole.circleId,
        sourceCircleRoleId: userCircleRole._id,  // Track source for cleanup
        assignedBy: userCircleRole.assignedBy,
        assignedAt: Date.now()
      });
    }
  }
}
```

#### 3.3 Cleanup on Removal (Precise - Track Source)

When user is removed from circleRole, revoke ONLY the RBAC roles that came from that specific circleRole assignment:

```typescript
// In circleRoles.removeUserFromRole mutation
async function handleUserCircleRoleRemoved(
  ctx: MutationCtx,
  userCircleRoleId: Id<'userCircleRoles'>  // The record being removed
) {
  // Find ONLY the RBAC roles that were auto-assigned from THIS circleRole
  // This prevents over-revoking if user has multiple roles in same circle
  const autoAssignedRoles = await ctx.db
    .query('userRoles')
    .withIndex('by_source_circle_role', (q) =>
      q.eq('sourceCircleRoleId', userCircleRoleId)
    )
    .filter((q) => q.eq(q.field('revokedAt'), undefined))
    .collect();

  // Revoke only the roles that came from this specific circleRole
  for (const ur of autoAssignedRoles) {
    await ctx.db.patch(ur._id, { revokedAt: Date.now() });
  }
}
```

**Why this approach**:

- User with Circle Lead + Finance Lead in same circle
- Removed from Circle Lead → Only revokes Circle Lead RBAC, keeps Finance Lead RBAC
- `sourceCircleRoleId` creates clean audit trail

#### 3.4 System Admin UI for Template → Permission Mapping

**Location**: `/admin/rbac` (new section)

Add a section to configure role template → RBAC permission mappings:

- List role templates
- For each template: multi-select of permissions with scope dropdown
- Save to `roleTemplates.rbacPermissions`

---

## File Changes Summary

### New Files

| File                                                                 | Purpose                                       |
| -------------------------------------------------------------------- | --------------------------------------------- |
| `convex/workspaceRoles.ts`                                           | Backend queries for workspace role management |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.server.ts` | Route data loading                            |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte`    | Role management UI                            |

### Modified Files

| File                                                              | Change                              |
| ----------------------------------------------------------------- | ----------------------------------- |
| `src/lib/modules/core/components/WorkspaceSettingsSidebar.svelte` | Add Roles navigation link           |
| `src/routes/(authenticated)/admin/rbac/+page.svelte`              | Add scope selectors to assign modal |
| `convex/admin/rbac.ts`                                            | Add workspace/circle list queries   |

---

## Success Criteria

### Phase 1 (Workspace Settings Role Management)

- [ ] Route `/w/[slug]/settings/roles/` exists and loads
- [ ] Workspace members list displays with their current roles
- [ ] "Assign Role" button opens modal with user/role selectors
- [ ] Successfully assigns workspace-scoped RBAC role via `rbac.roles.assignRole`
- [ ] Remove role button revokes assignment
- [ ] UI shows scope badges (System/Workspace)
- [ ] Navigation link visible in WorkspaceSettingsSidebar

### Phase 2 (Admin RBAC Enhancement)

- [ ] Assign role modal has scope type selector (System/Workspace/Circle)
- [ ] Workspace dropdown appears when workspace or circle scope selected
- [ ] Circle dropdown appears when circle scope selected
- [ ] Assignment includes correct `workspaceId` and `circleId` parameters
- [ ] Uses reactive queries instead of `window.location.reload()`

### Phase 3 (Circle Lead Feature) - VALIDATION TEST CASE

- [ ] `roleTemplates` table has `rbacPermissions` field
- [ ] System admin can configure Circle Lead template → `users.change-roles` permission
- [ ] When user assigned to "Circle Lead" role → auto-gets RBAC permission
- [ ] RBAC role has `circleId` scope set correctly
- [ ] **TEST**: Circle Lead can assign user to role in their circle ✅
- [ ] **TEST**: Non-Circle Lead cannot assign users → Permission denied ❌
- [ ] **TEST**: Org Designer can assign (workspace-level permission) ✅
- [ ] Removing user from Circle Lead role revokes auto-assigned RBAC role

---

## Decisions Made (2025-01-27)

### 1. CircleRole → RBAC Role Mapping ✅

**Decision**: Use **Option A: RBAC Role Auto-Assignment**

- When user is assigned to "Circle Lead" circleRole → auto-grant `users.change-roles` permission (circle-scoped)
- **System Admin** configures which role templates map to which RBAC permissions
- **Workspace Admin** gets toggle to enable/disable (default ON for Circle Lead)

**Schema Change**:

```typescript
roleTemplates: {
  // ... existing fields
  rbacPermissions: v.optional(v.array(v.object({
    permissionSlug: v.string(),  // e.g., "users.change-roles"
    scope: v.union(v.literal('all'), v.literal('own'))  // How the permission applies
  }))),
}
```

**Example**:

- Circle Lead template → `[{ permissionSlug: "users.change-roles", scope: "own" }]`
- When user fills Circle Lead → auto-gets permission to assign roles **within their circle only**

### 2. Permission Inheritance ✅

**Decision**: Higher scope wins

- Workspace permissions > Circle permissions > Role permissions
- Our existing `getUserPermissions` handles this via `scopePriority = { all: 3, own: 2, none: 1 }`
- **No changes needed** - current implementation is correct

### 3. UI for CircleRole Mapping ✅

**Decision**: System Admin sets up, CircleRole default is always ON

- **System Admin** (`/admin/rbac`): Configure role template → RBAC permission mappings
- **Circle Lead capability is a DEFAULT BEHAVIOR** of the CircleRole itself (always enabled)
- NOT tied to Quick Edit Mode - these are independent features:
  - Quick Edit Mode = Org Designer can edit structure without governance
  - Circle Lead = Can assign members to roles in their circle (always ON)

### 4. Expiration ✅

**Decision**: Skip for MVP

- No hard expiration on roles
- Auto-assigned RBAC roles follow circleRole lifecycle (removed when user leaves role)
- Future: "Review in X months" reminder feature (not hard expiration)

### 5. Circle Selection Scope ✅

**Decision**: Separate subtask at end

- **Phase 1**: Workspace-scoped RBAC roles only
- **Phase 3**: Circle-scoped (Circle Lead can assign within their circle)
- **Validation Test**: Circle Lead assigns user to role in their circle, Org Designer cannot

### 6. Admin Page Refactor ✅

**Decision**: Use reactive queries

- When enhancing admin RBAC page, replace `window.location.reload()` with reactive queries
- Apply the Convex pattern of using `useQuery` for real-time updates

---

## All Decisions Finalized ✅

### 1. Role Template Permissions UI in System Admin ✅

**Decision**: Simple Dropdown per Template

- Multi-select dropdown of permissions per role template
- Scope selector (all/own) per permission
- Matches existing admin page patterns

### 2. Auto-Assignment Trigger Mechanism ✅

**Decision**: Inline in Mutation (Side Effect)

- Atomic operation - circleRole assignment + RBAC grant in same transaction
- No delay, immediate permission
- Track `sourceCircleRoleId` for precise cleanup

### 3. Cleanup on Removal ✅

**Decision**: Track Source, Revoke Specific

- Use `sourceCircleRoleId` to track which circleRole granted RBAC
- Only revoke RBAC from the specific circleRole being removed
- Prevents over-revoking if user has multiple roles

### 4. Test Coverage ✅

**Decision**: Integration Tests + 1 E2E Test

- 3-5 Vitest integration tests for RBAC logic (fast)
- 1 Playwright E2E test for Circle Lead happy path (comprehensive)

---

## Related Documentation

- `convex/schema.ts` - RBAC schema definitions (lines 1246-1346)
- `convex/rbac/permissions.ts` - Permission checking logic
- `convex/rbac/roles.ts` - Role assignment mutations
- `convex/rbac/queries.ts` - Role queries
- `src/lib/infrastructure/rbac/` - Frontend RBAC components
- `src/routes/(authenticated)/admin/rbac/+page.svelte` - Current admin UI
- `dev-docs/master-docs/design-system.md` - UI token reference

---

**Last Updated**: 2025-01-27 (Validated & Refined)
