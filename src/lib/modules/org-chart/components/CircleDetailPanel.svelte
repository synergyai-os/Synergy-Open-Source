<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useQuickEditPermission } from '../composables/useQuickEditPermission.svelte';
	import { useCircleItems } from '../composables/useCircleItems.svelte';
	import { useEditCircle } from '../composables/useEditCircle.svelte';
	import CircleDetailHeader from './CircleDetailHeader.svelte';
	import CategoryHeader from './CategoryHeader.svelte';
	import RoleCard from './RoleCard.svelte';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';
	import CategoryItemsList from './CategoryItemsList.svelte';
	import CircleTypeBadge from './CircleTypeBadge.svelte';
	import CircleTypeSelector from './CircleTypeSelector.svelte';
	import DecisionModelSelector from './DecisionModelSelector.svelte';
	import AssignUserDialog from './AssignUserDialog.svelte';
	import ConfirmDiscardDialog from './ConfirmDiscardDialog.svelte';
	import FormTextarea from '$lib/components/atoms/FormTextarea.svelte';
	import FormSelect from '$lib/components/atoms/FormSelect.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import * as Tabs from '$lib/components/atoms/Tabs.svelte';
	import { tabsListRecipe, tabsTriggerRecipe, tabsContentRecipe } from '$lib/design-system/recipes';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import {
		CIRCLE_TYPES,
		DECISION_MODELS,
		DEFAULT_CIRCLE_TYPE_LABELS,
		DEFAULT_DECISION_MODEL_LABELS,
		type CircleType,
		type DecisionModel
	} from '$lib/infrastructure/organizational-model/constants';
	import { untrack } from 'svelte';

	type DecisionOption = { value: DecisionModel; label: string };

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

	// Edit mode state
	let isEditMode = $state(false);
	let showDiscardDialog = $state(false);
	const workspaceId = $derived($page.data.workspaceId as Id<'workspaces'> | undefined);

	// Edit circle composable (only used in edit mode)
	const editCircle = useEditCircle({
		circleId: () => circle?.circleId ?? null,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId,
		canQuickEdit: () => canEdit
	});

	// Circle items composable
	const circleItems = useCircleItems({
		sessionId: () => sessionId,
		entityType: () => 'circle',
		entityId: () => circle?.circleId ?? null
	});

	// Circle type and decision model options for edit mode
	const circleTypeOptions = [
		{ value: CIRCLE_TYPES.HIERARCHY, label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HIERARCHY] },
		{
			value: CIRCLE_TYPES.EMPOWERED_TEAM,
			label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.EMPOWERED_TEAM]
		},
		{ value: CIRCLE_TYPES.GUILD, label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.GUILD] },
		{ value: CIRCLE_TYPES.HYBRID, label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HYBRID] }
	];

	// Extract circleType as separate derived value (only tracks circleType, not entire formValues)
	// Pattern: Prevents infinite loop by tracking only the specific field we care about
	const circleTypeValue = $derived(isEditMode ? editCircle.formValues.circleType : null);

	// Decision model options (filtered based on circle type)
	const decisionModelOptions = $derived.by<DecisionOption[]>(() => {
		if (!isEditMode || !circleTypeValue) return [];
		const allOptions: DecisionOption[] = [
			{
				value: DECISION_MODELS.MANAGER_DECIDES,
				label: DEFAULT_DECISION_MODEL_LABELS[DECISION_MODELS.MANAGER_DECIDES]
			},
			{
				value: DECISION_MODELS.TEAM_CONSENSUS,
				label: DEFAULT_DECISION_MODEL_LABELS[DECISION_MODELS.TEAM_CONSENSUS]
			},
			{
				value: DECISION_MODELS.CONSENT,
				label: DEFAULT_DECISION_MODEL_LABELS[DECISION_MODELS.CONSENT]
			},
			{
				value: DECISION_MODELS.COORDINATION_ONLY,
				label: DEFAULT_DECISION_MODEL_LABELS[DECISION_MODELS.COORDINATION_ONLY]
			}
		];

		switch (circleTypeValue) {
			case CIRCLE_TYPES.HIERARCHY:
				return allOptions.filter((o) => o.value === DECISION_MODELS.MANAGER_DECIDES);
			case CIRCLE_TYPES.EMPOWERED_TEAM:
				return allOptions.filter((o) => o.value !== DECISION_MODELS.COORDINATION_ONLY);
			case CIRCLE_TYPES.GUILD:
				return allOptions.filter((o) => o.value === DECISION_MODELS.COORDINATION_ONLY);
			case CIRCLE_TYPES.HYBRID:
				return allOptions.filter((o) => o.value !== DECISION_MODELS.COORDINATION_ONLY);
			default:
				return allOptions;
		}
	});

	// Ensure decision model is valid for current circle type
	// Pattern #L120: Only track circleTypeValue (not entire formValues) to prevent infinite loop
	// Uses untrack() when calling setField() to prevent mutation from triggering effect
	$effect(() => {
		if (!isEditMode || !circle || !circleTypeValue) return;

		// Track only circleTypeValue - this is what triggers the effect
		// NOT editCircle.formValues (which would track entire object and cause loop)
		const circleType = circleTypeValue;

		// Compute valid options inline to avoid reactivity issues
		const allOptions: DecisionOption[] = [
			{
				value: DECISION_MODELS.MANAGER_DECIDES,
				label: DEFAULT_DECISION_MODEL_LABELS[DECISION_MODELS.MANAGER_DECIDES]
			},
			{
				value: DECISION_MODELS.TEAM_CONSENSUS,
				label: DEFAULT_DECISION_MODEL_LABELS[DECISION_MODELS.TEAM_CONSENSUS]
			},
			{
				value: DECISION_MODELS.CONSENT,
				label: DEFAULT_DECISION_MODEL_LABELS[DECISION_MODELS.CONSENT]
			},
			{
				value: DECISION_MODELS.COORDINATION_ONLY,
				label: DEFAULT_DECISION_MODEL_LABELS[DECISION_MODELS.COORDINATION_ONLY]
			}
		];

		let validOptions: DecisionOption[];
		switch (circleType) {
			case CIRCLE_TYPES.HIERARCHY:
				validOptions = allOptions.filter((o) => o.value === DECISION_MODELS.MANAGER_DECIDES);
				break;
			case CIRCLE_TYPES.EMPOWERED_TEAM:
				validOptions = allOptions.filter((o) => o.value !== DECISION_MODELS.COORDINATION_ONLY);
				break;
			case CIRCLE_TYPES.GUILD:
				validOptions = allOptions.filter((o) => o.value === DECISION_MODELS.COORDINATION_ONLY);
				break;
			case CIRCLE_TYPES.HYBRID:
				validOptions = allOptions.filter((o) => o.value !== DECISION_MODELS.COORDINATION_ONLY);
				break;
			default:
				validOptions = allOptions;
		}

		// Untrack decisionModel read to prevent loops
		const currentDecisionModel = untrack(() => editCircle.formValues.decisionModel);

		// Only update if current decision model is invalid
		const isValid = validOptions.some((o) => o.value === currentDecisionModel);

		if (!isValid && validOptions.length > 0) {
			// Pattern #L120: Use untrack() when calling setField() to prevent mutation from triggering effect
			// This breaks the cycle: setField() → state mutates → formValues recalculates → effect triggers
			untrack(() => {
				editCircle.setField('decisionModel', validOptions[0].value);
			});
		}
	});

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

	function handleClose() {
		if (!orgChart) return;

		// Check if in edit mode with unsaved changes
		if (isEditMode && editCircle.isDirty) {
			showDiscardDialog = true;
			return;
		}

		// Exit edit mode if active
		if (isEditMode) {
			isEditMode = false;
			editCircle.reset();
		}

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

	async function handleSaveAsProposal() {
		// For MVP, use simple title/description
		// TODO: In future, could show a dialog to enter title/description
		const title = `Update ${editCircle.formValues.name}`;
		const description = `Proposed changes to circle "${editCircle.formValues.name}"`;

		await editCircle.saveAsProposal(title, description);
		isEditMode = false;
		// Refresh circle data by re-selecting
		if (orgChart && circle) {
			orgChart.selectCircle(circle.circleId, { skipStackPush: true });
		}
	}

	function handleBreadcrumbClick(index: number) {
		if (!orgChart) return;

		// Check if in edit mode with unsaved changes
		if (isEditMode && editCircle.isDirty) {
			showDiscardDialog = true;
			return;
		}

		// Exit edit mode if active
		if (isEditMode) {
			isEditMode = false;
			editCircle.reset();
		}

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
							class="size-icon-xl text-tertiary mx-auto animate-spin"
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
						<p class="text-button text-error font-medium">Failed to load circle</p>
						<p class="text-button text-secondary mb-header">{String(error)}</p>
					</div>
				</div>
			{:else if circle}
				<!-- Header -->
				<CircleDetailHeader
					circleName={isEditMode ? editCircle.formValues.name : circle.name}
					onClose={handleClose}
					onBack={panelContext.onBack}
					showBackButton={panelContext.isMobile && panelContext.canGoBack}
					onEdit={isEditMode ? undefined : handleEditClick}
					editable={!isEditMode && canEdit}
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
				/>

				<!-- Edit Mode Indicator Bar -->
				{#if isEditMode}
					<div
						class="border-base bg-surface-subtle py-header gap-button px-page flex items-center border-b"
					>
						<Icon type="edit" size="sm" />
						<Text variant="body" size="sm" color="primary" class="font-medium">Edit mode</Text>
					</div>
				{/if}

				<!-- Operating Mode Section -->
				{#if circle}
					<div class="border-base mx-page rounded-card bg-surface card-padding mb-section border">
						<div class="mb-fieldGroup flex items-center justify-between">
							<Heading level={3}>Operating Mode</Heading>
							{#if !isEditMode}
								<CircleTypeBadge circleType={circle.circleType} />
							{/if}
						</div>

						{#if isEditMode}
							<!-- Edit Mode: Form Inputs -->
							<div class="space-y-form">
								<FormSelect
									label="Circle Type"
									value={editCircle.formValues.circleType}
									onchange={(value) => editCircle.setField('circleType', value as CircleType)}
									options={circleTypeOptions}
								/>
								<FormSelect
									label="Decision Model"
									value={editCircle.formValues.decisionModel}
									onchange={(value) => editCircle.setField('decisionModel', value as DecisionModel)}
									options={decisionModelOptions}
								/>
							</div>
						{:else}
							<!-- Read Mode: Selectors -->
							<div class="space-y-form">
								<CircleTypeSelector {circle} {sessionId} {canEdit} />
								<DecisionModelSelector {circle} {sessionId} {canEdit} />
							</div>
						{/if}
					</div>
				{/if}

				<!-- Content -->
				<div class="flex-1 overflow-y-auto">
					<Tabs.Root bind:value={activeTab}>
						<!-- Navigation Tabs - Sticky at top -->
						<div class="bg-surface px-page sticky top-0 z-10">
							<Tabs.List class={[tabsListRecipe(), 'gap-form flex flex-shrink-0 overflow-x-auto']}>
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
									<span class="gap-button flex items-center">
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
									<span class="gap-button flex items-center">
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
									<span class="gap-button flex items-center">
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
									<span class="gap-button flex items-center">
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
									<span class="gap-button flex items-center">
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
									<span class="gap-button flex items-center">
										<span>Projects</span>
										{#if tabCounts.projects > 0}
											<span class="text-label text-tertiary">({tabCounts.projects})</span>
										{/if}
									</span>
								</Tabs.Trigger>
							</Tabs.List>
						</div>

						<!-- Tab Content -->
						<div class="px-page py-page flex-1 overflow-y-auto">
							<Tabs.Content value="overview" class={tabsContentRecipe()}>
								<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
								<div
									class="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr)_minmax(400px,500px)]"
									style="gap: clamp(var(--spacing-5), 2.5vw, var(--spacing-10));"
								>
									<!-- Left Column: Overview Details -->
									<div class="gap-section flex min-w-0 flex-col overflow-hidden">
										<!-- Purpose -->
										<div>
											<h4
												class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
											>
												Purpose
											</h4>
											{#if isEditMode}
												<FormTextarea
													label=""
													placeholder="What's the purpose of this circle?"
													value={editCircle.formValues.purpose}
													oninput={(e) => editCircle.setField('purpose', e.currentTarget.value)}
													rows={4}
												/>
											{:else if canEdit}
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
													<div class="text-button text-secondary leading-relaxed break-words">
														{#if circle.purpose}
															{circle.purpose}
														{:else}
															<Text variant="body" size="md" color="tertiary">No purpose set</Text>
														{/if}
													</div>
												</EditPermissionTooltip>
											{:else}
												<p class="text-button text-secondary leading-relaxed break-words">
													{circle.purpose || 'No purpose set'}
												</p>
											{/if}
										</div>

										<!-- Domains -->
										<div>
											<h4
												class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
											>
												Domains
											</h4>
											<CategoryItemsList
												categoryName="Domains"
												items={circleItems.getItemsByCategory('Domains')}
												{canEdit}
												{editReason}
												onCreate={(content) => circleItems.createItem('Domains', content)}
												onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
												onDelete={(itemId) => circleItems.deleteItem(itemId)}
												placeholder="What domains does this circle own?"
											/>
										</div>

										<!-- Accountabilities -->
										<div>
											<h4
												class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
											>
												Accountabilities
											</h4>
											<CategoryItemsList
												categoryName="Accountabilities"
												items={circleItems.getItemsByCategory('Accountabilities')}
												{canEdit}
												{editReason}
												onCreate={(content) => circleItems.createItem('Accountabilities', content)}
												onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
												onDelete={(itemId) => circleItems.deleteItem(itemId)}
												placeholder="What is this circle accountable for?"
											/>
										</div>

										<!-- Policies -->
										<div>
											<h4
												class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
											>
												Policies
											</h4>
											<CategoryItemsList
												categoryName="Policies"
												items={circleItems.getItemsByCategory('Policies')}
												{canEdit}
												{editReason}
												onCreate={(content) => circleItems.createItem('Policies', content)}
												onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
												onDelete={(itemId) => circleItems.deleteItem(itemId)}
												placeholder="What policies govern this circle?"
											/>
										</div>

										<!-- Decision Rights -->
										<div>
											<h4
												class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
											>
												Decision Rights
											</h4>
											<CategoryItemsList
												categoryName="Decision Rights"
												items={circleItems.getItemsByCategory('Decision Rights')}
												{canEdit}
												{editReason}
												onCreate={(content) => circleItems.createItem('Decision Rights', content)}
												onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
												onDelete={(itemId) => circleItems.deleteItem(itemId)}
												placeholder="What decisions can this circle make?"
											/>
										</div>

										<!-- Notes -->
										<div>
											<h4
												class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
											>
												Notes
											</h4>
											<CategoryItemsList
												categoryName="Notes"
												items={circleItems.getItemsByCategory('Notes')}
												{canEdit}
												{editReason}
												onCreate={(content) => circleItems.createItem('Notes', content)}
												onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
												onDelete={(itemId) => circleItems.deleteItem(itemId)}
												placeholder="Additional notes about this circle"
											/>
										</div>
									</div>

									<!-- Right Column: Roles & Circles -->
									<div
										class="gap-section flex flex-col"
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
												<div class="gap-content mb-section flex flex-col">
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
																openAssignUserDialog('role', role.roleId, role.name);
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
												<div class="gap-content mb-section flex flex-col">
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
																openAssignUserDialog('role', role.roleId, role.name);
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
												<div class="gap-content mb-section flex flex-col">
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
																openAssignUserDialog(
																	'circle',
																	childCircle.circleId,
																	childCircle.name
																);
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
												<div class="gap-content mb-section flex flex-col">
													<RoleCard
														name="Members without role"
														isCircle={false}
														onClick={() => {}}
														onAddMember={() => {
															if (circle) {
																openAssignUserDialog('circle', circle.circleId, circle.name);
															}
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
										class="size-icon-xl text-tertiary mx-auto"
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
									<p class="text-button text-primary mb-header font-medium">No members yet</p>
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
										class="size-icon-xl text-tertiary mx-auto"
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
									<p class="text-button text-primary mb-header font-medium">No documents yet</p>
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
										class="size-icon-xl text-tertiary mx-auto"
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
									<p class="text-button text-primary mb-header font-medium">No activities yet</p>
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
										class="size-icon-xl text-tertiary mx-auto"
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
									<p class="text-button text-primary mb-header font-medium">No metrics yet</p>
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
										class="size-icon-xl text-tertiary mx-auto"
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
									<p class="text-button text-primary mb-header font-medium">No checklists yet</p>
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
										class="size-icon-xl text-tertiary mx-auto"
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
									<p class="text-button text-primary mb-header font-medium">No projects yet</p>
									<p class="text-button text-secondary mb-header">
										Projects associated with this circle will appear here. This feature will be
										available in a future update.
									</p>
								</div>
							</Tabs.Content>
						</div>
					</Tabs.Root>
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
						{#if canEdit}
							<Button
								variant="primary"
								onclick={handleSaveDirectly}
								disabled={editCircle.isSaving || !editCircle.isDirty}
							>
								{editCircle.isSaving ? 'Saving...' : 'Save'}
							</Button>
						{/if}
						<Button
							variant="primary"
							onclick={handleSaveAsProposal}
							disabled={editCircle.isSaving || !editCircle.isDirty}
						>
							{editCircle.isSaving ? 'Creating...' : 'Save as Proposal'}
						</Button>
					</div>
				{/if}
			{/if}
		{/snippet}
	</StackedPanel>

	<!-- Confirm Discard Dialog -->
	<ConfirmDiscardDialog
		open={showDiscardDialog}
		onOpenChange={(open) => {
			showDiscardDialog = open;
		}}
		onConfirm={handleConfirmDiscard}
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
