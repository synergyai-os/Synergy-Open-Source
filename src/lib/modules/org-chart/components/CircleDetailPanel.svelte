<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext, setContext } from 'svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useCustomFields } from '../composables/useCustomFields.svelte';
	import { useEditCircle } from '../composables/useEditCircle.svelte';
	import { useCanEdit } from '../composables/useCanEdit.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { CIRCLE_DETAIL_KEY, type CircleDetailContext } from './CircleDetailContext.svelte';
	import DetailHeader from './DetailHeader.svelte';
	import CircleTypeBadge from './CircleTypeBadge.svelte';
	import DecisionModelBadge from './DecisionModelBadge.svelte';
	import AssignUserDialog from './AssignUserDialog.svelte';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Loading from '$lib/components/atoms/Loading.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import { ErrorState, TabbedPanel } from '$lib/components/molecules';
	import { useDetailPanelNavigation } from '../composables/useDetailPanelNavigation.svelte';
	import { toast } from '$lib/utils/toast';
	import CircleOverviewTab from './tabs/CircleOverviewTab.svelte';
	import CircleMembersTab from './tabs/CircleMembersTab.svelte';
	import CircleDocumentsTab from './tabs/CircleDocumentsTab.svelte';
	import CircleActivitiesTab from './tabs/CircleActivitiesTab.svelte';
	import CircleMetricsTab from './tabs/CircleMetricsTab.svelte';
	import CircleChecklistsTab from './tabs/CircleChecklistsTab.svelte';
	import CircleProjectsTab from './tabs/CircleProjectsTab.svelte';

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

	// Get workspaceId from context (same pattern as page components)
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const workspaceId = $derived(() => {
		if (!workspaces) return undefined;
		return workspaces.activeWorkspaceId ?? undefined;
	});

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;
	const sessionId = $derived($page.data.sessionId);

	// Phase-based edit permissions (SYOS-981)
	const editPermission = useCanEdit({
		sessionId: () => sessionId ?? null,
		workspaceId: () => workspaceId() ?? null,
		circleId: () => circle?.circleId ?? null
	});

	const canEdit = $derived(editPermission.canEdit);
	const isDesignPhase = $derived(editPermission.isDesignPhase);

	// Query user's authority in this circle (SYOS-986)
	const getSessionId = () => sessionId;
	const authorityQuery =
		browser && circle && sessionId
			? useQuery(api.core.circles.index.getMyAuthority, () => {
					const sid = getSessionId();
					const cid = circle?.circleId;
					if (!sid || !cid) throw new Error('sessionId and circleId required');
					return { sessionId: sid, circleId: cid };
				})
			: null;

	const myAuthority = $derived(authorityQuery?.data ?? null);
	const isCircleLead = $derived(myAuthority?.isCircleLead ?? false);
	const circleType = $derived(circle?.circleType ?? 'hierarchy');

	// Edit reason for tooltip display when canEdit is false
	const editReason = $derived.by(() => {
		if (canEdit) return undefined;
		if (!isDesignPhase) {
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
		isDirty: () => editCircle.isDirty,
		onShowDiscardDialog: () => {
			showDiscardDialog = true;
		},
		resetEditMode: () => {
			isEditMode = false;
			editCircle.reset();
		}
	});

	// Edit circle composable (only used in edit mode)
	// In design phase, direct save is allowed. In active phase, Phase 4 will handle proposal routing.
	const editCircle = useEditCircle({
		circleId: () => circle?.circleId ?? null,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId(),
		canQuickEdit: () => isDesignPhase
	});

	// Custom fields composable
	const customFields = useCustomFields({
		sessionId: () => sessionId,
		workspaceId: () => workspaceId(),
		entityType: () => 'circle',
		entityId: () => circle?.circleId ?? null
	});

	// Map category names to system keys
	// Note: System keys are singular (matching SYSTEM_FIELD_DEFINITIONS in constants.ts)
	function getSystemKeyForCategory(categoryName: string): string | null {
		const mapping: Record<string, string> = {
			Domains: 'domain',
			Accountabilities: 'accountability',
			Policies: 'policy',
			'Decision Rights': 'decision_right',
			Notes: 'note'
		};
		return mapping[categoryName] ?? null;
	}

	// Helper: Get field value as array (for multi-item fields)
	function getFieldValueAsArray(systemKey: string): string[] {
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field || !field.parsedValue) return [];
		if (Array.isArray(field.parsedValue)) {
			return field.parsedValue.map((v) => String(v));
		}
		return [];
	}

	// Helper: Get field value as string (for single-value fields)
	function getFieldValueAsString(systemKey: string): string {
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field || !field.parsedValue) return '';
		return String(field.parsedValue);
	}

	// Helper: Convert array items to CircleItem format for CategoryItemsList
	function getItemsForCategory(categoryName: string): Array<{
		itemId: Id<'circleItems'>;
		content: string;
		order: number;
		createdAt: number;
		updatedAt: number;
	}> {
		const systemKey = getSystemKeyForCategory(categoryName);
		if (!systemKey) return [];
		const items = getFieldValueAsArray(systemKey);
		return items.map((content, index) => ({
			itemId: `${systemKey}-${index}` as Id<'circleItems'>, // Temporary ID format
			content,
			order: index,
			createdAt: Date.now(),
			updatedAt: Date.now()
		}));
	}

	// Handler: Add item to multi-item field
	async function handleAddMultiItemField(categoryName: string, content: string) {
		const systemKey = getSystemKeyForCategory(categoryName);
		if (!systemKey) return;
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field) return;
		const currentItems = getFieldValueAsArray(systemKey);
		const updatedItems = [...currentItems, content];
		await customFields.setFieldValue(field.definition._id, updatedItems);
	}

	// Handler: Update item in multi-item field
	async function handleUpdateMultiItemField(
		categoryName: string,
		itemId: Id<'circleItems'>,
		content: string
	) {
		const systemKey = getSystemKeyForCategory(categoryName);
		if (!systemKey) return;
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field) return;
		const index = parseInt(String(itemId).split('-')[1] ?? '0');
		const currentItems = getFieldValueAsArray(systemKey);
		const updatedItems = [...currentItems];
		updatedItems[index] = content;
		await customFields.setFieldValue(field.definition._id, updatedItems);
	}

	// Handler: Delete item from multi-item field
	async function handleDeleteMultiItemField(categoryName: string, itemId: Id<'circleItems'>) {
		const systemKey = getSystemKeyForCategory(categoryName);
		if (!systemKey) return;
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field) return;
		const index = parseInt(String(itemId).split('-')[1] ?? '0');
		const currentItems = getFieldValueAsArray(systemKey);
		const updatedItems = currentItems.filter((_, i) => i !== index);
		await customFields.setFieldValue(field.definition._id, updatedItems);
	}

	// Handler: Update single field (Notes)
	async function handleUpdateSingleField(categoryName: string, content: string) {
		const systemKey = getSystemKeyForCategory(categoryName);
		if (!systemKey) return;
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field) return;
		if (!content.trim()) {
			// Delete if empty
			await customFields.deleteFieldValue(field.definition._id);
		} else {
			await customFields.setFieldValue(field.definition._id, content);
		}
	}

	// Quick update handlers
	async function handleQuickUpdateCircle(updates: { name?: string; purpose?: string }) {
		if (!convexClient || !circle || !sessionId) return;

		await convexClient.mutation(api.core.circles.index.updateInline, {
			sessionId,
			circleId: circle.circleId,
			updates
		});
	}

	async function handleQuickUpdateRole(
		roleId: Id<'circleRoles'>,
		updates: { name?: string; purpose?: string }
	) {
		if (!convexClient || !sessionId) return;

		await convexClient.mutation(api.core.roles.index.updateInline, {
			sessionId,
			circleRoleId: roleId,
			updates
		});
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

	// Circle-specific tabs configuration
	const CIRCLE_TABS = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'members', label: 'Members', showCount: true },
		{ id: 'documents', label: 'Documents', showCount: true },
		{ id: 'activities', label: 'Activities', showCount: true },
		{ id: 'metrics', label: 'Metrics', showCount: true },
		{ id: 'checklists', label: 'Checklists', showCount: true },
		{ id: 'projects', label: 'Projects', showCount: true }
	];

	// Tab state
	let activeTab = $state('overview');
	const tabCounts = $state({
		overview: 0,
		members: 0,
		documents: 0,
		activities: 0,
		metrics: 0,
		checklists: 0,
		projects: 0
	});

	// Assign user dialog state
	let assignUserDialogOpen = $state(false);
	let assignUserDialogType = $state<'role' | 'circle'>('role');
	let assignUserDialogEntityId = $state<Id<'circleRoles'> | Id<'circles'> | null>(null);
	let assignUserDialogEntityName = $state('');

	function openAssignUserDialog(
		type: 'role' | 'circle',
		entityId: Id<'circleRoles'> | Id<'circles'>,
		entityName: string
	) {
		assignUserDialogType = type;
		assignUserDialogEntityId = entityId;
		assignUserDialogEntityName = entityName;
		assignUserDialogOpen = true;
	}

	function handleAssignUserSuccess() {
		// Refresh org chart data - queries will auto-refresh
		if (orgChart && circle) {
			// Trigger a refresh by re-selecting the circle
			orgChart.selectCircle(circle.circleId, { skipStackPush: true });
		}
	}

	// Use navigation composable for close handler
	const handleClose = navigation.handleClose;

	function handleEditClick() {
		if (!circle) return;
		isEditMode = true;
		editCircle.loadCircle();
	}

	function handleCancelEdit() {
		if (editCircle.isDirty) {
			showDiscardDialog = true;
		} else {
			isEditMode = false;
			editCircle.reset();
		}
	}

	function handleConfirmDiscard() {
		editCircle.reset();
		isEditMode = false;
		showDiscardDialog = false;
	}

	async function handleSaveDirectly() {
		await editCircle.saveDirectly();
		isEditMode = false;
		// Refresh circle data by re-selecting
		if (orgChart && circle) {
			orgChart.selectCircle(circle.circleId, { skipStackPush: true });
		}
	}

	async function handleAutoApprove() {
		const wsId = workspaceId();
		if (!convexClient || !circle || !sessionId || !wsId) return;

		try {
			await convexClient.mutation(api.core.proposals.index.saveAndApprove, {
				sessionId,
				workspaceId: wsId,
				entityType: 'circle',
				entityId: circle.circleId,
				title: `Update ${editCircle.formValues.name}`,
				description: 'Proposed changes to circle',
				editedValues: {
					name: editCircle.formValues.name,
					purpose: editCircle.formValues.purpose || undefined,
					circleType: editCircle.formValues.circleType,
					decisionModel: editCircle.formValues.decisionModel
				}
			});

			toast.success('Changes saved and auto-approved');
			isEditMode = false;

			// Refresh circle data by re-selecting
			if (orgChart) {
				orgChart.selectCircle(circle.circleId, { skipStackPush: true });
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to save changes';
			toast.error(message);
			console.error('[CircleDetailPanel] Auto-approve failed:', err);
		}
	}

	async function handleProposeChange() {
		if (!circle) return;

		try {
			await editCircle.saveAsProposal(
				`Update ${editCircle.formValues.name}`,
				'Proposed changes to circle'
			);

			toast.success('Proposal created. It will be reviewed in the next governance meeting.');
			isEditMode = false;

			// Refresh circle data by re-selecting
			if (orgChart) {
				orgChart.selectCircle(circle.circleId, { skipStackPush: true });
			}
		} catch (err) {
			// Error is already handled in editCircle.saveAsProposal
			console.error('[CircleDetailPanel] Propose change failed:', err);
		}
	}

	// Use navigation composable for breadcrumb handler
	const handleBreadcrumbClick = navigation.handleBreadcrumbClick;

	function handleRoleClick(roleId: string) {
		if (!orgChart) return;
		orgChart.selectRole(roleId as Id<'circleRoles'>, 'circle-panel');
	}

	function handleChildCircleClick(circleId: string) {
		if (!orgChart) return;
		orgChart.selectCircle(circleId as Id<'circles'>);
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

	// Set up context for tab components
	setContext<CircleDetailContext>(CIRCLE_DETAIL_KEY, {
		// Core Data (reactive getters)
		circle: () => circle,

		// Composables
		customFields,
		editCircle,

		// Permissions
		canEdit: () => canEdit,
		editReason: () => editReason,
		isEditMode: () => isEditMode,
		isDesignPhase: () => isDesignPhase,
		isCircleLead: () => isCircleLead,

		// Handlers
		handleQuickUpdateCircle,
		handleAddMultiItemField,
		handleUpdateMultiItemField,
		handleDeleteMultiItemField,
		handleUpdateSingleField,

		// Helper Functions
		getFieldValueAsArray,
		getFieldValueAsString,
		getItemsForCategory
	});
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
				<Loading message="Loading circle details..." size="md" fullHeight={true} />
			{:else if error}
				<ErrorState title="Failed to load circle" message={String(error)} />
			{:else if circle}
				<!-- Header -->
				<DetailHeader
					entityName={isEditMode ? editCircle.formValues.name : circle.name}
					onClose={handleClose}
					onBack={panelContext.onBack}
					showBackButton={panelContext.isMobile && panelContext.canGoBack}
					onEdit={isEditMode ? undefined : handleEditClick}
					canEdit={!isEditMode && canEdit}
					{editReason}
					onNameChange={!isEditMode ? (name) => handleQuickUpdateCircle({ name }) : undefined}
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
				>
					{#snippet titleBadges()}
						<div class="gap-button flex items-center">
							<CircleTypeBadge
								circleType={isEditMode ? editCircle.formValues.circleType : circle.circleType}
							/>
							<DecisionModelBadge
								decisionModel={isEditMode
									? editCircle.formValues.decisionModel
									: circle.decisionModel}
							/>
						</div>
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

				<!-- Content -->
				<div class="flex-1 overflow-y-auto">
					<TabbedPanel
						tabs={CIRCLE_TABS}
						bind:activeTab
						onTabChange={(tab) => {
							activeTab = tab;
						}}
						{tabCounts}
					>
						{#snippet content(tabId)}
							{#if tabId === 'overview'}
								<CircleOverviewTab
									{childCircles}
									{coreRoles}
									{regularRoles}
									{membersWithoutRoles}
									onRoleClick={handleRoleClick}
									onChildCircleClick={handleChildCircleClick}
									onQuickUpdateRole={handleQuickUpdateRole}
									onOpenAssignUserDialog={openAssignUserDialog}
								/>
							{:else if tabId === 'members'}
								<CircleMembersTab />
							{:else if tabId === 'documents'}
								<CircleDocumentsTab />
							{:else if tabId === 'activities'}
								<CircleActivitiesTab />
							{:else if tabId === 'metrics'}
								<CircleMetricsTab />
							{:else if tabId === 'checklists'}
								<CircleChecklistsTab />
							{:else if tabId === 'projects'}
								<CircleProjectsTab />
							{/if}
						{/snippet}
					</TabbedPanel>
				</div>

				<!-- Footer with Save Actions (Edit Mode Only) -->
				{#if isEditMode}
					<div
						class="border-base py-header gap-button bg-surface px-page sticky bottom-0 z-20 flex items-center justify-end border-t"
					>
						{#if editCircle.error}
							<div class="mr-auto">
								<Text variant="body" size="sm" color="error">{editCircle.error}</Text>
							</div>
						{/if}
						<Button variant="outline" onclick={handleCancelEdit} disabled={editCircle.isSaving}>
							Cancel
						</Button>

						{#if isDesignPhase}
							<!-- Design phase: Direct save for all members -->
							<Button
								variant="primary"
								onclick={handleSaveDirectly}
								disabled={editCircle.isSaving || !editCircle.isDirty}
							>
								{editCircle.isSaving ? 'Saving...' : 'Save'}
							</Button>
						{:else if circleType === 'hierarchy' && isCircleLead}
							<!-- Hierarchy + Circle Lead: Auto-approve flow -->
							<Button
								variant="primary"
								onclick={handleAutoApprove}
								disabled={editCircle.isSaving || !editCircle.isDirty}
							>
								{editCircle.isSaving ? 'Saving...' : 'Save'}
							</Button>
						{:else if circleType === 'guild'}
							<!-- Guild: View only (no save button) -->
							<Text variant="body" size="sm" color="secondary">Guild circles cannot be edited</Text>
						{:else}
							<!-- Non-hierarchy or non-lead: Propose Change flow -->
							<Button
								variant="primary"
								onclick={handleProposeChange}
								disabled={editCircle.isSaving || !editCircle.isDirty}
							>
								{editCircle.isSaving ? 'Proposing...' : 'Propose Change'}
							</Button>
						{/if}
					</div>
				{/if}
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

	<!-- Assign User Dialog -->
	{#if assignUserDialogEntityId && circle}
		<AssignUserDialog
			bind:open={assignUserDialogOpen}
			type={assignUserDialogType}
			entityId={assignUserDialogEntityId}
			entityName={assignUserDialogEntityName}
			workspaceId={circle.workspaceId}
			onSuccess={handleAssignUserSuccess}
		/>
	{/if}
{/if}
