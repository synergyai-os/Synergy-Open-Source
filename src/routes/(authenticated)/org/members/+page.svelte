<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { Dialog } from 'bits-ui';
	import { useWorkspaceMembers } from '$lib/modules/core/workspaces/composables/useWorkspaceMembers.svelte';
	import { usePermissions } from '$lib/infrastructure/rbac/composables/usePermissions.svelte';
	import InviteMemberModal from '$lib/modules/core/workspaces/components/InviteMemberModal.svelte';
	import { DEFAULT_LOCALE, DEFAULT_SHORT_DATE_FORMAT } from '$lib/utils/locale';
	import type { WorkspacesModuleAPI } from '$lib/modules/core/workspaces/composables/useWorkspaces.svelte';
	import type { WorkspaceMember } from '$lib/modules/core/workspaces/composables/useWorkspaceMembers.svelte';
	import type { Id } from '$lib/convex';

	let { data: _data } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const workspaceId = $derived(() => {
		if (!workspaces) return undefined;
		return workspaces.activeWorkspaceId ?? undefined;
	});
	const organizationName = $derived(() => {
		if (!workspaces) return 'Organization';
		return workspaces.activeWorkspace?.name ?? 'Organization';
	});
	const getSessionId = () => $page.data.sessionId;
	// CRITICAL: Call $derived function to get primitive value (not the function itself)
	// Pattern: When passing $derived values to Convex queries, extract primitive first
	// See SYOS-228 for full pattern documentation
	const getWorkspaceId = () => workspaceId();

	// Initialize members composable
	const members = useWorkspaceMembers({
		sessionId: getSessionId,
		workspaceId: getWorkspaceId
	});

	const membersList = $derived(members.members);
	const invitesList = $derived(members.invites);
	const isLoading = $derived(!browser || membersList === null);

	// Check permissions for removing members
	// Users can remove members if they are owners OR have users.remove permission
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
		sessionId: () => getSessionId() ?? null,
		workspaceId: () => {
			const orgId = workspaceId();
			return orgId ? (orgId as Id<'workspaces'>) : null;
		},
		initialPermissions // Server-side preloaded for instant button visibility
	});

	// Check if current user can remove members
	const canRemoveMembers = $derived(() => {
		// Owners can always remove members
		if (workspaces && workspaces.activeWorkspace?.role === 'owner') {
			return true;
		}
		// Non-owners need users.remove permission
		return permissions.can('users.remove');
	});

	// Check if current user can invite members
	const canInviteMembers = $derived(() => {
		// Owners can always invite members
		if (workspaces && workspaces.activeWorkspace?.role === 'owner') {
			return true;
		}
		// Non-owners need users.invite permission
		return permissions.can('users.invite');
	});

	// Invite modal state
	let showInviteModal = $state(false);

	// Confirmation dialog state
	let confirmRemoveDialog = $state<{
		open: boolean;
		member: WorkspaceMember | null;
	}>({
		open: false,
		member: null
	});

	function openRemoveDialog(member: WorkspaceMember) {
		confirmRemoveDialog.member = member;
		confirmRemoveDialog.open = true;
	}

	function closeRemoveDialog() {
		confirmRemoveDialog.open = false;
		confirmRemoveDialog.member = null;
	}

	async function handleRemoveMember() {
		if (!confirmRemoveDialog.member) return;

		try {
			await members.removeMember({
				workspaceId: workspaceId()!,
				userId: confirmRemoveDialog.member.userId
			});
			closeRemoveDialog();
		} catch (error) {
			// Error already handled by composable toast
			console.error('Failed to remove member:', error);
		}
	}

	// Format date for display
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString(DEFAULT_LOCALE, DEFAULT_SHORT_DATE_FORMAT);
	}

	// Format role for display
	function formatRole(role: string): string {
		return role.charAt(0).toUpperCase() + role.slice(1);
	}
</script>

<div class="flex h-full flex-col bg-base">
	<!-- Header -->
	<header class="border-base py-header border-b bg-surface px-page">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-h3 font-semibold text-primary">Members</h1>
				<p class="text-button mt-1 text-secondary">{organizationName()}</p>
			</div>
			{#if canInviteMembers()}
				<button
					onclick={() => (showInviteModal = true)}
					class="text-on-solid bg-accent-primary py-nav-item text-button hover:bg-accent-hover rounded-button px-2 font-medium transition-colors"
				>
					Invite Member
				</button>
			{/if}
		</div>
	</header>

	<!-- Content -->
	<main class="flex-1 overflow-y-auto px-page py-page">
		{#if isLoading}
			<div class="flex h-64 items-center justify-center">
				<div class="text-secondary">Loading members...</div>
			</div>
		{:else if membersList.length === 0}
			<!-- Empty State -->
			<div class="flex h-64 flex-col items-center justify-center">
				<svg
					class="mb-4 size-icon-xl text-secondary"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
				<h2 class="text-h3 font-medium text-primary">No members yet</h2>
				<p class="text-button mt-1 text-secondary">Invite members to get started</p>
			</div>
		{:else}
			<!-- Members Table -->
			<div class="border-base overflow-hidden rounded-card border bg-surface">
				<table class="w-full">
					<thead class="border-base border-b bg-elevated">
						<tr>
							<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
								Name
							</th>
							<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
								Email
							</th>
							<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
								Role
							</th>
							<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
								Joined
							</th>
							<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{#each membersList as member (member.userId)}
							<tr class="border-base hover:bg-sidebar-hover border-b last:border-b-0">
								<td class="py-nav-item text-button px-2 text-primary">
									{member.name || '—'}
								</td>
								<td class="py-nav-item text-button px-2 text-secondary">{member.email}</td>
								<td class="py-nav-item text-button px-2 text-secondary">
									{formatRole(member.role)}
								</td>
								<td class="py-nav-item text-button px-2 text-secondary">
									{formatDate(member.joinedAt)}
								</td>
								<td class="py-nav-item px-2">
									{#if member.role === 'owner'}
										<span class="text-button text-secondary">—</span>
									{:else if canRemoveMembers()}
										<button
											onclick={() => openRemoveDialog(member)}
											disabled={members.loading.remove}
											class="text-button text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
											title="Remove member"
										>
											Remove
										</button>
									{:else}
										<span class="text-button text-secondary">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Invited Table -->
			{#if canInviteMembers() && invitesList.length > 0}
				<div class="mt-8">
					<h2 class="text-h3 mb-4 font-semibold text-primary">Invited</h2>
					<div class="border-base overflow-hidden rounded-card border bg-surface">
						<table class="w-full">
							<thead class="border-base border-b bg-elevated">
								<tr>
									<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
										Email
									</th>
									<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
										Role
									</th>
									<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
										Status
									</th>
									<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
										Invited
									</th>
									<th class="py-nav-item text-button px-2 text-left font-medium text-secondary">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{#each invitesList as invite (invite.inviteId)}
									<tr class="border-base hover:bg-sidebar-hover border-b last:border-b-0">
										<td class="py-nav-item text-button px-2 text-primary">
											{invite.email}
										</td>
										<td class="py-nav-item text-button px-2 text-secondary">
											{formatRole(invite.role)}
										</td>
										<td class="py-nav-item text-button px-2">
											<span
												class={invite.status === 'accepted'
													? 'text-accent-primary'
													: 'text-secondary'}
											>
												{invite.status === 'accepted' ? 'Accepted' : 'Pending'}
											</span>
										</td>
										<td class="py-nav-item text-button px-2 text-secondary">
											{formatDate(invite.invitedAt)}
										</td>
										<td class="py-nav-item px-2">
											{#if invite.status === 'pending' && invite.email}
												<button
													onclick={() => members.resendInvite(invite.inviteId)}
													disabled={members.loading.resend}
													class="text-button text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
													title="Resend invite email"
												>
													Resend
												</button>
											{:else}
												<span class="text-button text-secondary">—</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}
	</main>
</div>

<!-- Remove Member Confirmation Dialog -->
<Dialog.Root
	open={confirmRemoveDialog.open}
	onOpenChange={(open) => {
		if (!open) closeRemoveDialog();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 transition-opacity" />
		<Dialog.Content
			class="border-base fixed top-1/2 left-1/2 z-50 w-[min(500px,90vw)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-card border bg-surface text-primary shadow-xl"
		>
			<div class="space-y-6 px-page py-page">
				<div>
					<Dialog.Title class="text-h3 font-semibold text-primary">Remove Member</Dialog.Title>
					<Dialog.Description class="text-button mt-1 text-secondary">
						Are you sure you want to remove
						<span class="font-medium text-primary">
							{confirmRemoveDialog.member?.name || confirmRemoveDialog.member?.email}
						</span>
						from this workspace? This action cannot be undone.
					</Dialog.Description>
				</div>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={closeRemoveDialog}
						disabled={members.loading.remove}
						class="border-base py-nav-item text-button hover:bg-sidebar-hover rounded-button border bg-elevated px-2 font-medium text-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleRemoveMember}
						disabled={members.loading.remove}
						class="text-on-solid bg-accent-primary py-nav-item text-button hover:bg-accent-hover rounded-button px-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						{members.loading.remove ? 'Removing...' : 'Remove Member'}
					</button>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<!-- Invite Member Modal -->
<InviteMemberModal
	open={showInviteModal}
	onOpenChange={(open) => (showInviteModal = open)}
	type="workspace"
	targetId={workspaceId() as Id<'workspaces'>}
	targetName={organizationName()}
	sessionId={getSessionId}
/>
