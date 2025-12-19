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
	import { CIRCLE_TYPES } from '$lib/infrastructure/organizational-model/constants';
	import { CIRCLE_DETAIL_KEY, type CircleDetailContext } from './CircleDetailContext.svelte';
	import DetailHeader from './DetailHeader.svelte';
	import AssignUserDialog from './AssignUserDialog.svelte';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';
	import Loading from '$lib/components/atoms/Loading.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import { ErrorState, TabbedPanel } from '$lib/components/molecules';
	import { useDetailPanelNavigation } from '../composables/useDetailPanelNavigation.svelte';
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

	let { orgChart }: { orgChart: UseOrgChart | null } = $props();

	// SSR guard - orgChart operations below are protected by optional chaining
	if (!browser || !orgChart) {
		// Component renders empty during SSR or when orgChart is null
	}
	const circle = $derived(orgChart?.selectedCircle ?? null),
		isOpen = $derived((orgChart?.selectedCircleId ?? null) !== null),
		isLoading = $derived(orgChart?.selectedCircleIsLoading ?? false),
		error = $derived(orgChart?.selectedCircleError ?? null);
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces'),
		workspaceId = $derived(() => workspaces?.activeWorkspaceId ?? undefined),
		convexClient = browser ? useConvexClient() : null,
		sessionId = $derived($page.data.sessionId);
	const editPermission = useCanEdit({
			sessionId: () => sessionId ?? null,
			workspaceId: () => workspaceId() ?? null,
			circleId: () => circle?.circleId ?? null
		}),
		canEdit = $derived(editPermission.canEdit),
		isDesignPhase = $derived(editPermission.isDesignPhase);
	const authorityQuery =
			browser && circle && sessionId
				? useQuery(api.core.circles.index.getMyAuthority, () => ({
						sessionId: sessionId!,
						circleId: circle!.circleId
					}))
				: null,
		isCircleLead = $derived(authorityQuery?.data?.isCircleLead ?? false),
		circleType = $derived(circle?.circleType ?? CIRCLE_TYPES.HIERARCHY),
		editReason = $derived.by(() =>
			canEdit || isDesignPhase
				? undefined
				: 'Only circle members can propose changes in active workspaces'
		);
	let isEditMode = $state(false),
		showDiscardDialog = $state(false);
	const navigation = useDetailPanelNavigation({
			orgChart: () => orgChart,
			isEditMode: () => isEditMode,
			isDirty: () => editCircle.isDirty,
			onShowDiscardDialog: () => (showDiscardDialog = true),
			resetEditMode: () => {
				isEditMode = false;
				editCircle.reset();
			}
		}),
		editCircle = useEditCircle({
			circleId: () => circle?.circleId ?? null,
			sessionId: () => sessionId,
			workspaceId: () => workspaceId(),
			canQuickEdit: () => isDesignPhase
		}),
		customFields = useCustomFields({
			sessionId: () => sessionId,
			workspaceId: () => workspaceId(),
			entityType: () => 'circle',
			entityId: () => circle?.circleId ?? null
		});
	const handleQuickUpdateCircle = (updates: { name?: string; purpose?: string }) =>
			quickUpdateCircle(convexClient, sessionId, circle?.circleId ?? null, updates),
		handleQuickUpdateRole = (
			roleId: Id<'circleRoles'>,
			updates: { name?: string; purpose?: string }
		) => quickUpdateRole(convexClient, sessionId, roleId, updates);
	const isTopmost = () =>
		orgChart &&
		orgChart.navigationStack.currentLayer?.type === 'circle' &&
		orgChart.navigationStack.currentLayer?.id === orgChart.selectedCircleId;
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
		assignUserDialogOpen = $state(false),
		assignUserDialogType = $state<'role' | 'circle'>('role'),
		assignUserDialogEntityId = $state<Id<'circleRoles'> | Id<'circles'> | null>(null),
		assignUserDialogEntityName = $state('');
	const tabCounts = $state(DEFAULT_TAB_COUNTS),
		openAssignUserDialog = (
			type: 'role' | 'circle',
			entityId: Id<'circleRoles'> | Id<'circles'>,
			entityName: string
		) => {
			assignUserDialogType = type;
			assignUserDialogEntityId = entityId;
			assignUserDialogEntityName = entityName;
			assignUserDialogOpen = true;
		},
		handleAssignUserSuccess = () => {
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
			sessionId,
			workspaceId,
			convexClient,
			isEditMode: () => isEditMode,
			setEditMode: (value) => (isEditMode = value),
			setShowDiscardDialog: (value) => (showDiscardDialog = value)
		}),
		{ handleClose, handleBreadcrumbClick } = navigation,
		handleRoleClick = (roleId: string) =>
			orgChart?.selectRole(roleId as Id<'circleRoles'>, 'circle-panel'),
		handleChildCircleClick = (circleId: string) =>
			orgChart?.selectCircle(circleId as Id<'circles'>),
		renderBreadcrumbIcon = (layerType: string): IconType | null =>
			layerType === 'circle' ? 'circle' : layerType === 'role' ? 'user' : null;

	// Simplified context - tab components access customFields directly for DB-driven iteration
	setContext<CircleDetailContext>(CIRCLE_DETAIL_KEY, {
		circle: () => circle,
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
				<DetailHeader
					entityName={isEditMode ? editCircle.formValues.name : circle.name}
					onClose={handleClose}
					onBack={panelContext.onBack}
					showBackButton={panelContext.isMobile && panelContext.canGoBack}
					onEdit={isEditMode ? undefined : handleEditClick}
					canEdit={!isEditMode && canEdit}
					{editReason}
					onNameChange={!isEditMode ? (name) => handleQuickUpdateCircle({ name }) : undefined}
				>
					{#snippet titleBadges()}
						<CircleTitleBadges
							circleType={isEditMode ? editCircle.formValues.circleType : circle.circleType}
							decisionModel={isEditMode
								? editCircle.formValues.decisionModel
								: circle.decisionModel}
						/>
					{/snippet}
				</DetailHeader>
				{#if isEditMode}
					<CircleEditModeBar />
				{/if}
				<div class="flex-1 overflow-y-auto">
					<TabbedPanel tabs={CIRCLE_TABS} bind:activeTab {tabCounts}>
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
								onOpenAssignUserDialog={openAssignUserDialog}
							/>
						{/snippet}
					</TabbedPanel>
				</div>
				{#if isEditMode}
					<CircleEditFooter
						{editCircle}
						{isDesignPhase}
						{circleType}
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
