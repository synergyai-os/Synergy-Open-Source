<script lang="ts">
	import { Avatar, Button, Icon } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';
	import { roleCardRecipe } from '$lib/design-system/recipes';

	type Props = {
		name: string;
		scope?: string;
		fillerCount?: number;
		selected?: boolean;
		expanded?: boolean;
		onClick: () => void;
		onToggleExpand?: () => void;
		onEdit?: () => void;
		menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
		class?: string;
	};

	let {
		name,
		scope,
		fillerCount = 0,
		selected = false,
		expanded = false,
		onClick,
		onToggleExpand,
		onEdit,
		menuItems = [],
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

	function handleHeaderClick() {
		if (onToggleExpand) {
			onToggleExpand();
		} else {
			onClick();
		}
	}

	const buttonClasses = $derived(roleCardRecipe({ variant: selected ? 'selected' : 'default' }));

	const chevronClasses = $derived(
		expanded ? 'transition-transform rotate-90' : 'transition-transform'
	);
</script>

<div class={className}>
	<button type="button" class={buttonClasses} onclick={handleHeaderClick}>
		{#if onToggleExpand}
			<Icon type="chevron-right" size="sm" color="secondary" class={chevronClasses} />
		{/if}
		<Avatar initials={getInitials(name)} size="md" />
		<div class="min-w-0 flex-1">
			<p class="text-button truncate font-medium text-primary">{name}</p>
			{#if scope}
				<p class="truncate text-label text-secondary">{scope}</p>
			{:else}
				<p class="text-label text-tertiary">
					{fillerCount} filler{fillerCount !== 1 ? 's' : ''}
				</p>
			{/if}
		</div>
		{#if onEdit || menuItems.length > 0}
			<div class="flex items-center gap-fieldGroup" role="group">
				{#if onEdit}
					<Button
						variant="ghost"
						size="sm"
						iconOnly
						onclick={(e) => {
							e?.stopPropagation();
							onEdit();
						}}
						ariaLabel="Edit {name}"
					>
						{#snippet children()}
							<Icon type="edit" size="sm" />
						{/snippet}
					</Button>
				{/if}
				{#if menuItems.length > 0}
					<ActionMenu items={menuItems} />
				{/if}
			</div>
		{/if}
	</button>
	{#if expanded && onToggleExpand}
		<div class="h-px w-full shrink-0 bg-[var(--color-border-default)]"></div>
		<!-- Expanded content will go here in later phases -->
	{/if}
</div>
