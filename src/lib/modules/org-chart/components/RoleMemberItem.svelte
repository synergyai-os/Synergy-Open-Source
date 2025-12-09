<script lang="ts">
	import { Avatar } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';
	import { roleCardRecipe } from '$lib/design-system/recipes';

	type Props = {
		userId: string;
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
		roleCardRecipe({ variant: selected ? 'selected' : 'default', nested: true }),
		onClick ? 'cursor-pointer' : '',
		className
	]);
</script>

{#if onClick}
	<button
		type="button"
		class={[...containerClasses, 'w-full border-0 bg-transparent p-0']}
		data-user-id={userId}
		onclick={onClick}
	>
		<Avatar {initials} size="md" image={avatarImage} />
		<div class="min-w-0 flex-1">
			<p class="truncate text-label font-medium text-primary">{displayName}</p>
			{#if scope}
				<p class="truncate text-label text-secondary">{scope}</p>
			{/if}
		</div>
		<div
			class="flex items-center gap-fieldGroup"
			role="group"
			onmousedown={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<ActionMenu items={menuItems} class="flex-shrink-0" />
		</div>
	</button>
{:else}
	<div class={containerClasses} data-user-id={userId}>
		<Avatar {initials} size="md" image={avatarImage} />
		<div class="min-w-0 flex-1">
			<p class="truncate text-label font-medium text-primary">{displayName}</p>
			{#if scope}
				<p class="truncate text-label text-secondary">{scope}</p>
			{/if}
		</div>
		<div
			class="flex items-center gap-fieldGroup"
			role="group"
			onmousedown={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<ActionMenu items={menuItems} class="flex-shrink-0" />
		</div>
	</div>
{/if}
