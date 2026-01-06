<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext, setContext } from 'svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useCustomFields } from '$lib/composables/useCustomFields.svelte';
	import { useEditCircle } from '../composables/useEditCircle.svelte';
	import { useCanEdit } from '../composables/useCanEdit.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { LEAD_AUTHORITY } from '$lib/infrastructure/organizational-model/constants';
	import { CIRCLE_DETAIL_KEY, type CircleDetailContext } from './CircleDetailContext.svelte';
	import DetailHeader from './DetailHeader.svelte';
	import AssignPersonDialog from './AssignPersonDialog.svelte';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';
	import Loading from '$lib/components/atoms/Loading.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import { ErrorState, TabbedPanel } from '$lib/components/molecules';
	import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
	import CircleTabContent from './CircleTabContent.svelte';
	import {
		handleQuickUpdateCircle as quickUpdateCircle,
		handleQuickUpdateRole as quickUpdateRole
	} from './circleDetailHelpers';
	import { createEditHandlers } from './circleDetailEditHandlers';
	import { CIRCLE_TABS, DEFAULT_TAB_COUNTS } from './circleDetailConfig';
	import CircleEditFooter from './CircleEditFooter.svelte';
	import CircleEditModeBar from './CircleEditModeBar.svelte';
	import CircleTitleBadges from './CircleTitleBadges.svelte';
	import { invariant } from '$lib/utils/invariant';

	let { orgChart }: { orgChart: UseOrgChart | null } = $props();

	// SSR guard - orgChart operations below are protected by optional chaining
	if (!browser || !orgChart) {
		// Component renders empty during SSR or when orgChart is null
	}
	// Get shared navigation from context
	const navigation = getStackedNavigation();

	const circle = $derived(orgChart?.selectedCircle ?? null),
		selectedCircleId = $derived(orgChart?.selectedCircleId ?? null),
		isOpen = $derived(navigation.isInStack('circle')),
		isLoading = $derived(orgChart?.selectedCircleIsLoading ?? false),
		error = $derived(orgChart?.selectedCircleError ?? null);
	const stable = $state({
		circle: null as typeof circle,
		circleId: null as typeof selectedCircleId
	});
	const lastLoaded = $state({
		circleId: null as string | null
	});

	// Keep a stable copy of the last-loaded circle for the currently selected circleId.
	// This prevents full-panel flashes when `isLoading` toggles briefly (e.g., URL state updates).
	$effect(() => {
		const id = selectedCircleId;
		if (id !== stable.circleId) {
			stable.circleId = id;
			stable.circle = null;
		}
		if (circle) {
			stable.circle = circle;
		}
	});

	const displayCircle = $derived(circle ?? stable.circle);
	$effect(() => {
		if (displayCircle && selectedCircleId) {
			lastLoaded.circleId = selectedCircleId as unknown as string;
		}
	});
	const shouldShowContentLoadingOverlay = $derived(
		!!selectedCircleId &&
			isLoading &&
			lastLoaded.circleId !== (selectedCircleId as unknown as string)
	);
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces'),
		workspaceId = $derived(() => workspaces?.activeWorkspaceId ?? undefined),
		convexClient = browser ? useConvexClient() : null,
		sessionId = $derived($page.data.sessionId);
	const editPermission = useCanEdit({
			sessionId: () => sessionId ?? null,
			workspaceId: () => workspaceId() ?? null,
			circleId: () => displayCircle?.circleId ?? null
		}),
		canEdit = $derived(editPermission.canEdit),
		isDesignPhase = $derived(editPermission.isDesignPhase);
	const authorityQuery = $derived(
			browser && displayCircle?.circleId && sessionId
				? useQuery(api.core.circles.index.getMyAuthority, () => {
						invariant(sessionId && displayCircle?.circleId, 'sessionId and circleId required');
						return { sessionId, circleId: displayCircle.circleId };
					})
				: null
		),
		isCircleLead = $derived(authorityQuery?.data?.isCircleLead ?? false),
		leadAuthority = $derived(displayCircle?.leadAuthority ?? LEAD_AUTHORITY.DECIDES),
		editReason = $derived.by(() =>
			canEdit || isDesignPhase
				? undefined
				: 'Only circle members can propose changes in active workspaces'
		);
	// Inline edits use `updateInline` which is design-phase only.
	const inlineEditReason = $derived.by(() =>
		isDesignPhase
			? editReason
			: 'Direct edits only allowed in design phase. Click Edit to propose changes.'
	);
	let isEditMode = $state(false),
		showDiscardDialog = $state(false);

	const editCircle = useEditCircle({
			circleId: () => displayCircle?.circleId ?? null,
			sessionId: () => sessionId,
			workspaceId: () => workspaceId(),
			canQuickEdit: () => isDesignPhase
		}),
		customFields = useCustomFields({
			sessionId: () => sessionId,
			workspaceId: () => workspaceId(),
			entityType: () => 'circle',
			entityId: () => displayCircle?.circleId ?? null
		});
	const handleQuickUpdateCircle = (updates: { name?: string; purpose?: string }) =>
			quickUpdateCircle(convexClient, sessionId, displayCircle?.circleId ?? null, updates),
		handleQuickUpdateRole = (
			roleId: Id<'circleRoles'>,
			updates: { name?: string; purpose?: string }
		) => quickUpdateRole(convexClient, sessionId, roleId, updates);
	const isTopmost = () => navigation.isTopmost('circle', selectedCircleId);
	const childCircles = $derived(
			orgChart?.selectedCircleId
				? orgChart.circles.filter((c) => c.parentCircleId === orgChart.selectedCircleId)
				: []
		),
		membersWithoutRoles = $derived(orgChart?.selectedCircleMembersWithoutRoles ?? []),
		coreRoles = $derived(
			orgChart?.selectedCircleId ? orgChart.getCoreRolesForCircle(orgChart.selectedCircleId) : []
		),
		regularRoles = $derived(
			orgChart?.selectedCircleId ? orgChart.getRegularRolesForCircle(orgChart.selectedCircleId) : []
		);
	let activeTab = $state('overview'),
		assignPersonDialogOpen = $state(false),
		assignPersonDialogType = $state<'role' | 'circle'>('role'),
		assignPersonDialogEntityId = $state<Id<'circleRoles'> | Id<'circles'> | null>(null),
		assignPersonDialogEntityName = $state('');
	const tabCounts = $state(DEFAULT_TAB_COUNTS),
		openAssignPersonDialog = (
			type: 'role' | 'circle',
			entityId: Id<'circleRoles'> | Id<'circles'>,
			entityName: string
		) => {
			assignPersonDialogType = type;
			assignPersonDialogEntityId = entityId;
			assignPersonDialogEntityName = entityName;
			assignPersonDialogOpen = true;
		},
		handleAssignPersonSuccess = () => {
			if (orgChart && circle) orgChart.selectCircle(circle.circleId, { skipStackPush: true });
		};

	const {
			handleEditClick,
			handleCancelEdit,
			handleConfirmDiscard,
			handleSaveDirectly,
			handleAutoApprove,
			handleProposeChange
		} = createEditHandlers({
			editCircle,
			orgChart,
			circle: () => circle,
			getSessionId: () => sessionId ?? null,
			workspaceId: () => workspaceId(),
			convexClient,
			isEditMode: () => isEditMode,
			setEditMode: (value) => (isEditMode = value),
			setShowDiscardDialog: (value) => (showDiscardDialog = value)
		}),
		// Handle close with edit protection
		handleClose = () => {
			// Check edit protection before navigating
			if (isEditMode && editCircle.isDirty) {
				showDiscardDialog = true;
				return;
			}

			// Reset edit mode if active
			if (isEditMode) {
				isEditMode = false;
				editCircle.reset();
			}

			// Use shared navigation's close handler
			navigation.handleClose();
		},
		// Handle breadcrumb click with edit protection
		handleBreadcrumbClick = (index: number) => {
			// Check edit protection before navigating
			if (isEditMode && editCircle.isDirty) {
				showDiscardDialog = true;
				return;
			}

			// Reset edit mode if active
			if (isEditMode) {
				isEditMode = false;
				editCircle.reset();
			}

			// Use shared navigation's breadcrumb handler
			navigation.handleBreadcrumbClick(index);
		},
		handleRoleClick = (roleId: string, roleName: string) =>
			orgChart?.selectRole(roleId as Id<'circleRoles'>, 'circle-panel', { roleName }),
		handleChildCircleClick = (circleId: string) =>
			orgChart?.selectCircle(circleId as Id<'circles'>),
		renderBreadcrumbIcon = (layerType: string): IconType | null =>
			layerType === 'circle' ? 'circle' : layerType === 'role' ? 'user' : null;

	// Simplified context - tab components access customFields directly for DB-driven iteration
	setContext<CircleDetailContext>(CIRCLE_DETAIL_KEY, {
		// Use the stable "displayCircle" to avoid transient nulls during brief loading toggles.
		// This is important for blur-save flows (e.g., governance Purpose) that must always have a circleId.
		circle: () => displayCircle,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId(),
		customFields,
		editCircle,
		canEdit: () => canEdit,
		editReason: () => editReason,
		isEditMode: () => isEditMode,
		isDesignPhase: () => isDesignPhase,
		isCircleLead: () => isCircleLead,
		handleQuickUpdateCircle
	});
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
			{#if !displayCircle && isLoading}
				<Loading message="Loading circle details..." size="md" fullHeight={true} />
			{:else if !displayCircle && error}
				<ErrorState title="Failed to load circle" message={String(error)} />
			{:else if displayCircle}
				<DetailHeader
					entityName={isEditMode ? editCircle.formValues.name : displayCircle.name}
					onClose={handleClose}
					onBack={panelContext.onBack}
					showBackButton={panelContext.isMobile && panelContext.canGoBack}
					onEdit={isEditMode ? undefined : handleEditClick}
					canEdit={!isEditMode && isDesignPhase}
					editReason={inlineEditReason}
					onNameChange={!isEditMode ? (name) => handleQuickUpdateCircle({ name }) : undefined}
				>
					{#snippet titleBadges()}
						<CircleTitleBadges
							leadAuthority={isEditMode
								? editCircle.formValues.leadAuthority
								: displayCircle.leadAuthority}
						/>
					{/snippet}
				</DetailHeader>
				{#if isEditMode}
					<CircleEditModeBar />
				{/if}
				<div class="relative flex-1 overflow-y-auto">
					<TabbedPanel
						tabs={CIRCLE_TABS}
						bind:activeTab
						{tabCounts}
						urlParam="circleTab"
						urlHistoryMode="replace"
					>
						{#snippet content(tabId)}
							<CircleTabContent
								{tabId}
								{childCircles}
								{coreRoles}
								{regularRoles}
								{membersWithoutRoles}
								onRoleClick={handleRoleClick}
								onChildCircleClick={handleChildCircleClick}
								onQuickUpdateRole={handleQuickUpdateRole}
								onOpenAssignPersonDialog={openAssignPersonDialog}
							/>
						{/snippet}
					</TabbedPanel>

					{#if shouldShowContentLoadingOverlay}
						<div class="bg-surface/80 absolute inset-0 flex items-center justify-center">
							<Loading message="Loading..." size="md" />
						</div>
					{/if}
				</div>
				{#if isEditMode}
					<CircleEditFooter
						{editCircle}
						{isDesignPhase}
						{leadAuthority}
						{isCircleLead}
						onCancel={handleCancelEdit}
						onSave={handleSaveDirectly}
						onAutoApprove={handleAutoApprove}
						onProposeChange={handleProposeChange}
					/>
				{/if}
			{/if}
		{/snippet}
	</StackedPanel>
	<StandardDialog
		bind:open={showDiscardDialog}
		title="Discard unsaved changes?"
		description="You have unsaved changes. Are you sure you want to discard them?"
		submitLabel="Discard"
		cancelLabel="Keep Editing"
		variant="danger"
		onsubmit={handleConfirmDiscard}
	/>
	{#if assignPersonDialogEntityId && circle}
		<AssignPersonDialog
			bind:open={assignPersonDialogOpen}
			type={assignPersonDialogType}
			entityId={assignPersonDialogEntityId}
			entityName={assignPersonDialogEntityName}
			workspaceId={circle.workspaceId}
			onSuccess={handleAssignPersonSuccess}
		/>
	{/if}
{/if}
