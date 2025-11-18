<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import type { UseOrgChart } from '$lib/composables/useOrgChart.svelte';
	import CircleDetailHeader from './CircleDetailHeader.svelte';
	import CategoryHeader from './CategoryHeader.svelte';
	import RoleCard from './RoleCard.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';

	let { orgChart }: { orgChart: UseOrgChart } = $props();

	const circle = $derived(orgChart.selectedCircle);
	const members = $derived(orgChart.selectedCircleMembers);
	const isOpen = $derived(orgChart.selectedCircleId !== null);
	const isLoading = $derived(orgChart.selectedCircleIsLoading);
	const error = $derived(orgChart.selectedCircleError);

	// Filter child circles from all circles (proven pattern: filter from existing query)
	const childCircles = $derived(
		orgChart.selectedCircleId
			? orgChart.circles.filter((c) => c.parentCircleId === orgChart.selectedCircleId)
			: []
	);

	// Get roles from selected circle (roles are already in circles.list query)
	// Note: circles.list includes roles but only with roleId and name
	// For full role details (purpose, fillerCount), we'd need a separate query
	// But since roles are visible in chart, they exist in circles data
	const roles = $derived.by(() => {
		if (!orgChart.selectedCircleId) {
			return [];
		}

		const selectedCircle = orgChart.circles.find((c) => c.circleId === orgChart.selectedCircleId);

		if (!selectedCircle) {
			return [];
		}

		// Map roles from circles data to match expected format
		// Note: circles.list only provides roleId and name, not purpose or fillerCount
		return (selectedCircle?.roles ?? []).map((role) => ({
			roleId: role.roleId,
			name: role.name,
			purpose: undefined, // Not available in circles.list
			fillerCount: 0 // Not available in circles.list
		}));
	});

	// Tab state with dummy counts
	let activeTab = $state(
		'overview' as
			| 'overview'
			| 'members'
			| 'documents'
			| 'activities'
			| 'metrics'
			| 'checklists'
			| 'projects'
	);
	const tabCounts = $state({
		overview: 0,
		members: 0,
		documents: 0,
		activities: 0,
		metrics: 0,
		checklists: 0,
		projects: 0
	});

	function handleClose() {
		orgChart.selectCircle(null);
	}

	function handleRoleClick(roleId: string) {
		orgChart.selectRole(roleId as Id<'circleRoles'>, 'circle-panel');
	}

	function handleChildCircleClick(circleId: string) {
		orgChart.selectCircle(circleId as Id<'circles'>);
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<!-- Backdrop -->
{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
		onclick={handleClose}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				handleClose();
			}
		}}
		role="button"
		tabindex="-1"
	></div>
{/if}

<!-- Panel -->
<aside
	class="fixed top-0 right-0 z-50 h-full w-full transform border-l border-base bg-elevated shadow-xl transition-transform duration-300 ease-in-out sm:w-[900px] lg:w-[1200px]"
	class:translate-x-0={isOpen}
	class:translate-x-full={!isOpen}
>
	{#if isLoading}
		<!-- Loading State -->
		<div class="flex h-full items-center justify-center">
			<div class="text-center">
				<svg class="mx-auto h-8 w-8 animate-spin text-tertiary" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<p class="mt-4 text-sm text-secondary">Loading circle details...</p>
			</div>
		</div>
	{:else if error}
		<!-- Error State -->
		<div class="flex h-full items-center justify-center">
			<div class="text-center">
				<p class="text-sm font-medium text-error">Failed to load circle</p>
				<p class="mt-2 text-sm text-secondary">{String(error)}</p>
			</div>
		</div>
	{:else if circle}
		<div class="flex h-full flex-col">
			<!-- Header -->
			<CircleDetailHeader
				circleName={circle.name}
				onClose={handleClose}
				onEdit={() => {
					/* TODO: Implement edit circle */
				}}
				addMenuItems={[
					{ label: 'Add lead members', onclick: () => {} },
					{ label: 'Add member', onclick: () => {} }
				]}
				headerMenuItems={[
					{ label: 'Copy URL', onclick: () => {} },
					{ label: 'Export to PDF', onclick: () => {} },
					{ label: 'Export to spreadsheet', onclick: () => {} },
					{ label: 'Reduce circle into role', onclick: () => {} },
					{ label: 'Move circle', onclick: () => {} },
					{ label: 'Restructure a sub-circle', onclick: () => {} },
					{ label: 'Notifications', onclick: () => {} },
					{ label: 'Settings', onclick: () => {} },
					{ label: 'Delete circle', onclick: () => {}, danger: true }
				]}
			/>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto">
				<!-- Circle Name -->
				<div class="px-inbox-container py-system-content">
					<h3 class="text-2xl font-bold text-primary">{circle.name}</h3>
					{#if circle.parentName}
						<p class="mt-1 text-sm text-secondary">
							Parent: <span class="font-medium">{circle.parentName}</span>
						</p>
					{/if}
				</div>

				<!-- Navigation Tabs -->
				<div class="border-b border-base px-inbox-container">
					<div class="flex gap-1 overflow-x-auto" role="tablist">
						<button
							type="button"
							class="flex-shrink-0 border-b-2 px-nav-item py-nav-item text-sm transition-colors"
							class:border-accent-primary={activeTab === 'overview'}
							class:border-transparent={activeTab !== 'overview'}
							class:text-primary={activeTab === 'overview'}
							class:text-secondary={activeTab !== 'overview'}
							onclick={() => {
								activeTab = 'overview';
							}}
							role="tab"
							aria-selected={activeTab === 'overview'}
						>
							Overview
						</button>
						<button
							type="button"
							class="flex-shrink-0 border-b-2 px-nav-item py-nav-item text-sm transition-colors"
							class:border-accent-primary={activeTab === 'members'}
							class:border-transparent={activeTab !== 'members'}
							class:text-primary={activeTab === 'members'}
							class:text-secondary={activeTab !== 'members'}
							onclick={() => {
								activeTab = 'members';
							}}
							role="tab"
							aria-selected={activeTab === 'members'}
						>
							Members
							{#if tabCounts.members > 0}
								<span class="ml-1 text-xs text-tertiary">({tabCounts.members})</span>
							{/if}
						</button>
						<button
							type="button"
							class="flex-shrink-0 border-b-2 px-nav-item py-nav-item text-sm transition-colors"
							class:border-accent-primary={activeTab === 'documents'}
							class:border-transparent={activeTab !== 'documents'}
							class:text-primary={activeTab === 'documents'}
							class:text-secondary={activeTab !== 'documents'}
							onclick={() => {
								activeTab = 'documents';
							}}
							role="tab"
							aria-selected={activeTab === 'documents'}
						>
							Documents
							{#if tabCounts.documents > 0}
								<span class="ml-1 text-xs text-tertiary">({tabCounts.documents})</span>
							{/if}
						</button>
						<button
							type="button"
							class="flex-shrink-0 border-b-2 px-nav-item py-nav-item text-sm transition-colors"
							class:border-accent-primary={activeTab === 'activities'}
							class:border-transparent={activeTab !== 'activities'}
							class:text-primary={activeTab === 'activities'}
							class:text-secondary={activeTab !== 'activities'}
							onclick={() => {
								activeTab = 'activities';
							}}
							role="tab"
							aria-selected={activeTab === 'activities'}
						>
							Activities
							{#if tabCounts.activities > 0}
								<span class="ml-1 text-xs text-tertiary">({tabCounts.activities})</span>
							{/if}
						</button>
						<button
							type="button"
							class="flex-shrink-0 border-b-2 px-nav-item py-nav-item text-sm transition-colors"
							class:border-accent-primary={activeTab === 'metrics'}
							class:border-transparent={activeTab !== 'metrics'}
							class:text-primary={activeTab === 'metrics'}
							class:text-secondary={activeTab !== 'metrics'}
							onclick={() => {
								activeTab = 'metrics';
							}}
							role="tab"
							aria-selected={activeTab === 'metrics'}
						>
							Metrics
							{#if tabCounts.metrics > 0}
								<span class="ml-1 text-xs text-tertiary">({tabCounts.metrics})</span>
							{/if}
						</button>
						<button
							type="button"
							class="flex-shrink-0 border-b-2 px-nav-item py-nav-item text-sm transition-colors"
							class:border-accent-primary={activeTab === 'checklists'}
							class:border-transparent={activeTab !== 'checklists'}
							class:text-primary={activeTab === 'checklists'}
							class:text-secondary={activeTab !== 'checklists'}
							onclick={() => {
								activeTab = 'checklists';
							}}
							role="tab"
							aria-selected={activeTab === 'checklists'}
						>
							Checklists
							{#if tabCounts.checklists > 0}
								<span class="ml-1 text-xs text-tertiary">({tabCounts.checklists})</span>
							{/if}
						</button>
						<button
							type="button"
							class="flex-shrink-0 border-b-2 px-nav-item py-nav-item text-sm transition-colors"
							class:border-accent-primary={activeTab === 'projects'}
							class:border-transparent={activeTab !== 'projects'}
							class:text-primary={activeTab === 'projects'}
							class:text-secondary={activeTab !== 'projects'}
							onclick={() => {
								activeTab = 'projects';
							}}
							role="tab"
							aria-selected={activeTab === 'projects'}
						>
							Projects
							{#if tabCounts.projects > 0}
								<span class="ml-1 text-xs text-tertiary">({tabCounts.projects})</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Tab Content -->
				<div class="flex-1 overflow-y-auto px-inbox-container py-system-content">
					{#if activeTab === 'overview'}
						<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
						<div class="grid grid-cols-1 gap-6 lg:grid-cols-[40%_60%]">
							<!-- Left Column: Overview Details -->
							<div class="flex flex-col space-y-6">
								<!-- Stats -->
								<div class="grid grid-cols-2 gap-4">
									<div class="rounded-lg bg-surface p-4">
										<p class="text-xs text-tertiary">Members</p>
										<p class="mt-1 text-2xl font-semibold text-primary">{circle.memberCount}</p>
									</div>
									<div class="rounded-lg bg-surface p-4">
										<p class="text-xs text-tertiary">Created</p>
										<p class="mt-1 text-sm font-medium text-primary">
											{formatDate(circle.createdAt)}
										</p>
									</div>
								</div>

								<!-- Purpose -->
								{#if circle.purpose}
									<div>
										<h4 class="mb-2 text-sm font-medium tracking-wide text-tertiary uppercase">
											Purpose
										</h4>
										<p class="text-sm leading-relaxed text-secondary">{circle.purpose}</p>
									</div>
								{/if}

								<!-- Domains -->
								<div>
									<h4 class="mb-2 text-sm font-medium tracking-wide text-tertiary uppercase">
										Domains
									</h4>
									<div class="flex items-center gap-2 text-sm text-secondary">
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										<span>Empty field</span>
									</div>
								</div>

								<!-- Accountabilities -->
								<div>
									<h4 class="mb-2 text-sm font-medium tracking-wide text-tertiary uppercase">
										Accountabilities
									</h4>
									<div class="flex items-center gap-2 text-sm text-secondary">
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										<span>Empty field</span>
									</div>
								</div>

								<!-- Policies -->
								<div>
									<h4 class="mb-2 text-sm font-medium tracking-wide text-tertiary uppercase">
										Policies
									</h4>
									<div class="flex items-center gap-2 text-sm text-secondary">
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										<span>Empty field</span>
									</div>
								</div>

								<!-- Decision Rights -->
								<div>
									<h4 class="mb-2 text-sm font-medium tracking-wide text-tertiary uppercase">
										Decision Rights
									</h4>
									<div class="flex items-center gap-2 text-sm text-secondary">
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										<span>Empty field</span>
									</div>
								</div>

								<!-- Notes -->
								<div>
									<h4 class="mb-2 text-sm font-medium tracking-wide text-tertiary uppercase">
										Notes
									</h4>
									<div class="flex items-center gap-2 text-sm text-secondary">
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										<span>Empty field</span>
									</div>
								</div>
							</div>

							<!-- Right Column: Roles & Circles -->
							<div class="flex flex-col space-y-6">
								<!-- Roles List -->
								<div>
									<CategoryHeader
										title="Roles"
										count={roles.length}
										onEdit={() => {
											/* TODO: Implement edit roles */
										}}
										onAdd={() => {
											/* TODO: Implement add role */
										}}
									/>
									{#if roles.length > 0}
										<div class="mt-3 space-y-2">
											{#each roles as role (role.roleId)}
												<RoleCard
													name={role.name}
													purpose={role.purpose}
													fillerCount={role.fillerCount}
													onClick={() => handleRoleClick(role.roleId)}
													onEdit={() => {
														/* TODO: Implement edit role */
													}}
													menuItems={[
														{ label: 'Edit role', onclick: () => {} },
														{ label: 'Remove', onclick: () => {}, danger: true }
													]}
												/>
											{/each}
										</div>
									{:else}
										<p class="mt-3 text-sm text-secondary">No roles in this circle yet</p>
									{/if}
								</div>

								<!-- Child Circles List -->
								<div>
									<CategoryHeader
										title="Circles"
										count={childCircles.length}
										onAdd={() => {
											/* TODO: Implement add circle */
										}}
									/>
									{#if childCircles.length > 0}
										<div class="mt-3 space-y-2">
											{#each childCircles as childCircle (childCircle.circleId)}
												<button
													type="button"
													class="flex w-full items-center gap-3 rounded-lg bg-surface p-3 text-left transition-colors hover:bg-hover-solid"
													onclick={() => handleChildCircleClick(childCircle.circleId)}
												>
													<Avatar initials={getInitials(childCircle.name)} size="md" />
													<div class="min-w-0 flex-1">
														<p class="truncate text-sm font-medium text-primary">
															{childCircle.name}
														</p>
														{#if childCircle.purpose}
															<p class="truncate text-xs text-secondary">{childCircle.purpose}</p>
														{:else}
															<p class="text-xs text-tertiary">
																{childCircle.memberCount} member{childCircle.memberCount !== 1
																	? 's'
																	: ''}
															</p>
														{/if}
													</div>
												</button>
											{/each}
										</div>
									{:else}
										<p class="mt-3 text-sm text-secondary">No child circles in this circle yet</p>
									{/if}
								</div>

								<!-- Members List -->
								<div>
									<CategoryHeader
										title="Members"
										count={members.length}
										onAdd={() => {
											/* TODO: Implement add member */
										}}
									/>
									{#if members.length > 0}
										<div class="mt-3 space-y-2">
											{#each members as member (member.userId)}
												<div class="flex items-center gap-3 rounded-lg bg-surface p-3">
													<Avatar initials={getInitials(member.name)} size="md" />
													<div class="min-w-0 flex-1">
														<p class="truncate text-sm font-medium text-primary">{member.name}</p>
														<p class="truncate text-xs text-secondary">{member.email}</p>
													</div>
												</div>
											{/each}
										</div>
									{:else}
										<p class="mt-3 text-sm text-secondary">No members in this circle yet</p>
									{/if}
								</div>
							</div>
						</div>
					{:else if activeTab === 'members'}
						<!-- Empty State: Members -->
						<div class="py-8 text-center">
							<svg
								class="mx-auto h-12 w-12 text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							<p class="mt-4 text-sm font-medium text-primary">No members yet</p>
							<p class="mt-1 text-sm text-secondary">
								Members assigned to this circle will appear here. This feature will be available in
								a future update.
							</p>
						</div>
					{:else if activeTab === 'documents'}
						<!-- Empty State: Documents -->
						<div class="py-8 text-center">
							<svg
								class="mx-auto h-12 w-12 text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<p class="mt-4 text-sm font-medium text-primary">No documents yet</p>
							<p class="mt-1 text-sm text-secondary">
								Documents related to this circle will appear here. This feature will be available in
								a future update.
							</p>
						</div>
					{:else if activeTab === 'activities'}
						<!-- Empty State: Activities -->
						<div class="py-8 text-center">
							<svg
								class="mx-auto h-12 w-12 text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p class="mt-4 text-sm font-medium text-primary">No activities yet</p>
							<p class="mt-1 text-sm text-secondary">
								Recent activities and updates for this circle will appear here. This feature will be
								available in a future update.
							</p>
						</div>
					{:else if activeTab === 'metrics'}
						<!-- Empty State: Metrics -->
						<div class="py-8 text-center">
							<svg
								class="mx-auto h-12 w-12 text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							<p class="mt-4 text-sm font-medium text-primary">No metrics yet</p>
							<p class="mt-1 text-sm text-secondary">
								Performance metrics and analytics for this circle will appear here. This feature
								will be available in a future update.
							</p>
						</div>
					{:else if activeTab === 'checklists'}
						<!-- Empty State: Checklists -->
						<div class="py-8 text-center">
							<svg
								class="mx-auto h-12 w-12 text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
								/>
							</svg>
							<p class="mt-4 text-sm font-medium text-primary">No checklists yet</p>
							<p class="mt-1 text-sm text-secondary">
								Checklists and task lists for this circle will appear here. This feature will be
								available in a future update.
							</p>
						</div>
					{:else if activeTab === 'projects'}
						<!-- Empty State: Projects -->
						<div class="py-8 text-center">
							<svg
								class="mx-auto h-12 w-12 text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
								/>
							</svg>
							<p class="mt-4 text-sm font-medium text-primary">No projects yet</p>
							<p class="mt-1 text-sm text-secondary">
								Projects associated with this circle will appear here. This feature will be
								available in a future update.
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</aside>
