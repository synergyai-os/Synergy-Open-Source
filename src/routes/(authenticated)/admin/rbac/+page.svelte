<script lang="ts">
	import type { PageData } from './$types';
	import { Badge, Tabs, Button, FormInput, FormTextarea } from '$lib/components/atoms';
	import { ToggleSwitch } from '$lib/components/molecules';
	import { browser } from '$app/environment';
	import { Dialog } from 'bits-ui';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';

	let { data }: { data: PageData } = $props();

	const convexClient = useConvexClient();
	const sessionId = $derived(data.sessionId);

	// Tab state
	let activeTab = $state('roles');

	// Search state
	let rolesSearch = $state('');
	let permissionsSearch = $state('');

	// Filter state
	let roleTypeFilter = $state<'all' | 'system' | 'custom'>('all');

	// Modal state
	let roleDetailModalOpen = $state(false);
	let selectedRole: (typeof roles)[number] | null = $state(null);

	// Guidance card state
	let guidanceDismissed = $state(false);
	if (browser) {
		guidanceDismissed = localStorage.getItem('rbac-guidance-dismissed') === 'true';
	}

	// Modal state
	let createPermissionModalOpen = $state(false);
	let createRoleModalOpen = $state(false);
	let assignRoleModalOpen = $state(false);
	let assignPermissionModalOpen = $state(false);

	// Create Permission form state
	let permSlug = $state('');
	let permCategory = $state('');
	let permAction = $state('');
	let permDescription = $state('');
	let permRequiresResource = $state(false);
	let createPermissionLoading = $state(false);
	let createPermissionError = $state<string | null>(null);

	// Create Role form state
	let roleSlug = $state('');
	let roleName = $state('');
	let roleDescription = $state('');
	let createRoleLoading = $state(false);
	let createRoleError = $state<string | null>(null);

	// Assign Role form state
	let assignUserId = $state<string>('');
	let assignRoleId = $state<string>('');
	let assignRoleLoading = $state(false);
	let assignRoleError = $state<string | null>(null);

	// Assign Permission form state
	let assignPermRoleId = $state<string>('');
	let assignPermPermissionId = $state<string>('');
	let assignPermScope = $state<'all' | 'own' | 'none'>('all');
	let assignPermissionLoading = $state(false);
	let assignPermissionError = $state<string | null>(null);

	// Role detail state
	let rolePermissions: Array<{
		permissionId: string;
		slug: string;
		category: string;
		action: string;
		description: string;
		scope: 'all' | 'own' | 'none';
	}> = $state([]);
	let loadingRolePermissions = $state(false);

	const allUsers = $derived(
		(data.allUsers || []) as Array<{ _id: string; email: string; name: string | null }>
	);

	// Flatten permissions for easier access
	const allPermissionsFlat = $derived.by(() => {
		if (!data.permissions) return [];
		const perms = data.permissions as Record<string, unknown[]>;
		const flat: Array<{
			_id: string;
			slug: string;
			category: string;
			action: string;
			description: string;
		}> = [];
		for (const categoryPerms of Object.values(perms)) {
			for (const perm of categoryPerms) {
				flat.push(perm as (typeof flat)[number]);
			}
		}
		return flat;
	});

	async function loadRolePermissions(roleId: string) {
		if (!convexClient || !sessionId) return;
		loadingRolePermissions = true;
		try {
			const result = await convexClient.query(api.admin.rbac.getRolePermissions, {
				sessionId,
				roleId: roleId as Id<'roles'>
			});
			rolePermissions = (result || []) as typeof rolePermissions;
		} catch (error) {
			console.error('Failed to load role permissions:', error);
		} finally {
			loadingRolePermissions = false;
		}
	}

	async function createPermission() {
		if (!convexClient || !sessionId) {
			createPermissionError = 'Not authenticated';
			return;
		}

		if (!permSlug.trim() || !permCategory.trim() || !permAction.trim() || !permDescription.trim()) {
			createPermissionError = 'All fields are required';
			return;
		}

		createPermissionLoading = true;
		createPermissionError = null;

		try {
			await convexClient.mutation(api.admin.rbac.createPermission, {
				sessionId,
				slug: permSlug.trim(),
				category: permCategory.trim(),
				action: permAction.trim(),
				description: permDescription.trim(),
				requiresResource: permRequiresResource
			});

			// Reset form
			permSlug = '';
			permCategory = '';
			permAction = '';
			permDescription = '';
			permRequiresResource = false;
			createPermissionModalOpen = false;

			// Reload page
			window.location.reload();
		} catch (error) {
			createPermissionError =
				error instanceof Error ? error.message : 'Failed to create permission';
		} finally {
			createPermissionLoading = false;
		}
	}

	async function createRole() {
		if (!convexClient || !sessionId) {
			createRoleError = 'Not authenticated';
			return;
		}

		if (!roleSlug.trim() || !roleName.trim() || !roleDescription.trim()) {
			createRoleError = 'All fields are required';
			return;
		}

		createRoleLoading = true;
		createRoleError = null;

		try {
			await convexClient.mutation(api.admin.rbac.createRole, {
				sessionId,
				slug: roleSlug.trim(),
				name: roleName.trim(),
				description: roleDescription.trim()
			});

			// Reset form
			roleSlug = '';
			roleName = '';
			roleDescription = '';
			createRoleModalOpen = false;

			// Reload page
			window.location.reload();
		} catch (error) {
			createRoleError = error instanceof Error ? error.message : 'Failed to create role';
		} finally {
			createRoleLoading = false;
		}
	}

	async function assignRoleToUser() {
		if (!convexClient || !sessionId) {
			assignRoleError = 'Not authenticated';
			return;
		}

		if (!assignUserId || !assignRoleId) {
			assignRoleError = 'Please select a user and role';
			return;
		}

		assignRoleLoading = true;
		assignRoleError = null;

		try {
			await convexClient.mutation(api.admin.rbac.assignRoleToUser, {
				sessionId,
				userId: assignUserId as Id<'users'>,
				roleId: assignRoleId as Id<'roles'>
			});

			// Reset form
			assignUserId = '';
			assignRoleId = '';
			assignRoleModalOpen = false;

			// Reload page
			window.location.reload();
		} catch (error) {
			assignRoleError = error instanceof Error ? error.message : 'Failed to assign role';
		} finally {
			assignRoleLoading = false;
		}
	}

	async function assignPermissionToRole() {
		if (!convexClient || !sessionId) {
			assignPermissionError = 'Not authenticated';
			return;
		}

		if (!assignPermRoleId || !assignPermPermissionId) {
			assignPermissionError = 'Please select a role and permission';
			return;
		}

		assignPermissionLoading = true;
		assignPermissionError = null;

		try {
			await convexClient.mutation(api.admin.rbac.assignPermissionToRole, {
				sessionId,
				roleId: assignPermRoleId as Id<'roles'>,
				permissionId: assignPermPermissionId as Id<'permissions'>,
				scope: assignPermScope
			});

			// Reload role permissions if viewing that role
			if (selectedRole && selectedRole._id === assignPermRoleId) {
				await loadRolePermissions(assignPermRoleId);
			}

			// Reset form
			assignPermRoleId = '';
			assignPermPermissionId = '';
			assignPermScope = 'all';
			assignPermissionModalOpen = false;
		} catch (error) {
			assignPermissionError =
				error instanceof Error ? error.message : 'Failed to assign permission';
		} finally {
			assignPermissionLoading = false;
		}
	}

	async function removePermissionFromRole(roleId: string, permissionId: string) {
		if (!convexClient || !sessionId) return;

		if (!confirm('Remove this permission from the role?')) return;

		try {
			await convexClient.mutation(api.admin.rbac.removePermissionFromRole, {
				sessionId,
				roleId: roleId as Id<'roles'>,
				permissionId: permissionId as Id<'permissions'>
			});

			// Reload role permissions if viewing that role
			if (selectedRole && selectedRole._id === roleId) {
				await loadRolePermissions(roleId);
			}

			// Reload page to update permission counts
			window.location.reload();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to remove permission');
		}
	}

	function showRoleDetails(role: (typeof roles)[number]) {
		selectedRole = role;
		roleDetailModalOpen = true;
		loadRolePermissions(role._id);
	}

	// Derived data
	const roles = $derived(
		(data.roles || []) as Array<{
			_id: string;
			slug: string;
			name: string;
			description: string;
			isSystem: boolean;
			permissionCount: number;
		}>
	);

	const permissions = $derived((data.permissions || {}) as Record<string, unknown[]>);

	const analytics = $derived(
		(data.analytics || null) as {
			overview: {
				totalRoles: number;
				totalPermissions: number;
				totalAssignments: number;
				activeAssignments: number;
				revokedAssignments: number;
			};
			roleDistribution: Array<{
				slug: string;
				roleName: string;
				count: number;
				scopes: { global: number; org: number; team: number };
			}>;
			mostAssignedRoles: Array<{
				slug: string;
				roleName: string;
				count: number;
				scopes: { global: number; org: number; team: number };
			}>;
			scopeBreakdown: {
				global: number;
				organization: number;
				team: number;
			};
			mostUsedPermissions: Array<{ slug: string; count: number }>;
			systemLevel: {
				assignments: number;
				users: number;
			};
			health: {
				rolesWithNoAssignments: number;
				rolesWithNoPermissions: number;
				unusedRoles: Array<{ _id: string; slug: string; name: string }>;
			};
		} | null
	);

	// Filtered roles
	const filteredRoles = $derived.by(() => {
		let result = roles;

		// Apply search filter
		if (rolesSearch.trim()) {
			const searchLower = rolesSearch.toLowerCase();
			result = result.filter(
				(role) =>
					role.name.toLowerCase().includes(searchLower) ||
					role.slug.toLowerCase().includes(searchLower) ||
					role.description.toLowerCase().includes(searchLower)
			);
		}

		// Apply type filter
		if (roleTypeFilter === 'system') {
			result = result.filter((role) => role.isSystem);
		} else if (roleTypeFilter === 'custom') {
			result = result.filter((role) => !role.isSystem);
		}

		return result;
	});

	// Grouped roles
	const systemRoles = $derived(filteredRoles.filter((r) => r.isSystem));
	const customRoles = $derived(filteredRoles.filter((r) => !r.isSystem));

	// Filtered permissions
	const filteredPermissions = $derived.by(() => {
		if (!permissionsSearch.trim()) {
			return permissions;
		}

		const searchLower = permissionsSearch.toLowerCase();
		const filtered: Record<string, unknown[]> = {};

		for (const [category, perms] of Object.entries(permissions)) {
			const matchingPerms = perms.filter(
				(perm) =>
					((perm as { slug: string }).slug || '').toLowerCase().includes(searchLower) ||
					((perm as { description: string }).description || '').toLowerCase().includes(searchLower)
			);

			if (matchingPerms.length > 0) {
				filtered[category] = matchingPerms;
			}
		}

		return filtered;
	});

	// Permission categories count
	const permissionCategories = $derived(Object.keys(filteredPermissions).length);

	const totalPermissions = $derived(
		Object.values(filteredPermissions).reduce((sum, perms) => sum + perms.length, 0)
	);

	// Overview stats
	const totalRoles = $derived(roles.length);
	const systemRolesCount = $derived(roles.filter((r) => r.isSystem).length);
	const customRolesCount = $derived(roles.filter((r) => !r.isSystem).length);
	const activeAssignments = $derived(analytics?.overview.activeAssignments ?? 0);

	function dismissGuidance() {
		guidanceDismissed = true;
		if (browser) {
			localStorage.setItem('rbac-guidance-dismissed', 'true');
		}
	}
</script>

<svelte:head>
	<title>RBAC Management - Admin - SynergyOS</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<header
		class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"
	>
		<div>
			<h1 class="text-h2 font-bold text-primary">RBAC Management</h1>
			<p class="mt-form-field-gap text-small text-secondary">
				Manage roles, permissions, and user-role assignments
			</p>
		</div>
		<div class="flex items-center gap-icon">
			<Button variant="primary" onclick={() => console.log('Create Role')}>Create Role</Button>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		<!-- Overview Cards -->
		<div class="mb-content-padding grid grid-cols-1 gap-content-section md:grid-cols-3">
			<button
				type="button"
				onclick={() => {
					activeTab = 'roles';
					roleTypeFilter = 'all';
				}}
				class="rounded-card border border-base bg-surface px-card py-card text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-label text-tertiary">Total Roles</p>
				<p class="mt-form-field-gap text-h2 font-semibold text-primary">{totalRoles}</p>
				<p class="mt-form-field-gap text-label text-secondary">
					{systemRolesCount} system, {customRolesCount} custom
				</p>
			</button>

			<button
				type="button"
				onclick={() => {
					activeTab = 'permissions';
				}}
				class="rounded-card border border-base bg-surface px-card py-card text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-label text-tertiary">Total Permissions</p>
				<p class="mt-form-field-gap text-h2 font-semibold text-primary">{totalPermissions}</p>
				<p class="mt-form-field-gap text-label text-secondary">
					{permissionCategories} categories
				</p>
			</button>

			<button
				type="button"
				onclick={() => {
					activeTab = 'assignments';
				}}
				class="rounded-card border border-base bg-surface px-card py-card text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-label text-tertiary">Active Assignments</p>
				<p class="mt-form-field-gap text-h2 font-semibold text-primary">{activeAssignments}</p>
				<p class="mt-form-field-gap text-label text-secondary">User-role assignments</p>
			</button>
		</div>

		<!-- Quick Actions Bar -->
		<div
			class="mb-content-padding flex flex-wrap items-center gap-icon rounded-card border border-base bg-surface px-card py-card"
		>
			<Button variant="primary" onclick={() => (createRoleModalOpen = true)}>Create Role</Button>
			<Button variant="secondary" onclick={() => (createPermissionModalOpen = true)}>
				Create Permission
			</Button>
			<Button variant="secondary" onclick={() => (assignRoleModalOpen = true)}>
				Assign Role to User
			</Button>
			<a
				href="/dev-docs/2-areas/rbac/RBAC-SUMMARY"
				target="_blank"
				class="ml-auto text-small text-secondary hover:text-primary hover:underline"
			>
				View Documentation →
			</a>
		</div>

		<!-- Guidance Card -->
		{#if !guidanceDismissed}
			<div
				class="mb-content-padding rounded-card border border-accent-primary/20 bg-accent-primary/5 px-card py-card"
			>
				<div class="flex items-start justify-between gap-content-section">
					<div class="flex-1">
						<h3 class="mb-content-section text-small font-semibold text-primary">What is RBAC?</h3>
						<p class="mb-content-section text-small text-secondary">
							Roles define what users can do in SynergyOS. Each role has permissions that grant
							access to specific features.
						</p>
						<div class="text-small text-secondary">
							<p class="mb-form-field-gap font-medium">Common Tasks:</p>
							<ul class="ml-content-section list-disc space-y-form-field-gap">
								<li>Create custom roles for your organization</li>
								<li>Assign roles to users to grant permissions</li>
								<li>View permissions to understand what each role can do</li>
							</ul>
						</div>
					</div>
					<button
						type="button"
						onclick={dismissGuidance}
						class="flex-shrink-0 text-tertiary hover:text-primary"
						aria-label="Dismiss guidance"
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
			</div>
		{/if}

		<!-- Tabs -->
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List class="flex size-tab rounded-tab-container border-b border-border-base">
				<Tabs.Trigger
					value="roles"
					class="border-b-2 border-transparent px-form-section py-header text-button font-medium text-text-secondary transition-colors hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary"
				>
					Roles ({roles.length})
				</Tabs.Trigger>
				<Tabs.Trigger
					value="permissions"
					class="border-b-2 border-transparent px-form-section py-header text-button font-medium text-text-secondary transition-colors hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary"
				>
					Permissions ({totalPermissions})
				</Tabs.Trigger>
				<Tabs.Trigger
					value="analytics"
					class="border-b-2 border-transparent px-form-section py-header text-button font-medium text-text-secondary transition-colors hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary"
				>
					Analytics
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Roles Tab -->
			<Tabs.Content value="roles">
				<div class="flex flex-col gap-settings-section">
					<!-- Search and Filter Bar -->
					<div class="flex items-center gap-icon">
						<div class="flex-1">
							<FormInput
								placeholder="Search roles by name, slug, or description..."
								bind:value={rolesSearch}
								class="w-full"
							/>
						</div>
						<select
							bind:value={roleTypeFilter}
							class="rounded-input border border-base bg-input px-input-x py-input-y text-small text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
						>
							<option value="all">All Types</option>
							<option value="system">System</option>
							<option value="custom">Custom</option>
						</select>
					</div>

					<!-- Roles Display -->
					{#if filteredRoles.length === 0}
						<div class="flex flex-col items-center justify-center py-readable-quote text-center">
							<p class="mb-content-section text-h3 font-medium text-secondary">
								{rolesSearch.trim() || roleTypeFilter !== 'all'
									? 'No roles match your filters'
									: 'No roles yet'}
							</p>
							<p class="text-small text-tertiary">
								{rolesSearch.trim() || roleTypeFilter !== 'all'
									? 'Try adjusting your search or filter criteria'
									: 'Create your first role to get started'}
							</p>
						</div>
					{:else}
						<!-- System Roles -->
						{#if systemRoles.length > 0 && (roleTypeFilter === 'all' || roleTypeFilter === 'system')}
							<div class="flex flex-col gap-content-section">
								<div class="flex items-center justify-between">
									<h2 class="text-h3 font-semibold text-primary">
										System Roles ({systemRoles.length})
									</h2>
									<p class="text-small text-secondary">Built-in roles that cannot be modified</p>
								</div>
								<div class="grid grid-cols-1 gap-content-section md:grid-cols-2 lg:grid-cols-3">
									{#each systemRoles as role (role._id)}
										<div
											class="group flex flex-col gap-content-section rounded-card border border-base bg-surface px-card py-card transition-colors hover:border-accent-primary hover:bg-hover-solid"
										>
											<div class="flex items-start justify-between">
												<div class="flex-1">
													<h3 class="font-semibold text-primary">{role.name}</h3>
													<p class="mt-form-field-gap font-code text-label text-tertiary">
														{role.slug}
													</p>
												</div>
												<Badge variant="system">System</Badge>
											</div>
											<p class="line-clamp-2 text-small text-secondary">{role.description}</p>
											<div class="flex items-center justify-between">
												<span class="text-label text-tertiary">
													{role.permissionCount} permission{role.permissionCount !== 1 ? 's' : ''}
												</span>
												<button
													type="button"
													onclick={() => showRoleDetails(role)}
													class="text-label text-accent-primary hover:underline"
												>
													View Details
												</button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Custom Roles -->
						{#if customRoles.length > 0 && (roleTypeFilter === 'all' || roleTypeFilter === 'custom')}
							<div class="flex flex-col gap-content-section">
								<div class="flex items-center justify-between">
									<h2 class="text-h3 font-semibold text-primary">
										Custom Roles ({customRoles.length})
									</h2>
									<p class="text-small text-secondary">Roles created for your organization</p>
								</div>
								<div class="grid grid-cols-1 gap-content-section md:grid-cols-2 lg:grid-cols-3">
									{#each customRoles as role (role._id)}
										<div
											class="group flex flex-col gap-content-section rounded-card border border-base bg-surface px-card py-card transition-colors hover:border-accent-primary hover:bg-hover-solid"
										>
											<div class="flex items-start justify-between">
												<div class="flex-1">
													<h3 class="font-semibold text-primary">{role.name}</h3>
													<p class="mt-form-field-gap font-code text-label text-tertiary">
														{role.slug}
													</p>
												</div>
												<Badge variant="custom">Custom</Badge>
											</div>
											<p class="line-clamp-2 text-small text-secondary">{role.description}</p>
											<div class="flex items-center justify-between">
												<span class="text-label text-tertiary">
													{role.permissionCount} permission{role.permissionCount !== 1 ? 's' : ''}
												</span>
												<div class="flex items-center gap-icon">
													<button
														type="button"
														onclick={() => showRoleDetails(role)}
														class="text-label text-accent-primary hover:underline"
													>
														View
													</button>
													<button
														type="button"
														onclick={() => console.log('Edit', role)}
														class="text-label text-secondary hover:text-primary hover:underline"
													>
														Edit
													</button>
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</Tabs.Content>

			<!-- Permissions Tab -->
			<Tabs.Content value="permissions">
				<div class="flex flex-col gap-content-section">
					<!-- Search Bar -->
					<div>
						<FormInput
							placeholder="Search permissions by slug or description..."
							bind:value={permissionsSearch}
							class="w-full"
						/>
					</div>

					<!-- Permissions by Category -->
					{#if permissionCategories === 0}
						<div class="flex flex-col items-center justify-center py-readable-quote text-center">
							<p class="mb-content-section text-h3 font-medium text-secondary">
								No permissions match your search
							</p>
							<p class="text-small text-tertiary">Try adjusting your search criteria</p>
						</div>
					{:else}
						<div class="flex flex-col gap-settings-section">
							{#each Object.entries(filteredPermissions) as [category, perms] (category)}
								<div class="rounded-card border border-base bg-surface px-card py-card">
									<div class="mb-content-section flex items-center justify-between">
										<h3 class="text-h3 font-semibold text-primary">{category}</h3>
										<Badge variant="default">{perms.length}</Badge>
									</div>
									<div class="grid grid-cols-1 gap-icon md:grid-cols-2 lg:grid-cols-3">
										{#each perms as perm, index (index)}
											<div
												class="rounded-button border border-base bg-elevated px-card py-card transition-colors hover:bg-hover-solid"
											>
												<p class="font-code text-label text-tertiary">
													{(perm as { slug: string }).slug}
												</p>
												<p class="mt-form-field-gap text-small text-secondary">
													{(perm as { description: string }).description}
												</p>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</Tabs.Content>

			<!-- RBAC Analytics Tab -->
			<Tabs.Content value="analytics">
				<div class="flex flex-col gap-settings-section">
					{#if !analytics}
						<div class="flex flex-col items-center justify-center py-readable-quote text-center">
							<p class="mb-content-section text-h3 font-medium text-secondary">
								Loading analytics...
							</p>
						</div>
					{:else}
						<!-- Overview Stats -->
						<div class="grid grid-cols-1 gap-content-section md:grid-cols-2 lg:grid-cols-4">
							<div class="rounded-card border border-base bg-surface px-card py-card">
								<p class="text-label text-tertiary">Active Assignments</p>
								<p class="mt-form-field-gap text-h2 font-semibold text-primary">
									{analytics.overview.activeAssignments}
								</p>
								<p class="mt-form-field-gap text-label text-secondary">
									{analytics.overview.revokedAssignments} revoked
								</p>
							</div>
							<div class="rounded-card border border-base bg-surface px-card py-card">
								<p class="text-label text-tertiary">System-Level Assignments</p>
								<p class="mt-form-field-gap text-h2 font-semibold text-primary">
									{analytics.systemLevel.assignments}
								</p>
								<p class="mt-form-field-gap text-label text-secondary">
									{analytics.systemLevel.users} unique users
								</p>
							</div>
							<div class="rounded-card border border-base bg-surface px-card py-card">
								<p class="text-label text-tertiary">Unused Roles</p>
								<p class="mt-form-field-gap text-h2 font-semibold text-primary">
									{analytics.health.rolesWithNoAssignments}
								</p>
								<p class="mt-form-field-gap text-label text-secondary">
									{analytics.health.rolesWithNoPermissions} without permissions
								</p>
							</div>
							<div class="rounded-card border border-base bg-surface px-card py-card">
								<p class="text-label text-tertiary">Total Roles</p>
								<p class="mt-form-field-gap text-h2 font-semibold text-primary">
									{analytics.overview.totalRoles}
								</p>
								<p class="mt-form-field-gap text-label text-secondary">
									{analytics.overview.totalPermissions} permissions
								</p>
							</div>
						</div>

						<!-- Scope Breakdown -->
						<div class="rounded-card border border-base bg-surface px-card py-card">
							<h3 class="mb-content-section text-h3 font-semibold text-primary">
								Assignment Scope Breakdown
							</h3>
							<div class="grid grid-cols-1 gap-content-section md:grid-cols-3">
								<div class="rounded-button border border-base bg-elevated px-card py-card">
									<p class="text-label text-tertiary">Global (System-Level)</p>
									<p class="mt-form-field-gap text-h3 font-semibold text-primary">
										{analytics.scopeBreakdown.global}
									</p>
									<p class="mt-form-field-gap text-label text-secondary">
										{analytics.scopeBreakdown.global > 0
											? Math.round(
													(analytics.scopeBreakdown.global / analytics.overview.activeAssignments) *
														100
												)
											: 0}% of all assignments
									</p>
								</div>
								<div class="rounded-button border border-base bg-elevated px-card py-card">
									<p class="text-label text-tertiary">Organization-Scoped</p>
									<p class="mt-form-field-gap text-h3 font-semibold text-primary">
										{analytics.scopeBreakdown.organization}
									</p>
									<p class="mt-form-field-gap text-label text-secondary">
										{analytics.scopeBreakdown.organization > 0
											? Math.round(
													(analytics.scopeBreakdown.organization /
														analytics.overview.activeAssignments) *
														100
												)
											: 0}% of all assignments
									</p>
								</div>
								<div class="rounded-button border border-base bg-elevated px-card py-card">
									<p class="text-label text-tertiary">Team-Scoped</p>
									<p class="mt-form-field-gap text-h3 font-semibold text-primary">
										{analytics.scopeBreakdown.team}
									</p>
									<p class="mt-form-field-gap text-label text-secondary">
										{analytics.scopeBreakdown.team > 0
											? Math.round(
													(analytics.scopeBreakdown.team / analytics.overview.activeAssignments) *
														100
												)
											: 0}% of all assignments
									</p>
								</div>
							</div>
						</div>

						<!-- Most Assigned Roles -->
						<div class="rounded-card border border-base bg-surface px-card py-card">
							<h3 class="mb-content-section text-h3 font-semibold text-primary">
								Most Assigned Roles
							</h3>
							{#if analytics.mostAssignedRoles.length === 0}
								<p class="text-small text-secondary">No role assignments yet</p>
							{:else}
								<div class="space-y-icon">
									{#each analytics.mostAssignedRoles as role (role.slug)}
										<div
											class="flex items-center justify-between rounded-button border border-base bg-elevated px-card py-card"
										>
											<div class="flex-1">
												<p class="font-medium text-primary">{role.roleName}</p>
												<p class="mt-form-field-gap text-label text-tertiary">
													{role.scopes.global} global, {role.scopes.org} org, {role.scopes.team} team
												</p>
											</div>
											<div class="text-right">
												<p class="text-h3 font-semibold text-primary">{role.count}</p>
												<p class="text-label text-tertiary">assignments</p>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Most Used Permissions -->
						<div class="rounded-card border border-base bg-surface px-card py-card">
							<h3 class="mb-content-section text-h3 font-semibold text-primary">
								Most Used Permissions
							</h3>
							{#if analytics.mostUsedPermissions.length === 0}
								<p class="text-small text-secondary">No permission usage data</p>
							{:else}
								<div class="space-y-icon">
									{#each analytics.mostUsedPermissions as perm (perm.slug)}
										<div
											class="flex items-center justify-between rounded-button border border-base bg-elevated px-card py-card"
										>
											<div class="flex-1">
												<p class="font-code text-small text-primary">{perm.slug}</p>
											</div>
											<div class="text-right">
												<p class="text-h3 font-semibold text-primary">{perm.count}</p>
												<p class="text-label text-tertiary">roles</p>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Health Warnings -->
						{#if analytics.health.unusedRoles.length > 0}
							<div class="rounded-card border border-yellow-500/20 bg-yellow-500/5 px-card py-card">
								<h3 class="mb-content-section text-h3 font-semibold text-primary">
									⚠️ Unused Roles
								</h3>
								<p class="mb-content-section text-small text-secondary">
									The following roles have no active assignments:
								</p>
								<div class="flex flex-wrap gap-icon">
									{#each analytics.health.unusedRoles as role (role._id)}
										<span
											class="rounded-button bg-elevated px-badge py-badge text-label text-secondary"
										>
											{role.name} ({role.slug})
										</span>
									{/each}
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</main>
</div>

<!-- Role Detail Modal -->
<Dialog.Root bind:open={roleDetailModalOpen}>
	<Dialog.Content
		class="w-[min(600px,90vw)] rounded-card border border-base bg-surface text-primary shadow-card-hover"
	>
		{#if selectedRole}
			<div class="space-y-settings-section px-inbox-container py-inbox-container">
				<div>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<Dialog.Title class="text-h3 font-semibold text-primary">
								{selectedRole.name}
							</Dialog.Title>
							<Dialog.Description class="mt-form-field-gap text-small text-secondary">
								{selectedRole.description}
							</Dialog.Description>
						</div>
						<Badge variant={selectedRole.isSystem ? 'system' : 'custom'}>
							{selectedRole.isSystem ? 'System' : 'Custom'}
						</Badge>
					</div>
					<p class="mt-content-section font-code text-label text-tertiary">{selectedRole.slug}</p>
				</div>

				<div>
					<div class="mb-content-section flex items-center justify-between">
						<h4 class="text-small font-semibold text-primary">Permissions</h4>
						<Button
							variant="secondary"
							onclick={() => {
								if (!selectedRole) return;
								assignPermRoleId = selectedRole._id;
								assignPermissionModalOpen = true;
							}}
						>
							Add Permission
						</Button>
					</div>
					{#if loadingRolePermissions}
						<p class="text-small text-secondary">Loading permissions...</p>
					{:else if rolePermissions.length === 0}
						<p class="text-small text-secondary">No permissions assigned</p>
					{:else}
						<div class="space-y-icon">
							{#each rolePermissions as perm (perm.permissionId)}
								<div
									class="flex items-center justify-between rounded-button border border-base bg-elevated px-card py-card"
								>
									<div class="flex-1">
										<p class="font-code text-label text-tertiary">{perm.slug}</p>
										<p class="mt-form-field-gap text-small text-secondary">{perm.description}</p>
									</div>
									<div class="flex items-center gap-icon">
										<Badge
											variant={perm.scope === 'all'
												? 'default'
												: perm.scope === 'own'
													? 'custom'
													: 'system'}
										>
											{perm.scope}
										</Badge>
										<button
											type="button"
											onclick={() => {
												if (!selectedRole) return;
												removePermissionFromRole(selectedRole._id, perm.permissionId);
											}}
											class="text-label text-error hover:text-error-secondary hover:underline"
										>
											Remove
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="flex items-center justify-end gap-icon pt-content-section">
					<Dialog.Close
						type="button"
						class="rounded-button border border-base px-button-x py-button-y text-small font-medium text-secondary hover:text-primary"
					>
						Close
					</Dialog.Close>
					{#if !selectedRole.isSystem}
						<button
							type="button"
							onclick={() => {
								console.log('Edit', selectedRole);
								roleDetailModalOpen = false;
							}}
							class="rounded-button bg-accent-primary px-button-x py-button-y text-small font-medium text-primary"
						>
							Edit Role
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Create Permission Modal -->
<Dialog.Root bind:open={createPermissionModalOpen}>
	<Dialog.Content
		class="w-[min(600px,90vw)] rounded-card border border-base bg-surface text-primary shadow-card-hover"
	>
		<div class="space-y-6 px-inbox-container py-inbox-container">
			<div>
				<Dialog.Title class="text-lg font-semibold text-primary">Create Permission</Dialog.Title>
				<Dialog.Description class="mt-1 text-sm text-secondary">
					Create a new permission that can be assigned to roles
				</Dialog.Description>
			</div>

			<div class="space-y-content-section">
				<div>
					<FormInput label="Slug" placeholder="docs.view" bind:value={permSlug} required />
					<p class="mt-form-field-gap text-label text-tertiary">
						Format: category.action (e.g., docs.view)
					</p>
				</div>

				<div class="grid grid-cols-2 gap-content-section">
					<div>
						<FormInput label="Category" placeholder="docs" bind:value={permCategory} required />
					</div>
					<div>
						<FormInput label="Action" placeholder="view" bind:value={permAction} required />
					</div>
				</div>

				<div>
					<FormTextarea
						label="Description"
						placeholder="View documentation pages"
						bind:value={permDescription}
						required
					/>
				</div>

				<div class="flex items-center gap-icon">
					<ToggleSwitch
						checked={permRequiresResource}
						onChange={(checked) => {
							permRequiresResource = checked;
						}}
						label="Requires Resource"
					/>
				</div>

				{#if createPermissionError}
					<div class="border-error/20 bg-error/5 rounded-button border px-card py-card">
						<p class="text-small text-error">{createPermissionError}</p>
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-icon pt-content-section">
				<Dialog.Close
					type="button"
					class="rounded-button border border-base px-button-x py-button-y text-small font-medium text-secondary hover:text-primary"
				>
					Cancel
				</Dialog.Close>
				<Button variant="primary" onclick={createPermission} disabled={createPermissionLoading}>
					{createPermissionLoading ? 'Creating...' : 'Create Permission'}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Create Role Modal -->
<Dialog.Root bind:open={createRoleModalOpen}>
	<Dialog.Content
		class="w-[min(600px,90vw)] rounded-card border border-base bg-surface text-primary shadow-card-hover"
	>
		<div class="space-y-settings-section px-inbox-container py-inbox-container">
			<div>
				<Dialog.Title class="text-h3 font-semibold text-primary">Create Role</Dialog.Title>
				<Dialog.Description class="mt-form-field-gap text-small text-secondary">
					Create a new role that can be assigned to users
				</Dialog.Description>
			</div>

			<div class="space-y-content-section">
				<div>
					<FormInput label="Slug" placeholder="docs-viewer" bind:value={roleSlug} required />
					<p class="mt-form-field-gap text-label text-tertiary">
						URL-friendly identifier (e.g., docs-viewer)
					</p>
				</div>

				<div>
					<FormInput
						label="Name"
						placeholder="Documentation Viewer"
						bind:value={roleName}
						required
					/>
				</div>

				<div>
					<FormTextarea
						label="Description"
						placeholder="Can view documentation pages"
						bind:value={roleDescription}
						required
					/>
				</div>

				{#if createRoleError}
					<div class="border-error/20 bg-error/5 rounded-button border px-card py-card">
						<p class="text-small text-error">{createRoleError}</p>
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-icon pt-content-section">
				<Dialog.Close
					type="button"
					class="rounded-button border border-base px-button-x py-button-y text-small font-medium text-secondary hover:text-primary"
				>
					Cancel
				</Dialog.Close>
				<Button variant="primary" onclick={createRole} disabled={createRoleLoading}>
					{createRoleLoading ? 'Creating...' : 'Create Role'}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Assign Role to User Modal -->
<Dialog.Root bind:open={assignRoleModalOpen}>
	<Dialog.Content
		class="w-[min(600px,90vw)] rounded-card border border-base bg-surface text-primary shadow-card-hover"
	>
		<div class="space-y-settings-section px-inbox-container py-inbox-container">
			<div>
				<Dialog.Title class="text-h3 font-semibold text-primary">Assign Role to User</Dialog.Title>
				<Dialog.Description class="mt-form-field-gap text-small text-secondary">
					Assign a role to a user to grant them permissions
				</Dialog.Description>
			</div>

			<div class="space-y-content-section">
				<div>
					<label
						for="assign-user-select"
						class="mb-content-section block text-small font-medium text-primary">User</label
					>
					<select
						id="assign-user-select"
						bind:value={assignUserId}
						class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-small text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
					>
						<option value="">Select a user...</option>
						{#each allUsers as user (user._id)}
							<option value={user._id}>
								{user.name || user.email} ({user.email})
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="assign-role-select"
						class="mb-content-section block text-small font-medium text-primary">Role</label
					>
					<select
						id="assign-role-select"
						bind:value={assignRoleId}
						class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-small text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
					>
						<option value="">Select a role...</option>
						{#each roles as role (role._id)}
							<option value={role._id}>{role.name} ({role.slug})</option>
						{/each}
					</select>
				</div>

				{#if assignRoleError}
					<div class="border-error/20 bg-error/5 rounded-button border px-card py-card">
						<p class="text-small text-error">{assignRoleError}</p>
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-icon pt-content-section">
				<Dialog.Close
					type="button"
					class="rounded-button border border-base px-button-x py-button-y text-small font-medium text-secondary hover:text-primary"
				>
					Cancel
				</Dialog.Close>
				<Button variant="primary" onclick={assignRoleToUser} disabled={assignRoleLoading}>
					{assignRoleLoading ? 'Assigning...' : 'Assign Role'}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Assign Permission to Role Modal -->
<Dialog.Root bind:open={assignPermissionModalOpen}>
	<Dialog.Content
		class="w-[min(600px,90vw)] rounded-card border border-base bg-surface text-primary shadow-card-hover"
	>
		<div class="space-y-settings-section px-inbox-container py-inbox-container">
			<div>
				<Dialog.Title class="text-h3 font-semibold text-primary"
					>Assign Permission to Role</Dialog.Title
				>
				<Dialog.Description class="mt-form-field-gap text-small text-secondary">
					Grant a permission to a role with a specific scope
				</Dialog.Description>
			</div>

			<div class="space-y-content-section">
				<div>
					<label
						for="assign-perm-role-select"
						class="mb-content-section block text-small font-medium text-primary">Role</label
					>
					<select
						id="assign-perm-role-select"
						bind:value={assignPermRoleId}
						class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-small text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
					>
						<option value="">Select a role...</option>
						{#each roles as role (role._id)}
							<option value={role._id}>{role.name} ({role.slug})</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="assign-perm-permission-select"
						class="mb-content-section block text-small font-medium text-primary">Permission</label
					>
					<select
						id="assign-perm-permission-select"
						bind:value={assignPermPermissionId}
						class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-small text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
					>
						<option value="">Select a permission...</option>
						{#each allPermissionsFlat as perm (perm._id)}
							<option value={perm._id}>
								{perm.slug} - {perm.description}
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="assign-perm-scope-select"
						class="mb-content-section block text-small font-medium text-primary">Scope</label
					>
					<select
						id="assign-perm-scope-select"
						bind:value={assignPermScope}
						class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-small text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
					>
						<option value="all">All - Access all resources</option>
						<option value="own">Own - Access only own resources</option>
						<option value="none">None - Explicitly denied</option>
					</select>
					<p class="mt-form-field-gap text-label text-tertiary">
						Scope determines what resources the permission applies to
					</p>
				</div>

				{#if assignPermissionError}
					<div class="border-error/20 bg-error/5 rounded-button border px-card py-card">
						<p class="text-small text-error">{assignPermissionError}</p>
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-icon pt-content-section">
				<Dialog.Close
					type="button"
					class="rounded-button border border-base px-button-x py-button-y text-small font-medium text-secondary hover:text-primary"
				>
					Cancel
				</Dialog.Close>
				<Button
					variant="primary"
					onclick={assignPermissionToRole}
					disabled={assignPermissionLoading}
				>
					{assignPermissionLoading ? 'Assigning...' : 'Assign Permission'}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
