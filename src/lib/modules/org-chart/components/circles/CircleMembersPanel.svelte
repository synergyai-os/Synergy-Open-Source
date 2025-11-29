<script lang="ts">
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { useCircleMembers } from '../../composables/useCircleMembers.svelte';
	import type { UseCircles, CircleMember } from '../../composables/useCircles.svelte';
	import type { WorkspacesModuleAPI } from '$lib/modules/core/workspaces/composables/useWorkspaces.svelte';

	let {
		circles,
		circleId,
		members
	}: {
		circles: Pick<UseCircles, 'loading' | 'addMember' | 'removeMember'>;
		circleId: string;
		members: CircleMember[];
	} = $props();

	const getSessionId = () => $page.data.sessionId;

	// Get workspaceId from context (passed from parent page)
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const getWorkspaceId = () => workspaces?.activeWorkspaceId ?? undefined;

	// Use composable for circle members queries
	const circleMembers = useCircleMembers({
		sessionId: getSessionId,
		workspaceId: getWorkspaceId,
		members: () => members
	});

	const availableUsers = $derived(circleMembers.availableUsers);

	let selectedUserId = $state('');

	async function handleAddMember() {
		if (!selectedUserId) return;

		await circles.addMember({ circleId, userId: selectedUserId });
		selectedUserId = ''; // Reset selection
	}

	async function handleRemoveMember(userId: string) {
		if (confirm('Remove this member from the circle?')) {
			await circles.removeMember({ circleId, userId });
		}
	}
</script>

<div class="border-base flex h-full flex-col rounded-card border bg-surface">
	<!-- Panel Header -->
	<div class="border-base py-nav-item border-b px-2">
		<h2 class="text-button font-semibold text-primary">Members</h2>
		<p class="mt-1 text-label text-secondary">{members.length} members</p>
	</div>

	<!-- Add Member Form -->
	<div class="border-base py-nav-item border-b px-2">
		<div class="flex gap-2">
			<select
				bind:value={selectedUserId}
				class="border-base text-button focus:border-accent-primary flex-1 rounded-button border bg-elevated px-input-x py-input-y text-primary focus:outline-none"
				disabled={circles.loading.addMember || availableUsers.length === 0}
			>
				<option value="">
					{availableUsers.length === 0 ? 'All members added' : 'Select user...'}
				</option>
				{#each availableUsers as user (user.userId)}
					<option value={user.userId}>
						{user.name || user.email}
					</option>
				{/each}
			</select>
			<button
				onclick={handleAddMember}
				disabled={!selectedUserId || circles.loading.addMember}
				class="text-on-solid bg-accent-primary px-card text-button hover:bg-accent-hover rounded-button py-input-y font-medium disabled:opacity-50"
			>
				{circles.loading.addMember ? 'Adding...' : 'Add'}
			</button>
		</div>
	</div>

	<!-- Members List -->
	<div class="py-nav-item flex-1 overflow-y-auto px-2">
		{#if members.length === 0}
			<div class="flex h-32 items-center justify-center text-center">
				<p class="text-button text-secondary">No members yet</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each members as member (member.userId)}
					<div
						class="border-base px-card py-nav-item flex items-center justify-between rounded-button border bg-elevated"
					>
						<div class="min-w-0 flex-1">
							<p class="text-button truncate font-medium text-primary">
								{member.name || member.email}
							</p>
							{#if member.name}
								<p class="truncate text-label text-secondary">{member.email}</p>
							{/if}
						</div>
						<button
							onclick={() => handleRemoveMember(member.userId)}
							disabled={circles.loading.removeMember}
							class="hover:bg-sidebar-hover ml-2 rounded-button text-secondary hover:text-primary disabled:opacity-50"
							style="padding: var(--spacing-2);"
							title="Remove member"
						>
							<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		{/if}
	</div>
</div>
