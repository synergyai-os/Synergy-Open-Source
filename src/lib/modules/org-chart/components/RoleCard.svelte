<script lang="ts">
	import { Avatar, Button, Icon } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';
	import { roleCardRecipe } from '$lib/design-system/recipes';
	import RoleMemberItem from './RoleMemberItem.svelte';

	type Member = {
		userId: string;
		name?: string;
		email: string;
		avatarImage?: string;
		scope?: string;
	};

	type Props = {
		name: string;
		scope?: string;
		fillerCount?: number;
		selected?: boolean;
		expanded?: boolean;
		isCircle?: boolean;
		onClick: () => void;
		onToggleExpand?: () => void;
		onEdit?: () => void;
		menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
		members?: Member[];
		onAddMember?: () => void;
		onRemoveMember?: (userId: string) => void;
		memberMenuItems?: (
			userId: string
		) => Array<{ label: string; onclick: () => void; danger?: boolean }>;
		currentUserId?: string;
		class?: string;
	};

	let {
		name,
		scope,
		fillerCount = 0,
		selected = false,
		expanded = false,
		isCircle = false,
		onClick,
		onToggleExpand,
		onEdit,
		menuItems = [],
		members = [],
		onAddMember,
		onRemoveMember,
		memberMenuItems,
		currentUserId,
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
		onClick();
	}

	const buttonClasses = $derived(roleCardRecipe({ variant: selected ? 'selected' : 'default' }));

	// Always show members if they exist (no collapse)
	const showMembers = $derived(members.length > 0);
</script>

<div class={[className, 'overflow-hidden rounded-card border border-default']}>
	<button type="button" class={[buttonClasses, 'w-full']} onclick={handleHeaderClick}>
		{#if isCircle}
			<Icon type="circle" size="md" color="secondary" />
		{/if}
		<div class="min-w-0 flex-1 text-left">
			<p class="text-button truncate font-medium text-primary">{name}</p>
			{#if !scope && fillerCount > 0}
				<p class="text-label text-tertiary">
					{fillerCount} filler{fillerCount !== 1 ? 's' : ''}
				</p>
			{/if}
		</div>
		<div class="flex items-center gap-fieldGroup" role="group">
			{#if onAddMember}
				<Button
					variant="ghost"
					size="sm"
					iconOnly
					onclick={(e) => {
						e?.stopPropagation();
						onAddMember();
					}}
					ariaLabel="Add member to {name}"
				>
					{#snippet children()}
						<Icon type="add" size="sm" />
					{/snippet}
				</Button>
			{/if}
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
			<div onmousedown={(e) => e.stopPropagation()} role="group">
				<ActionMenu items={menuItems} class="flex-shrink-0" />
			</div>
		</div>
	</button>
	{#if showMembers}
		<div class="h-px w-full shrink-0 bg-[var(--color-border-default)]"></div>
		<div class="flex flex-col gap-fieldGroup">
			{#each members as member (member.userId)}
				<RoleMemberItem
					userId={member.userId}
					name={member.name}
					email={member.email}
					avatarImage={member.avatarImage}
					scope={member.scope}
					selected={currentUserId ? member.userId === currentUserId : false}
					menuItems={memberMenuItems ? memberMenuItems(member.userId) : []}
				/>
			{/each}
		</div>
	{/if}
</div>
