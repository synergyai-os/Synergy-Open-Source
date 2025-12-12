<script lang="ts">
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { usePermissions } from '$lib/infrastructure/rbac/composables/usePermissions.svelte';
	import { PermissionGate, PermissionButton } from '$lib/infrastructure/rbac/components';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { toast } from '$lib/utils/toast';
	import { browser } from '$app/environment';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type { Id } from '$lib/convex';

	// Get user from page data
	const userId = $derived($page.data.user?.userId);
	const sessionId = $derived($page.data.sessionId);

	// Get workspace context from Svelte context (set by root layout)
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const activeWorkspaceId = $derived(() => {
		if (!workspaces) return null;
		return workspaces.activeWorkspaceId ?? null;
	});
	const activeWorkspace = $derived(() => {
		if (!workspaces) return undefined;
		const orgId = activeWorkspaceId();
		return workspaces.workspaces.find((org) => org.workspaceId === orgId);
	});

	// Initialize permissions composable with workspace context
	// Server-side preloaded permissions for instant rendering (pattern #L1390)
	const initialPermissions = $page.data.permissions as
		| Array<{
				permissionSlug: string;
				scope: string;
				roleSlug: string;
				roleName: string;
		  }>
		| undefined;
	const permissions = usePermissions({
		sessionId: () => sessionId ?? null,
		userId: () => (userId ? (userId as Id<'users'>) : null),
		workspaceId: () => {
			const orgId = activeWorkspaceId();
			return orgId ? (orgId as Id<'workspaces'>) : null;
		},
		initialPermissions // Server-side preloaded for instant button visibility
	});

	// Convex client
	const convexClient = browser ? useConvexClient() : null;

	// Progressive disclosure state
	let showPermissionDetails = $state(false);
	let showSetup = $state(false);

	// Test mutation functions
	async function testCreateTeam() {
		const orgId = activeWorkspaceId();
		if (!convexClient || !orgId || !userId) {
			toast.error('Please select an workspace first');
			return;
		}

		const loadingToastId = toast.loading('Creating circle...');
		const sessionId = $page.data.sessionId;
		if (!sessionId) {
			toast.error('Session ID required');
			return;
		}
		try {
			await convexClient.mutation(api.core.circles.index.create, {
				sessionId,
				workspaceId: orgId as Id<'workspaces'>,
				name: `Test Circle ${Math.floor(Math.random() * 1000)}`
			});
			if (loadingToastId !== undefined) {
				toast.success('✅ Circle created successfully', { id: loadingToastId });
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			if (loadingToastId !== undefined) {
				toast.error(`❌ ${message}`, { id: loadingToastId });
			}
		}
	}

	async function testInviteUser() {
		const orgId = activeWorkspaceId();
		if (!convexClient || !orgId || !userId) {
			toast.error('Please select an workspace first');
			return;
		}

		const loadingToastId = toast.loading('Inviting user...');
		const sessionId = $page.data.sessionId;
		if (!sessionId) {
			toast.error('Session ID required');
			return;
		}
		try {
			await convexClient.mutation(api.core.workspaces.index.createWorkspaceInvite, {
				sessionId,
				workspaceId: orgId as Id<'workspaces'>,
				email: `test${Math.floor(Math.random() * 1000)}@example.com`,
				role: 'member'
			});
			if (loadingToastId !== undefined) {
				toast.success('✅ User invited successfully', { id: loadingToastId });
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			if (loadingToastId !== undefined) {
				toast.error(`❌ ${message}`, { id: loadingToastId });
			}
		}
	}

	async function testUpdateProfile() {
		if (!convexClient || !userId) {
			toast.error('User not authenticated');
			return;
		}

		const loadingToastId = toast.loading('Updating profile...');
		const sessionId = $page.data.sessionId;
		if (!sessionId) {
			toast.error('Session ID required');
			return;
		}
		try {
			await convexClient.mutation(api.core.users.index.updateUserProfile, {
				sessionId,
				targetUserId: userId as Id<'users'>,
				firstName: `Test${Math.floor(Math.random() * 100)}`,
				lastName: 'User'
			});
			if (loadingToastId !== undefined) {
				toast.success('✅ Profile updated successfully', { id: loadingToastId });
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			if (loadingToastId !== undefined) {
				toast.error(`❌ ${message}`, { id: loadingToastId });
			}
		}
	}
</script>

<svelte:head>
	<title>Permission System Test | SynergyOS</title>
</svelte:head>

<div class="container-constrained py-1">
	<!-- Page Header with Workspace Context -->
	<header class="mb-section-tight">
		<div class="mb-2 flex items-baseline gap-2">
			<h1 class="text-display-lg text-primary font-semibold">Permission System Test</h1>
			{#if activeWorkspace}
				<span class="text-secondary text-sm">
					for <strong class="text-primary">{activeWorkspace.name}</strong>
				</span>
			{:else}
				<span class="text-danger text-sm"> ⚠️ No workspace selected </span>
			{/if}
		</div>
		<p class="text-body text-secondary max-w-prose">
			Test and verify the RBAC permission system with your current user account
		</p>
	</header>

	<!-- Status Overview Card (Collapsible) -->
	<div
		class="mb-content-section border-base px-card py-card rounded-card bg-surface shadow-card border"
	>
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-display-sm text-primary font-semibold">Current Status</h2>
			<button
				onclick={() => (showPermissionDetails = !showPermissionDetails)}
				class="text-link text-sm hover:underline"
			>
				{showPermissionDetails ? 'Hide' : 'Show'} Details
			</button>
		</div>
		<dl class="space-y-3">
			<div>
				<dt class="text-label text-secondary">User ID</dt>
				<dd class="font-code text-body text-primary">{userId ?? 'Not logged in'}</dd>
			</div>
			<div>
				<dt class="text-label text-secondary">Organization</dt>
				<dd class="text-body text-primary">
					{activeWorkspace()?.name ?? 'None selected'}
					{#if activeWorkspaceId()}
						<span class="font-code text-secondary text-sm">({activeWorkspaceId()})</span>
					{/if}
				</dd>
			</div>
			<div>
				<dt class="text-label text-secondary">Permissions</dt>
				<dd class="text-body text-primary">
					{#if permissions.isLoading}
						Loading...
					{:else if permissions.error}
						<span class="text-danger">Error loading permissions</span>
					{:else}
						{permissions.permissions.length} permissions loaded
					{/if}
				</dd>
			</div>
		</dl>
		{#if showPermissionDetails && permissions.permissions.length > 0}
			<div class="p-card rounded-card border-subtle bg-surface mt-4 border">
				<h3 class="text-label text-secondary mb-2 font-semibold">Your Permissions:</h3>
				<ul class="space-y-1">
					{#each permissions.permissions as permission (permission)}
						<li class="font-code text-primary text-sm">✓ {permission}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>

	<!-- Quick Test Actions -->
	<div class="p-card mb-section-normal border-base rounded-card shadow-card border">
		<h2 class="text-display-sm text-primary mb-4 font-semibold">Quick Test Actions</h2>
		<div class="flex flex-wrap gap-3">
			<PermissionButton
				requires="teams.create"
				{permissions}
				variant="primary"
				onclick={testCreateTeam}
			>
				Create Circle
			</PermissionButton>
			<PermissionButton
				requires="users.invite"
				{permissions}
				variant="primary"
				onclick={testInviteUser}
			>
				Invite User
			</PermissionButton>
			<PermissionButton
				requires="users.manage-profile"
				{permissions}
				variant="primary"
				onclick={testUpdateProfile}
			>
				Update Profile
			</PermissionButton>
			<PermissionButton requires="teams.delete" {permissions} variant="secondary">
				Delete Circle (No action)
			</PermissionButton>
		</div>
		<p class="text-secondary mt-4 text-sm">
			💡 <strong>Tip:</strong> Buttons are automatically disabled if you lack the required permission.
		</p>
	</div>

	<!-- Permission Gates (Conditional Content) -->
	<div class="p-card mb-section-normal border-base rounded-card shadow-card border">
		<h2 class="text-display-sm text-primary mb-4 font-semibold">PermissionGate Component Test</h2>
		<div class="space-y-4">
			<div>
				<h3 class="text-label text-secondary mb-2 font-semibold">Can create teams?</h3>
				<PermissionGate can="teams.create" {permissions}>
					<div class="bg-success-subtle p-card rounded-card text-success">
						✅ You have permission to create teams
					</div>
					{#snippet fallbackSnippet()}
						<div class="bg-warning-subtle p-card rounded-card text-warning">
							❌ You don't have permission to create teams
						</div>
					{/snippet}
				</PermissionGate>
			</div>

			<div>
				<h3 class="text-label text-secondary mb-2 font-semibold">Can delete teams?</h3>
				<PermissionGate can="teams.delete" {permissions}>
					<div class="bg-success-subtle p-card rounded-card text-success">
						✅ You have permission to delete teams
					</div>
					{#snippet fallbackSnippet()}
						<div class="bg-warning-subtle p-card rounded-card text-warning">
							❌ You don't have permission to delete teams
						</div>
					{/snippet}
				</PermissionGate>
			</div>

			<div>
				<h3 class="text-label text-secondary mb-2 font-semibold">Can invite users?</h3>
				<PermissionGate can="users.invite" {permissions}>
					<div class="bg-success-subtle p-card rounded-card text-success">
						✅ You have permission to invite users
					</div>
					{#snippet fallbackSnippet()}
						<div class="bg-warning-subtle p-card rounded-card text-warning">
							❌ You don't have permission to invite users
						</div>
					{/snippet}
				</PermissionGate>
			</div>
		</div>
	</div>

	<!-- Setup Instructions (Collapsible) -->
	<div
		class="space-y-content-section border-base px-card py-card rounded-card bg-surface shadow-card border"
	>
		<div class="flex items-center justify-between">
			<h2 class="text-display-sm text-primary font-semibold">Setup Instructions</h2>
			<button onclick={() => (showSetup = !showSetup)} class="text-link text-sm hover:underline">
				{showSetup ? 'Hide' : 'Show'} Instructions
			</button>
		</div>
		{#if showSetup}
			<div class="prose prose-sm max-w-none">
				<h3 class="text-label text-secondary font-semibold">To test permissions:</h3>
				<ol class="text-secondary list-inside list-decimal space-y-2 text-sm">
					<li>
						Ensure RBAC data is seeded: <code class="rounded-card bg-surface px-1 py-0.5 text-xs"
							>npx convex run rbac/seedRBAC:seedAllRBAC</code
						>
					</li>
					<li>
						Assign yourself the admin role: <code
							class="rounded-card bg-surface px-1 py-0.5 text-xs"
							>npx convex run rbac/setupAdmin:setupAdmin '{'{'}userId:"YOUR_USER_ID"}'</code
						>
					</li>
					<li>Refresh this page to load your permissions</li>
					<li>Try clicking the buttons above to test different permissions</li>
				</ol>
				<p class="text-secondary mt-4 text-sm">
					<strong>Note:</strong> Replace
					<code class="rounded-card bg-surface px-1 py-0.5 text-xs">YOUR_USER_ID</code> with your actual
					user ID shown in "Current Status" above.
				</p>
			</div>
		{/if}
	</div>
</div>
