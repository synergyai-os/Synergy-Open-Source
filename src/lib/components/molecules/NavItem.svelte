<script lang="ts">
	import { Icon, Text, Badge, type IconType } from '$lib/components/atoms';
	import { navItemRecipe, type NavItemVariantProps } from '$lib/design-system/recipes';

	type Props = NavItemVariantProps & {
		href: string;
		iconType: IconType;
		label: string;
		badge?: number | string;
		title?: string;
		class?: string;
		target?: string;
		rel?: string;
		onclick?: (e: MouseEvent) => void;
	};

	let {
		href,
		iconType,
		label,
		badge,
		title,
		state = 'default',
		collapsed = false,
		class: className = '',
		target,
		rel,
		onclick
	}: Props = $props();

	const classes = $derived([
		navItemRecipe({ state, collapsed }),
		className
	]);

	// WORKAROUND: Sidebar badge colors missing - see missing-styles.md
	// Using custom classes to match sidebar badge styling from Sidebar.svelte
	const badgeClasses = $derived(
		collapsed
			? 'text-label absolute top-0 right-0 rounded bg-sidebar-badge px-badge py-badge leading-none font-medium text-sidebar-badge text-center'
			: 'text-label min-w-[18px] flex-shrink-0 rounded bg-sidebar-badge px-badge py-badge text-center font-medium text-sidebar-badge'
	);
</script>

<a
	{href}
	{title}
	class={classes}
	{target}
	{rel}
	{onclick}
>
	<Icon type={iconType} size="sm" class="flex-shrink-0" />
	{#if !collapsed}
		<Text variant="body" size="sm" as="span" class="min-w-0 flex-1 font-normal">
			{label}
		</Text>
		{#if badge !== undefined && badge !== null && badge !== ''}
			<span class={badgeClasses}>
				{badge}
			</span>
		{/if}
	{:else if collapsed && badge !== undefined && badge !== null && badge !== ''}
		<span class={badgeClasses}>
			{badge}
		</span>
	{/if}
</a>

