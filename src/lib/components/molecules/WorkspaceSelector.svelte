<script lang="ts">
	import { Avatar, Icon, Text } from '$lib/components/atoms';
	import { workspaceSelectorRecipe } from '$lib/design-system/recipes';

	type Props = {
		avatarImage?: string;
		initials: string;
		username: string;
		orgName: string;
		showLabels?: boolean;
		isLoading?: boolean;
		variant?: 'sidebar' | 'topbar';
		class?: string;
	};

	let {
		avatarImage,
		initials,
		username,
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

	// Icon styling: context-specific to WorkspaceSelector
	const iconClasses = $derived([
		'ml-auto flex-shrink-0', // Layout
		'transition-transform duration-200', // Styling
		'text-secondary', // Color
		showLabels ? 'group-hover:text-primary' : '' // Conditional hover
	]);
</script>

<div
	class={containerClasses}
	style="opacity: {isLoading ? 'var(--opacity-60)' : 'var(--opacity-100)'}"
>
	{#if avatarImage}
		<img src={avatarImage} alt={username} class="size-avatar-sm flex-shrink-0 rounded-avatar" />
	{:else}
		<Avatar {initials} size="sm" variant="brand" />
	{/if}

	{#if showLabels}
		<!-- Text group wrapper: flex-1 to take available space, left-aligned -->
		<!-- Tight spacing (2px) between username and orgName for compact display -->
		<div class="flex min-w-0 flex-1 flex-col text-left" style="gap: var(--spacing-0-5);">
			{#if isLoading}
				<!-- Skeleton loading state - exact match to text sizes including line-height -->
				<!-- Username: text-sm (14px) with line-height 1.5 = 21px (1.3125rem) -->
				<div
					class="animate-pulse rounded"
					style="height: 1.3125rem; width: 7rem; background-color: var(--color-component-sidebar-itemHover);"
				></div>
				<!-- OrgName: text-[0.625rem] (10px) with line-height 1.5 = 15px (0.9375rem) -->
				<div
					class="animate-pulse rounded"
					style="height: 0.9375rem; width: 4rem; background-color: var(--color-component-sidebar-itemHover);"
				></div>
			{:else}
				<Text variant="body" size="sm" color="default" as="span" class="truncate font-medium">
					{username}
				</Text>
				<Text variant="label" size="sm" color="tertiary" as="span" class="truncate">
					{orgName}
				</Text>
			{/if}
		</div>
	{/if}

	<Icon type="chevron-down" size="sm" class={iconClasses} />
</div>
