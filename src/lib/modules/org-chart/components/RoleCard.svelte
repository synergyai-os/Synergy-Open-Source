<script lang="ts">
	import { Badge, Button, Icon } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';
	import { roleCardRecipe } from '$lib/design-system/recipes';
	import RoleMemberItem from './RoleMemberItem.svelte';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';

	type Member = {
		userId: string;
		name?: string;
		email: string;
		avatarImage?: string;
		scope?: string; // User-level scope (displayed on user card)
		roleName?: string;
	};

	type Props = {
		name: string;
		purpose?: string; // Purpose of the role/circle (what is the purpose of this role)
		isCircle?: boolean;
		status?: 'draft' | 'hiring'; // Status badge displayed next to role name
		onClick: () => void;
		onEdit?: () => void;
		menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
		members?: Member[];
		onAddMember?: () => void;
		memberMenuItems?: (
			userId: string
		) => Array<{ label: string; onclick: () => void; danger?: boolean }>;
		currentUserId?: string;
		// Inline editing props (optional - only for roles, not circles)
		roleId?: Id<'circleRoles'>;
		circleId?: Id<'circles'>;
		canEdit?: boolean;
		editReason?: string;
		onNameChange?: (name: string) => Promise<void>;
		onPurposeChange?: (purpose: string) => Promise<void>;
		class?: string;
	};

	let {
		name,
		purpose,
		isCircle = false,
		status,
		onClick,
		onEdit,
		menuItems = [],
		members = [],
		onAddMember,
		memberMenuItems,
		currentUserId,
		roleId,
		circleId: _circleId,
		canEdit = false,
		editReason,
		onNameChange,
		onPurposeChange,
		class: className = ''
	}: Props = $props();

	function handleHeaderClick() {
		onClick();
	}

	const buttonClasses = $derived(roleCardRecipe({ variant: 'default' }));

	// Always show members if they exist (no collapse)
	const showMembers = $derived(members.length > 0);

	// Badge variant mapping: hiring = warning, draft = default
	const badgeVariant = $derived(status === 'hiring' ? 'warning' : 'default');
	const badgeLabel = $derived(status === 'hiring' ? 'Hiring' : 'Draft');
</script>

<div class={[className, 'overflow-hidden rounded-card border border-default']}>
	<button type="button" class={[buttonClasses, 'w-full']} onclick={handleHeaderClick}>
		{#if isCircle}
			<Icon type="circle" size="md" color="secondary" />
		{/if}
		<div class="min-w-0 flex-1 text-left">
			<div class="flex items-center gap-fieldGroup">
				{#if canEdit && onNameChange && !isCircle && roleId}
					<InlineEditText
						value={name}
						onSave={onNameChange}
						placeholder="Role name"
						size="md"
						className="truncate font-medium"
					/>
				{:else if editReason && !isCircle}
					<EditPermissionTooltip reason={editReason}>
						<p class="text-button truncate font-medium text-primary">{name}</p>
					</EditPermissionTooltip>
				{:else}
					<p class="text-button truncate font-medium text-primary">{name}</p>
				{/if}
				{#if status}
					<Badge variant={badgeVariant} size="md">
						{badgeLabel}
					</Badge>
				{/if}
			</div>
			{#if !isCircle}
				{#if canEdit && onPurposeChange && roleId}
					<InlineEditText
						value={purpose || ''}
						onSave={onPurposeChange}
						multiline={true}
						placeholder="What's the purpose of this role?"
						maxRows={2}
						size="sm"
						className="text-label"
					/>
				{:else if editReason}
					<EditPermissionTooltip reason={editReason}>
						<p class="text-label text-secondary">{purpose || 'No purpose set'}</p>
					</EditPermissionTooltip>
				{:else if purpose}
					<p class="text-label text-secondary">{purpose}</p>
				{/if}
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
					<Icon type="add" size="sm" />
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
					<Icon type="edit" size="sm" />
				</Button>
			{/if}
			{#if menuItems.length > 0}
				<div
					onmousedown={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
					role="group"
				>
					<ActionMenu items={menuItems} class="flex-shrink-0" />
				</div>
			{/if}
		</div>
	</button>
	{#if showMembers}
		<div class="w-full shrink-0 border-t border-subtle"></div>
		<div class="flex flex-col gap-fieldGroup">
			{#each members as member (member.userId)}
				<RoleMemberItem
					userId={member.userId}
					name={member.name}
					email={member.email}
					avatarImage={member.avatarImage}
					scope={isCircle ? member.roleName : member.scope}
					selected={currentUserId ? member.userId === currentUserId : false}
					menuItems={memberMenuItems ? memberMenuItems(member.userId) : []}
				/>
			{/each}
		</div>
	{/if}
</div>
