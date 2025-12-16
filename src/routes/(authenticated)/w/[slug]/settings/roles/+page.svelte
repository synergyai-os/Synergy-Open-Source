<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Button, Badge, Heading, Text } from '$lib/components/atoms';
	import { Dialog } from 'bits-ui';
	import { invariant } from '$lib/utils/invariant';

	let { data }: { data: PageData } = $props();

	const convexClient = browser ? useConvexClient() : null;
	const sessionId = $derived(data.sessionId);
	const workspaceId = $derived(data.workspaceId as Id<'workspaces'>);

	// Queries
	const getSessionId = () => sessionId;
	const getWorkspaceId = () => workspaceId;

	// SYOS-855: Roles queries moved to infrastructure/access/workspaceRoles
	const membersQuery =
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.infrastructure.access.workspaceRoles.getWorkspaceMembersWithRoles, () => {
					const s = getSessionId();
					const w = getWorkspaceId();
					invariant(s && w, 'sessionId and workspaceId required');
					return { sessionId: s, workspaceId: w };
				})
			: null;

	const rolesQuery =
		browser && getSessionId()
			? useQuery(api.infrastructure.access.workspaceRoles.getAssignableRoles, () => {
					const s = getSessionId();
					invariant(s, 'sessionId required');
					return { sessionId: s };
				})
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
		invariant(convexClient && sessionId, 'Not authenticated');
		invariant(selectedUserId && selectedRoleId, 'Please select a user and role');

		assignLoading = true;
		assignError = null;

		try {
			const role = availableRoles.find((r) => r._id === selectedRoleId);
			invariant(role, 'Role not found');

			await convexClient.mutation(api.infrastructure.rbac.roles.assignRole, {
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
			await convexClient.mutation(api.infrastructure.rbac.roles.revokeRole, {
				sessionId,
				userRoleId: userRoleId as Id<'systemRoles'> | Id<'workspaceRoles'>
			});
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to remove role');
		}
	}

	function openAssignModalForUser(userId: string) {
		selectedUserId = userId;
		assignModalOpen = true;
	}
</script>

<div class="bg-base h-full overflow-y-auto">
	<div class="px-page py-page mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-section flex items-center justify-between">
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
			class="border-accent-primary/20 bg-accent-primary/10 rounded-card card-padding mb-section border"
		>
			<Text variant="body" size="sm" color="secondary">
				Roles control what users can do. <strong>System roles</strong> apply globally.
				<strong>Workspace roles</strong> apply only to this workspace.
			</Text>
		</div>

		<!-- Members List -->
		<div class="gap-form flex flex-col">
			{#each members as member (member.userId)}
				<div class="border-base rounded-card bg-surface card-padding border">
					<div class="gap-form flex items-start justify-between">
						<div class="min-w-0 flex-1">
							<Text variant="body" size="sm" color="primary" class="font-medium">
								{member.userName || member.userEmail}
							</Text>
							<Text variant="body" size="sm" color="secondary">
								{member.userEmail}
							</Text>

							<!-- User's Roles -->
							{#if member.roles.length > 0}
								<div class="gap-fieldGroup mt-fieldGroup flex flex-wrap">
									{#each member.roles as role (role.userRoleId)}
										<div class="flex items-center gap-1">
											<Badge variant={role.scope === 'system' ? 'primary' : 'default'}>
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
												class="text-tertiary hover:text-error transition-colors"
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

						<Button variant="secondary" onclick={() => openAssignModalForUser(member.userId)}>
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
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] border-base shadow-card-hover rounded-card bg-surface text-primary fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(500px,90vw)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto border"
		>
			<div class="space-y-form px-page py-page">
				<div>
					<Dialog.Title class="text-h3 text-primary font-semibold">Assign Role</Dialog.Title>
					<Dialog.Description class="text-small text-secondary mt-fieldGroup">
						Assign an RBAC role to a workspace member
					</Dialog.Description>
				</div>

				<div class="space-y-form">
					<!-- User Selector -->
					<div>
						<label
							for="user-select"
							class="text-small mb-fieldGroup text-primary block font-medium"
						>
							User
						</label>
						<select
							id="user-select"
							bind:value={selectedUserId}
							class="border-base bg-input text-small focus:ring-accent-primary rounded-input px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
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
						<label
							for="role-select"
							class="text-small mb-fieldGroup text-primary block font-medium"
						>
							Role
						</label>
						<select
							id="role-select"
							bind:value={selectedRoleId}
							class="border-base bg-input text-small focus:ring-accent-primary rounded-input px-input py-input text-primary w-full border focus:ring-2 focus:outline-none"
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
						<p class="text-small mb-fieldGroup text-primary block font-medium">Scope</p>
						<div class="space-y-fieldGroup">
							<label class="gap-fieldGroup flex items-center">
								<input
									type="radio"
									name="scope"
									value="workspace"
									bind:group={scopeType}
									class="focus:ring-accent-primary text-accent-primary"
								/>
								<span class="text-small text-primary">This workspace only</span>
							</label>
							<label class="gap-fieldGroup flex items-center">
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
						class="border-base text-small rounded-button px-button py-button text-secondary hover:text-primary border font-medium"
					>
						Cancel
					</Dialog.Close>
					<Button variant="primary" onclick={handleAssignRole} disabled={assignLoading}>
						{assignLoading ? 'Assigning...' : 'Assign Role'}
					</Button>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
