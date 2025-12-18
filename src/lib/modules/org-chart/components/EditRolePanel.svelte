<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { Id } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useEditRole } from '../composables/useEditRole.svelte';
	import { useQuickEditPermission } from '../composables/useQuickEditPermission.svelte';
	import { useCustomFields } from '../composables/useCustomFields.svelte';
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

	// Custom fields composable for category items
	const customFields = useCustomFields({
		sessionId: () => sessionId,
		workspaceId: () => workspaceId,
		entityType: () => 'role',
		entityId: () => (roleId ? String(roleId) : null)
	});

	// Map category names to system keys
	function getSystemKeyForCategory(categoryName: string): string | null {
		const mapping: Record<string, string> = {
			Domains: 'domains',
			Accountabilities: 'accountabilities',
			Policies: 'policies',
			'Decision Rights': 'decision_rights',
			Notes: 'notes'
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
						class="size-icon-xl text-tertiary mx-auto animate-spin"
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
					<p class="text-button text-error font-medium">Failed to load role</p>
					<p class="text-button text-secondary mb-header">{editRole.error}</p>
				</div>
			</div>
		{:else}
			<!-- Header -->
			<div class="border-base py-header px-page flex items-center justify-between border-b">
				<Heading level={1}>Edit Role</Heading>
			</div>

			<!-- Form Content -->
			<div class="px-page py-page flex-1 overflow-y-auto">
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
					<div class="gap-fieldGroup flex flex-col">
						<Label.Root for="represents-to-parent" class={labelRootRecipe()}>
							Represents to Parent Circle
						</Label.Root>
						<div class="gap-button flex items-center">
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
						<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
							Domains
						</h4>
						<CategoryItemsList
							categoryName="Domains"
							items={getItemsForCategory('Domains')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => handleAddMultiItemField('Domains', content)}
							onUpdate={(itemId, content) => handleUpdateMultiItemField('Domains', itemId, content)}
							onDelete={(itemId) => handleDeleteMultiItemField('Domains', itemId)}
							placeholder="What domains does this role own?"
						/>
					</div>

					<!-- Accountabilities -->
					<div>
						<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
							Accountabilities
						</h4>
						<CategoryItemsList
							categoryName="Accountabilities"
							items={getItemsForCategory('Accountabilities')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => handleAddMultiItemField('Accountabilities', content)}
							onUpdate={(itemId, content) =>
								handleUpdateMultiItemField('Accountabilities', itemId, content)}
							onDelete={(itemId) => handleDeleteMultiItemField('Accountabilities', itemId)}
							placeholder="What is this role accountable for?"
						/>
					</div>

					<!-- Policies -->
					<div>
						<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
							Policies
						</h4>
						<CategoryItemsList
							categoryName="Policies"
							items={getItemsForCategory('Policies')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => handleAddMultiItemField('Policies', content)}
							onUpdate={(itemId, content) =>
								handleUpdateMultiItemField('Policies', itemId, content)}
							onDelete={(itemId) => handleDeleteMultiItemField('Policies', itemId)}
							placeholder="What policies govern this role?"
						/>
					</div>

					<!-- Decision Rights -->
					<div>
						<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
							Decision Rights
						</h4>
						<CategoryItemsList
							categoryName="Decision Rights"
							items={getItemsForCategory('Decision Rights')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => handleAddMultiItemField('Decision Rights', content)}
							onUpdate={(itemId, content) =>
								handleUpdateMultiItemField('Decision Rights', itemId, content)}
							onDelete={(itemId) => handleDeleteMultiItemField('Decision Rights', itemId)}
							placeholder="What decisions can this role make?"
						/>
					</div>

					<!-- Notes -->
					<div>
						<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
							Notes
						</h4>
						<CategoryItemsList
							categoryName="Notes"
							items={getItemsForCategory('Notes')}
							canEdit={canQuickEdit}
							{editReason}
							onCreate={(content) => handleUpdateSingleField('Notes', content)}
							onUpdate={(itemId, content) => handleUpdateSingleField('Notes', content)}
							onDelete={(itemId) => handleUpdateSingleField('Notes', '')}
							placeholder="Additional notes about this role"
						/>
					</div>
				</div>
			</div>

			<!-- Footer with action buttons -->
			<div class="border-base py-header gap-button px-page flex items-center justify-end border-t">
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
