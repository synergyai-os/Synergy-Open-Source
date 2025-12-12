<script lang="ts">
	import type { PageData } from './$types';
	import { Badge, Tabs, Button, FormInput, FormTextarea } from '$lib/components/atoms';
	import { ToggleSwitch } from '$lib/components/molecules';
	import { browser } from '$app/environment';
	import { Dialog } from 'bits-ui';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { tabsListRecipe, tabsTriggerRecipe, tabsContentRecipe } from '$lib/design-system/recipes';
	import { invariant } from '$lib/utils/invariant';

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
	let assignScopeType = $state<'system' | 'workspace' | 'circle'>('system');
	let assignWorkspaceId = $state<string>('');
	let assignCircleId = $state<string>('');
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

	// Role Templates state
	let editTemplateModalOpen = $state(false);
	let selectedTemplate: (typeof roleTemplates)[number] | null = $state(null);
	let editingPermissions: Array<{
		permissionSlug: string;
		scope: 'all' | 'own';
		permissionId?: string;
		permissionName?: string;
	}> = $state([]);
	let availablePermissionToAdd = $state<string>('');
	let templateEditLoading = $state(false);
	let templateEditError = $state<string | null>(null);

	const allUsers = $derived(
		(data.allUsers || []) as Array<{ _id: string; email: string; name: string | null }>
	);

	const getSessionId = () => sessionId;
	const getAssignWorkspaceId = () => assignWorkspaceId;

	// Reactive queries for workspaces and circles
	const allWorkspacesQuery =
		browser && getSessionId()
			? useQuery(api.admin.rbac.listWorkspaces, () => {
					const s = getSessionId();
					invariant(s, 'sessionId required');
					return { sessionId: s };
				})
			: null;

	const circlesQuery =
		browser && getSessionId() && getAssignWorkspaceId()
			? useQuery(api.admin.rbac.listCirclesByWorkspace, () => {
					const s = getSessionId();
					const w = getAssignWorkspaceId();
					invariant(s && w, 'sessionId and workspaceId required');
					return { sessionId: s, workspaceId: w as Id<'workspaces'> };
				})
			: null;

	// Reactive queries for roles, permissions, and analytics
	const rolesQuery =
		browser && getSessionId()
			? useQuery(api.admin.rbac.listRoles, () => {
					const s = getSessionId();
					invariant(s, 'sessionId required');
					return { sessionId: s };
				})
			: null;

	const permissionsQuery =
		browser && getSessionId()
			? useQuery(api.admin.rbac.listPermissions, () => {
					const s = getSessionId();
					invariant(s, 'sessionId required');
					return { sessionId: s };
				})
			: null;

	const analyticsQuery =
		browser && getSessionId()
			? useQuery(api.admin.rbac.getRBACAnalytics, () => {
					const s = getSessionId();
					invariant(s, 'sessionId required');
					return { sessionId: s };
				})
			: null;

	const roleTemplatesQuery =
		browser && getSessionId()
			? useQuery(api.admin.rbac.listRoleTemplates, () => {
					const s = getSessionId();
					invariant(s, 'sessionId required');
					return { sessionId: s };
				})
			: null;

	const allWorkspaces = $derived(allWorkspacesQuery?.data ?? []);
	const circles = $derived(circlesQuery?.data ?? []);

	// Use reactive queries if available, otherwise fall back to server data
	const reactiveRoles = $derived(rolesQuery?.data ?? []);
	const reactivePermissions = $derived(permissionsQuery?.data ?? {});
	const reactiveAnalytics = $derived(analyticsQuery?.data ?? null);
	const roleTemplates = $derived(roleTemplatesQuery?.data ?? []);

	// Reset circle selection when workspace changes
	$effect(() => {
		if (assignWorkspaceId) {
			assignCircleId = '';
		}
	});

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

			// Data will update reactively via useQuery - no reload needed
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

			// Data will update reactively via useQuery - no reload needed
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

		// Validate scope selection
		if (assignScopeType === 'workspace' && !assignWorkspaceId) {
			assignRoleError = 'Please select a workspace';
			return;
		}

		if (assignScopeType === 'circle' && (!assignWorkspaceId || !assignCircleId)) {
			assignRoleError = 'Please select a workspace and circle';
			return;
		}

		assignRoleLoading = true;
		assignRoleError = null;

		try {
			await convexClient.mutation(api.admin.rbac.assignRoleToUser, {
				sessionId,
				assigneeUserId: assignUserId as Id<'users'>,
				roleId: assignRoleId as Id<'roles'>,
				workspaceId:
					assignScopeType === 'workspace' || assignScopeType === 'circle'
						? (assignWorkspaceId as Id<'workspaces'>)
						: undefined,
				circleId: assignScopeType === 'circle' ? (assignCircleId as Id<'circles'>) : undefined
			});

			// Reset form
			assignUserId = '';
			assignRoleId = '';
			assignScopeType = 'system';
			assignWorkspaceId = '';
			assignCircleId = '';
			assignRoleModalOpen = false;

			// Data will update reactively via useQuery - no reload needed
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

			// Data will update reactively via useQuery - no reload needed
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to remove permission');
		}
	}

	function showRoleDetails(role: (typeof roles)[number]) {
		selectedRole = role;
		roleDetailModalOpen = true;
		loadRolePermissions(role._id);
	}

	// Derived data - use reactive queries if available, otherwise fall back to server data
	const roles = $derived(
		(reactiveRoles.length > 0 ? reactiveRoles : data.roles || []) as Array<{
			_id: string;
			slug: string;
			name: string;
			description: string;
			isSystem: boolean;
			permissionCount: number;
		}>
	);

	const permissions = $derived(
		(Object.keys(reactivePermissions).length > 0
			? reactivePermissions
			: data.permissions || {}) as Record<string, unknown[]>
	);

	const analytics = $derived(
		(reactiveAnalytics || data.analytics || null) as {
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
				workspace: number;
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

	// Role Templates handlers
	function openEditTemplateModal(template: (typeof roleTemplates)[number]) {
		selectedTemplate = template;
		editingPermissions = [...(template.rbacPermissions || [])];
		availablePermissionToAdd = '';
		templateEditError = null;
		editTemplateModalOpen = true;
	}

	function closeEditTemplateModal() {
		editTemplateModalOpen = false;
		selectedTemplate = null;
		editingPermissions = [];
		availablePermissionToAdd = '';
		templateEditError = null;
	}

	function addPermissionToTemplate() {
		if (!availablePermissionToAdd) return;

		// Check if permission already added
		if (editingPermissions.some((p) => p.permissionSlug === availablePermissionToAdd)) {
			templateEditError = 'Permission already added';
			return;
		}

		// Find permission details
		const permission = allPermissionsFlat.find((p) => p.slug === availablePermissionToAdd);
		if (!permission) {
			templateEditError = 'Permission not found';
			return;
		}

		// Add with default scope 'own'
		editingPermissions = [
			...editingPermissions,
			{
				permissionSlug: permission.slug,
				scope: 'own',
				permissionId: permission._id,
				permissionName: permission.description
			}
		];

		availablePermissionToAdd = '';
		templateEditError = null;
	}

	function removePermissionFromTemplate(permissionSlug: string) {
		editingPermissions = editingPermissions.filter((p) => p.permissionSlug !== permissionSlug);
	}

	function updatePermissionScope(permissionSlug: string, scope: 'all' | 'own') {
		editingPermissions = editingPermissions.map((p) =>
			p.permissionSlug === permissionSlug ? { ...p, scope } : p
		);
	}

	async function saveTemplatePermissions() {
		if (!convexClient || !sessionId || !selectedTemplate) {
			templateEditError = 'Not authenticated';
			return;
		}

		templateEditLoading = true;
		templateEditError = null;

		try {
			await convexClient.mutation(api.admin.rbac.updateTemplateRbacPermissions, {
				sessionId,
				templateId: selectedTemplate._id as Id<'roleTemplates'>,
				rbacPermissions: editingPermissions.map((p) => ({
					permissionSlug: p.permissionSlug,
					scope: p.scope
				}))
			});

			// Close modal - data will update reactively
			closeEditTemplateModal();
		} catch (error) {
			templateEditError =
				error instanceof Error ? error.message : 'Failed to update template permissions';
		} finally {
			templateEditLoading = false;
		}
	}
</script>

<svelte:head>
	<title>RBAC Management - Admin - SynergyOS</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<header
		class="border-subtle bg-surface px-page flex flex-shrink-0 items-center justify-between border-b"
		style="padding-top: var(--spacing-page-y); padding-bottom: var(--spacing-2);"
	>
		<div>
			<h1 class="text-h2 text-primary font-bold">RBAC Management</h1>
			<p class="text-small text-secondary mt-fieldGroup">
				Manage roles, permissions, and user-role assignments
			</p>
		</div>
		<div class="gap-button flex items-center">
			<Button variant="primary" onclick={() => console.log('Create Role')}>Create Role</Button>
		</div>
	</header>

	<!-- Main Content -->
	<main class="px-page py-page flex-1 overflow-y-auto">
		<!-- Overview Cards -->
		<div class="gap-section mb-section grid grid-cols-1 md:grid-cols-3">
			<button
				type="button"
				onclick={() => {
					activeTab = 'roles';
					roleTypeFilter = 'all';
				}}
				class="rounded-card border-default bg-surface card-padding hover:bg-hover border text-left transition-colors"
			>
				<p class="text-label text-tertiary">Total Roles</p>
				<p class="text-h2 text-primary mt-fieldGroup font-semibold">{totalRoles}</p>
				<p class="text-label text-secondary mt-fieldGroup">
					{systemRolesCount} system, {customRolesCount} custom
				</p>
			</button>

			<button
				type="button"
				onclick={() => {
					activeTab = 'permissions';
				}}
				class="rounded-card border-default bg-surface card-padding hover:bg-hover border text-left transition-colors"
			>
				<p class="text-label text-tertiary">Total Permissions</p>
				<p class="text-h2 text-primary mt-fieldGroup font-semibold">{totalPermissions}</p>
				<p class="text-label text-secondary mt-fieldGroup">
					{permissionCategories} categories
				</p>
			</button>

			<button
				type="button"
				onclick={() => {
					activeTab = 'assignments';
				}}
				class="rounded-card border-default bg-surface card-padding hover:bg-hover border text-left transition-colors"
			>
				<p class="text-label text-tertiary">Active Assignments</p>
				<p class="text-h2 text-primary mt-fieldGroup font-semibold">{activeAssignments}</p>
				<p class="text-label text-secondary mt-fieldGroup">User-role assignments</p>
			</button>
		</div>

		<!-- Quick Actions Bar -->
		<div
			class="gap-button rounded-card border-default bg-surface card-padding mb-section flex flex-wrap items-center border"
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
				class="text-small text-secondary hover:text-primary ml-auto hover:underline"
			>
				View Documentation →
			</a>
		</div>

		<!-- Guidance Card -->
		{#if !guidanceDismissed}
			<div
				class="border-accent-primary/20 bg-accent-primary/5 rounded-card card-padding mb-section border"
			>
				<div class="gap-content-sectionGap flex items-start justify-between">
					<div class="flex-1">
						<h3 class="text-small text-primary mb-header font-semibold">What is RBAC?</h3>
						<p class="text-small text-secondary mb-header">
							Roles define what users can do in SynergyOS. Each role has permissions that grant
							access to specific features.
						</p>
						<div class="text-small text-secondary">
							<p class="mb-fieldGroup font-medium">Common Tasks:</p>
							<ul class="ml-content-sectionGap gap-form flex list-disc flex-col">
								<li>Create custom roles for your workspace</li>
								<li>Assign roles to users to grant permissions</li>
								<li>View permissions to understand what each role can do</li>
							</ul>
						</div>
					</div>
					<button
						type="button"
						onclick={dismissGuidance}
						class="text-tertiary hover:text-primary flex-shrink-0"
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
			<Tabs.List class={tabsListRecipe()}>
				<Tabs.Trigger value="roles" class={tabsTriggerRecipe({ active: activeTab === 'roles' })}>
					Roles ({roles.length})
				</Tabs.Trigger>
				<Tabs.Trigger
					value="permissions"
					class={tabsTriggerRecipe({ active: activeTab === 'permissions' })}
				>
					Permissions ({totalPermissions})
				</Tabs.Trigger>
				<Tabs.Trigger
					value="analytics"
					class={tabsTriggerRecipe({ active: activeTab === 'analytics' })}
				>
					Analytics
				</Tabs.Trigger>
				<Tabs.Trigger
					value="role-templates"
					class={tabsTriggerRecipe({ active: activeTab === 'role-templates' })}
				>
					Role Templates
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Roles Tab -->
			<Tabs.Content value="roles" class={tabsContentRecipe()}>
				<div class="gap-section flex flex-col">
					<!-- Search and Filter Bar -->
					<div class="gap-button flex items-center">
						<div class="flex-1">
							<FormInput
								placeholder="Search roles by name, slug, or description..."
								bind:value={rolesSearch}
								class="w-full"
							/>
						</div>
						<select
							bind:value={roleTypeFilter}
							class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary border focus:ring-2 focus:outline-none"
						>
							<option value="all">All Types</option>
							<option value="system">System</option>
							<option value="custom">Custom</option>
						</select>
					</div>

					<!-- Roles Display -->
					{#if filteredRoles.length === 0}
						<div
							class="flex flex-col items-center justify-center text-center"
							style="padding-block: var(--spacing-8);"
						>
							<p class="text-h3 text-secondary mb-header font-medium">
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
							<div class="gap-content-sectionGap flex flex-col">
								<div class="flex items-center justify-between">
									<h2 class="text-h3 text-primary font-semibold">
										System Roles ({systemRoles.length})
									</h2>
									<p class="text-small text-secondary">Built-in roles that cannot be modified</p>
								</div>
								<div class="gap-content-sectionGap grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
									{#each systemRoles as role (role._id)}
										<div
											class="group gap-card rounded-card border-default bg-surface card-padding hover:border-accent-primary hover:bg-hover flex flex-col border transition-colors"
										>
											<div class="flex items-start justify-between">
												<div class="flex-1">
													<h3 class="text-primary font-semibold">{role.name}</h3>
													<p class="font-code text-label text-tertiary mt-fieldGroup">
														{role.slug}
													</p>
												</div>
												<Badge variant="system">System</Badge>
											</div>
											<p class="text-small text-secondary line-clamp-2">{role.description}</p>
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
							<div class="gap-content-sectionGap flex flex-col">
								<div class="flex items-center justify-between">
									<h2 class="text-h3 text-primary font-semibold">
										Custom Roles ({customRoles.length})
									</h2>
									<p class="text-small text-secondary">Roles created for your workspace</p>
								</div>
								<div class="gap-content-sectionGap grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
									{#each customRoles as role (role._id)}
										<div
											class="group gap-card rounded-card border-default bg-surface card-padding hover:border-accent-primary hover:bg-hover flex flex-col border transition-colors"
										>
											<div class="flex items-start justify-between">
												<div class="flex-1">
													<h3 class="text-primary font-semibold">{role.name}</h3>
													<p class="font-code text-label text-tertiary mt-fieldGroup">
														{role.slug}
													</p>
												</div>
												<Badge variant="custom">Custom</Badge>
											</div>
											<p class="text-small text-secondary line-clamp-2">{role.description}</p>
											<div class="flex items-center justify-between">
												<span class="text-label text-tertiary">
													{role.permissionCount} permission{role.permissionCount !== 1 ? 's' : ''}
												</span>
												<div class="gap-button flex items-center">
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
			<Tabs.Content value="permissions" class={tabsContentRecipe()}>
				<div class="gap-content-sectionGap flex flex-col">
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
						<div
							class="flex flex-col items-center justify-center text-center"
							style="padding-block: var(--spacing-8);"
						>
							<p class="text-h3 text-secondary mb-header font-medium">
								No permissions match your search
							</p>
							<p class="text-small text-tertiary">Try adjusting your search criteria</p>
						</div>
					{:else}
						<div class="gap-section flex flex-col">
							{#each Object.entries(filteredPermissions) as [category, perms] (category)}
								<div class="rounded-card border-default bg-surface card-padding border">
									<div class="mb-header flex items-center justify-between">
										<h3 class="text-h3 text-primary font-semibold">{category}</h3>
										<Badge variant="default">{perms.length}</Badge>
									</div>
									<div class="gap-fieldGroup grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
										{#each perms as perm, index (index)}
											<div
												class="rounded-button border-default bg-elevated card-padding hover:bg-hover border transition-colors"
											>
												<p class="font-code text-label text-tertiary">
													{(perm as { slug: string }).slug}
												</p>
												<p class="text-small text-secondary mt-fieldGroup">
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
			<Tabs.Content value="analytics" class={tabsContentRecipe()}>
				<div class="gap-section flex flex-col">
					{#if !analytics}
						<div
							class="flex flex-col items-center justify-center text-center"
							style="padding-block: var(--spacing-8);"
						>
							<p class="text-h3 text-secondary mb-header font-medium">Loading analytics...</p>
						</div>
					{:else}
						<!-- Overview Stats -->
						<div class="gap-content-sectionGap grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
							<div class="rounded-card border-default bg-surface card-padding border">
								<p class="text-label text-tertiary">Active Assignments</p>
								<p class="text-h2 text-primary mt-fieldGroup font-semibold">
									{analytics.overview.activeAssignments}
								</p>
								<p class="text-label text-secondary mt-fieldGroup">
									{analytics.overview.revokedAssignments} revoked
								</p>
							</div>
							<div class="rounded-card border-default bg-surface card-padding border">
								<p class="text-label text-tertiary">System-Level Assignments</p>
								<p class="text-h2 text-primary mt-fieldGroup font-semibold">
									{analytics.systemLevel.assignments}
								</p>
								<p class="text-label text-secondary mt-fieldGroup">
									{analytics.systemLevel.users} unique users
								</p>
							</div>
							<div class="rounded-card border-default bg-surface card-padding border">
								<p class="text-label text-tertiary">Unused Roles</p>
								<p class="text-h2 text-primary mt-fieldGroup font-semibold">
									{analytics.health.rolesWithNoAssignments}
								</p>
								<p class="text-label text-secondary mt-fieldGroup">
									{analytics.health.rolesWithNoPermissions} without permissions
								</p>
							</div>
							<div class="rounded-card border-default bg-surface card-padding border">
								<p class="text-label text-tertiary">Total Roles</p>
								<p class="text-h2 text-primary mt-fieldGroup font-semibold">
									{analytics.overview.totalRoles}
								</p>
								<p class="text-label text-secondary mt-fieldGroup">
									{analytics.overview.totalPermissions} permissions
								</p>
							</div>
						</div>

						<!-- Scope Breakdown -->
						<div class="rounded-card border-default bg-surface card-padding border">
							<h3 class="text-h3 text-primary mb-header font-semibold">
								Assignment Scope Breakdown
							</h3>
							<div class="gap-content-sectionGap grid grid-cols-1 md:grid-cols-3">
								<div class="rounded-button border-default bg-elevated card-padding border">
									<p class="text-label text-tertiary">Global (System-Level)</p>
									<p class="text-h3 text-primary mt-fieldGroup font-semibold">
										{analytics.scopeBreakdown.global}
									</p>
									<p class="text-label text-secondary mt-fieldGroup">
										{analytics.scopeBreakdown.global > 0
											? Math.round(
													(analytics.scopeBreakdown.global / analytics.overview.activeAssignments) *
														100
												)
											: 0}% of all assignments
									</p>
								</div>
								<div class="rounded-button border-default bg-elevated card-padding border">
									<p class="text-label text-tertiary">Organization-Scoped</p>
									<p class="text-h3 text-primary mt-fieldGroup font-semibold">
										{analytics.scopeBreakdown.workspace}
									</p>
									<p class="text-label text-secondary mt-fieldGroup">
										{analytics.scopeBreakdown.workspace > 0
											? Math.round(
													(analytics.scopeBreakdown.workspace /
														analytics.overview.activeAssignments) *
														100
												)
											: 0}% of all assignments
									</p>
								</div>
								<div class="rounded-button border-default bg-elevated card-padding border">
									<p class="text-label text-tertiary">Team-Scoped</p>
									<p class="text-h3 text-primary mt-fieldGroup font-semibold">
										{analytics.scopeBreakdown.team}
									</p>
									<p class="text-label text-secondary mt-fieldGroup">
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
						<div class="rounded-card border-default bg-surface card-padding border">
							<h3 class="text-h3 text-primary mb-header font-semibold">Most Assigned Roles</h3>
							{#if analytics.mostAssignedRoles.length === 0}
								<p class="text-small text-secondary">No role assignments yet</p>
							{:else}
								<div class="gap-fieldGroup flex flex-col">
									{#each analytics.mostAssignedRoles as role (role.slug)}
										<div
											class="rounded-button border-default bg-elevated card-padding flex items-center justify-between border"
										>
											<div class="flex-1">
												<p class="text-primary font-medium">{role.roleName}</p>
												<p class="text-label text-tertiary mt-fieldGroup">
													{role.scopes.global} global, {role.scopes.org} org, {role.scopes.team} team
												</p>
											</div>
											<div class="text-right">
												<p class="text-h3 text-primary font-semibold">{role.count}</p>
												<p class="text-label text-tertiary">assignments</p>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Most Used Permissions -->
						<div class="rounded-card border-default bg-surface card-padding border">
							<h3 class="text-h3 text-primary mb-header font-semibold">Most Used Permissions</h3>
							{#if analytics.mostUsedPermissions.length === 0}
								<p class="text-small text-secondary">No permission usage data</p>
							{:else}
								<div class="gap-fieldGroup flex flex-col">
									{#each analytics.mostUsedPermissions as perm (perm.slug)}
										<div
											class="rounded-button border-default bg-elevated card-padding flex items-center justify-between border"
										>
											<div class="flex-1">
												<p class="text-small font-code text-primary">{perm.slug}</p>
											</div>
											<div class="text-right">
												<p class="text-h3 text-primary font-semibold">{perm.count}</p>
												<p class="text-label text-tertiary">roles</p>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Health Warnings -->
						{#if analytics.health.unusedRoles.length > 0}
							<div
								class="border-warning/20 rounded-card bg-status-warningLight card-padding border"
							>
								<h3 class="text-h3 text-primary mb-header font-semibold">⚠️ Unused Roles</h3>
								<p class="text-small text-secondary mb-header">
									The following roles have no active assignments:
								</p>
								<div class="gap-fieldGroup flex flex-wrap">
									{#each analytics.health.unusedRoles as role (role._id)}
										<span
											class="rounded-button bg-elevated px-badge-md py-badge-md text-label text-secondary"
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

			<!-- Role Templates Tab -->
			<Tabs.Content value="role-templates" class={tabsContentRecipe()}>
				<div class="gap-section flex flex-col">
					<div
						class="border-accent-primary/20 bg-accent-primary/5 rounded-card card-padding border"
					>
						<p class="text-small text-secondary">
							Configure which RBAC permissions are automatically granted when users fill
							organizational roles (e.g., Circle Lead). These permissions are auto-assigned when a
							user is assigned to a role template.
						</p>
					</div>

					{#if roleTemplates.length === 0}
						<div
							class="flex flex-col items-center justify-center text-center"
							style="padding-block: var(--spacing-8);"
						>
							<p class="text-h3 text-secondary mb-header font-medium">No role templates found</p>
							<p class="text-small text-tertiary">
								Role templates will appear here once they are created
							</p>
						</div>
					{:else}
						<div class="gap-content-sectionGap flex flex-col">
							{#each roleTemplates as template (template._id)}
								<div
									class="rounded-card border-default bg-surface card-padding hover:bg-hover border transition-colors"
								>
									<div class="gap-content-sectionGap flex items-start justify-between">
										<div class="flex-1">
											<div class="gap-button flex items-center">
												<h3 class="text-primary font-semibold">{template.name}</h3>
												{#if template.workspaceId === undefined}
													<Badge variant="system">System</Badge>
												{:else}
													<Badge variant="custom">Workspace</Badge>
												{/if}
												{#if template.isRequired}
													<Badge variant="default">Required</Badge>
												{/if}
											</div>
											{#if template.description}
												<p class="text-small text-secondary mt-fieldGroup">
													{template.description}
												</p>
											{/if}

											<!-- Permissions List -->
											{#if template.rbacPermissions.length > 0}
												<div class="mt-section gap-fieldGroup flex flex-col">
													<p class="text-label text-primary font-medium">RBAC Permissions:</p>
													<div class="gap-fieldGroup flex flex-wrap">
														{#each template.rbacPermissions as perm (perm.permissionSlug)}
															<div
																class="gap-fieldGroup rounded-button border-default bg-elevated card-padding flex items-center border"
															>
																<span class="font-code text-label text-primary">
																	{perm.permissionSlug}
																</span>
																<Badge variant={perm.scope === 'all' ? 'default' : 'custom'}>
																	{perm.scope}
																</Badge>
															</div>
														{/each}
													</div>
												</div>
											{:else}
												<p class="mt-section text-small text-tertiary">
													No RBAC permissions configured
												</p>
											{/if}
										</div>
										<Button variant="secondary" onclick={() => openEditTemplateModal(template)}>
											Edit
										</Button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</main>
</div>

<!-- Role Detail Modal -->
<Dialog.Root bind:open={roleDetailModalOpen}>
	<Dialog.Content
		class="shadow-card-hover rounded-card border-default bg-surface text-primary w-[min(600px,90vw)] border"
	>
		{#if selectedRole}
			<div class="gap-section px-page py-page flex flex-col">
				<div>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<Dialog.Title class="text-h3 text-primary font-semibold">
								{selectedRole.name}
							</Dialog.Title>
							<Dialog.Description class="text-small text-secondary mt-fieldGroup">
								{selectedRole.description}
							</Dialog.Description>
						</div>
						<Badge variant={selectedRole.isSystem ? 'system' : 'custom'}>
							{selectedRole.isSystem ? 'System' : 'Custom'}
						</Badge>
					</div>
					<p class="mt-section font-code text-label text-tertiary">{selectedRole.slug}</p>
				</div>

				<div>
					<div class="mb-header flex items-center justify-between">
						<h4 class="text-small text-primary font-semibold">Permissions</h4>
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
						<div class="gap-fieldGroup flex flex-col">
							{#each rolePermissions as perm (perm.permissionId)}
								<div
									class="rounded-button border-default bg-elevated card-padding flex items-center justify-between border"
								>
									<div class="flex-1">
										<p class="font-code text-label text-tertiary">{perm.slug}</p>
										<p class="text-small text-secondary mt-fieldGroup">{perm.description}</p>
									</div>
									<div class="gap-button flex items-center">
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
											class="hover:text-error-secondary text-label text-error hover:underline"
										>
											Remove
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="pt-section gap-button flex items-center justify-end">
					<Dialog.Close
						type="button"
						class="text-small rounded-button border-default px-button py-button text-secondary hover:text-primary border font-medium"
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
							class="text-small rounded-button bg-accent-primary px-button py-button text-inverse font-medium"
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
		class="shadow-card-hover rounded-card border-default bg-surface text-primary w-[min(600px,90vw)] border"
	>
		<div class="gap-section px-page py-page flex flex-col">
			<div>
				<Dialog.Title class="text-h3 text-primary font-semibold">Create Permission</Dialog.Title>
				<Dialog.Description class="text-small text-secondary mt-fieldGroup">
					Create a new permission that can be assigned to roles
				</Dialog.Description>
			</div>

			<div class="gap-content-sectionGap flex flex-col">
				<div>
					<FormInput label="Slug" placeholder="docs.view" bind:value={permSlug} required />
					<p class="text-label text-tertiary mt-fieldGroup">
						Format: category.action (e.g., docs.view)
					</p>
				</div>

				<div class="gap-content-sectionGap grid grid-cols-2">
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

				<div class="gap-button flex items-center">
					<ToggleSwitch
						checked={permRequiresResource}
						onChange={(checked) => {
							permRequiresResource = checked;
						}}
						label="Requires Resource"
					/>
				</div>

				{#if createPermissionError}
					<div class="border-error/20 bg-error/5 rounded-button card-padding border">
						<p class="text-small text-error">{createPermissionError}</p>
					</div>
				{/if}
			</div>

			<div class="pt-section gap-button flex items-center justify-end">
				<Dialog.Close
					type="button"
					class="text-small rounded-button border-default px-button py-button text-secondary hover:text-primary border font-medium"
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
		class="shadow-card-hover rounded-card border-default bg-surface text-primary w-[min(600px,90vw)] border"
	>
		<div class="gap-section px-page py-page flex flex-col">
			<div>
				<Dialog.Title class="text-h3 text-primary font-semibold">Create Role</Dialog.Title>
				<Dialog.Description class="text-small text-secondary mt-fieldGroup">
					Create a new role that can be assigned to users
				</Dialog.Description>
			</div>

			<div class="gap-content-sectionGap flex flex-col">
				<div>
					<FormInput label="Slug" placeholder="docs-viewer" bind:value={roleSlug} required />
					<p class="text-label text-tertiary mt-fieldGroup">
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
					<div class="border-error/20 bg-error/5 rounded-button card-padding border">
						<p class="text-small text-error">{createRoleError}</p>
					</div>
				{/if}
			</div>

			<div class="pt-section gap-button flex items-center justify-end">
				<Dialog.Close
					type="button"
					class="text-small rounded-button border-default px-button py-button text-secondary hover:text-primary border font-medium"
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
		class="shadow-card-hover rounded-card border-default bg-surface text-primary w-[min(600px,90vw)] border"
	>
		<div class="gap-section px-page py-page flex flex-col">
			<div>
				<Dialog.Title class="text-h3 text-primary font-semibold">Assign Role to User</Dialog.Title>
				<Dialog.Description class="text-small text-secondary mt-fieldGroup">
					Assign a role to a user to grant them permissions
				</Dialog.Description>
			</div>

			<div class="gap-content-sectionGap flex flex-col">
				<div>
					<label
						for="assign-user-select"
						class="text-small text-primary mb-header block font-medium">User</label
					>
					<select
						id="assign-user-select"
						bind:value={assignUserId}
						class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
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
						class="text-small text-primary mb-header block font-medium">Role</label
					>
					<select
						id="assign-role-select"
						bind:value={assignRoleId}
						class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
					>
						<option value="">Select a role...</option>
						{#each roles as role (role._id)}
							<option value={role._id}>{role.name} ({role.slug})</option>
						{/each}
					</select>
				</div>

				<!-- Scope Type Selector -->
				<div>
					<p class="text-small text-primary mb-header block font-medium">Scope</p>
					<div class="gap-fieldGroup flex flex-col">
						<label class="gap-button flex items-center">
							<input
								type="radio"
								name="assign-scope"
								value="system"
								bind:group={assignScopeType}
								class="focus:ring-accent-primary text-accent-primary"
							/>
							<span class="text-small text-primary">System-wide (all workspaces)</span>
						</label>
						<label class="gap-button flex items-center">
							<input
								type="radio"
								name="assign-scope"
								value="workspace"
								bind:group={assignScopeType}
								class="focus:ring-accent-primary text-accent-primary"
							/>
							<span class="text-small text-primary">Workspace-scoped</span>
						</label>
						<label class="gap-button flex items-center">
							<input
								type="radio"
								name="assign-scope"
								value="circle"
								bind:group={assignScopeType}
								class="focus:ring-accent-primary text-accent-primary"
							/>
							<span class="text-small text-primary">Circle-scoped</span>
						</label>
					</div>
				</div>

				<!-- Workspace Selector (shown when workspace or circle scope) -->
				{#if assignScopeType === 'workspace' || assignScopeType === 'circle'}
					<div>
						<label
							for="assign-workspace-select"
							class="text-small text-primary mb-header block font-medium"
						>
							Workspace
						</label>
						<select
							id="assign-workspace-select"
							bind:value={assignWorkspaceId}
							class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
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
							class="text-small text-primary mb-header block font-medium"
						>
							Circle
						</label>
						<select
							id="assign-circle-select"
							bind:value={assignCircleId}
							class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
						>
							<option value="">Select a circle...</option>
							{#each circles as circle (circle._id)}
								<option value={circle._id}>{circle.name}</option>
							{/each}
						</select>
					</div>
				{/if}

				{#if assignRoleError}
					<div class="border-error/20 bg-error/5 rounded-button card-padding border">
						<p class="text-small text-error">{assignRoleError}</p>
					</div>
				{/if}
			</div>

			<div class="pt-section gap-button flex items-center justify-end">
				<Dialog.Close
					type="button"
					class="text-small rounded-button border-default px-button py-button text-secondary hover:text-primary border font-medium"
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
		class="shadow-card-hover rounded-card border-default bg-surface text-primary w-[min(600px,90vw)] border"
	>
		<div class="gap-section px-page py-page flex flex-col">
			<div>
				<Dialog.Title class="text-h3 text-primary font-semibold"
					>Assign Permission to Role</Dialog.Title
				>
				<Dialog.Description class="text-small text-secondary mt-fieldGroup">
					Grant a permission to a role with a specific scope
				</Dialog.Description>
			</div>

			<div class="gap-content-sectionGap flex flex-col">
				<div>
					<label
						for="assign-perm-role-select"
						class="text-small text-primary mb-header block font-medium">Role</label
					>
					<select
						id="assign-perm-role-select"
						bind:value={assignPermRoleId}
						class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
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
						class="text-small text-primary mb-header block font-medium">Permission</label
					>
					<select
						id="assign-perm-permission-select"
						bind:value={assignPermPermissionId}
						class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
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
						class="text-small text-primary mb-header block font-medium">Scope</label
					>
					<select
						id="assign-perm-scope-select"
						bind:value={assignPermScope}
						class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
					>
						<option value="all">All - Access all resources</option>
						<option value="own">Own - Access only own resources</option>
						<option value="none">None - Explicitly denied</option>
					</select>
					<p class="text-label text-tertiary mt-fieldGroup">
						Scope determines what resources the permission applies to
					</p>
				</div>

				{#if assignPermissionError}
					<div class="border-error/20 bg-error/5 rounded-button card-padding border">
						<p class="text-small text-error">{assignPermissionError}</p>
					</div>
				{/if}
			</div>

			<div class="pt-section gap-button flex items-center justify-end">
				<Dialog.Close
					type="button"
					class="text-small rounded-button border-default px-button py-button text-secondary hover:text-primary border font-medium"
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

<!-- Edit Role Template Permissions Modal -->
<Dialog.Root
	bind:open={editTemplateModalOpen}
	onOpenChange={(open) => !open && closeEditTemplateModal()}
>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] shadow-card-hover rounded-card border-default bg-surface text-primary fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(700px,90vw)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto border"
		>
			{#if selectedTemplate}
				<div class="gap-section px-page py-page flex flex-col">
					<div>
						<Dialog.Title class="text-h3 text-primary font-semibold">
							Edit Permissions: {selectedTemplate.name}
						</Dialog.Title>
						<Dialog.Description class="text-small text-secondary mt-fieldGroup">
							Configure which RBAC permissions are automatically granted when users fill this
							organizational role
						</Dialog.Description>
					</div>

					<div class="gap-content-sectionGap flex flex-col">
						<!-- Selected Permissions -->
						<div>
							<p class="text-small text-primary mb-header block font-medium">
								Selected Permissions
							</p>
							{#if editingPermissions.length === 0}
								<p class="text-small text-tertiary">No permissions selected</p>
							{:else}
								<div class="gap-fieldGroup flex flex-col">
									{#each editingPermissions as perm (perm.permissionSlug)}
										<div
											class="gap-content-sectionGap rounded-button border-default bg-elevated card-padding flex items-center justify-between border"
										>
											<div class="flex-1">
												<p class="font-code text-label text-primary">{perm.permissionSlug}</p>
												{#if perm.permissionName}
													<p class="text-small text-secondary mt-fieldGroup">
														{perm.permissionName}
													</p>
												{/if}
											</div>
											<div class="gap-fieldGroup flex items-center">
												<select
													value={perm.scope}
													onchange={(e) =>
														updatePermissionScope(
															perm.permissionSlug,
															(e.target as HTMLSelectElement).value as 'all' | 'own'
														)}
													class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary border focus:ring-2 focus:outline-none"
												>
													<option value="all">All</option>
													<option value="own">Own</option>
												</select>
												<button
													type="button"
													onclick={() => removePermissionFromTemplate(perm.permissionSlug)}
													class="hover:text-error-secondary text-label text-error transition-colors"
													title="Remove permission"
												>
													<svg
														class="icon-sm"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
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
									{/each}
								</div>
							{/if}
						</div>

						<!-- Add Permission -->
						<div>
							<label
								for="add-permission-select"
								class="text-small text-primary mb-header block font-medium"
							>
								Add Permission
							</label>
							<div class="gap-button flex">
								<select
									id="add-permission-select"
									bind:value={availablePermissionToAdd}
									class="bg-input text-small focus:ring-accent-primary rounded-input border-default px-input py-input text-primary flex-1 border focus:ring-2 focus:outline-none"
								>
									<option value="">Select a permission...</option>
									{#each allPermissionsFlat as perm (perm._id)}
										{#if !editingPermissions.some((p) => p.permissionSlug === perm.slug)}
											<option value={perm.slug}>
												{perm.slug} - {perm.description}
											</option>
										{/if}
									{/each}
								</select>
								<Button variant="secondary" onclick={addPermissionToTemplate}>Add</Button>
							</div>
						</div>

						{#if templateEditError}
							<div class="border-error/20 bg-error/5 rounded-button card-padding border">
								<p class="text-small text-error">{templateEditError}</p>
							</div>
						{/if}
					</div>

					<div class="pt-section gap-button flex items-center justify-end">
						<Dialog.Close
							type="button"
							class="text-small rounded-button border-default px-button py-button text-secondary hover:text-primary border font-medium"
						>
							Cancel
						</Dialog.Close>
						<Button
							variant="primary"
							onclick={saveTemplatePermissions}
							disabled={templateEditLoading}
						>
							{templateEditLoading ? 'Saving...' : 'Save'}
						</Button>
					</div>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
