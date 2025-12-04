<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useQuickEditPermission } from '../composables/useQuickEditPermission.svelte';
	import CircleDetailHeader from './CircleDetailHeader.svelte';
	import CategoryHeader from './CategoryHeader.svelte';
	import RoleCard from './RoleCard.svelte';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';
	import * as Tabs from '$lib/components/atoms/Tabs.svelte';
	import { tabsListRecipe, tabsTriggerRecipe, tabsContentRecipe } from '$lib/design-system/recipes';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import Text from '$lib/components/atoms/Text.svelte';

	let { orgChart }: { orgChart: UseOrgChart | null } = $props();

	// Guard: Don't access orgChart properties if it's null (prevents hydration errors)
	if (!browser || !orgChart) {
		// Return early during SSR or when orgChart is not available
		// This prevents accessing properties on null during hydration
	}

	const circle = $derived(orgChart?.selectedCircle ?? null);
	const isOpen = $derived((orgChart?.selectedCircleId ?? null) !== null);
	const isLoading = $derived(orgChart?.selectedCircleIsLoading ?? false);
	const error = $derived(orgChart?.selectedCircleError ?? null);

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;
	const sessionId = $derived($page.data.sessionId);

	// Check quick edit permission using composable
	// Pattern: Move query to composable for proper reactivity (matches usePermissions pattern)
	// Composable uses function parameters which makes the condition reactive
	// OPTIMIZATION: Pass allowQuickChanges for instant "no edit" determination
	// If workspace disables quick edits, we don't need a backend call
	const quickEditPermission = useQuickEditPermission({
		circle: () => orgChart?.selectedCircle ?? null,
		sessionId: () => $page.data.sessionId,
		allowQuickChanges: () => orgChart?.allowQuickChanges ?? false
	});

	const canEdit = $derived(quickEditPermission.canEdit);
	const editReason = $derived(quickEditPermission.editReason);

	// Quick update handlers
	async function handleQuickUpdateCircle(updates: { name?: string; purpose?: string }) {
		if (!convexClient || !circle || !sessionId) return;

		try {
			await convexClient.mutation(api.circles.quickUpdate, {
				sessionId,
				circleId: circle.circleId,
				updates
			});
		} catch (error) {
			// Error handling is done in InlineEditText component
			throw error;
		}
	}

	async function handleQuickUpdateRole(
		roleId: Id<'circleRoles'>,
		updates: { name?: string; purpose?: string }
	) {
		if (!convexClient || !sessionId) return;

		try {
			await convexClient.mutation(api.circleRoles.quickUpdate, {
				sessionId,
				circleRoleId: roleId,
				updates
			});
		} catch (error) {
			// Error handling is done in InlineEditText component
			throw error;
		}
	}

	// Check if this circle panel is the topmost layer
	const isTopmost = () => {
		if (!orgChart) return false;
		const currentLayer = orgChart.navigationStack.currentLayer;
		return currentLayer?.type === 'circle' && currentLayer?.id === orgChart.selectedCircleId;
	};

	// Filter child circles from all circles (proven pattern: filter from existing query)
	const childCircles = $derived(
		orgChart && orgChart.selectedCircleId
			? orgChart.circles.filter((c) => c.parentCircleId === orgChart.selectedCircleId)
			: []
	);

	// Get roles from preloaded data (instant display, no query delay)
	// Roles are preloaded in useOrgChart via listByWorkspace query
	const allRoles = $derived(
		orgChart && orgChart.selectedCircleId
			? (orgChart.getRolesForCircle(orgChart.selectedCircleId) ?? [])
			: []
	);

	// Get members without roles
	const membersWithoutRoles = $derived(orgChart?.selectedCircleMembersWithoutRoles ?? []);

	// Get core and regular roles from composable (uses preloaded templates data)
	// This avoids hydration errors - query is managed in composable with proper SSR handling
	const coreRoles = $derived(
		orgChart && orgChart.selectedCircleId
			? orgChart.getCoreRolesForCircle(orgChart.selectedCircleId)
			: []
	);

	const regularRoles = $derived(
		orgChart && orgChart.selectedCircleId
			? orgChart.getRegularRolesForCircle(orgChart.selectedCircleId)
			: []
	);

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
		if (!orgChart) return;
		// ESC goes back one level (not all the way)
		const previousLayer = orgChart.navigationStack.previousLayer;

		if (previousLayer) {
			// Pop current layer
			orgChart.navigationStack.pop();

			// Navigate to previous layer WITHOUT pushing (we're already there after pop)
			if (previousLayer.type === 'circle') {
				orgChart.selectCircle(previousLayer.id as Id<'circles'>, { skipStackPush: true });
			} else if (previousLayer.type === 'role') {
				orgChart.selectRole(previousLayer.id as Id<'circleRoles'>, 'circle-panel', {
					skipStackPush: true
				});
			}
		} else {
			// No previous layer - close everything
			orgChart.navigationStack.pop();
			orgChart.selectCircle(null);
		}
	}

	function handleBreadcrumbClick(index: number) {
		if (!orgChart) return;
		// Get the target layer to navigate to
		const targetLayer = orgChart.navigationStack.getLayer(index);
		if (!targetLayer) return;

		// Jump to that layer in the stack (this already positions us at the right layer)
		orgChart.navigationStack.jumpTo(index);

		// Re-open the panel for that layer WITHOUT pushing to stack (we're already there)
		if (targetLayer.type === 'circle') {
			orgChart.selectCircle(targetLayer.id as Id<'circles'>, { skipStackPush: true });
		} else if (targetLayer.type === 'role') {
			orgChart.selectRole(targetLayer.id as Id<'circleRoles'>, 'circle-panel', {
				skipStackPush: true
			});
		}
	}

	function handleRoleClick(roleId: string) {
		if (!orgChart) return;
		orgChart.selectRole(roleId as Id<'circleRoles'>, 'circle-panel');
	}

	function handleChildCircleClick(circleId: string) {
		if (!orgChart) return;
		orgChart.selectCircle(circleId as Id<'circles'>);
	}

	// Icon renderer for breadcrumbs - modules define their own icons
	// Returns HTML strings for SVG icons
	function renderBreadcrumbIcon(layerType: string): string | null {
		if (layerType === 'circle') {
			return `<svg class="size-icon-sm inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"></circle></svg>`;
		} else if (layerType === 'role') {
			return `<svg class="size-icon-sm inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
		}
		return null;
	}
</script>

{#if orgChart}
	<StackedPanel
		{isOpen}
		navigationStack={orgChart.navigationStack}
		onClose={handleClose}
		onBreadcrumbClick={handleBreadcrumbClick}
		{isTopmost}
		iconRenderer={renderBreadcrumbIcon}
	>
		{#snippet children(panelContext)}
			{#if isLoading}
				<!-- Loading State -->
				<div class="flex h-full items-center justify-center">
					<div class="text-center">
						<svg
							class="mx-auto size-icon-xl animate-spin text-tertiary"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<p class="text-button text-secondary mb-header">Loading circle details...</p>
					</div>
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="flex h-full items-center justify-center">
					<div class="text-center">
						<p class="text-button font-medium text-error">Failed to load circle</p>
						<p class="text-button text-secondary mb-header">{String(error)}</p>
					</div>
				</div>
			{:else if circle}
				<!-- Header -->
				<CircleDetailHeader
					circleName={circle.name}
					onClose={handleClose}
					onBack={panelContext.onBack}
					showBackButton={panelContext.isMobile && panelContext.canGoBack}
					onEdit={() => {
						/* TODO: Implement edit circle */
					}}
					editable={canEdit}
					{editReason}
					onNameChange={(name) => handleQuickUpdateCircle({ name })}
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
					<Tabs.Root bind:value={activeTab}>
						<!-- Navigation Tabs - Sticky at top -->
						<div class="sticky top-0 z-10 bg-surface px-page">
							<Tabs.List class={[tabsListRecipe(), 'flex flex-shrink-0 gap-form overflow-x-auto']}>
								<Tabs.Trigger
									value="overview"
									class={[tabsTriggerRecipe({ active: activeTab === 'overview' }), 'flex-shrink-0']}
								>
									Overview
								</Tabs.Trigger>
								<Tabs.Trigger
									value="members"
									class={[tabsTriggerRecipe({ active: activeTab === 'members' }), 'flex-shrink-0']}
								>
									<span class="flex items-center gap-button">
										<span>Members</span>
										{#if tabCounts.members > 0}
											<span class="text-label text-tertiary">({tabCounts.members})</span>
										{/if}
									</span>
								</Tabs.Trigger>
								<Tabs.Trigger
									value="documents"
									class={[
										tabsTriggerRecipe({ active: activeTab === 'documents' }),
										'flex-shrink-0'
									]}
								>
									<span class="flex items-center gap-button">
										<span>Documents</span>
										{#if tabCounts.documents > 0}
											<span class="text-label text-tertiary">({tabCounts.documents})</span>
										{/if}
									</span>
								</Tabs.Trigger>
								<Tabs.Trigger
									value="activities"
									class={[
										tabsTriggerRecipe({ active: activeTab === 'activities' }),
										'flex-shrink-0'
									]}
								>
									<span class="flex items-center gap-button">
										<span>Activities</span>
										{#if tabCounts.activities > 0}
											<span class="text-label text-tertiary">({tabCounts.activities})</span>
										{/if}
									</span>
								</Tabs.Trigger>
								<Tabs.Trigger
									value="metrics"
									class={[tabsTriggerRecipe({ active: activeTab === 'metrics' }), 'flex-shrink-0']}
								>
									<span class="flex items-center gap-button">
										<span>Metrics</span>
										{#if tabCounts.metrics > 0}
											<span class="text-label text-tertiary">({tabCounts.metrics})</span>
										{/if}
									</span>
								</Tabs.Trigger>
								<Tabs.Trigger
									value="checklists"
									class={[
										tabsTriggerRecipe({ active: activeTab === 'checklists' }),
										'flex-shrink-0'
									]}
								>
									<span class="flex items-center gap-button">
										<span>Checklists</span>
										{#if tabCounts.checklists > 0}
											<span class="text-label text-tertiary">({tabCounts.checklists})</span>
										{/if}
									</span>
								</Tabs.Trigger>
								<Tabs.Trigger
									value="projects"
									class={[tabsTriggerRecipe({ active: activeTab === 'projects' }), 'flex-shrink-0']}
								>
									<span class="flex items-center gap-button">
										<span>Projects</span>
										{#if tabCounts.projects > 0}
											<span class="text-label text-tertiary">({tabCounts.projects})</span>
										{/if}
									</span>
								</Tabs.Trigger>
							</Tabs.List>
						</div>

						<!-- Tab Content -->
						<div class="flex-1 overflow-y-auto px-page py-page">
							<Tabs.Content value="overview" class={tabsContentRecipe()}>
								<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
								<div
									class="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr)_minmax(400px,500px)]"
									style="gap: clamp(var(--spacing-5), 2.5vw, var(--spacing-10));"
								>
									<!-- Left Column: Overview Details -->
									<div class="flex min-w-0 flex-col gap-section overflow-hidden">
										<!-- Purpose -->
										<div>
											<h4
												class="text-button font-medium tracking-wide text-tertiary uppercase mb-header"
											>
												Purpose
											</h4>
											{#if canEdit}
												<InlineEditText
													value={circle.purpose || ''}
													onSave={(purpose) => handleQuickUpdateCircle({ purpose })}
													multiline={true}
													placeholder="What's the purpose of this circle?"
													maxRows={4}
													size="md"
												/>
											{:else if editReason}
												<EditPermissionTooltip reason={editReason}>
													{#snippet children()}
														<div class="text-button leading-relaxed break-words text-secondary">
															{#if circle.purpose}
																{circle.purpose}
															{:else}
																<Text variant="body" size="md" color="tertiary">
																	No purpose set
																</Text>
															{/if}
														</div>
													{/snippet}
												</EditPermissionTooltip>
											{:else}
												<p class="text-button leading-relaxed break-words text-secondary">
													{circle.purpose || 'No purpose set'}
												</p>
											{/if}
										</div>

										<!-- Domains -->
										<div>
											<h4
												class="text-button font-medium tracking-wide text-tertiary uppercase mb-header"
											>
												Domains
											</h4>
											<div class="text-button flex items-center gap-button text-secondary">
												<svg
													class="size-icon-sm"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
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
											<h4
												class="text-button font-medium tracking-wide text-tertiary uppercase mb-header"
											>
												Accountabilities
											</h4>
											<div class="text-button flex items-center gap-button text-secondary">
												<svg
													class="size-icon-sm"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
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
											<h4
												class="text-button font-medium tracking-wide text-tertiary uppercase mb-header"
											>
												Policies
											</h4>
											<div class="text-button flex items-center gap-button text-secondary">
												<svg
													class="size-icon-sm"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
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
											<h4
												class="text-button font-medium tracking-wide text-tertiary uppercase mb-header"
											>
												Decision Rights
											</h4>
											<div class="text-button flex items-center gap-button text-secondary">
												<svg
													class="size-icon-sm"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
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
											<h4
												class="text-button font-medium tracking-wide text-tertiary uppercase mb-header"
											>
												Notes
											</h4>
											<div class="text-button flex items-center gap-button text-secondary">
												<svg
													class="size-icon-sm"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
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
									<div
										class="flex flex-col gap-section"
										style="padding-right: var(--spacing-page-x);"
									>
										<!-- Core Roles Section -->
										{#if coreRoles.length > 0}
											<div>
												<CategoryHeader
													variant="plain"
													title="Core Roles"
													count={coreRoles.length}
													onEdit={() => {
														/* TODO: Implement edit roles */
													}}
													onAdd={() => {
														/* TODO: Implement add role */
													}}
												/>
												<div class="flex flex-col gap-content mb-section">
													{#each coreRoles as role (role.roleId)}
														{@const roleStatus =
															role.status === 'draft'
																? 'draft'
																: role.isHiring
																	? 'hiring'
																	: undefined}
														<RoleCard
															name={role.name}
															purpose={role.purpose}
															status={roleStatus}
															roleId={role.roleId}
															circleId={circle.circleId}
															{canEdit}
															{editReason}
															onNameChange={(name) => handleQuickUpdateRole(role.roleId, { name })}
															onPurposeChange={(purpose) =>
																handleQuickUpdateRole(role.roleId, { purpose })}
															onClick={() => handleRoleClick(role.roleId)}
															onEdit={() => {
																/* TODO: Implement edit role */
															}}
															onAddMember={() => {
																/* TODO: Implement add member to role */
															}}
															menuItems={[
																{ label: 'Edit role', onclick: () => {} },
																{ label: 'Remove', onclick: () => {}, danger: true }
															]}
														/>
													{/each}
												</div>
											</div>
										{/if}

										<!-- Regular Roles Section -->
										{#if regularRoles.length > 0}
											<div>
												<CategoryHeader
													variant="plain"
													title="Roles"
													count={regularRoles.length}
													onEdit={() => {
														/* TODO: Implement edit roles */
													}}
													onAdd={() => {
														/* TODO: Implement add role */
													}}
												/>
												<div class="flex flex-col gap-content mb-section">
													{#each regularRoles as role (role.roleId)}
														{@const roleStatus =
															role.status === 'draft'
																? 'draft'
																: role.isHiring
																	? 'hiring'
																	: undefined}
														<RoleCard
															name={role.name}
															purpose={role.purpose}
															status={roleStatus}
															roleId={role.roleId}
															circleId={circle.circleId}
															{canEdit}
															{editReason}
															onNameChange={(name) => handleQuickUpdateRole(role.roleId, { name })}
															onPurposeChange={(purpose) =>
																handleQuickUpdateRole(role.roleId, { purpose })}
															onClick={() => handleRoleClick(role.roleId)}
															onEdit={() => {
																/* TODO: Implement edit role */
															}}
															onAddMember={() => {
																/* TODO: Implement add member to role */
															}}
															menuItems={[
																{ label: 'Edit role', onclick: () => {} },
																{ label: 'Remove', onclick: () => {}, danger: true }
															]}
														/>
													{/each}
												</div>
											</div>
										{/if}

										<!-- Child Circles Section -->
										{#if childCircles.length > 0}
											<div>
												<CategoryHeader
													variant="plain"
													title="Circles"
													count={childCircles.length}
													onAdd={() => {
														/* TODO: Implement add circle */
													}}
												/>
												<div class="flex flex-col gap-content mb-section">
													{#each childCircles as childCircle (childCircle.circleId)}
														<RoleCard
															name={childCircle.name}
															purpose={childCircle.purpose}
															isCircle={true}
															onClick={() => handleChildCircleClick(childCircle.circleId)}
															onEdit={() => {
																/* TODO: Implement edit circle */
															}}
															onAddMember={() => {
																/* TODO: Implement add member to circle */
															}}
															menuItems={[
																{ label: 'Edit circle', onclick: () => {} },
																{ label: 'Remove', onclick: () => {}, danger: true }
															]}
														/>
													{/each}
												</div>
											</div>
										{/if}

										<!-- Members Without Roles Section -->
										<div>
											<CategoryHeader
												variant="plain"
												title="Members without role"
												count={membersWithoutRoles.length}
												onAdd={() => {
													/* TODO: Implement add member */
												}}
											/>
											{#if membersWithoutRoles.length > 0}
												<div class="flex flex-col gap-content mb-section">
													<RoleCard
														name="Members without role"
														isCircle={false}
														onClick={() => {}}
														onAddMember={() => {
															/* TODO: Implement add member */
														}}
														members={membersWithoutRoles.map((m) => ({
															userId: m.userId,
															name: m.name,
															email: m.email
														}))}
													/>
												</div>
											{:else}
												<p class="text-button text-secondary mb-section">
													All members are assigned to roles
												</p>
											{/if}
										</div>
									</div>
								</div>
							</Tabs.Content>

							<Tabs.Content value="members" class={tabsContentRecipe()}>
								<!-- Empty State: Members -->
								<div class="py-page text-center">
									<svg
										class="mx-auto size-icon-xl text-tertiary"
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
									<p class="text-button font-medium text-primary mb-header">No members yet</p>
									<p class="text-button text-secondary mb-header">
										Members assigned to this circle will appear here. This feature will be available
										in a future update.
									</p>
								</div>
							</Tabs.Content>

							<Tabs.Content value="documents" class={tabsContentRecipe()}>
								<!-- Empty State: Documents -->
								<div class="py-page text-center">
									<svg
										class="mx-auto size-icon-xl text-tertiary"
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
									<p class="text-button font-medium text-primary mb-header">No documents yet</p>
									<p class="text-button text-secondary mb-header">
										Documents related to this circle will appear here. This feature will be
										available in a future update.
									</p>
								</div>
							</Tabs.Content>

							<Tabs.Content value="activities" class={tabsContentRecipe()}>
								<!-- Empty State: Activities -->
								<div class="py-page text-center">
									<svg
										class="mx-auto size-icon-xl text-tertiary"
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
									<p class="text-button font-medium text-primary mb-header">No activities yet</p>
									<p class="text-button text-secondary mb-header">
										Recent activities and updates for this circle will appear here. This feature
										will be available in a future update.
									</p>
								</div>
							</Tabs.Content>

							<Tabs.Content value="metrics" class={tabsContentRecipe()}>
								<!-- Empty State: Metrics -->
								<div class="py-page text-center">
									<svg
										class="mx-auto size-icon-xl text-tertiary"
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
									<p class="text-button font-medium text-primary mb-header">No metrics yet</p>
									<p class="text-button text-secondary mb-header">
										Performance metrics and analytics for this circle will appear here. This feature
										will be available in a future update.
									</p>
								</div>
							</Tabs.Content>

							<Tabs.Content value="checklists" class={tabsContentRecipe()}>
								<!-- Empty State: Checklists -->
								<div class="py-page text-center">
									<svg
										class="mx-auto size-icon-xl text-tertiary"
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
									<p class="text-button font-medium text-primary mb-header">No checklists yet</p>
									<p class="text-button text-secondary mb-header">
										Checklists and task lists for this circle will appear here. This feature will be
										available in a future update.
									</p>
								</div>
							</Tabs.Content>

							<Tabs.Content value="projects" class={tabsContentRecipe()}>
								<!-- Empty State: Projects -->
								<div class="py-page text-center">
									<svg
										class="mx-auto size-icon-xl text-tertiary"
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
									<p class="text-button font-medium text-primary mb-header">No projects yet</p>
									<p class="text-button text-secondary mb-header">
										Projects associated with this circle will appear here. This feature will be
										available in a future update.
									</p>
								</div>
							</Tabs.Content>
						</div>
					</Tabs.Root>
				</div>
			{/if}
		{/snippet}
	</StackedPanel>
{/if}
