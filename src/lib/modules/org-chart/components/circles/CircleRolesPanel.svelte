<script lang="ts">
	import { page } from '$app/stores';
	import { useCircleRoles } from '../../composables/useCircleRoles.svelte';
	import type { UseCircles, CircleRole, CircleMember } from '../../composables/useCircles.svelte';

	let {
		circles,
		circleId,
		roles,
		members
	}: {
		circles: Pick<
			UseCircles,
			| 'loading'
			| 'createRole'
			| 'updateRole'
			| 'deleteRole'
			| 'assignUserToRole'
			| 'removeUserFromRole'
		>;
		circleId: string;
		roles: CircleRole[];
		members: CircleMember[];
	} = $props();

	const getSessionId = () => $page.data.sessionId;

	// State for creating new role
	let showCreateForm = $state(false);
	let newRoleName = $state('');
	let newRolePurpose = $state('');

	// State for expanding role details
	let expandedRoleId = $state<string | null>(null);

	// Use composable for circle roles queries
	const circleRoles = useCircleRoles({
		sessionId: getSessionId,
		expandedRoleId: () => expandedRoleId,
		members: () => members
	});

	const roleFillers = $derived(circleRoles.roleFillers);

	// State for assigning users
	let assignUserId = $state<Record<string, string>>({});

	async function handleCreateRole() {
		if (!newRoleName.trim()) return;

		await circles.createRole({
			circleId,
			name: newRoleName.trim(),
			purpose: newRolePurpose.trim() || undefined
		});

		// Reset form on success
		if (!circles.loading.createRole) {
			newRoleName = '';
			newRolePurpose = '';
			showCreateForm = false;
		}
	}

	async function handleAssignUser(roleId: string) {
		const userId = assignUserId[roleId];
		if (!userId) return;

		await circles.assignUserToRole({ circleRoleId: roleId, userId });

		// Reset selection on success (use spread to trigger reactivity)
		assignUserId = { ...assignUserId, [roleId]: '' };
	}

	async function handleRemoveUser(roleId: string, userId: string) {
		if (confirm('Remove this user from the role?')) {
			await circles.removeUserFromRole({ circleRoleId: roleId, userId });
		}
	}

	async function handleDeleteRole(roleId: string, roleName: string) {
		if (confirm(`Delete role "${roleName}"? All user assignments will be removed.`)) {
			await circles.deleteRole({ circleRoleId: roleId });
		}
	}

	function toggleRoleExpand(roleId: string) {
		expandedRoleId = expandedRoleId === roleId ? null : roleId;
	}

	// Filter out users who are already assigned to this role
	function getAvailableUsersForRole(_roleId: string): CircleMember[] {
		// Note: roleFillers already filtered by expandedRoleId via query
		return circleRoles.availableUsers;
	}
</script>

<div class="border-base flex h-full flex-col rounded-card border bg-surface">
	<!-- Panel Header -->
	<div class="border-base py-nav-item border-b px-2">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-button font-semibold text-primary">Roles</h2>
				<p class="mt-1 text-label text-secondary">{roles.length} roles</p>
			</div>
			<button
				onclick={() => (showCreateForm = !showCreateForm)}
				class="hover:bg-sidebar-hover rounded-button text-secondary hover:text-primary"
				style="padding: var(--spacing-2);"
				title="Create role"
			>
				<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
			</button>
		</div>
	</div>

	<!-- Create Role Form -->
	{#if showCreateForm}
		<div class="border-base py-nav-item border-b px-2">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleCreateRole();
				}}
				class="space-y-inbox-list-gap"
			>
				<input
					type="text"
					bind:value={newRoleName}
					placeholder="Role name *"
					class="border-base text-button focus:border-accent-primary w-full rounded-button border bg-elevated px-input-x py-input-y text-primary focus:outline-none"
					required
				/>
				<textarea
					bind:value={newRolePurpose}
					placeholder="Purpose (optional)"
					rows={2}
					class="border-base text-button focus:border-accent-primary w-full rounded-button border bg-elevated px-input-x py-input-y text-primary focus:outline-none"
				></textarea>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => {
							showCreateForm = false;
							newRoleName = '';
							newRolePurpose = '';
						}}
						class="border-base px-card text-button rounded-button border py-input-y font-medium text-secondary hover:text-primary"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={circles.loading.createRole}
						class="text-on-solid bg-accent-primary px-card text-button hover:bg-accent-hover rounded-button py-input-y font-medium disabled:opacity-50"
					>
						{circles.loading.createRole ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Roles List -->
	<div class="py-nav-item flex-1 overflow-y-auto px-2">
		{#if roles.length === 0}
			<div class="flex h-32 items-center justify-center text-center">
				<p class="text-button text-secondary">No roles yet</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each roles as role (role.roleId)}
					<div class="border-base rounded-button border bg-elevated">
						<!-- Role Header -->
						<div class="px-card py-nav-item flex items-start justify-between">
							<button
								onclick={() => toggleRoleExpand(role.roleId)}
								class="min-w-0 flex-1 text-left"
							>
								<div class="flex items-center gap-2">
									<svg
										class="size-[0.75rem] flex-shrink-0 transition-transform {expandedRoleId ===
										role.roleId
											? 'rotate-90'
											: ''}"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
									<p class="text-button truncate font-medium text-primary">{role.name}</p>
								</div>
								{#if role.purpose}
									<p class="mt-1 text-xs text-secondary">{role.purpose}</p>
								{/if}
								<p class="mt-1 text-xs text-secondary">{role.fillerCount} fillers</p>
							</button>
							<button
								onclick={() => handleDeleteRole(role.roleId, role.name)}
								disabled={circles.loading.deleteRole}
								class="hover:bg-sidebar-hover ml-2 rounded-button text-secondary hover:text-primary disabled:opacity-50"
								style="padding: var(--spacing-2);"
								title="Delete role"
							>
								<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>

						<!-- Expanded Role Details -->
						{#if expandedRoleId === role.roleId}
							<div class="border-base px-card py-nav-item border-t">
								<!-- Assign User Form -->
								<div class="mb-3">
									<div class="flex gap-2">
										<select
											bind:value={assignUserId[role.roleId]}
											class="border-base text-button focus:border-accent-primary flex-1 rounded-button border bg-surface px-input-x py-input-y text-primary focus:outline-none"
											disabled={circles.loading.assignUser ||
												getAvailableUsersForRole(role.roleId).length === 0}
										>
											<option value="">
												{getAvailableUsersForRole(role.roleId).length === 0
													? 'All members assigned'
													: 'Select user...'}
											</option>
											{#each getAvailableUsersForRole(role.roleId) as user (user.userId)}
												<option value={user.userId}>
													{user.name || user.email}
												</option>
											{/each}
										</select>
										<button
											onclick={() => handleAssignUser(role.roleId)}
											disabled={!assignUserId[role.roleId] || circles.loading.assignUser}
											class="text-on-solid bg-accent-primary px-card hover:bg-accent-hover rounded-button py-input-y text-label font-medium disabled:opacity-50"
										>
											Assign
										</button>
									</div>
								</div>

								<!-- Role Fillers -->
								<div class="space-y-2">
									{#if roleFillers.length === 0}
										<p class="text-label text-secondary">No users assigned</p>
									{:else}
										{#each roleFillers as filler (filler.userId)}
											<div class="flex items-center justify-between text-label">
												<span class="text-primary">{filler.name || filler.email}</span>
												<button
													onclick={() => handleRemoveUser(role.roleId, filler.userId)}
													disabled={circles.loading.removeUser}
													class="rounded-button text-secondary hover:text-primary disabled:opacity-50"
													style="padding: var(--spacing-2);"
													title="Remove user"
												>
													<svg
														class="size-[0.75rem]"
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
										{/each}
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
