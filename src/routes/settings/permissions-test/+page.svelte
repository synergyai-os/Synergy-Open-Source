<script lang="ts">
	import { getContext } from 'svelte';
	import { usePermissions } from '$lib/composables/usePermissions.svelte';
	import { PermissionGate, PermissionButton } from '$lib/components/permissions';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { toast } from '$lib/utils/toast';
	import { browser } from '$app/environment';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	// Get user from page data
	const { data } = $props();
	const userId = data.user?.userId;
	const sessionId = data.sessionId;

	// Get workspace context from Svelte context (set by root layout)
	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const activeOrganizationId = $derived(organizations?.activeOrganizationId ?? null);
	const activeOrganization = $derived(
		organizations?.organizations.find((org) => org.organizationId === activeOrganizationId)
	);

	// Initialize permissions composable with workspace context
	const permissions = usePermissions({
		sessionId: () => sessionId as any,
		userId: () => userId as any,
		organizationId: () => activeOrganizationId as any
	});

	// Convex client
	const convexClient = browser ? useConvexClient() : null;

	// Progressive disclosure state
	let showPermissionDetails = $state(false);
	let showSetup = $state(false);

	// Test mutation functions
	async function testCreateTeam() {
		if (!convexClient || !activeOrganizationId || !userId) {
			toast.error('Please select an organization first');
			return;
		}

		const loading = toast.loading('Creating team...');
		try {
			await convexClient.mutation(api.teams.createTeam, {
				organizationId: activeOrganizationId as any,
				name: `Test Team ${Math.floor(Math.random() * 1000)}`,
				userId: userId as any // Temporary: pass explicitly until Convex auth is set up
			});
			toast.success('✅ Team created successfully', { id: loading });
		} catch (error: any) {
			toast.error(`❌ ${error.message}`, { id: loading });
		}
	}

	async function testInviteUser() {
		if (!convexClient || !activeOrganizationId || !userId) {
			toast.error('Please select an organization first');
			return;
		}

		const loading = toast.loading('Inviting user...');
		try {
			await convexClient.mutation(api.organizations.createOrganizationInvite, {
				organizationId: activeOrganizationId as any,
				email: `test${Math.floor(Math.random() * 1000)}@example.com`,
				role: 'member',
				userId: userId as any // Temporary: pass explicitly until Convex auth is set up
			});
			toast.success('✅ User invited successfully', { id: loading });
		} catch (error: any) {
			toast.error(`❌ ${error.message}`, { id: loading });
		}
	}

	async function testUpdateProfile() {
		if (!convexClient || !userId) {
			toast.error('User not authenticated');
			return;
		}

		const loading = toast.loading('Updating profile...');
		try {
			await convexClient.mutation(api.users.updateUserProfile, {
				targetUserId: userId as any,
				firstName: `Test${Math.floor(Math.random() * 100)}`,
				lastName: 'User',
				userId: userId as any // Temporary: pass explicitly until Convex auth is set up
			});
			toast.success('✅ Profile updated successfully', { id: loading });
		} catch (error: any) {
			toast.error(`❌ ${error.message}`, { id: loading });
		}
	}
</script>

<svelte:head>
	<title>Permission System Test | Axon</title>
</svelte:head>

<div class="container-constrained py-section">
	<!-- Page Header with Workspace Context -->
	<header class="mb-section-tight">
		<div class="mb-2 flex items-baseline gap-icon">
			<h1 class="text-display-lg font-semibold text-primary">Permission System Test</h1>
			{#if activeOrganization}
				<span class="text-sm text-secondary">
					for <strong class="text-primary">{activeOrganization.name}</strong>
				</span>
			{:else}
				<span class="text-danger text-sm"> ⚠️ No organization selected </span>
			{/if}
		</div>
		<p class="text-body max-w-prose text-secondary">
			Test and verify the RBAC permission system with your current user account
		</p>
	</header>

	<!-- Status Overview Card (Collapsible) -->
	<div class="card p-card mb-section-normal bg-surface-secondary">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-display-sm font-semibold text-primary">Current Status</h2>
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
				<dd class="text-body font-mono text-primary">{userId ?? 'Not logged in'}</dd>
			</div>
			<div>
				<dt class="text-label text-secondary">Organization</dt>
				<dd class="text-body text-primary">
					{activeOrganization?.name ?? 'None selected'}
					{#if activeOrganizationId}
						<span class="font-mono text-sm text-secondary">({activeOrganizationId})</span>
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
			<div class="border-subtle mt-4 rounded-md border bg-surface p-3">
				<h3 class="mb-2 text-label font-semibold text-secondary">Your Permissions:</h3>
				<ul class="space-y-1">
					{#each permissions.permissions as permission (permission)}
						<li class="font-mono text-sm text-primary">✓ {permission}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>

	<!-- Quick Test Actions -->
	<div class="card p-card mb-section-normal">
		<h2 class="text-display-sm mb-4 font-semibold text-primary">Quick Test Actions</h2>
		<div class="flex flex-wrap gap-3">
			<PermissionButton
				requires="teams.create"
				{permissions}
				onclick={testCreateTeam}
				class="btn-primary"
			>
				Create Team
			</PermissionButton>
			<PermissionButton
				requires="users.invite"
				{permissions}
				onclick={testInviteUser}
				class="btn-primary"
			>
				Invite User
			</PermissionButton>
			<PermissionButton
				requires="users.manage-profile"
				{permissions}
				onclick={testUpdateProfile}
				class="btn-primary"
			>
				Update Profile
			</PermissionButton>
			<PermissionButton requires="teams.delete" {permissions} class="btn-secondary">
				Delete Team (No action)
			</PermissionButton>
		</div>
		<p class="mt-4 text-sm text-secondary">
			💡 <strong>Tip:</strong> Buttons are automatically disabled if you lack the required permission.
		</p>
	</div>

	<!-- Permission Gates (Conditional Content) -->
	<div class="card p-card mb-section-normal">
		<h2 class="text-display-sm mb-4 font-semibold text-primary">PermissionGate Component Test</h2>
		<div class="space-y-4">
			<div>
				<h3 class="mb-2 text-label font-semibold text-secondary">Can create teams?</h3>
				<PermissionGate can="teams.create" {permissions}>
					<div class="bg-success-subtle text-success rounded-md p-3">
						✅ You have permission to create teams
					</div>
					{#snippet fallbackSnippet()}
						<div class="bg-warning-subtle text-warning rounded-md p-3">
							❌ You don't have permission to create teams
						</div>
					{/snippet}
				</PermissionGate>
			</div>

			<div>
				<h3 class="mb-2 text-label font-semibold text-secondary">Can delete teams?</h3>
				<PermissionGate can="teams.delete" {permissions}>
					<div class="bg-success-subtle text-success rounded-md p-3">
						✅ You have permission to delete teams
					</div>
					{#snippet fallbackSnippet()}
						<div class="bg-warning-subtle text-warning rounded-md p-3">
							❌ You don't have permission to delete teams
						</div>
					{/snippet}
				</PermissionGate>
			</div>

			<div>
				<h3 class="mb-2 text-label font-semibold text-secondary">Can invite users?</h3>
				<PermissionGate can="users.invite" {permissions}>
					<div class="bg-success-subtle text-success rounded-md p-3">
						✅ You have permission to invite users
					</div>
					{#snippet fallbackSnippet()}
						<div class="bg-warning-subtle text-warning rounded-md p-3">
							❌ You don't have permission to invite users
						</div>
					{/snippet}
				</PermissionGate>
			</div>
		</div>
	</div>

	<!-- Setup Instructions (Collapsible) -->
	<div class="card p-card bg-surface-secondary space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-display-sm font-semibold text-primary">Setup Instructions</h2>
			<button onclick={() => (showSetup = !showSetup)} class="text-link text-sm hover:underline">
				{showSetup ? 'Hide' : 'Show'} Instructions
			</button>
		</div>
		{#if showSetup}
			<div class="prose prose-sm max-w-none">
				<h3 class="text-label font-semibold text-secondary">To test permissions:</h3>
				<ol class="list-inside list-decimal space-y-2 text-sm text-secondary">
					<li>
						Ensure RBAC data is seeded: <code class="rounded bg-surface px-1 py-0.5 text-xs"
							>npx convex run rbac/seedRBAC:seedAllRBAC</code
						>
					</li>
					<li>
						Assign yourself the admin role: <code class="rounded bg-surface px-1 py-0.5 text-xs"
							>npx convex run rbac/setupAdmin:setupAdmin '{'{'}userId:"YOUR_USER_ID"}'</code
						>
					</li>
					<li>Refresh this page to load your permissions</li>
					<li>Try clicking the buttons above to test different permissions</li>
				</ol>
				<p class="mt-4 text-sm text-secondary">
					<strong>Note:</strong> Replace
					<code class="rounded bg-surface px-1 py-0.5 text-xs">YOUR_USER_ID</code> with your actual user
					ID shown in "Current Status" above.
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.btn-primary {
		@apply bg-primary text-on-primary hover:bg-primary-hover rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50;
	}

	.btn-secondary {
		@apply bg-secondary text-on-secondary hover:bg-secondary-hover rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
