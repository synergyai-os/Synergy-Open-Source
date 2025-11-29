<script lang="ts">
	import { Avatar, Icon, Text } from '$lib/components/atoms';
	import { workspaceSelectorRecipe } from '$lib/design-system/recipes';

	type Props = {
		avatarImage?: string;
		initials: string;
		orgName: string;
		showLabels?: boolean;
		isLoading?: boolean;
		variant?: 'sidebar' | 'topbar';
		class?: string;
	};

	let {
		avatarImage,
		initials,
		orgName,
		showLabels = true,
		isLoading = false,
		variant = 'sidebar',
		class: className = ''
	}: Props = $props();

	const containerStylingClasses = $derived(workspaceSelectorRecipe());
	const containerLayoutClasses = $derived(
		showLabels ? 'flex items-center min-w-0 flex-1 gap-header' : 'flex items-center'
	);
	const containerClasses = $derived([containerLayoutClasses, containerStylingClasses, className]);

	// Icon layout: context-specific to WorkspaceSelector
	// Note: flex-shrink-0 is now in icon recipe base classes
	const iconWrapperClasses = $derived([
		'ml-auto', // Layout
		'transition-transform duration-200' // Styling
	]);
</script>

<div
	class={containerClasses}
	style="opacity: {isLoading ? 'var(--opacity-60)' : 'var(--opacity-100)'}"
>
	{#if avatarImage}
		<!-- Tiny avatar image for sidebar header (20px) -->
		<img
			src={avatarImage}
			alt={orgName}
			class="flex-shrink-0 rounded-full"
			style="width: 1.25rem; height: 1.25rem;"
		/>
	{:else}
		<!-- Workspace avatars use neutral gray (default) for professional appearance - xxs (20px) for compact sidebar -->
		<Avatar {initials} size="xxs" variant="default" />
	{/if}

	{#if showLabels}
		<!-- Org name display - single line, takes available space -->
		<div class="flex min-w-0 flex-1 items-center text-left">
			{#if isLoading}
				<!-- Skeleton loading state - matches text-xs (12px) with line-height 1.5 = 18px -->
				<div
					class="animate-pulse rounded"
					style="height: 1.125rem; width: 5rem; background-color: var(--color-component-sidebar-itemHover);"
				></div>
			{:else}
				<Text variant="body" size="sm" color="default" as="span" class="truncate font-semibold">
					{orgName}
				</Text>
			{/if}
		</div>
	{/if}

	<div class={iconWrapperClasses}>
		<Icon type="chevron-down" size="sm" color="secondary" />
	</div>
</div>
