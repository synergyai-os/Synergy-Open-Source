<script lang="ts">
	import { page } from '$app/stores';
	import { usePermissions } from '$lib/composables/usePermissions.svelte';
	import { PermissionGate, PermissionButton } from '$lib/components/permissions';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { toast } from '$lib/utils/toast';
	import { browser } from '$app/environment';

	// Get user from page data
	const { data } = $props();
	const userId = data.user?.userId;

	// Initialize permissions composable
	const permissions = usePermissions({
		userId: () => userId,
	});

	// Get current organization/team (if any)
	const activeOrgId = $derived(data.user?.activeWorkspace?.id);
	const convexClient = browser ? useConvexClient() : null;

	// Test mutation results
	let testResults = $state<Array<{ action: string; status: 'success' | 'error'; message: string }>>([]);

	function addResult(action: string, status: 'success' | 'error', message: string) {
		testResults = [{ action, status, message }, ...testResults];
	}

	async function testCreateTeam() {
		if (!convexClient || !activeOrgId) {
			addResult('Create Team', 'error', 'No active organization');
			return;
		}

		try {
			await convexClient.mutation(api.teams.createTeam, {
				organizationId: activeOrgId as any,
				name: `Test Team ${Date.now()}`,
			});
			addResult('Create Team', 'success', 'Team created successfully');
			toast.success('Test team created!');
		} catch (error: any) {
			addResult('Create Team', 'error', error.message);
			toast.error(error.message);
		}
	}

	async function testInviteUser() {
		if (!convexClient || !activeOrgId) {
			addResult('Invite User', 'error', 'No active organization');
			return;
		}

		try {
			await convexClient.mutation(api.organizations.createOrganizationInvite, {
				organizationId: activeOrgId as any,
				email: `test-${Date.now()}@example.com`,
				role: 'member',
			});
			addResult('Invite User', 'success', 'Invite created successfully');
			toast.success('Test invite created!');
		} catch (error: any) {
			addResult('Invite User', 'error', error.message);
			toast.error(error.message);
		}
	}

	async function testUpdateProfile() {
		if (!convexClient || !userId) {
			addResult('Update Profile', 'error', 'No user ID');
			return;
		}

		try {
			await convexClient.mutation(api.users.updateUserProfile, {
				userId: userId as any,
				firstName: 'Test',
				lastName: 'User',
			});
			addResult('Update Profile', 'success', 'Profile updated successfully');
			toast.success('Profile updated!');
		} catch (error: any) {
			addResult('Update Profile', 'error', error.message);
			toast.error(error.message);
		}
	}
</script>

<div class="min-h-screen bg-base p-container">
	<div class="max-w-4xl mx-auto space-y-section">
		<!-- Header -->
		<div class="space-y-2">
			<h1 class="text-display-lg font-semibold text-primary">
				Permission System Test
			</h1>
			<p class="text-body text-secondary">
				Visual testing page for the RBAC permission system
			</p>
		</div>

		<!-- User Info -->
		<div class="card p-card space-y-4">
			<h2 class="text-display-sm font-semibold text-primary">
				Current User
			</h2>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-label text-tertiary">User ID</p>
					<p class="text-body text-primary font-mono text-sm">{userId || 'Not logged in'}</p>
				</div>
				<div>
					<p class="text-label text-tertiary">Organization</p>
					<p class="text-body text-primary">{activeOrgId || 'None'}</p>
				</div>
			</div>
		</div>

		<!-- Permissions Status -->
		<div class="card p-card space-y-4">
			<h2 class="text-display-sm font-semibold text-primary">
				Your Permissions
			</h2>

			{#if permissions.isLoading}
				<p class="text-body text-secondary">Loading permissions...</p>
			{:else if permissions.error}
				<p class="text-body text-danger">Error loading permissions: {String(permissions.error)}</p>
			{:else if permissions.permissions.length === 0}
				<p class="text-body text-secondary">No permissions found. Please run seed script and assign admin role.</p>
			{:else}
				<div class="space-y-2">
					<p class="text-body text-secondary">
						You have <strong>{permissions.permissions.length}</strong> permissions from your roles:
					</p>
					<div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
						{#each permissions.permissions as perm}
							<div class="flex items-center justify-between p-3 bg-surface-secondary rounded-md">
								<div class="flex items-center gap-2">
									<span class="text-body text-primary font-mono text-sm">{perm.permissionSlug}</span>
									<span class="text-label px-2 py-1 rounded-full {
										perm.scope === 'all' ? 'bg-success/10 text-success' :
										perm.scope === 'own' ? 'bg-warning/10 text-warning' :
										'bg-tertiary/10 text-tertiary'
									}">
										{perm.scope}
									</span>
								</div>
								<span class="text-label text-tertiary">{perm.roleName}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Permission Gates Test -->
		<div class="card p-card space-y-4">
			<h2 class="text-display-sm font-semibold text-primary">
				PermissionGate Component Test
			</h2>
			<p class="text-body text-secondary">
				Content below shows/hides based on your permissions
			</p>

			<div class="space-y-4">
				<PermissionGate can="teams.create" {permissions}>
					<div class="p-4 bg-success/10 border border-success/20 rounded-md">
						<p class="text-body text-success font-semibold">✅ You can create teams</p>
						<p class="text-sm text-success/80">This content is visible because you have "teams.create" permission</p>
					</div>
					{#snippet fallback()}
						<div class="p-4 bg-danger/10 border border-danger/20 rounded-md">
							<p class="text-body text-danger font-semibold">❌ You cannot create teams</p>
							<p class="text-sm text-danger/80">Missing "teams.create" permission</p>
						</div>
					{/snippet}
				</PermissionGate>

				<PermissionGate can="users.remove" {permissions}>
					<div class="p-4 bg-success/10 border border-success/20 rounded-md">
						<p class="text-body text-success font-semibold">✅ You can remove users</p>
						<p class="text-sm text-success/80">This content is visible because you have "users.remove" permission</p>
					</div>
					{#snippet fallback()}
						<div class="p-4 bg-danger/10 border border-danger/20 rounded-md">
							<p class="text-body text-danger font-semibold">❌ You cannot remove users</p>
							<p class="text-sm text-danger/80">Missing "users.remove" permission</p>
						</div>
					{/snippet}
				</PermissionGate>

				<PermissionGate can="organizations.manage-billing" {permissions}>
					<div class="p-4 bg-success/10 border border-success/20 rounded-md">
						<p class="text-body text-success font-semibold">✅ You can manage billing</p>
						<p class="text-sm text-success/80">This content is visible because you have "organizations.manage-billing" permission</p>
					</div>
					{#snippet fallback()}
						<div class="p-4 bg-danger/10 border border-danger/20 rounded-md">
							<p class="text-body text-danger font-semibold">❌ You cannot manage billing</p>
							<p class="text-sm text-danger/80">Missing "organizations.manage-billing" permission</p>
						</div>
					{/snippet}
				</PermissionGate>
			</div>
		</div>

		<!-- Permission Buttons Test -->
		<div class="card p-card space-y-4">
			<h2 class="text-display-sm font-semibold text-primary">
				PermissionButton Component Test
			</h2>
			<p class="text-body text-secondary">
				Buttons below enable/disable based on your permissions
			</p>

			<div class="flex flex-wrap gap-3">
				<PermissionButton
					requires="teams.create"
					{permissions}
					class="btn-primary"
					tooltip="You need 'teams.create' permission"
				>
					Create Team
				</PermissionButton>

				<PermissionButton
					requires="users.invite"
					{permissions}
					class="btn-secondary"
					tooltip="You need 'users.invite' permission"
				>
					Invite User
				</PermissionButton>

				<PermissionButton
					requires="users.remove"
					{permissions}
					class="btn-danger"
					tooltip="You need 'users.remove' permission"
				>
					Remove User
				</PermissionButton>

				<PermissionButton
					requires="organizations.manage-billing"
					{permissions}
					class="btn-secondary"
					tooltip="You need 'organizations.manage-billing' permission"
				>
					Manage Billing
				</PermissionButton>
			</div>
		</div>

		<!-- Test Operations -->
		<div class="card p-card space-y-4">
			<h2 class="text-display-sm font-semibold text-primary">
				Test Operations
			</h2>
			<p class="text-body text-secondary">
				Click buttons to test actual backend operations with permission checks
			</p>

			<div class="flex flex-wrap gap-3">
				<button
					onclick={testCreateTeam}
					class="btn-primary"
				>
					Test: Create Team
				</button>

				<button
					onclick={testInviteUser}
					class="btn-secondary"
				>
					Test: Invite User
				</button>

				<button
					onclick={testUpdateProfile}
					class="btn-secondary"
				>
					Test: Update Profile
				</button>
			</div>

			<!-- Test Results -->
			{#if testResults.length > 0}
				<div class="space-y-2 max-h-64 overflow-y-auto">
					<h3 class="text-body font-semibold text-primary">Test Results</h3>
					{#each testResults as result}
						<div class="p-3 rounded-md {
							result.status === 'success' ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'
						}">
							<p class="text-sm font-semibold {
								result.status === 'success' ? 'text-success' : 'text-danger'
							}">
								{result.status === 'success' ? '✅' : '❌'} {result.action}
							</p>
							<p class="text-sm {
								result.status === 'success' ? 'text-success/80' : 'text-danger/80'
							}">
								{result.message}
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Help Section -->
		<div class="card p-card space-y-4 bg-surface-secondary">
			<h2 class="text-display-sm font-semibold text-primary">
				Setup Instructions
			</h2>
			<div class="space-y-3 text-sm">
				<div>
					<p class="font-semibold text-primary">1. Seed RBAC Data</p>
					<pre class="mt-1 p-2 bg-base rounded text-xs overflow-x-auto"><code>npx convex run rbac/seedRBAC:seedRBAC</code></pre>
				</div>
				<div>
					<p class="font-semibold text-primary">2. Assign Admin Role</p>
					<pre class="mt-1 p-2 bg-base rounded text-xs overflow-x-auto"><code>npx convex run rbac/setupAdmin:setupAdmin '{"{"}userId:"{userId}"{"}}'</code></pre>
				</div>
				<div>
					<p class="font-semibold text-primary">3. Verify Setup</p>
					<pre class="mt-1 p-2 bg-base rounded text-xs overflow-x-auto"><code>npx convex run rbac/setupAdmin:verifyAdminSetup '{"{"}userId:"{userId}"{"}}'</code></pre>
				</div>
			</div>
		</div>
	</div>
</div>

