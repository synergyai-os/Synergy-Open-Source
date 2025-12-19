<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { useCustomFields } from '$lib/composables/useCustomFields.svelte';
	import { useCanEdit } from '../composables/useCanEdit.svelte';
	import { useEditRole } from '../composables/useEditRole.svelte';
	import DetailHeader from './DetailHeader.svelte';
	import { Badge } from '$lib/components/atoms';
	import * as Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import { tooltipContentRecipe, tooltipArrowRecipe } from '$lib/design-system/recipes';
	import CategoryHeader from './CategoryHeader.svelte';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { Avatar } from '$lib/components/atoms';
	import Text from '$lib/components/atoms/Text.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Loading from '$lib/components/atoms/Loading.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import {
		EmptyState,
		ErrorState,
		TabbedPanel,
		CustomFieldSection
	} from '$lib/components/molecules';
	import { useDetailPanelNavigation } from '../composables/useDetailPanelNavigation.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import {
		getLeadAuthorityLevel,
		getAuthorityUI,
		getLeadDescription
	} from '$lib/infrastructure/organizational-model/constants';
	import { invariant } from '$lib/utils/invariant';

	let { orgChart }: { orgChart: UseOrgChart | null } = $props();

	// Guard: Don't access orgChart properties if it's null (prevents hydration errors)
	if (!browser || !orgChart) {
		// Return early during SSR or when orgChart is not available
		// This prevents accessing properties on null during hydration
	}

	const role = $derived(orgChart?.selectedRole ?? null);
	const fillers = $derived(orgChart?.selectedRoleFillers ?? []);
	const isOpen = $derived((orgChart?.selectedRoleId ?? null) !== null);
	const _selectionSource = $derived(orgChart?.selectionSource ?? null);
	const error = $derived(orgChart?.selectedRoleError ?? null);
	const isLoading = $derived(orgChart?.selectedRoleIsLoading ?? false);

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;
	const sessionId = $derived($page.data.sessionId);

	// Get workspaceId from context (same pattern as CircleDetailPanel)
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const workspaceId = $derived(() => {
		if (!workspaces) return undefined;
		return workspaces.activeWorkspaceId ?? undefined;
	});

	// Query circle for permission checking (roles belong to circles)
	const circleQuery = $derived(
		browser && role?.circleId && sessionId
			? useQuery(api.core.circles.index.get, () => {
					invariant(role?.circleId && sessionId, 'Role circleId and sessionId required');
					return { sessionId, circleId: role.circleId };
				})
			: null
	);

	const circle = $derived(circleQuery?.data ?? null);
	const circleQueryError = $derived(circleQuery?.error ?? null);

	// Log circle query failures for debugging
	$effect(() => {
		if (circleQueryError && role?.roleId) {
			console.error(
				'[RoleDetailPanel] Circle query failed for role:',
				role.roleId,
				'circleId:',
				role.circleId,
				'error:',
				circleQueryError
			);
		}
	});

	// Check if role is Lead role - Lead roles CANNOT be edited regardless of permissions
	const isLeadRole = $derived(role?.isLeadRole ?? false);

	// Get authority level for Lead role (SYOS-672)
	const authorityLevel = $derived(
		isLeadRole && circle ? getLeadAuthorityLevel(circle.circleType) : null
	);
	const authorityUI = $derived(authorityLevel ? getAuthorityUI(authorityLevel) : null);

	// Phase-based edit permissions (SYOS-982)
	const editPermission = useCanEdit({
		sessionId: () => sessionId ?? null,
		workspaceId: () => workspaceId() ?? null,
		circleId: () => role?.circleId ?? null
	});

	// Lead roles cannot be edited regardless of permissions
	const canEdit = $derived(isLeadRole ? false : editPermission.canEdit);
	const isDesignPhase = $derived(editPermission.isDesignPhase);

	// Edit reason for tooltip display when canEdit is false
	const editReason = $derived.by(() => {
		if (isLeadRole) {
			return 'Lead roles cannot be edited directly. Edit the Lead role template instead to update all Lead roles across all circles.';
		}
		if (circleQueryError) {
			return 'Unable to verify edit permissions. Please refresh the page.';
		}
		if (!canEdit && !isDesignPhase) {
			return 'Only circle members can propose changes in active workspaces';
		}
		return undefined;
	});

	// Edit mode state
	let isEditMode = $state(false);
	let showDiscardDialog = $state(false);

	// Navigation composable for shared navigation logic
	const navigation = useDetailPanelNavigation({
		orgChart: () => orgChart,
		isEditMode: () => isEditMode,
		isDirty: () => editRole.isDirty,
		onShowDiscardDialog: () => {
			showDiscardDialog = true;
		},
		resetEditMode: () => {
			isEditMode = false;
			editRole.reset();
		}
	});

	// Edit role composable (only used in edit mode)
	// In design phase, direct save is allowed. In active phase, Phase 4 will handle proposal routing.
	const editRole = useEditRole({
		roleId: () => role?.roleId ?? null,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId() ?? null,
		canQuickEdit: () => isDesignPhase
	});

	// Custom fields composable for roles
	const customFields = useCustomFields({
		sessionId: () => sessionId,
		workspaceId: () => workspaceId() ?? undefined,
		entityType: () => 'role',
		entityId: () => role?.roleId ?? null
	});

	// Quick update handler for role (purpose and name)
	async function handleQuickUpdateRole(updates: { name?: string; purpose?: string }) {
		if (!convexClient || !role || !sessionId) return;

		await convexClient.mutation(api.core.roles.index.updateInline, {
			sessionId,
			circleRoleId: role.roleId,
			updates
		});
		// No manual refetch needed - useQuery automatically refetches after mutations
	}

	// Quick update handler for role name (separate for header)
	async function handleQuickUpdateRoleName(name: string) {
		await handleQuickUpdateRole({ name });
	}

	// Check if this role panel is the topmost layer
	const isTopmost = () => {
		if (!orgChart) return false;
		const currentLayer = orgChart.navigationStack.currentLayer;
		return currentLayer?.type === 'role' && currentLayer?.id === orgChart.selectedRoleId;
	};

	// Role-specific tabs configuration
	const ROLE_TABS = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'members', label: 'Members', showCount: true },
		{ id: 'documents', label: 'Documents', showCount: true },
		{ id: 'activities', label: 'Activities', showCount: true },
		{ id: 'metrics', label: 'Metrics', showCount: true },
		{ id: 'checklists', label: 'Checklists', showCount: true },
		{ id: 'projects', label: 'Projects', showCount: true }
	];

	// Tab state with dummy counts
	let activeTab = $state('overview' as string);
	const tabCounts = $state({
		overview: 0,
		members: 0,
		documents: 0,
		activities: 0,
		metrics: 0,
		checklists: 0,
		projects: 0
	});

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function handleEditClick() {
		if (!role) return;
		isEditMode = true;
		editRole.loadRole();
	}

	function handleCancelEdit() {
		if (editRole.isDirty) {
			showDiscardDialog = true;
		} else {
			isEditMode = false;
			editRole.reset();
		}
	}

	function handleConfirmDiscard() {
		editRole.reset();
		isEditMode = false;
		showDiscardDialog = false;
	}

	async function handleSaveDirectly() {
		await editRole.saveDirectly();
		isEditMode = false;
		// Refresh role data by re-selecting
		if (orgChart && role) {
			orgChart.selectRole(role.roleId, 'circle-panel', { skipStackPush: true });
		}
	}

	// Icon renderer for breadcrumbs - modules define their own icons
	// Returns IconType for rendering with Icon component (secure, no HTML injection)
	function renderBreadcrumbIcon(layerType: string): IconType | null {
		if (layerType === 'circle') {
			return 'circle';
		} else if (layerType === 'role') {
			return 'user';
		}
		return null;
	}
</script>

{#if orgChart}
	<StackedPanel
		{isOpen}
		navigationStack={orgChart.navigationStack}
		onClose={navigation.handleClose}
		onBreadcrumbClick={navigation.handleBreadcrumbClick}
		{isTopmost}
		iconRenderer={renderBreadcrumbIcon}
	>
		{#snippet children(panelContext)}
			{#if isLoading}
				<!-- Loading State -->
				<Loading message="Loading role details..." />
			{:else if error}
				<!-- Error State -->
				<ErrorState title="Failed to load role" message={String(error)} />
			{:else if role}
				<!-- Header -->
				<DetailHeader
					entityName={isEditMode ? editRole.formValues.name : role.name}
					onClose={navigation.handleClose}
					onBack={panelContext.onBack}
					showBackButton={panelContext.isMobile && panelContext.canGoBack}
					onEdit={isEditMode ? undefined : handleEditClick}
					canEdit={!isEditMode && canEdit}
					{editReason}
					onNameChange={!isEditMode ? handleQuickUpdateRoleName : undefined}
					addMenuItems={[
						{ label: 'Add filler', onclick: () => {} },
						{ label: 'Add accountability', onclick: () => {} },
						{ label: 'Add domain', onclick: () => {} }
					]}
					headerMenuItems={[
						{ label: 'Copy URL', onclick: () => {} },
						{ label: 'Export to PDF', onclick: () => {} },
						{ label: 'Export to spreadsheet', onclick: () => {} },
						{ label: 'Convert role to circle', onclick: () => {} },
						{ label: 'Move role', onclick: () => {} },
						{ label: 'Notifications', onclick: () => {} },
						{ label: 'Settings', onclick: () => {} },
						{ label: 'Delete role', onclick: () => {}, danger: true }
					]}
				>
					{#snippet authorityBadge()}
						{#if isLeadRole && authorityUI && circle}
							<Tooltip.Provider>
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<span {...props} class="inline-block">
												<Badge variant="default" size="md">
													{authorityUI.badge}
												</Badge>
											</span>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Portal>
										<Tooltip.Content class={tooltipContentRecipe()}>
											<p class="text-button text-primary">
												{getLeadDescription(circle.circleType)}
											</p>
											<Tooltip.Arrow class={tooltipArrowRecipe()} />
										</Tooltip.Content>
									</Tooltip.Portal>
								</Tooltip.Root>
							</Tooltip.Provider>
						{/if}
					{/snippet}
				</DetailHeader>

				<!-- Edit Mode Indicator Bar -->
				{#if isEditMode}
					<div
						class="border-base bg-surface-subtle py-header gap-button px-page flex items-center border-b"
					>
						<Icon type="edit" size="sm" />
						<Text variant="body" size="sm" color="primary" class="font-medium">Edit mode</Text>
					</div>
				{/if}

				<div class="flex h-full flex-col">
					<!-- Content -->
					<div class="flex-1 overflow-y-auto">
						<TabbedPanel
							tabs={ROLE_TABS}
							bind:activeTab
							onTabChange={(tab) => {
								activeTab = tab;
							}}
							{tabCounts}
						>
							{#snippet content(tabId)}
								{#if tabId === 'overview'}
									<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
									<div
										class="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr)_minmax(400px,500px)]"
										style="gap: clamp(var(--spacing-5), 2.5vw, var(--spacing-10));"
									>
										<!-- Left Column: Custom Fields (DB-driven, ordered by definition.order) -->
										<div class="gap-section flex min-w-0 flex-col overflow-hidden">
											{#each customFields.fields as field (field.definition._id)}
												<CustomFieldSection
													{field}
													{canEdit}
													{editReason}
													onSave={(value) =>
														customFields.setFieldValue(field.definition._id, value)}
													onDelete={() => customFields.deleteFieldValue(field.definition._id)}
												/>
											{/each}
										</div>

										<!-- Right Column: Filled By List -->
										<div
											class="gap-section flex flex-col"
											style="padding-right: var(--spacing-page-x);"
										>
											<!-- Filled By List -->
											<div>
												<CategoryHeader
													variant="plain"
													title="Filled By"
													count={fillers.length}
													onAdd={() => {}}
												/>
												{#if fillers.length > 0}
													<div class="gap-content mb-section flex flex-col">
														{#each fillers as filler (filler.userId)}
															<div
																class="p-card gap-button rounded-card bg-surface flex items-center"
															>
																<Avatar
																	initials={getInitials(filler.name || filler.email)}
																	size="md"
																/>
																<!-- Info -->
																<div class="min-w-0 flex-1">
																	<p class="text-button text-primary truncate font-medium">
																		{filler.name || filler.email}
																	</p>
																	{#if filler.name}
																		<p class="text-label text-secondary truncate">{filler.email}</p>
																	{/if}
																</div>
															</div>
														{/each}
													</div>
												{:else}
													<p class="text-button text-secondary mb-section">
														No one is filling this role yet
													</p>
												{/if}
											</div>
										</div>
									</div>
								{:else if tabId === 'members'}
									<EmptyState
										icon="users"
										title="No members yet"
										description="Members assigned to this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'documents'}
									<EmptyState
										icon="file-text"
										title="No documents yet"
										description="Documents related to this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'activities'}
									<EmptyState
										icon="clock"
										title="No activities yet"
										description="Recent activities and updates for this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'metrics'}
									<EmptyState
										icon="bar-chart"
										title="No metrics yet"
										description="Performance metrics and analytics for this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'checklists'}
									<EmptyState
										icon="check-square"
										title="No checklists yet"
										description="Checklists and task lists for this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'projects'}
									<EmptyState
										icon="briefcase"
										title="No projects yet"
										description="Projects associated with this role will appear here. This feature will be available in a future update."
									/>
								{/if}
							{/snippet}
						</TabbedPanel>
					</div>

					<!-- Footer with Save Actions (Edit Mode Only) -->
					{#if isEditMode}
						<div
							class="border-base py-header gap-button bg-surface px-page sticky bottom-0 z-20 flex items-center justify-end border-t"
						>
							{#if editRole.error}
								<div class="mr-auto">
									<Text variant="body" size="sm" color="error">{editRole.error}</Text>
								</div>
							{/if}
							<Button variant="outline" onclick={handleCancelEdit} disabled={editRole.isSaving}>
								Cancel
							</Button>

							{#if isDesignPhase}
								<!-- Design phase: Direct save for all members -->
								<Button
									variant="primary"
									onclick={handleSaveDirectly}
									disabled={editRole.isSaving || !editRole.isDirty}
								>
									{editRole.isSaving ? 'Saving...' : 'Save'}
								</Button>
							{:else}
								<!-- Active phase: Propose Change flow (or disabled if not member) -->
								{#if !canEdit}
									<div class="mr-auto">
										<Text variant="body" size="sm" color="tertiary">
											Only circle members can propose changes in active workspaces
										</Text>
									</div>
								{:else}
									<Button
										variant="primary"
										onclick={handleSaveDirectly}
										disabled={editRole.isSaving || !editRole.isDirty}
									>
										{editRole.isSaving ? 'Proposing...' : 'Propose Change'}
									</Button>
								{/if}
							{/if}
						</div>
					{/if}
				</div>
			{:else}
				<!-- Empty State - Panel open but no role data -->
				<div class="px-page flex h-full items-center justify-center">
					<div class="text-center">
						<p class="text-button text-secondary">No role selected</p>
					</div>
				</div>
			{/if}
		{/snippet}
	</StackedPanel>

	<!-- Confirm Discard Dialog -->
	<StandardDialog
		bind:open={showDiscardDialog}
		title="Discard unsaved changes?"
		description="You have unsaved changes. Are you sure you want to discard them?"
		submitLabel="Discard"
		cancelLabel="Keep Editing"
		variant="danger"
		onsubmit={handleConfirmDiscard}
	/>
{/if}
