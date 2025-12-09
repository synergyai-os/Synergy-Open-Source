<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { Id } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useEditRole } from '../composables/useEditRole.svelte';
	import { useQuickEditPermission } from '../composables/useQuickEditPermission.svelte';
	import { useCircleItems } from '../composables/useCircleItems.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import ConfirmDiscardDialog from './ConfirmDiscardDialog.svelte';
	import FormInput from '$lib/components/atoms/FormInput.svelte';
	import FormTextarea from '$lib/components/atoms/FormTextarea.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import * as Checkbox from '$lib/components/atoms/Checkbox.svelte';
	import { checkboxBoxRecipe, checkboxIconRecipe } from '$lib/design-system/recipes';
	import * as Label from '$lib/components/atoms/Label.svelte';
	import { labelRootRecipe } from '$lib/design-system/recipes';
	import CategoryItemsList from './CategoryItemsList.svelte';

	let { orgChart, roleId }: { orgChart: UseOrgChart | null; roleId: Id<'circleRoles'> } = $props();

	// Guard: Don't access orgChart properties if it's null
	if (!browser || !orgChart) {
		// Return early during SSR
	}

	const isOpen = $derived(roleId !== null);
	const sessionId = $derived($page.data.sessionId);
	const workspaceId = $derived($page.data.workspaceId as Id<'workspaces'> | undefined);

	// Check quick edit permission (needs circle context)
	const quickEditPermission = useQuickEditPermission({
		circle: () => orgChart?.selectedCircle ?? null,
		sessionId: () => sessionId,
		allowQuickChanges: () => orgChart?.allowQuickChanges ?? false
	});

	const canQuickEdit = $derived(quickEditPermission.canEdit);
	const editReason = $derived(quickEditPermission.editReason);

	// Edit role composable
	const editRole = useEditRole({
		roleId: () => roleId,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId,
		canQuickEdit: () => canQuickEdit
	});

	// Circle items composable for category items
	const circleItems = useCircleItems({
		sessionId: () => sessionId,
		entityType: () => 'role',
		entityId: () => (roleId ? String(roleId) : null)
	});

	// Load role data when panel opens
	$effect(() => {
		if (roleId && sessionId) {
			editRole.loadRole();
		}
	});

	// Confirm discard dialog state
	let showDiscardDialog = $state(false);

	// Check if this panel is the topmost layer
	const isTopmost = () => {
		if (!orgChart) return false;
		const currentLayer = orgChart.navigationStack.currentLayer;
		return currentLayer?.type === 'edit-role' && currentLayer?.id === roleId;
	};

	function handleClose() {
		if (editRole.isDirty) {
			showDiscardDialog = true;
		} else {
			closePanel();
		}
	}

	function closePanel() {
		if (!orgChart) return;
		orgChart.navigationStack.pop();
		// Return to role detail panel
		orgChart.selectRole(roleId, 'circle-panel', { skipStackPush: true });
	}

	function handleConfirmDiscard() {
		editRole.reset();
		closePanel();
	}

	function handleBreadcrumbClick(index: number) {
		if (!orgChart) return;
		const targetLayer = orgChart.navigationStack.getLayer(index);
		if (!targetLayer) return;

		if (editRole.isDirty) {
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
			await editRole.saveDirectly();
			closePanel();
		} catch (_error) {
			// Error already handled in composable
		}
	}

	async function handleSaveAsProposal() {
		// For MVP, use simple title/description
		// TODO: In future, could show a dialog to enter title/description
		const title = `Update ${editRole.formValues.name}`;
		const description = `Proposed changes to role "${editRole.formValues.name}"`;

		try {
			await editRole.saveAsProposal(title, description);
			closePanel();
		} catch (_error) {
			// Error already handled in composable
		}
	}

	// Local form state for two-way binding
	let nameValue = $state('');
	let purposeValue = $state('');
	let representsToParentValue = $state(false);

	// Sync local state with composable form values
	$effect(() => {
		const formValues = editRole.formValues;
		nameValue = formValues.name;
		purposeValue = formValues.purpose;
		representsToParentValue = formValues.representsToParent;
	});

	// Sync local state changes back to composable
	$effect(() => {
		editRole.setField('name', nameValue);
	});
	$effect(() => {
		editRole.setField('purpose', purposeValue);
	});
	$effect(() => {
		editRole.setField('representsToParent', representsToParentValue);
	});

	// Icon renderer for breadcrumbs
	// Returns IconType for rendering with Icon component (secure, no HTML injection)
	function renderBreadcrumbIcon(layerType: string): IconType | null {
		if (layerType === 'role') {
			return 'user';
		} else if (layerType === 'edit-role') {
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
		{#if editRole.isLoading}
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
					<p class="text-button text-secondary mb-header">Loading role details...</p>
				</div>
			</div>
		{:else if editRole.error}
			<!-- Error State -->
			<div class="flex h-full items-center justify-center">
				<div class="text-center">
					<p class="text-button font-medium text-error">Failed to load role</p>
					<p class="text-button text-secondary mb-header">{editRole.error}</p>
				</div>
			</div>
		{:else}
			<!-- Header -->
			<div class="border-base py-header flex items-center justify-between border-b px-page">
				<Heading level={1}>Edit Role</Heading>
			</div>

			<!-- Form Content -->
			<div class="flex-1 overflow-y-auto px-page py-page">
				<div class="space-y-section mx-auto max-w-2xl">
					<!-- Error message -->
					{#if editRole.error}
						<div
							class="bg-error/10 border-error/20 px-card-compact py-card-compact rounded-card border"
						>
							<Text variant="body" size="sm" color="error">{editRole.error}</Text>
						</div>
					{/if}

					<!-- Name -->
					<FormInput label="Name" placeholder="Role name" bind:value={nameValue} required />

					<!-- Purpose -->
					<FormTextarea
						label="Purpose"
						placeholder="What's the purpose of this role?"
						bind:value={purposeValue}
						rows={4}
					/>

					<!-- Represents to Parent -->
					<div class="flex flex-col gap-fieldGroup">
						<Label.Root for="represents-to-parent" class={labelRootRecipe()}>
							Represents to Parent Circle
						</Label.Root>
						<div class="flex items-center gap-button">
							<Checkbox.Root bind:checked={representsToParentValue}>
								{#snippet children({ checked })}
									<div class={checkboxBoxRecipe({ checked })}>
										{#if checked}
											<svg
												class={checkboxIconRecipe()}
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="3"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<polyline points="20 6 9 17 4 12"></polyline>
											</svg>
										{/if}
									</div>
								{/snippet}
							</Checkbox.Root>
							<Text variant="body" size="sm" color="secondary">
								This role represents the circle to its parent circle in meetings and governance
							</Text>
						</div>
					</div>

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
							placeholder="What domains does this role own?"
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
							placeholder="What is this role accountable for?"
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
							placeholder="What policies govern this role?"
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
							placeholder="What decisions can this role make?"
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
							placeholder="Additional notes about this role"
						/>
					</div>
				</div>
			</div>

			<!-- Footer with action buttons -->
			<div class="border-base py-header flex items-center justify-end gap-button border-t px-page">
				<Button variant="outline" onclick={handleClose} disabled={editRole.isSaving}>Cancel</Button>
				{#if canQuickEdit}
					<Button
						variant="primary"
						onclick={handleSaveDirectly}
						disabled={editRole.isSaving || !editRole.isDirty}
					>
						{editRole.isSaving ? 'Saving...' : 'Save'}
					</Button>
				{/if}
				<Button
					variant="primary"
					onclick={handleSaveAsProposal}
					disabled={editRole.isSaving || !editRole.isDirty}
				>
					{editRole.isSaving ? 'Creating...' : 'Save as Proposal'}
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
