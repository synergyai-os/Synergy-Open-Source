<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { untrack } from 'svelte';
	import type { Id } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useEditCircle } from '../composables/useEditCircle.svelte';
	import { useQuickEditPermission } from '../composables/useQuickEditPermission.svelte';
	import { useCircleItems } from '../composables/useCircleItems.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import ConfirmDiscardDialog from './ConfirmDiscardDialog.svelte';
	import FormInput from '$lib/components/atoms/FormInput.svelte';
	import FormTextarea from '$lib/components/atoms/FormTextarea.svelte';
	import FormSelect from '$lib/components/atoms/FormSelect.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import CategoryItemsList from './CategoryItemsList.svelte';
	import {
		CIRCLE_TYPES,
		DECISION_MODELS,
		DEFAULT_CIRCLE_TYPE_LABELS,
		DEFAULT_DECISION_MODEL_LABELS,
		type CircleType,
		type DecisionModel
	} from '$lib/infrastructure/organizational-model/constants';

	let { orgChart, circleId }: { orgChart: UseOrgChart | null; circleId: Id<'circles'> } = $props();

	// Guard: Don't access orgChart properties if it's null
	if (!browser || !orgChart) {
		// Return early during SSR
	}

	const isOpen = $derived(circleId !== null);
	const sessionId = $derived($page.data.sessionId);
	const workspaceId = $derived($page.data.workspaceId as Id<'workspaces'> | undefined);

	// Check quick edit permission
	const quickEditPermission = useQuickEditPermission({
		circle: () => orgChart?.selectedCircle ?? null,
		sessionId: () => sessionId,
		allowQuickChanges: () => orgChart?.allowQuickChanges ?? false
	});

	const canQuickEdit = $derived(quickEditPermission.canEdit);
	const editReason = $derived(quickEditPermission.editReason);

	// Edit circle composable
	const editCircle = useEditCircle({
		circleId: () => circleId,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId,
		canQuickEdit: () => canQuickEdit
	});

	// Circle items composable for category items
	const circleItems = useCircleItems({
		sessionId: () => sessionId,
		entityType: () => 'circle',
		entityId: () => (circleId ? String(circleId) : null)
	});

	// Load circle data when panel opens
	$effect(() => {
		if (circleId && sessionId) {
			editCircle.loadCircle();
		}
	});

	// Confirm discard dialog state
	let showDiscardDialog = $state(false);

	// Check if this panel is the topmost layer
	const isTopmost = () => {
		if (!orgChart) return false;
		const currentLayer = orgChart.navigationStack.currentLayer;
		return currentLayer?.type === 'edit-circle' && currentLayer?.id === circleId;
	};

	function handleClose() {
		if (editCircle.isDirty) {
			showDiscardDialog = true;
		} else {
			closePanel();
		}
	}

	function closePanel() {
		if (!orgChart) return;
		const previousLayer = orgChart.navigationStack.previousLayer;

		// Pop current layer
		orgChart.navigationStack.pop();

		if (previousLayer) {
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
			orgChart.selectCircle(null);
		}
	}

	function handleConfirmDiscard() {
		editCircle.reset();
		closePanel();
	}

	function handleBreadcrumbClick(index: number) {
		if (!orgChart) return;
		const targetLayer = orgChart.navigationStack.getLayer(index);
		if (!targetLayer) return;

		if (editCircle.isDirty) {
			showDiscardDialog = true;
			return;
		}

		orgChart.navigationStack.jumpTo(index);

		if (targetLayer.type === 'circle') {
			orgChart.selectCircle(targetLayer.id as Id<'circles'>, { skipStackPush: true });
		} else if (targetLayer.type === 'role') {
			orgChart.selectRole(targetLayer.id as Id<'circleRoles'>, 'circle-panel', {
				skipStackPush: true
			});
		}
	}

	async function handleSaveDirectly() {
		try {
			await editCircle.saveDirectly();
			closePanel();
		} catch (_error) {
			// Error already handled in composable
		}
	}

	async function handleSaveAsProposal() {
		// For MVP, use simple title/description
		// TODO: In future, could show a dialog to enter title/description
		const title = `Update ${editCircle.formValues.name}`;
		const description = `Proposed changes to circle "${editCircle.formValues.name}"`;

		try {
			await editCircle.saveAsProposal(title, description);
			closePanel();
		} catch (_error) {
			// Error already handled in composable
		}
	}

	// Circle type options
	const circleTypeOptions: Array<{ value: CircleType; label: string }> = [
		{ value: CIRCLE_TYPES.HIERARCHY, label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HIERARCHY] },
		{
			value: CIRCLE_TYPES.EMPOWERED_TEAM,
			label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.EMPOWERED_TEAM]
		},
		{ value: CIRCLE_TYPES.GUILD, label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.GUILD] },
		{ value: CIRCLE_TYPES.HYBRID, label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HYBRID] }
	];

	// Decision model options (filtered based on circle type)
	const decisionModelOptions = $derived.by(() => {
		const circleType = editCircle.formValues.circleType;
		const allOptions: Array<{ value: DecisionModel; label: string }> = [
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

		switch (circleType) {
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

	// Form values - use composable as single source of truth
	// IMPORTANT: We use $derived to READ values and setField() callbacks to WRITE
	// This avoids bidirectional $effect sync which causes infinite loops (see Svelte 5 docs)
	const nameValue = $derived(editCircle.formValues.name);
	const purposeValue = $derived(editCircle.formValues.purpose);
	const circleTypeValue = $derived(editCircle.formValues.circleType);
	const decisionModelValue = $derived(editCircle.formValues.decisionModel);

	// Ensure decision model is valid for current circle type
	// Uses untrack to prevent infinite loops - only runs when circleType changes
	$effect(() => {
		const currentDecisionModel = untrack(() => editCircle.formValues.decisionModel);
		const validOptions = decisionModelOptions;
		const isValid = validOptions.some((o) => o.value === currentDecisionModel);

		if (!isValid && validOptions.length > 0) {
			editCircle.setField('decisionModel', validOptions[0].value);
		}
	});

	// Icon renderer for breadcrumbs
	// Returns IconType for rendering with Icon component (secure, no HTML injection)
	function renderBreadcrumbIcon(layerType: string): IconType | null {
		if (layerType === 'circle') {
			return 'circle';
		} else if (layerType === 'edit-circle') {
			return 'edit';
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
		{#if editCircle.isLoading}
			<!-- Loading State -->
			<div class="flex h-full items-center justify-center">
				<div class="text-center">
					<svg
						class="mx-auto size-icon-xl animate-spin text-tertiary"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
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
		{:else if editCircle.error}
			<!-- Error State -->
			<div class="flex h-full items-center justify-center">
				<div class="text-center">
					<p class="text-button font-medium text-error">Failed to load circle</p>
					<p class="text-button text-secondary mb-header">{editCircle.error}</p>
				</div>
			</div>
		{:else}
			<!-- Header -->
			<div class="border-base py-header flex items-center justify-between border-b px-page">
				<Heading level={1}>Edit Circle</Heading>
			</div>

			<!-- Form Content -->
			<div class="flex-1 overflow-y-auto px-page py-page">
				<div class="space-y-section mx-auto max-w-2xl">
					<!-- Error message -->
					{#if editCircle.error}
						<div
							class="bg-error/10 border-error/20 px-card-compact py-card-compact rounded-card border"
						>
							<Text variant="body" size="sm" color="error">{editCircle.error}</Text>
						</div>
					{/if}

					<!-- Name -->
					<FormInput
						label="Name"
						placeholder="Circle name"
						value={nameValue}
						oninput={(e) => editCircle.setField('name', e.currentTarget.value)}
						required
					/>

					<!-- Purpose -->
					<FormTextarea
						label="Purpose"
						placeholder="What's the purpose of this circle?"
						value={purposeValue}
						oninput={(e) => editCircle.setField('purpose', e.currentTarget.value)}
						rows={4}
					/>

					<!-- Circle Type -->
					<FormSelect
						label="Circle Type"
						value={circleTypeValue}
						onchange={(value) => editCircle.setField('circleType', value as CircleType)}
						options={circleTypeOptions}
					/>

					<!-- Decision Model -->
					<FormSelect
						label="Decision Model"
						value={decisionModelValue}
						onchange={(value) => editCircle.setField('decisionModel', value as DecisionModel)}
						options={decisionModelOptions}
					/>

					<!-- Domains -->
					<div>
						<h4 class="text-button font-medium tracking-wide text-tertiary uppercase mb-header">
							Domains
						</h4>
						<CategoryItemsList
							categoryName="Domains"
							items={circleItems.getItemsByCategory('Domains')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => circleItems.createItem('Domains', content)}
							onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
							onDelete={(itemId) => circleItems.deleteItem(itemId)}
							placeholder="What domains does this circle own?"
						/>
					</div>

					<!-- Accountabilities -->
					<div>
						<h4 class="text-button font-medium tracking-wide text-tertiary uppercase mb-header">
							Accountabilities
						</h4>
						<CategoryItemsList
							categoryName="Accountabilities"
							items={circleItems.getItemsByCategory('Accountabilities')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => circleItems.createItem('Accountabilities', content)}
							onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
							onDelete={(itemId) => circleItems.deleteItem(itemId)}
							placeholder="What is this circle accountable for?"
						/>
					</div>

					<!-- Policies -->
					<div>
						<h4 class="text-button font-medium tracking-wide text-tertiary uppercase mb-header">
							Policies
						</h4>
						<CategoryItemsList
							categoryName="Policies"
							items={circleItems.getItemsByCategory('Policies')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => circleItems.createItem('Policies', content)}
							onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
							onDelete={(itemId) => circleItems.deleteItem(itemId)}
							placeholder="What policies govern this circle?"
						/>
					</div>

					<!-- Decision Rights -->
					<div>
						<h4 class="text-button font-medium tracking-wide text-tertiary uppercase mb-header">
							Decision Rights
						</h4>
						<CategoryItemsList
							categoryName="Decision Rights"
							items={circleItems.getItemsByCategory('Decision Rights')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => circleItems.createItem('Decision Rights', content)}
							onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
							onDelete={(itemId) => circleItems.deleteItem(itemId)}
							placeholder="What decisions can this circle make?"
						/>
					</div>

					<!-- Notes -->
					<div>
						<h4 class="text-button font-medium tracking-wide text-tertiary uppercase mb-header">
							Notes
						</h4>
						<CategoryItemsList
							categoryName="Notes"
							items={circleItems.getItemsByCategory('Notes')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => circleItems.createItem('Notes', content)}
							onUpdate={(itemId, content) => circleItems.updateItem(itemId, content)}
							onDelete={(itemId) => circleItems.deleteItem(itemId)}
							placeholder="Additional notes about this circle"
						/>
					</div>
				</div>
			</div>

			<!-- Footer with action buttons -->
			<div class="border-base py-header flex items-center justify-end gap-button border-t px-page">
				<Button variant="outline" onclick={handleClose} disabled={editCircle.isSaving}>
					Cancel
				</Button>
				{#if canQuickEdit}
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
	</StackedPanel>

	<!-- Confirm Discard Dialog -->
	<ConfirmDiscardDialog
		open={showDiscardDialog}
		onOpenChange={(open) => {
			showDiscardDialog = open;
		}}
		onConfirm={handleConfirmDiscard}
	/>
{/if}
