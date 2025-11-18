<script lang="ts">
	import type { PageData } from './$types';
	import { Badge, Tabs, Button, FormInput } from '$lib/components/ui';
	import { browser } from '$app/environment';
	import { Dialog } from 'bits-ui';

	let { data }: { data: PageData } = $props();

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

	function showRoleDetails(role: (typeof roles)[number]) {
		selectedRole = role;
		roleDetailModalOpen = true;
	}

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
			<h1 class="text-2xl font-bold text-primary">RBAC Management</h1>
			<p class="mt-1 text-sm text-secondary">
				Manage roles, permissions, and user-role assignments
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="primary" onclick={() => console.log('Create Role')}>Create Role</Button>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		<!-- Overview Cards -->
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
			<button
				type="button"
				onclick={() => {
					activeTab = 'roles';
					roleTypeFilter = 'all';
				}}
				class="rounded-lg border border-base bg-surface p-4 text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-xs text-tertiary">Total Roles</p>
				<p class="mt-1 text-2xl font-semibold text-primary">{totalRoles}</p>
				<p class="mt-1 text-xs text-secondary">
					{systemRolesCount} system, {customRolesCount} custom
				</p>
			</button>

			<button
				type="button"
				onclick={() => {
					activeTab = 'permissions';
				}}
				class="rounded-lg border border-base bg-surface p-4 text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-xs text-tertiary">Total Permissions</p>
				<p class="mt-1 text-2xl font-semibold text-primary">{totalPermissions}</p>
				<p class="mt-1 text-xs text-secondary">
					{permissionCategories} categories
				</p>
			</button>

			<button
				type="button"
				onclick={() => {
					activeTab = 'assignments';
				}}
				class="rounded-lg border border-base bg-surface p-4 text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-xs text-tertiary">Active Assignments</p>
				<p class="mt-1 text-2xl font-semibold text-primary">{activeAssignments}</p>
				<p class="mt-1 text-xs text-secondary">User-role assignments</p>
			</button>
		</div>

		<!-- Quick Actions Bar -->
		<div
			class="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-base bg-surface p-4"
		>
			<Button variant="primary" onclick={() => console.log('Create Role')}>Create Role</Button>
			<Button variant="secondary" onclick={() => console.log('Assign Role')}>
				Assign Role to User
			</Button>
			<a
				href="/dev-docs/2-areas/rbac/RBAC-SUMMARY"
				target="_blank"
				class="text-sm text-secondary hover:text-primary hover:underline"
			>
				View Documentation →
			</a>
		</div>

		<!-- Guidance Card -->
		{#if !guidanceDismissed}
			<div class="mb-6 rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-4">
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1">
						<h3 class="mb-2 text-sm font-semibold text-primary">What is RBAC?</h3>
						<p class="mb-2 text-sm text-secondary">
							Roles define what users can do in SynergyOS. Each role has permissions that grant
							access to specific features.
						</p>
						<div class="text-sm text-secondary">
							<p class="mb-1 font-medium">Common Tasks:</p>
							<ul class="ml-4 list-disc space-y-1">
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
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		<Tabs
			tabs={[
				{ value: 'roles', label: `Roles (${roles.length})` },
				{ value: 'permissions', label: `Permissions (${totalPermissions})` },
				{ value: 'analytics', label: 'Analytics' }
			]}
			bind:value={activeTab}
		>
			{#snippet children(tabValue)}
				{#if tabValue === 'roles'}
					<!-- Roles Tab -->
					<div class="flex flex-col gap-6">
						<!-- Search and Filter Bar -->
						<div class="flex items-center gap-2">
							<div class="flex-1">
								<FormInput
									placeholder="Search roles by name, slug, or description..."
									bind:value={rolesSearch}
									class="w-full"
								/>
							</div>
							<select
								bind:value={roleTypeFilter}
								class="rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
							>
								<option value="all">All Types</option>
								<option value="system">System</option>
								<option value="custom">Custom</option>
							</select>
						</div>

						<!-- Roles Display -->
						{#if filteredRoles.length === 0}
							<div class="flex flex-col items-center justify-center py-12 text-center">
								<p class="mb-2 text-lg font-medium text-secondary">
									{rolesSearch.trim() || roleTypeFilter !== 'all'
										? 'No roles match your filters'
										: 'No roles yet'}
								</p>
								<p class="text-sm text-tertiary">
									{rolesSearch.trim() || roleTypeFilter !== 'all'
										? 'Try adjusting your search or filter criteria'
										: 'Create your first role to get started'}
								</p>
							</div>
						{:else}
							<!-- System Roles -->
							{#if systemRoles.length > 0 && (roleTypeFilter === 'all' || roleTypeFilter === 'system')}
								<div class="flex flex-col gap-4">
									<div class="flex items-center justify-between">
										<h2 class="text-lg font-semibold text-primary">
											System Roles ({systemRoles.length})
										</h2>
										<p class="text-sm text-secondary">Built-in roles that cannot be modified</p>
									</div>
									<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
										{#each systemRoles as role (role._id)}
											<div
												class="group flex flex-col gap-3 rounded-lg border border-base bg-surface p-4 transition-colors hover:border-accent-primary hover:bg-hover-solid"
											>
												<div class="flex items-start justify-between">
													<div class="flex-1">
														<h3 class="font-semibold text-primary">{role.name}</h3>
														<p class="mt-1 font-mono text-xs text-tertiary">{role.slug}</p>
													</div>
													<Badge variant="system">System</Badge>
												</div>
												<p class="line-clamp-2 text-sm text-secondary">{role.description}</p>
												<div class="flex items-center justify-between">
													<span class="text-xs text-tertiary">
														{role.permissionCount} permission{role.permissionCount !== 1 ? 's' : ''}
													</span>
													<button
														type="button"
														onclick={() => showRoleDetails(role)}
														class="text-xs text-accent-primary hover:underline"
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
								<div class="flex flex-col gap-4">
									<div class="flex items-center justify-between">
										<h2 class="text-lg font-semibold text-primary">
											Custom Roles ({customRoles.length})
										</h2>
										<p class="text-sm text-secondary">Roles created for your organization</p>
									</div>
									<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
										{#each customRoles as role (role._id)}
											<div
												class="group flex flex-col gap-3 rounded-lg border border-base bg-surface p-4 transition-colors hover:border-accent-primary hover:bg-hover-solid"
											>
												<div class="flex items-start justify-between">
													<div class="flex-1">
														<h3 class="font-semibold text-primary">{role.name}</h3>
														<p class="mt-1 font-mono text-xs text-tertiary">{role.slug}</p>
													</div>
													<Badge variant="custom">Custom</Badge>
												</div>
												<p class="line-clamp-2 text-sm text-secondary">{role.description}</p>
												<div class="flex items-center justify-between">
													<span class="text-xs text-tertiary">
														{role.permissionCount} permission{role.permissionCount !== 1 ? 's' : ''}
													</span>
													<div class="flex items-center gap-2">
														<button
															type="button"
															onclick={() => showRoleDetails(role)}
															class="text-xs text-accent-primary hover:underline"
														>
															View
														</button>
														<button
															type="button"
															onclick={() => console.log('Edit', role)}
															class="text-xs text-secondary hover:text-primary hover:underline"
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
				{:else if tabValue === 'permissions'}
					<!-- Permissions Tab -->
					<div class="flex flex-col gap-4">
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
							<div class="flex flex-col items-center justify-center py-12 text-center">
								<p class="mb-2 text-lg font-medium text-secondary">
									No permissions match your search
								</p>
								<p class="text-sm text-tertiary">Try adjusting your search criteria</p>
							</div>
						{:else}
							<div class="flex flex-col gap-6">
								{#each Object.entries(filteredPermissions) as [category, perms] (category)}
									<div class="rounded-lg border border-base bg-surface p-4">
										<div class="mb-3 flex items-center justify-between">
											<h3 class="text-lg font-semibold text-primary">{category}</h3>
											<Badge variant="default">{perms.length}</Badge>
										</div>
										<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
											{#each perms as perm, index (index)}
												<div
													class="rounded-md border border-base bg-elevated p-3 transition-colors hover:bg-hover-solid"
												>
													<p class="font-mono text-xs text-tertiary">
														{(perm as { slug: string }).slug}
													</p>
													<p class="mt-1 text-sm text-secondary">
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
				{:else if tabValue === 'analytics'}
					<!-- RBAC Analytics Tab -->
					<div class="flex flex-col gap-6">
						{#if !analytics}
							<div class="flex flex-col items-center justify-center py-12 text-center">
								<p class="mb-2 text-lg font-medium text-secondary">Loading analytics...</p>
							</div>
						{:else}
							<!-- Overview Stats -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
								<div class="rounded-lg border border-base bg-surface p-4">
									<p class="text-xs text-tertiary">Active Assignments</p>
									<p class="mt-1 text-2xl font-semibold text-primary">
										{analytics.overview.activeAssignments}
									</p>
									<p class="mt-1 text-xs text-secondary">
										{analytics.overview.revokedAssignments} revoked
									</p>
								</div>
								<div class="rounded-lg border border-base bg-surface p-4">
									<p class="text-xs text-tertiary">System-Level Assignments</p>
									<p class="mt-1 text-2xl font-semibold text-primary">
										{analytics.systemLevel.assignments}
									</p>
									<p class="mt-1 text-xs text-secondary">
										{analytics.systemLevel.users} unique users
									</p>
								</div>
								<div class="rounded-lg border border-base bg-surface p-4">
									<p class="text-xs text-tertiary">Unused Roles</p>
									<p class="mt-1 text-2xl font-semibold text-primary">
										{analytics.health.rolesWithNoAssignments}
									</p>
									<p class="mt-1 text-xs text-secondary">
										{analytics.health.rolesWithNoPermissions} without permissions
									</p>
								</div>
								<div class="rounded-lg border border-base bg-surface p-4">
									<p class="text-xs text-tertiary">Total Roles</p>
									<p class="mt-1 text-2xl font-semibold text-primary">
										{analytics.overview.totalRoles}
									</p>
									<p class="mt-1 text-xs text-secondary">
										{analytics.overview.totalPermissions} permissions
									</p>
								</div>
							</div>

							<!-- Scope Breakdown -->
							<div class="rounded-lg border border-base bg-surface p-4">
								<h3 class="mb-4 text-lg font-semibold text-primary">Assignment Scope Breakdown</h3>
								<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div class="rounded-md border border-base bg-elevated p-3">
										<p class="text-xs text-tertiary">Global (System-Level)</p>
										<p class="mt-1 text-xl font-semibold text-primary">
											{analytics.scopeBreakdown.global}
										</p>
										<p class="mt-1 text-xs text-secondary">
											{analytics.scopeBreakdown.global > 0
												? Math.round(
														(analytics.scopeBreakdown.global /
															analytics.overview.activeAssignments) *
															100
													)
												: 0}% of all assignments
										</p>
									</div>
									<div class="rounded-md border border-base bg-elevated p-3">
										<p class="text-xs text-tertiary">Organization-Scoped</p>
										<p class="mt-1 text-xl font-semibold text-primary">
											{analytics.scopeBreakdown.organization}
										</p>
										<p class="mt-1 text-xs text-secondary">
											{analytics.scopeBreakdown.organization > 0
												? Math.round(
														(analytics.scopeBreakdown.organization /
															analytics.overview.activeAssignments) *
															100
													)
												: 0}% of all assignments
										</p>
									</div>
									<div class="rounded-md border border-base bg-elevated p-3">
										<p class="text-xs text-tertiary">Team-Scoped</p>
										<p class="mt-1 text-xl font-semibold text-primary">
											{analytics.scopeBreakdown.team}
										</p>
										<p class="mt-1 text-xs text-secondary">
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
							<div class="rounded-lg border border-base bg-surface p-4">
								<h3 class="mb-4 text-lg font-semibold text-primary">Most Assigned Roles</h3>
								{#if analytics.mostAssignedRoles.length === 0}
									<p class="text-sm text-secondary">No role assignments yet</p>
								{:else}
									<div class="space-y-2">
										{#each analytics.mostAssignedRoles as role (role.slug)}
											<div
												class="flex items-center justify-between rounded-md border border-base bg-elevated p-3"
											>
												<div class="flex-1">
													<p class="font-medium text-primary">{role.roleName}</p>
													<p class="mt-1 text-xs text-tertiary">
														{role.scopes.global} global, {role.scopes.org} org, {role.scopes.team} team
													</p>
												</div>
												<div class="text-right">
													<p class="text-lg font-semibold text-primary">{role.count}</p>
													<p class="text-xs text-tertiary">assignments</p>
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Most Used Permissions -->
							<div class="rounded-lg border border-base bg-surface p-4">
								<h3 class="mb-4 text-lg font-semibold text-primary">Most Used Permissions</h3>
								{#if analytics.mostUsedPermissions.length === 0}
									<p class="text-sm text-secondary">No permission usage data</p>
								{:else}
									<div class="space-y-2">
										{#each analytics.mostUsedPermissions as perm (perm.slug)}
											<div
												class="flex items-center justify-between rounded-md border border-base bg-elevated p-3"
											>
												<div class="flex-1">
													<p class="font-mono text-sm text-primary">{perm.slug}</p>
												</div>
												<div class="text-right">
													<p class="text-lg font-semibold text-primary">{perm.count}</p>
													<p class="text-xs text-tertiary">roles</p>
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Health Warnings -->
							{#if analytics.health.unusedRoles.length > 0}
								<div class="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
									<h3 class="mb-2 text-lg font-semibold text-primary">⚠️ Unused Roles</h3>
									<p class="mb-3 text-sm text-secondary">
										The following roles have no active assignments:
									</p>
									<div class="flex flex-wrap gap-2">
										{#each analytics.health.unusedRoles as role (role._id)}
											<span class="rounded-md bg-elevated px-2 py-1 text-xs text-secondary">
												{role.name} ({role.slug})
											</span>
										{/each}
									</div>
								</div>
							{/if}
						{/if}
					</div>
				{/if}
			{/snippet}
		</Tabs>
	</main>
</div>

<!-- Role Detail Modal -->
<Dialog.Root bind:open={roleDetailModalOpen}>
	<Dialog.Content
		class="w-[min(600px,90vw)] rounded-lg border border-base bg-surface text-primary shadow-xl"
	>
		{#if selectedRole}
			<div class="space-y-6 px-inbox-container py-inbox-container">
				<div>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<Dialog.Title class="text-lg font-semibold text-primary">
								{selectedRole.name}
							</Dialog.Title>
							<Dialog.Description class="mt-1 text-sm text-secondary">
								{selectedRole.description}
							</Dialog.Description>
						</div>
						<Badge variant={selectedRole.isSystem ? 'system' : 'custom'}>
							{selectedRole.isSystem ? 'System' : 'Custom'}
						</Badge>
					</div>
					<p class="mt-2 font-mono text-xs text-tertiary">{selectedRole.slug}</p>
				</div>

				<div>
					<h4 class="mb-2 text-sm font-semibold text-primary">Permissions</h4>
					<p class="text-sm text-secondary">
						This role has {selectedRole.permissionCount} permission{selectedRole.permissionCount !==
						1
							? 's'
							: ''}. Permission details coming soon.
					</p>
				</div>

				<div class="flex items-center justify-end gap-2 pt-2">
					<Dialog.Close
						type="button"
						class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary"
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
							class="rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium text-white"
						>
							Edit Role
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
