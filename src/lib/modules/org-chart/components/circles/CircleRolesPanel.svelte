<script lang="ts">
	import { page } from '$app/stores';
	import {
		useCircleRoles,
		type UseCircles,
		type CircleRole,
		type CircleMember
	} from '$lib/infrastructure/organizational-model';

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
			| 'archiveRole'
			| 'assignPersonToRole'
			| 'removePersonFromRole'
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
	let newRoleDecisionRights = $state('');

	// State for expanding role details
	let expandedRoleId = $state<string | null>(null);

	// Use composable for circle roles queries
	const circleRoles = useCircleRoles({
		sessionId: getSessionId,
		expandedRoleId: () => expandedRoleId,
		members: () => members
	});

	const roleFillers = $derived(circleRoles.roleFillers);

	// State for assigning people
	let assignPersonId = $state<Record<string, string>>({});

	async function handleCreateRole() {
		if (!newRoleName.trim()) return;

		if (!newRolePurpose.trim()) return;

		const decisionRights = newRoleDecisionRights
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);

		if (decisionRights.length === 0) return;

		await circles.createRole({
			circleId,
			name: newRoleName.trim(),
			purpose: newRolePurpose.trim(),
			decisionRights
		});

		// Reset form on success
		if (!circles.loading.createRole) {
			newRoleName = '';
			newRolePurpose = '';
			newRoleDecisionRights = '';
			showCreateForm = false;
		}
	}

	async function handleAssignPerson(roleId: string) {
		const personId = assignPersonId[roleId];
		if (!personId) return;

		await circles.assignPersonToRole({ circleRoleId: roleId, assigneePersonId: personId });

		// Reset selection on success (use spread to trigger reactivity)
		assignPersonId = { ...assignPersonId, [roleId]: '' };
	}

	async function handleRemovePerson(roleId: string, personId: string) {
		if (confirm('Remove this person from the role?')) {
			await circles.removePersonFromRole({ circleRoleId: roleId, assigneePersonId: personId });
		}
	}

	async function handleArchiveRole(roleId: string, roleName: string) {
		if (confirm(`Archive role "${roleName}"? All user assignments will be removed.`)) {
			await circles.archiveRole({ circleRoleId: roleId });
		}
	}

	function toggleRoleExpand(roleId: string) {
		expandedRoleId = expandedRoleId === roleId ? null : roleId;
	}

	// Filter out people who are already assigned to this role
	function getAvailablePeopleForRole(_roleId: string): CircleMember[] {
		// Note: roleFillers already filtered by expandedRoleId via query
		return circleRoles.availablePersons;
	}
</script>

<div class="border-base rounded-card bg-surface flex h-full flex-col border">
	<!-- Panel Header -->
	<div class="border-base py-nav-item px-button-sm-x border-b">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-button text-primary font-semibold">Roles</h2>
				<p class="text-label text-secondary mt-fieldGroup">{roles.length} roles</p>
			</div>
			<button
				onclick={() => (showCreateForm = !showCreateForm)}
				class="hover:bg-sidebar-hover rounded-button inset-sm text-secondary hover:text-primary"
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
		<div class="border-base py-nav-item px-button-sm-x border-b">
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
					class="border-base text-button rounded-button bg-elevated px-input-x py-input-y text-primary focus:border-accent-primary w-full border focus:outline-none"
					required
				/>
				<textarea
					bind:value={newRolePurpose}
					placeholder="Purpose *"
					rows={2}
					class="border-base text-button rounded-button bg-elevated px-input-x py-input-y text-primary focus:border-accent-primary w-full border focus:outline-none"
				></textarea>
				<textarea
					bind:value={newRoleDecisionRights}
					placeholder="Decision rights (one per line) *"
					rows={3}
					class="border-base text-button rounded-button bg-elevated px-input-x py-input-y text-primary focus:border-accent-primary w-full border focus:outline-none"
				></textarea>
				<div class="gap-button flex">
					<button
						type="button"
						onclick={() => {
							showCreateForm = false;
							newRoleName = '';
							newRolePurpose = '';
							newRoleDecisionRights = '';
						}}
						class="border-base px-card text-button rounded-button py-input-y text-secondary hover:text-primary border font-medium"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={circles.loading.createRole ||
							!newRoleName.trim() ||
							!newRolePurpose.trim() ||
							!newRoleDecisionRights.trim()}
						class="text-on-solid px-card text-button rounded-button bg-accent-primary py-input-y hover:bg-accent-hover font-medium disabled:opacity-50"
					>
						{circles.loading.createRole ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Roles List -->
	<div class="py-nav-item px-button-sm-x flex-1 overflow-y-auto">
		{#if roles.length === 0}
			<div class="flex h-32 items-center justify-center text-center">
				<p class="text-button text-secondary">No roles yet</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each roles as role (role.roleId)}
					<div class="border-base rounded-button bg-elevated border">
						<!-- Role Header -->
						<div class="px-card py-nav-item flex items-start justify-between">
							<button
								onclick={() => toggleRoleExpand(role.roleId)}
								class="min-w-0 flex-1 text-left"
							>
								<div class="gap-button flex items-center">
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
									<p class="text-button text-primary truncate font-medium">{role.name}</p>
								</div>
								{#if role.purpose}
									<p class="text-label text-secondary mt-fieldGroup">{role.purpose}</p>
								{/if}
								<p class="text-label text-secondary mt-fieldGroup">{role.fillerCount} fillers</p>
							</button>
							<button
								onclick={() => handleArchiveRole(role.roleId, role.name)}
								disabled={circles.loading.archiveRole}
								class="hover:bg-sidebar-hover rounded-button inset-sm text-secondary hover:text-primary ml-2 disabled:opacity-50"
								title="Archive role"
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
								<!-- Assign Person Form -->
								<div class="mb-header">
									<div class="gap-button flex">
										<select
											bind:value={assignPersonId[role.roleId]}
											class="border-base text-button rounded-button bg-surface px-input-x py-input-y text-primary focus:border-accent-primary flex-1 border focus:outline-none"
											disabled={circles.loading.assignPerson ||
												getAvailablePeopleForRole(role.roleId).length === 0}
										>
											<option value="">
												{getAvailablePeopleForRole(role.roleId).length === 0
													? 'All members assigned'
													: 'Select person...'}
											</option>
											{#each getAvailablePeopleForRole(role.roleId) as person (person.personId)}
												<option value={person.personId}>
													{person.displayName || person.email}
												</option>
											{/each}
										</select>
										<button
											onclick={() => handleAssignPerson(role.roleId)}
											disabled={!assignPersonId[role.roleId] || circles.loading.assignPerson}
											class="text-on-solid px-card rounded-button bg-accent-primary py-input-y text-label hover:bg-accent-hover font-medium disabled:opacity-50"
										>
											Assign
										</button>
									</div>
								</div>

								<!-- Role Fillers -->
								<div class="space-y-2">
									{#if roleFillers.length === 0}
										<p class="text-label text-secondary">No people assigned</p>
									{:else}
										{#each roleFillers as filler (filler.personId)}
											<div class="text-label flex items-center justify-between">
												<span class="text-primary">{filler.displayName || filler.email}</span>
												<button
													onclick={() => handleRemovePerson(role.roleId, filler.personId)}
													disabled={circles.loading.removePerson}
													class="rounded-button inset-sm text-secondary hover:text-primary disabled:opacity-50"
													title="Remove person"
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
