<script lang="ts">
	import { Avatar } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';
	import { roleCardRecipe } from '$lib/design-system/recipes';

	type Props = {
		userId: string;
		name?: string;
		email: string;
		avatarImage?: string;
		scope?: string;
		selected?: boolean;
		menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
		onClick?: () => void;
		class?: string;
	};

	let {
		userId,
		name,
		email,
		avatarImage,
		scope,
		selected = false,
		menuItems = [],
		onClick,
		class: className = ''
	}: Props = $props();

	function getInitials(text: string): string {
		return text
			.split(' ')
			.map((word) => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	const displayName = $derived(name || email.split('@')[0]);
	const initials = $derived(getInitials(displayName));

	const containerClasses = $derived([
		roleCardRecipe({ variant: selected ? 'selected' : 'default' }),
		onClick ? 'cursor-pointer' : '',
		className
	]);
</script>

<div class={containerClasses} onclick={onClick} role={onClick ? 'button' : undefined} tabindex={onClick ? 0 : undefined}>
	<Avatar initials={initials} size="md" />
	<div class="min-w-0 flex-1">
		<p class="text-button truncate font-medium text-primary">{displayName}</p>
		{#if name}
			<p class="truncate text-label text-secondary">{email}</p>
		{/if}
		{#if scope}
			<p class="truncate text-label text-secondary">{scope}</p>
		{/if}
	</div>
	{#if menuItems.length > 0}
		<div class="flex items-center gap-fieldGroup" role="group">
			<ActionMenu items={menuItems} />
		</div>
	{/if}
</div>

