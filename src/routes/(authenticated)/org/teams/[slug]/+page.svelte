<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { useTeams } from '$lib/composables/useTeams.svelte';
	import InviteMemberModal from '$lib/components/InviteMemberModal.svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
	import type { Id } from '$lib/convex';

	let {
		data: _data,
		params
	}: {
		data: unknown;
		params: { slug: string };
	} = $props();

	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const organizationId = $derived(() => {
		if (!organizations) return undefined;
		return organizations.activeOrganizationId ?? undefined;
	});
	const organizationName = $derived(() => {
		if (!organizations) return 'Organization';
		return organizations.activeOrganization?.name ?? 'Organization';
	});
	const getSessionId = () => $page.data.sessionId;
	const getOrganizationId = () => organizationId();
	const getTeamSlug = () => params.slug;

	// Initialize teams composable
	const teams = useTeams({
		sessionId: getSessionId,
		organizationId: getOrganizationId,
		teamSlug: getTeamSlug
	});

	const team = $derived(teams.team);
	const isLoading = $derived(!browser || team === null);

	// Invite modal state
	let showInviteModal = $state(false);
</script>

<div class="flex h-full flex-col bg-base">
	<!-- Header -->
	<header class="border-b border-base bg-surface px-inbox-container py-header">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-semibold text-primary">
					{isLoading ? 'Loading...' : (team?.name ?? 'Team')}
				</h1>
				<p class="mt-1 text-sm text-secondary">{organizationName()}</p>
			</div>
			{#if team && !isLoading}
				<button
					class="text-on-solid rounded-md bg-accent-primary px-nav-item py-nav-item text-sm font-medium hover:bg-accent-hover"
					onclick={() => (showInviteModal = true)}
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
				<div class="text-secondary">Loading team...</div>
			</div>
		{:else if !team}
			<div class="flex h-64 items-center justify-center">
				<div class="text-center">
					<h2 class="text-lg font-medium text-primary">Team not found</h2>
					<p class="mt-1 text-sm text-secondary">
						This team may have been deleted or you don't have access.
					</p>
				</div>
			</div>
		{:else}
			<!-- Team Details -->
			<div class="space-y-6">
				<!-- Team Info -->
				<div class="rounded-lg border border-base bg-surface p-content-padding">
					<h2 class="mb-4 text-lg font-semibold text-primary">Team Information</h2>
					<div class="space-y-4">
						<div>
							<div class="mb-1 text-xs font-medium text-secondary">Name</div>
							<div class="text-sm text-primary">{team.name}</div>
						</div>
						<div>
							<div class="mb-1 text-xs font-medium text-secondary">Members</div>
							<div class="text-sm text-primary">{team.members.length}</div>
						</div>
						<div>
							<div class="mb-1 text-xs font-medium text-secondary">Created</div>
							<div class="text-sm text-primary">
								{new Date(team.createdAt).toLocaleDateString()}
							</div>
						</div>
					</div>
				</div>

				<!-- Team Members -->
				<div class="rounded-lg border border-base bg-surface p-content-padding">
					<h2 class="mb-4 text-lg font-semibold text-primary">Members</h2>
					{#if team.members.length === 0}
						<p class="text-sm text-secondary">No members yet.</p>
					{:else}
						<div class="overflow-hidden rounded-lg border border-base">
							<table class="w-full">
								<thead class="border-b border-base bg-elevated">
									<tr>
										<th
											class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary"
										>
											Name
										</th>
										<th
											class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary"
										>
											Email
										</th>
										<th
											class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary"
										>
											Role
										</th>
										<th
											class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary"
										>
											Joined
										</th>
									</tr>
								</thead>
								<tbody>
									{#each team.members as member (member.userId)}
										<tr class="border-b border-base last:border-b-0 hover:bg-sidebar-hover">
											<td class="px-nav-item py-nav-item text-sm text-primary">
												{member.name || '—'}
											</td>
											<td class="px-nav-item py-nav-item text-sm text-secondary">
												{member.email}
											</td>
											<td class="px-nav-item py-nav-item text-sm text-secondary">
												{member.role === 'admin' ? 'Admin' : 'Member'}
											</td>
											<td class="px-nav-item py-nav-item text-sm text-secondary">
												{new Date(member.joinedAt).toLocaleDateString()}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<!-- Invite Member Modal -->
{#if team && organizationId()}
	<InviteMemberModal
		open={showInviteModal}
		onOpenChange={(open) => (showInviteModal = open)}
		type="team"
		targetId={team.teamId}
		targetName={team.name}
		sessionId={getSessionId}
	/>
{/if}
