<script lang="ts">
	import { Avatar } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';
	import { roleCardRecipe } from '$lib/design-system/recipes';
	import type { Id } from '$lib/convex';

	type Props = {
		personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId)
		name?: string;
		email: string;
		avatarImage?: string;
		scope?: string; // User-level scope (displayed below user name)
		selected?: boolean;
		menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
		onClick?: () => void;
		class?: string;
	};

	let {
		personId,
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
		roleCardRecipe({ variant: selected ? 'selected' : 'default', nested: true }),
		onClick ? 'cursor-pointer' : '',
		className
	]);
</script>

{#if onClick}
	<button
		type="button"
		class={[...containerClasses, 'w-full border-0 bg-transparent p-0']}
		data-person-id={personId}
		onclick={onClick}
	>
		<Avatar {initials} size="md" image={avatarImage} />
		<div class="min-w-0 flex-1">
			<p class="text-label text-primary truncate font-medium">{displayName}</p>
			{#if scope}
				<p class="text-label text-secondary truncate">{scope}</p>
			{/if}
		</div>
		<div class="gap-fieldGroup flex items-center" role="group">
			<ActionMenu items={menuItems} class="flex-shrink-0" />
		</div>
	</button>
{:else}
	<div class={containerClasses} data-person-id={personId}>
		<Avatar {initials} size="md" image={avatarImage} />
		<div class="min-w-0 flex-1">
			<p class="text-label text-primary truncate font-medium">{displayName}</p>
			{#if scope}
				<p class="text-label text-secondary truncate">{scope}</p>
			{/if}
		</div>
		<div class="gap-fieldGroup flex items-center" role="group">
			<ActionMenu items={menuItems} class="flex-shrink-0" />
		</div>
	</div>
{/if}
