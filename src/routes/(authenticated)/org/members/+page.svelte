<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { Dialog } from 'bits-ui';
	import { useOrganizationMembers } from '$lib/composables/useOrganizationMembers.svelte';
	import { usePermissions } from '$lib/composables/usePermissions.svelte';
	import InviteMemberModal from '$lib/components/InviteMemberModal.svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
	import type { OrganizationMember } from '$lib/composables/useOrganizationMembers.svelte';
	import type { Id } from '$lib/convex';

	let { data: _data } = $props();

	const organizations = getContext<UseOrganizations | undefined>('organizations');
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const organizationId = $derived(() => {
		if (!organizations) return undefined;
		return organizations.activeOrganizationId ?? undefined;
	});
	const organizationName = $derived(() => {
		if (!organizations) return 'Organization';
		return organizations.activeOrganization?.name ?? 'Organization';
	});
	const getSessionId = () => $page.data.sessionId;
	// CRITICAL: Call $derived function to get primitive value (not the function itself)
	// Pattern: When passing $derived values to Convex queries, extract primitive first
	// See SYOS-228 for full pattern documentation
	const getOrganizationId = () => organizationId();

	// Redirect to onboarding if no org selected
	$effect(() => {
		if (browser && !organizationId()) {
			goto(resolveRoute('/org/onboarding'));
		}
	});

	// Initialize members composable
	const members = useOrganizationMembers({
		sessionId: getSessionId,
		organizationId: getOrganizationId
	});

	const membersList = $derived(members.members);
	const invitesList = $derived(members.invites);
	const isLoading = $derived(!browser || membersList === null);

	// Check permissions for removing members
	// Users can remove members if they are owners OR have users.remove permission
	const permissions = usePermissions({
		sessionId: () => getSessionId() ?? null,
		organizationId: () => {
			const orgId = organizationId();
			return orgId ? (orgId as Id<'organizations'>) : null;
		}
	});

	// Check if current user can remove members
	const canRemoveMembers = $derived(() => {
		// Owners can always remove members
		if (organizations && organizations.activeOrganization?.role === 'owner') {
			return true;
		}
		// Non-owners need users.remove permission
		return permissions.can('users.remove');
	});

	// Check if current user can invite members
	const canInviteMembers = $derived(() => {
		// Owners can always invite members
		if (organizations && organizations.activeOrganization?.role === 'owner') {
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
		member: OrganizationMember | null;
	}>({
		open: false,
		member: null
	});

	function openRemoveDialog(member: OrganizationMember) {
		confirmRemoveDialog.member = member;
		confirmRemoveDialog.open = true;
	}

	function closeRemoveDialog() {
		confirmRemoveDialog.open = false;
		confirmRemoveDialog.member = null;
	}

	async function handleRemoveMember() {
		if (!confirmRemoveDialog.member || !organizationId()) return;

		try {
			await members.removeMember({
				organizationId: organizationId()!,
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
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Format role for display
	function formatRole(role: string): string {
		return role.charAt(0).toUpperCase() + role.slice(1);
	}
</script>

<div class="flex h-full flex-col bg-base">
	<!-- Header -->
	<header class="border-b border-base bg-surface px-inbox-container py-header">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-semibold text-primary">Members</h1>
				<p class="mt-1 text-sm text-secondary">{organizationName()}</p>
			</div>
			{#if canInviteMembers()}
				<button
					onclick={() => (showInviteModal = true)}
					class="text-on-solid rounded-md bg-accent-primary px-nav-item py-nav-item text-sm font-medium transition-colors hover:bg-accent-hover"
				>
					Invite Member
				</button>
			{/if}
		</div>
	</header>

	<!-- Content -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-inbox-container">
		{#if isLoading}
			<div class="flex h-64 items-center justify-center">
				<div class="text-secondary">Loading members...</div>
			</div>
		{:else if membersList.length === 0}
			<!-- Empty State -->
			<div class="flex h-64 flex-col items-center justify-center">
				<svg
					class="mb-4 h-12 w-12 text-secondary"
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
				<h2 class="text-lg font-medium text-primary">No members yet</h2>
				<p class="mt-1 text-sm text-secondary">Invite members to get started</p>
			</div>
		{:else}
			<!-- Members Table -->
			<div class="overflow-hidden rounded-lg border border-base bg-surface">
				<table class="w-full">
					<thead class="border-b border-base bg-elevated">
						<tr>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Name
							</th>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Email
							</th>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Role
							</th>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Joined
							</th>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{#each membersList as member (member.userId)}
							<tr class="border-b border-base last:border-b-0 hover:bg-sidebar-hover">
								<td class="px-nav-item py-nav-item text-sm text-primary">
									{member.name || '—'}
								</td>
								<td class="px-nav-item py-nav-item text-sm text-secondary">{member.email}</td>
								<td class="px-nav-item py-nav-item text-sm text-secondary">
									{formatRole(member.role)}
								</td>
								<td class="px-nav-item py-nav-item text-sm text-secondary">
									{formatDate(member.joinedAt)}
								</td>
								<td class="px-nav-item py-nav-item">
									{#if member.role === 'owner'}
										<span class="text-sm text-secondary">—</span>
									{:else if canRemoveMembers()}
										<button
											onclick={() => openRemoveDialog(member)}
											disabled={members.loading.remove}
											class="text-sm text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
											title="Remove member"
										>
											Remove
										</button>
									{:else}
										<span class="text-sm text-secondary">—</span>
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
					<h2 class="mb-4 text-lg font-semibold text-primary">Invited</h2>
					<div class="overflow-hidden rounded-lg border border-base bg-surface">
						<table class="w-full">
							<thead class="border-b border-base bg-elevated">
								<tr>
									<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
										Email
									</th>
									<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
										Role
									</th>
									<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
										Status
									</th>
									<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
										Invited
									</th>
									<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{#each invitesList as invite (invite.inviteId)}
									<tr class="border-b border-base last:border-b-0 hover:bg-sidebar-hover">
										<td class="px-nav-item py-nav-item text-sm text-primary">
											{invite.email}
										</td>
										<td class="px-nav-item py-nav-item text-sm text-secondary">
											{formatRole(invite.role)}
										</td>
										<td class="px-nav-item py-nav-item text-sm">
											<span
												class={invite.status === 'accepted'
													? 'text-accent-primary'
													: 'text-secondary'}
											>
												{invite.status === 'accepted' ? 'Accepted' : 'Pending'}
											</span>
										</td>
										<td class="px-nav-item py-nav-item text-sm text-secondary">
											{formatDate(invite.invitedAt)}
										</td>
										<td class="px-nav-item py-nav-item">
											{#if invite.status === 'pending' && invite.email}
												<button
													onclick={() => members.resendInvite(invite.inviteId)}
													disabled={members.loading.resend}
													class="text-sm text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
													title="Resend invite email"
												>
													Resend
												</button>
											{:else}
												<span class="text-sm text-secondary">—</span>
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
			class="fixed top-1/2 left-1/2 z-50 w-[min(500px,90vw)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-base bg-surface text-primary shadow-xl"
		>
			<div class="space-y-6 px-inbox-container py-inbox-container">
				<div>
					<Dialog.Title class="text-lg font-semibold text-primary">Remove Member</Dialog.Title>
					<Dialog.Description class="mt-1 text-sm text-secondary">
						Are you sure you want to remove
						<span class="font-medium text-primary">
							{confirmRemoveDialog.member?.name || confirmRemoveDialog.member?.email}
						</span>
						from this organization? This action cannot be undone.
					</Dialog.Description>
				</div>

				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={closeRemoveDialog}
						disabled={members.loading.remove}
						class="rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm font-medium text-secondary transition-colors hover:bg-sidebar-hover disabled:cursor-not-allowed disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleRemoveMember}
						disabled={members.loading.remove}
						class="text-on-solid rounded-md bg-accent-primary px-nav-item py-nav-item text-sm font-medium transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
					>
						{members.loading.remove ? 'Removing...' : 'Remove Member'}
					</button>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<!-- Invite Member Modal -->
{#if organizationId()}
	<InviteMemberModal
		open={showInviteModal}
		onOpenChange={(open) => (showInviteModal = open)}
		type="organization"
		targetId={organizationId() as Id<'organizations'>}
		targetName={organizationName()}
		sessionId={getSessionId}
	/>
{/if}
