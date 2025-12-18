<script lang="ts">
	import { browser } from '$app/environment';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import { formInputRecipe } from '$lib/design-system/recipes';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { isSingleFieldCategory } from '$lib/infrastructure/organizational-model/constants';

	export interface CircleItem {
		itemId: Id<'circleItems'>;
		content: string;
		order: number;
		createdAt: number;
		updatedAt: number;
	}

	type Props = {
		categoryName: string;
		items: CircleItem[];
		canEdit: boolean;
		editReason?: string;
		onCreate: (content: string) => Promise<void>;
		onUpdate: (itemId: Id<'circleItems'>, content: string) => Promise<void>;
		onDelete: (itemId: Id<'circleItems'>) => Promise<void>;
		placeholder?: string;
	};

	let {
		categoryName,
		items,
		canEdit,
		editReason,
		onCreate,
		onUpdate,
		onDelete,
		placeholder = 'Click to add'
	}: Props = $props();

	const isSingleField = $derived(isSingleFieldCategory(categoryName));
	const isEmpty = $derived(items.length === 0);

	// For single-field categories (Notes), get first item or empty string
	const singleFieldContent = $derived(isSingleField ? (items[0]?.content ?? '') : '');
	const singleFieldItemId = $derived(isSingleField ? items[0]?.itemId : null);

	// Add mode state - tracks when user clicked "Add" but hasn't created item yet
	let isAdding = $state(false);
	let addingValue = $state('');
	let addingInputRef: HTMLInputElement | null = $state(null);

	// Focus input when entering add mode
	$effect(() => {
		if (isAdding && browser && addingInputRef) {
			addingInputRef.focus();
		}
	});

	async function handleSingleFieldSave(content: string) {
		if (!content.trim()) {
			// Delete if empty
			if (singleFieldItemId) {
				await onDelete(singleFieldItemId);
			}
			return;
		}

		if (singleFieldItemId) {
			// Update existing
			await onUpdate(singleFieldItemId, content);
		} else {
			// Create new
			await onCreate(content);
		}
	}

	function handleStartAdding() {
		isAdding = true;
		addingValue = '';
	}

	async function handleAddingBlur() {
		// Small delay to allow click events to fire first
		setTimeout(async () => {
			if (addingValue.trim()) {
				// Has content → create item
				try {
					await onCreate(addingValue.trim());
					isAdding = false;
					addingValue = '';
				} catch (_error) {
					// Error handling is done in onCreate
					// Keep input open so user can retry
				}
			} else {
				// Empty → cancel (no create)
				isAdding = false;
				addingValue = '';
			}
		}, 200);
	}

	function handleAddingKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddingBlur();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			isAdding = false;
			addingValue = '';
		}
	}

	// Get singular form of category name for "Add X" button
	const singularName = $derived(
		categoryName === 'Accountabilities'
			? 'Accountability'
			: categoryName === 'Decision Rights'
				? 'Decision Right'
				: categoryName.endsWith('s')
					? categoryName.slice(0, -1)
					: categoryName
	);

	const inputClasses = $derived(formInputRecipe({ size: 'md' }));
</script>

{#if isSingleField}
	<!-- Single Field Category (Notes) -->
	{#if canEdit}
		<InlineEditText
			value={singleFieldContent}
			onSave={handleSingleFieldSave}
			multiline={true}
			{placeholder}
			maxRows={4}
			size="md"
		/>
	{:else if editReason}
		<EditPermissionTooltip reason={editReason}>
			<div class="text-button text-secondary leading-relaxed break-words">
				{#if singleFieldContent}
					{singleFieldContent}
				{:else}
					<Text variant="body" size="md" color="tertiary">
						No {categoryName.toLowerCase()} set
					</Text>
				{/if}
			</div>
		</EditPermissionTooltip>
	{:else}
		<p class="text-button text-secondary leading-relaxed break-words">
			{singleFieldContent || `No ${categoryName.toLowerCase()} set`}
		</p>
	{/if}
{:else}
	<!-- Multiple Items Category (Domains, Accountabilities, etc.) -->
	<div class="space-y-2">
		{#if isEmpty}
			{#if canEdit}
				{#if isAdding}
					<!-- Inline input for adding new item -->
					<input
						bind:this={addingInputRef}
						bind:value={addingValue}
						{placeholder}
						onkeydown={handleAddingKeydown}
						onblur={handleAddingBlur}
						class={inputClasses}
					/>
				{:else}
					<Button variant="ghost" size="sm" onclick={handleStartAdding}>
						<span class="gap-button flex items-center">
							<Icon type="plus" size="sm" />
							<span>Add {singularName}</span>
						</span>
					</Button>
				{/if}
			{:else if editReason}
				<EditPermissionTooltip reason={editReason}>
					<Text variant="body" size="md" color="tertiary">
						No {categoryName.toLowerCase()} set
					</Text>
				</EditPermissionTooltip>
			{:else}
				<Text variant="body" size="md" color="tertiary">
					No {categoryName.toLowerCase()} set
				</Text>
			{/if}
		{:else}
			{#each items as item (item.itemId)}
				<div class="gap-button flex items-start">
					<div class="flex-1">
						{#if canEdit}
							<InlineEditText
								value={item.content}
								onSave={(content) => onUpdate(item.itemId, content)}
								multiline={false}
								{placeholder}
								size="md"
							/>
						{:else if editReason}
							<EditPermissionTooltip reason={editReason}>
								<Text variant="body" size="md" color="default">
									{item.content}
								</Text>
							</EditPermissionTooltip>
						{:else}
							<Text variant="body" size="md" color="default">
								{item.content}
							</Text>
						{/if}
					</div>
					{#if canEdit}
						<Button
							variant="ghost"
							size="sm"
							iconOnly
							onclick={() => onDelete(item.itemId)}
							ariaLabel="Delete {singularName}"
							class="hover:bg-error-hover text-error"
						>
							<Icon type="trash" size="sm" />
						</Button>
					{/if}
				</div>
			{/each}
			{#if canEdit}
				{#if isAdding}
					<!-- Inline input for adding new item -->
					<input
						bind:this={addingInputRef}
						bind:value={addingValue}
						{placeholder}
						onkeydown={handleAddingKeydown}
						onblur={handleAddingBlur}
						class={inputClasses}
					/>
				{:else}
					<Button variant="ghost" size="sm" onclick={handleStartAdding}>
						<span class="gap-button flex items-center">
							<Icon type="plus" size="sm" />
							<span>Add {singularName}</span>
						</span>
					</Button>
				{/if}
			{/if}
		{/if}
	</div>
{/if}
