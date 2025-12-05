<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { Id } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useEditCircle } from '../composables/useEditCircle.svelte';
	import { useQuickEditPermission } from '../composables/useQuickEditPermission.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import ConfirmDiscardDialog from './ConfirmDiscardDialog.svelte';
	import FormInput from '$lib/components/atoms/FormInput.svelte';
	import FormTextarea from '$lib/components/atoms/FormTextarea.svelte';
	import FormSelect from '$lib/components/atoms/FormSelect.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import {
		CIRCLE_TYPES,
		DECISION_MODELS,
		DEFAULT_CIRCLE_TYPE_LABELS,
		DEFAULT_DECISION_MODEL_LABELS
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

	// Edit circle composable
	const editCircle = useEditCircle({
		circleId: () => circleId,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId,
		canQuickEdit: () => canQuickEdit
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
		} catch (error) {
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
		} catch (error) {
			// Error already handled in composable
		}
	}

	// Circle type options
	const circleTypeOptions = [
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
		const allOptions = [
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

	// Local form state for two-way binding
	let nameValue = $state('');
	let purposeValue = $state('');
	let circleTypeValue = $state(CIRCLE_TYPES.HIERARCHY);
	let decisionModelValue = $state(DECISION_MODELS.MANAGER_DECIDES);

	// Sync local state with composable form values
	$effect(() => {
		const formValues = editCircle.formValues;
		nameValue = formValues.name;
		purposeValue = formValues.purpose;
		circleTypeValue = formValues.circleType;
		decisionModelValue = formValues.decisionModel;
	});

	// Sync local state changes back to composable
	$effect(() => {
		editCircle.setField('name', nameValue);
	});
	$effect(() => {
		editCircle.setField('purpose', purposeValue);
	});
	$effect(() => {
		editCircle.setField('circleType', circleTypeValue);
	});
	$effect(() => {
		editCircle.setField('decisionModel', decisionModelValue);
	});

	// Ensure decision model is valid for current circle type
	$effect(() => {
		const validOptions = decisionModelOptions;
		const isValid = validOptions.some((o) => o.value === decisionModelValue);

		if (!isValid && validOptions.length > 0) {
			decisionModelValue = validOptions[0].value as any;
		}
	});

	// Icon renderer for breadcrumbs
	function renderBreadcrumbIcon(layerType: string): string | null {
		if (layerType === 'circle') {
			return `<svg class="size-icon-sm inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"></circle></svg>`;
		} else if (layerType === 'edit-circle') {
			return `<svg class="size-icon-sm inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`;
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
			{#if editCircle.isLoading}
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
						<FormInput label="Name" placeholder="Circle name" bind:value={nameValue} required />

						<!-- Purpose -->
						<FormTextarea
							label="Purpose"
							placeholder="What's the purpose of this circle?"
							bind:value={purposeValue}
							rows={4}
						/>

						<!-- Circle Type -->
						<FormSelect
							label="Circle Type"
							bind:value={circleTypeValue}
							options={circleTypeOptions}
						/>

						<!-- Decision Model -->
						<FormSelect
							label="Decision Model"
							bind:value={decisionModelValue}
							options={decisionModelOptions}
						/>
					</div>
				</div>

				<!-- Footer with action buttons -->
				<div
					class="border-base py-header flex items-center justify-end gap-button border-t px-page"
				>
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
{/if}
