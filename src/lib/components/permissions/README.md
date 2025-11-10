# Permission Components

UI components for role-based access control (RBAC) permission checking.

## Components

### `usePermissions` Composable

Reactive permission checking hook.

```svelte
<script lang="ts">
	import { usePermissions } from '$lib/composables/usePermissions.svelte';
	import { currentUserId, activeOrganizationId } from '$lib/stores';

	const permissions = usePermissions({
		userId: () => $currentUserId,
		organizationId: () => $activeOrganizationId
	});
</script>

{#if permissions.can('teams.create')}
	<button>Create Team</button>
{/if}

{#if permissions.cannot('users.remove')}
	<p>You cannot remove users</p>
{/if}
```

### `PermissionGate`

Conditionally renders children based on permissions.

```svelte
<script lang="ts">
	import { PermissionGate } from '$lib/components/permissions';
	import { usePermissions } from '$lib/composables/usePermissions.svelte';

	const permissions = usePermissions({
		userId: () => $currentUserId
	});
</script>

<!-- Basic usage -->
<PermissionGate can="teams.create" {permissions}>
	<button>Create Team</button>
</PermissionGate>

<!-- With fallback message -->
<PermissionGate
	can="users.invite"
	{permissions}
	fallback="You don't have permission to invite users"
>
	<button>Invite User</button>
</PermissionGate>

<!-- With custom fallback snippet -->
<PermissionGate can="teams.delete" {permissions}>
	{#snippet fallbackSnippet()}
		<div class="rounded-md bg-yellow-50 p-4 text-yellow-900">
			<p>Only admins can delete teams.</p>
			<a href="/help/permissions">Learn more</a>
		</div>
	{/snippet}

	<button>Delete Team</button>
</PermissionGate>
```

### `PermissionButton`

Button that automatically disables based on permissions.

```svelte
<script lang="ts">
	import { PermissionButton } from '$lib/components/permissions';
	import { usePermissions } from '$lib/composables/usePermissions.svelte';

	const permissions = usePermissions({
		userId: () => $currentUserId
	});

	function handleCreate() {
		// Create team logic
	}
</script>

<!-- Primary button -->
<PermissionButton requires="teams.create" {permissions} variant="primary" onclick={handleCreate}>
	Create Team
</PermissionButton>

<!-- Secondary button with custom title -->
<PermissionButton
	requires="users.remove"
	{permissions}
	variant="danger"
	permissionDeniedTitle="Only admins can remove users"
	onclick={handleRemove}
>
	Remove User
</PermissionButton>

<!-- Ghost button -->
<PermissionButton requires="teams.update" {permissions} variant="ghost" onclick={handleEdit}>
	Edit Team
</PermissionButton>
```

## Permission Slugs

Common permission slugs (defined in `convex/seed/rbac.ts`):

### User Management

- `users.view` - View user profiles
- `users.invite` - Invite new users
- `users.remove` - Remove users
- `users.change-roles` - Assign/revoke roles
- `users.manage-profile` - Edit user profiles

### Team Management

- `teams.view` - View team details
- `teams.create` - Create new teams
- `teams.update` - Edit team settings
- `teams.delete` - Delete teams
- `teams.add-members` - Add team members
- `teams.remove-members` - Remove team members
- `teams.change-roles` - Change team member roles

### Organization Settings

- `organizations.view-settings` - View organization settings
- `organizations.update-settings` - Update organization settings
- `organizations.manage-billing` - Manage billing/subscriptions

## Design Patterns

### Loading States

The `PermissionGate` component handles loading states automatically:

```svelte
<PermissionGate can="teams.create" {permissions} showLoading={true}>
	<button>Create Team</button>
</PermissionGate>
<!-- Shows "Loading permissions..." while fetching -->
```

### Error Handling

Both components handle errors gracefully:

```svelte
<PermissionGate can="teams.create" {permissions}>
	<button>Create Team</button>
</PermissionGate>
<!-- Shows "Error loading permissions" if query fails -->
```

### Reactive Updates

Permissions update reactively when roles change:

```svelte
<script lang="ts">
	// When user's role changes, permissions update automatically
	const permissions = usePermissions({
		userId: () => $currentUserId,
		organizationId: () => $activeOrganizationId
	});
</script>

<!-- Button appears/disappears when permissions change -->
<PermissionButton requires="teams.create" {permissions}>Create Team</PermissionButton>
```

## Architecture

See [dev-docs/rbac-architecture.md](../../../../dev-docs/rbac-architecture.md) for complete system architecture.

## Testing

Manual test plan:

1. Load page as Admin → See all management buttons
2. Load page as Team Lead → See only team management for own team
3. Load page as Member → See no management buttons
4. Admin creates team → Button appears immediately (reactive)
