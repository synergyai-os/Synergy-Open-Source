<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import {
		useCustomFields,
		type CustomFieldWithValue
	} from '$lib/composables/useCustomFields.svelte';
	import { useCanEdit } from '../composables/useCanEdit.svelte';
	import { useEditRole } from '../composables/useEditRole.svelte';
	import DetailHeader from './DetailHeader.svelte';
	import { Badge } from '$lib/components/atoms';
	import * as Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import { tooltipContentRecipe, tooltipArrowRecipe } from '$lib/design-system/recipes';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Loading from '$lib/components/atoms/Loading.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import { ErrorState, TabbedPanel } from '$lib/components/molecules';
	import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import {
		getLeadAuthorityLevel,
		getAuthorityUI,
		getLeadDescription
	} from '$lib/infrastructure/organizational-model/constants';
	import { invariant } from '$lib/utils/invariant';
	import { toast } from 'svelte-sonner';
	import RoleTabContent from './RoleTabContent.svelte';
	import { DEFAULT_ROLE_TAB_COUNTS, ROLE_TABS } from './roleDetailConfig';

	let { orgChart }: { orgChart: UseOrgChart | null } = $props();

	// Guard: Don't access orgChart properties if it's null (prevents hydration errors)
	if (!browser || !orgChart) {
		// Return early during SSR or when orgChart is not available
		// This prevents accessing properties on null during hydration
	}

	// Get shared navigation from context
	const navigation = getStackedNavigation();

	const role = $derived(orgChart?.selectedRole ?? null);
	const _fillers = $derived(orgChart?.selectedRoleFillers ?? []);
	const selectedRoleId = $derived(orgChart?.selectedRoleId ?? null);
	const isOpen = $derived(navigation.isInStack('role'));
	const error = $derived(orgChart?.selectedRoleError ?? null);
	const isLoading = $derived(orgChart?.selectedRoleIsLoading ?? false);
	const stable = $state({
		role: null as typeof role,
		roleId: null as typeof selectedRoleId
	});
	const lastLoaded = $state({
		roleId: null as string | null
	});

	// Keep a stable copy of the last-loaded role for the currently selected roleId.
	// Prevents full-panel flash if `isLoading` toggles briefly (e.g., URL tab param updates).
	$effect(() => {
		const id = selectedRoleId;
		if (id !== stable.roleId) {
			stable.roleId = id;
			stable.role = null;
		}
		if (role) {
			stable.role = role;
		}
	});

	const displayRole = $derived(role ?? stable.role);
	$effect(() => {
		if (displayRole && selectedRoleId) {
			lastLoaded.roleId = selectedRoleId as unknown as string;
		}
	});
	const shouldShowContentLoadingOverlay = $derived(
		!!selectedRoleId && isLoading && lastLoaded.roleId !== (selectedRoleId as unknown as string)
	);

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;
	const sessionId = $derived($page.data.sessionId);

	// Get workspaceId from context (same pattern as CircleDetailPanel)
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const workspaceId = $derived.by(() => workspaces?.activeWorkspaceId ?? undefined);

	// Query circle for permission checking (roles belong to circles)
	const circleQuery = $derived(
		browser && displayRole?.circleId && sessionId
			? useQuery(api.core.circles.index.get, () => {
					invariant(displayRole?.circleId && sessionId, 'Role circleId and sessionId required');
					return { sessionId, circleId: displayRole.circleId };
				})
			: null
	);

	const circle = $derived(circleQuery?.data ?? null);
	const circleQueryError = $derived(circleQuery?.error ?? null);

	// Log circle query failures for debugging
	$effect(() => {
		if (circleQueryError && displayRole?.roleId) {
			console.error(
				'[RoleDetailPanel] Circle query failed for role:',
				displayRole.roleId,
				'circleId:',
				displayRole.circleId,
				'error:',
				circleQueryError
			);
		}
	});

	// Check if role is Lead role - Lead roles CANNOT be edited regardless of permissions
	const isLeadRole = $derived(displayRole?.isLeadRole ?? false);

	// Get authority level for Lead role (SYOS-672)
	const authorityLevel = $derived(
		isLeadRole && circle ? getLeadAuthorityLevel(circle.leadAuthority) : null
	);
	const authorityUI = $derived(authorityLevel ? getAuthorityUI(authorityLevel) : null);

	// Phase-based edit permissions (SYOS-982)
	const editPermission = useCanEdit({
		sessionId: () => sessionId ?? null,
		workspaceId: () => workspaceId ?? null,
		circleId: () => displayRole?.circleId ?? null
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

	// Edit role composable (only used in edit mode)
	// In design phase, direct save is allowed. In active phase, Phase 4 will handle proposal routing.
	const editRole = useEditRole({
		roleId: () => displayRole?.roleId ?? null,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId ?? null,
		canQuickEdit: () => isDesignPhase
	});

	// Custom fields composable for roles
	const customFields = useCustomFields({
		sessionId: () => sessionId,
		workspaceId: () => workspaceId ?? undefined,
		entityType: () => 'role',
		entityId: () => displayRole?.roleId ?? null
	});

	// Governance fields (purpose, decisionRights) are schema fields (DR-011) and should render above custom fields.
	// Filter out any legacy system custom fields if a workspace still has them defined.
	const visibleCustomFields = $derived(
		customFields.fields.filter((f) => {
			const key = f.definition.systemKey;
			const name = f.definition.name;
			return (
				key !== 'purpose' &&
				key !== 'decisionRights' &&
				name !== 'Purpose' &&
				name !== 'Decision Rights'
			);
		})
	);

	const governancePurposeField = $derived.by<CustomFieldWithValue>(() => ({
		definition: {
			// Sentinel ID: rendered via CustomFieldSection but not stored in customFieldDefinitions
			_id: '' as unknown as Id<'customFieldDefinitions'>,
			name: 'Purpose',
			order: -2,
			systemKey: 'purpose',
			isSystemField: true,
			fieldType: 'longText'
		},
		value: null,
		parsedValue: displayRole?.purpose ?? ''
	}));

	const governanceDecisionRightsField = $derived.by<CustomFieldWithValue>(() => ({
		definition: {
			// Sentinel ID: rendered via CustomFieldSection but not stored in customFieldDefinitions
			_id: '' as unknown as Id<'customFieldDefinitions'>,
			name: 'Decision Rights',
			order: -1,
			systemKey: 'decisionRights',
			isSystemField: true,
			fieldType: 'textList'
		},
		value: null,
		parsedValue: displayRole?.decisionRights ?? []
	}));

	async function saveRolePurpose(value: unknown) {
		if (!convexClient || !displayRole || !sessionId) return;
		const next = typeof value === 'string' ? value : '';
		await convexClient.mutation(api.core.roles.index.updateInline, {
			sessionId,
			circleRoleId: displayRole.roleId,
			updates: { purpose: next }
		});
	}

	async function deleteRolePurpose() {
		// GOV-02: purpose cannot be deleted.
		toast.error('Role purpose is required');
	}

	async function saveRoleDecisionRights(value: unknown) {
		if (!convexClient || !displayRole || !sessionId) return;
		if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
			toast.error('Decision rights must be a list of text items');
			return;
		}
		await convexClient.mutation(api.core.roles.index.updateInline, {
			sessionId,
			circleRoleId: displayRole.roleId,
			updates: { decisionRights: value }
		});
	}

	async function deleteRoleDecisionRights() {
		// GOV-03: decisionRights cannot be empty.
		// Important: don't throw here (CustomFieldSection has an uncaught delete path).
		toast.error('At least one decision right is required');
	}

	// Quick update handler for role (purpose and name)
	async function handleQuickUpdateRole(updates: { name?: string; purpose?: string }) {
		if (!convexClient || !displayRole || !sessionId) return;

		await convexClient.mutation(api.core.roles.index.updateInline, {
			sessionId,
			circleRoleId: displayRole.roleId,
			updates
		});
		// No manual refetch needed - useQuery automatically refetches after mutations
	}

	// Quick update handler for role name (separate for header)
	async function handleQuickUpdateRoleName(name: string) {
		await handleQuickUpdateRole({ name });
	}

	// Filled By actions (RoleCardWithMembers → RoleCard)
	async function handleRoleMemberAssignment(personIds: Id<'people'>[]) {
		if (!convexClient || !sessionId || !displayRole || personIds.length === 0) return;
		try {
			await convexClient.mutation(api.core.roles.index.assignPerson, {
				sessionId,
				circleRoleId: displayRole.roleId,
				assigneePersonId: personIds[0]
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to assign person';
			toast.error(message);
		}
	}

	async function handleRoleMemberRemoval(personId: Id<'people'>) {
		if (!convexClient || !sessionId || !displayRole) return;
		try {
			await convexClient.mutation(api.core.roles.index.removePerson, {
				sessionId,
				circleRoleId: displayRole.roleId,
				assigneePersonId: personId
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to remove person';
			toast.error(message);
		}
	}

	// Check if this role panel is the topmost layer
	const isTopmost = () => navigation.isTopmost('role', selectedRoleId);

	// Role-specific tabs configuration
	let activeTab = $state('overview');
	const tabCounts = $state(DEFAULT_ROLE_TAB_COUNTS);

	function handleEditClick() {
		if (!displayRole) return;
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
		if (orgChart && displayRole) {
			orgChart.selectRole(displayRole.roleId, 'circle-panel', { skipStackPush: true });
		}
	}

	// Handle close with edit protection
	function handleClose() {
		// Check edit protection before navigating
		if (isEditMode && editRole.isDirty) {
			showDiscardDialog = true;
			return;
		}

		// Reset edit mode if active
		if (isEditMode) {
			isEditMode = false;
			editRole.reset();
		}

		// Use shared navigation's close handler
		navigation.handleClose();
	}

	// Handle breadcrumb click with edit protection
	function handleBreadcrumbClick(index: number) {
		// Check edit protection before navigating
		if (isEditMode && editRole.isDirty) {
			showDiscardDialog = true;
			return;
		}

		// Reset edit mode if active
		if (isEditMode) {
			isEditMode = false;
			editRole.reset();
		}

		// Use shared navigation's breadcrumb handler
		navigation.handleBreadcrumbClick(index);
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
		navigationStack={navigation}
		onClose={handleClose}
		onBreadcrumbClick={handleBreadcrumbClick}
		{isTopmost}
		iconRenderer={renderBreadcrumbIcon}
	>
		{#snippet children(panelContext)}
			{#if !displayRole && isLoading}
				<!-- Loading State -->
				<Loading message="Loading role details..." />
			{:else if !displayRole && error}
				<!-- Error State -->
				<ErrorState title="Failed to load role" message={String(error)} />
			{:else if displayRole}
				<!-- Header -->
				<DetailHeader
					entityName={isEditMode ? editRole.formValues.name : displayRole.name}
					onClose={handleClose}
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
												{getLeadDescription(circle.leadAuthority)}
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
					<div class="relative flex-1 overflow-y-auto">
						<TabbedPanel
							tabs={ROLE_TABS}
							bind:activeTab
							urlParam="roleTab"
							urlHistoryMode="replace"
							{tabCounts}
						>
							{#snippet content(tabId)}
								<RoleTabContent
									{tabId}
									displayRole={displayRole
										? {
												roleId: displayRole.roleId,
												name: displayRole.name,
												purpose: displayRole.purpose ?? null,
												circleId: displayRole.circleId,
												decisionRights: displayRole.decisionRights ?? null
											}
										: null}
									workspaceId={workspaceId ?? undefined}
									sessionId={sessionId ?? undefined}
									{canEdit}
									{editReason}
									{governancePurposeField}
									{governanceDecisionRightsField}
									{visibleCustomFields}
									onSaveRolePurpose={saveRolePurpose}
									onDeleteRolePurpose={deleteRolePurpose}
									onSaveRoleDecisionRights={saveRoleDecisionRights}
									onDeleteRoleDecisionRights={deleteRoleDecisionRights}
									onSaveCustomField={(definitionId, value) =>
										customFields.setFieldValue(definitionId, value)}
									onDeleteCustomField={(definitionId) =>
										customFields.deleteFieldValue(definitionId)}
									onRoleMemberAssignment={handleRoleMemberAssignment}
									onRoleMemberRemoval={handleRoleMemberRemoval}
								/>
							{/snippet}
						</TabbedPanel>

						{#if shouldShowContentLoadingOverlay}
							<div class="bg-surface/80 absolute inset-0 flex items-center justify-center">
								<Loading message="Loading..." />
							</div>
						{/if}
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
