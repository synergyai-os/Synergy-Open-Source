<script lang="ts">
	import { Badge, Button, Icon } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';
	import { PersonSelector } from '$lib/components/organisms';
	import { roleCardRecipe } from '$lib/design-system/recipes';
	import RoleMemberItem from './RoleMemberItem.svelte';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { SvelteSet } from 'svelte/reactivity';

	type Member = {
		personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId)
		name?: string;
		email: string;
		avatarImage?: string;
		scope?: string; // Person-level scope (displayed on person card)
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
		onMemberSelect?: (personIds: Id<'people'>[]) => void;
		onMemberRemove?: (personId: Id<'people'>) => void;
		memberMenuItems?: (
			personId: Id<'people'>
		) => Array<{ label: string; onclick: () => void; danger?: boolean }>;
		currentPersonId?: Id<'people'>;
		// Inline editing props (optional - only for roles, not circles)
		roleId?: Id<'circleRoles'>;
		circleId?: Id<'circles'>;
		canEdit?: boolean;
		editReason?: string;
		onNameChange?: (name: string) => Promise<void>;
		onPurposeChange?: (purpose: string) => Promise<void>;
		// Required for PersonSelector
		workspaceId?: Id<'workspaces'>;
		sessionId?: string;
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
		onMemberSelect,
		onMemberRemove,
		memberMenuItems,
		currentPersonId,
		roleId,
		circleId,
		canEdit = false,
		editReason,
		onNameChange,
		onPurposeChange,
		workspaceId,
		sessionId,
		class: className = ''
	}: Props = $props();

	function handleHeaderClick() {
		onClick();
	}

	const buttonClasses = $derived(roleCardRecipe({ variant: 'default' }));

	// Optimistic removal handling:
	// When removing a person from THIS role, we want them to immediately become selectable again
	// even if the role fillers query (driving `members`) hasn't propagated yet.
	const optimisticallyRemovedPersonIds = new SvelteSet<Id<'people'>>();

	const visibleMembers = $derived.by(() => {
		if (isCircle) return members;
		return members.filter((m) => !optimisticallyRemovedPersonIds.has(m.personId));
	});

	// Once the backend-driven `members` prop no longer contains an optimistically removed person,
	// drop the suppression so we don't accidentally hide them if they're later re-assigned elsewhere.
	$effect(() => {
		if (isCircle) return;
		const memberIds = new SvelteSet(members.map((m) => m.personId));
		for (const personId of optimisticallyRemovedPersonIds) {
			if (!memberIds.has(personId)) {
				optimisticallyRemovedPersonIds.delete(personId);
			}
		}
	});

	// Always show members if they exist (no collapse)
	const showMembers = $derived(visibleMembers.length > 0);

	// Badge variant mapping: hiring = warning, draft = default
	const badgeVariant = $derived(status === 'hiring' ? 'warning' : 'default');
	const badgeLabel = $derived(status === 'hiring' ? 'Hiring' : 'Draft');

	// PersonSelector state
	let showPeopleSelector = $state(false);
	let selectedPersonIds = $state<Id<'people'>[]>([]);
	let addMemberAnchorElement = $state<HTMLElement | null>(null);

	// People already shown on this card (Assigned for roles, Members for circles)
	const pinnedPersonIds = $derived.by(() => visibleMembers.map((m) => m.personId));
	const pinnedSectionLabel = $derived(isCircle ? 'Members' : 'Assigned');

	// Handle person selection
	function handlePersonSelection(personIds: Id<'people'>[]) {
		// Defensive: Bits UI can emit a "clear" change (empty array) depending on controlled value timing.
		// In that case, do nothing and keep the selector open so the user can select again.
		const next = Array.from(personIds ?? []);
		if (next.length === 0) return;

		onMemberSelect?.(next);
		// IMPORTANT:
		// `selectedPersonIds` is *UI selection state*, not "currently assigned members".
		// If we keep it populated, `PersonSelector` will keep filtering those people out
		// (it hides anything in `selectedPersonIds`), which breaks "remove then re-assign"
		// in this same RoleCard instance until a reload resets local state.
		selectedPersonIds = [];
		// If we just re-selected someone we previously removed optimistically, clear the suppression
		// so the UI/selector stays consistent before Convex pushes the updated fillers list.
		for (const personId of next) {
			optimisticallyRemovedPersonIds.delete(personId);
		}
		showPeopleSelector = false;
	}

	function handlePinnedPersonClick(personId: Id<'people'>) {
		// Only roles support "remove from role" via pinned section
		if (isCircle) return;
		// Optimistically unpin/unexclude immediately for this RoleCard instance.
		optimisticallyRemovedPersonIds.add(personId);
		// Clear any lingering selection so the removed person can immediately re-appear in the selector.
		selectedPersonIds = [];
		onMemberRemove?.(personId);
	}

	// Check if we can show PersonSelector (need required props)
	const canShowPeopleSelector = $derived(
		!!workspaceId && !!sessionId && !!circleId && !!onMemberSelect
	);
</script>

<div class={[className, 'rounded-card border-default overflow-hidden border']}>
	<button type="button" class={[buttonClasses, 'w-full']} onclick={handleHeaderClick}>
		{#if isCircle}
			<Icon type="circle" size="md" color="secondary" />
		{/if}
		<div class="min-w-0 flex-1 text-left">
			<div class="gap-fieldGroup flex items-center">
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
						<p class="text-button text-primary truncate font-medium">{name}</p>
					</EditPermissionTooltip>
				{:else}
					<p class="text-button text-primary truncate font-medium">{name}</p>
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
		<div class="gap-fieldGroup flex items-center" role="group">
			{#if canShowPeopleSelector}
				<div
					class="relative"
					onclick={(e) => {
						e?.stopPropagation();
					}}
					onkeydown={(e) => {
						if (e.key === 'Escape') {
							showPeopleSelector = false;
						}
					}}
					role="presentation"
				>
					<div class="inline-flex" bind:this={addMemberAnchorElement}>
						<Button
							variant="ghost"
							size="sm"
							iconOnly
							onclick={(e) => {
								e?.stopPropagation();
								// Keep the button visible; just toggle the popover open state.
								if (!addMemberAnchorElement) return;
								// Reset UI selection each time we open, so past selections don't hide options.
								if (!showPeopleSelector) selectedPersonIds = [];
								showPeopleSelector = !showPeopleSelector;
							}}
							ariaLabel="Add member to {name}"
						>
							<Icon type="user-plus" size="sm" />
						</Button>
					</div>

					<PersonSelector
						triggerStyle="external"
						anchorElement={addMemberAnchorElement}
						mode="circle-aware"
						{workspaceId}
						{sessionId}
						{circleId}
						excludePersonIds={pinnedPersonIds}
						{pinnedPersonIds}
						{pinnedSectionLabel}
						onPinnedPersonClick={!isCircle && onMemberRemove ? handlePinnedPersonClick : undefined}
						bind:selectedPersonIds
						onSelect={handlePersonSelection}
						multiple={false}
						placeholder="Select member..."
						bind:open={showPeopleSelector}
					/>
				</div>
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
				<div class="flex-shrink-0" role="group">
					<ActionMenu items={menuItems} />
				</div>
			{/if}
		</div>
	</button>
	{#if showMembers}
		<div class="border-subtle w-full shrink-0 border-t"></div>
		<div class="gap-fieldGroup flex flex-col">
			{#each visibleMembers as member (member.personId)}
				<RoleMemberItem
					personId={member.personId}
					name={member.name}
					email={member.email}
					avatarImage={member.avatarImage}
					scope={isCircle ? member.roleName : member.scope}
					selected={currentPersonId ? member.personId === currentPersonId : false}
					menuItems={memberMenuItems ? memberMenuItems(member.personId) : []}
				/>
			{/each}
		</div>
	{/if}
</div>
