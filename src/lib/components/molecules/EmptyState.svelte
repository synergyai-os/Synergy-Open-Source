<script lang="ts">
	/**
	 * EmptyState Component
	 *
	 * Molecule component that composes Icon + Text atoms to display empty states.
	 * Used when there's no content to display (e.g., "No members yet", "No documents yet").
	 *
	 * Usage:
	 * <EmptyState icon="members" title="No members yet" description="Members will appear here..." />
	 *
	 * With action button:
	 * <EmptyState icon="add" title="No items yet">
	 *   <Button>Add Item</Button>
	 * </EmptyState>
	 */

	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';

	interface Props {
		icon: IconType;
		title: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		children?: Snippet; // Optional action slot
	}

	let { icon, title, description, size = 'md', children }: Props = $props();

	// Map size prop to icon size
	// EmptyState 'md' = Icon 'xl' (matches existing pattern: size-icon-xl)
	// EmptyState 'sm' = Icon 'lg', EmptyState 'lg' = Icon 'xxl'
	const iconSize = $derived(
		size === 'sm' ? 'lg' : size === 'md' ? 'xl' : 'xxl'
	);
</script>

<div class="py-page text-center">
	<Icon type={icon} size={iconSize} color="tertiary" class="mx-auto" />
	<Text variant="body" size="sm" color="default" weight="medium" as="p" class="mb-header">
		{title}
	</Text>
	{#if description}
		<Text variant="body" size="sm" color="secondary" as="p" class="mb-header">
			{description}
		</Text>
	{/if}
	{#if children}
		<div class="mt-form-section">
			{@render children()}
		</div>
	{/if}
</div>

