<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { invariant } from '$lib/utils/invariant';
	import RoleCard from './RoleCard.svelte';

	type Props = {
		roleId: Id<'circleRoles'>; // Role ID for querying fillers
		name: string;
		purpose?: string;
		isCircle?: boolean;
		status?: 'draft' | 'hiring';
		onClick: () => void;
		onEdit?: () => void;
		menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
		onMemberSelect?: (personIds: Id<'people'>[]) => void;
		onMemberRemove?: (personId: Id<'people'>) => void;
		memberMenuItems?: (
			personId: Id<'people'>
		) => Array<{ label: string; onclick: () => void; danger?: boolean }>;
		currentPersonId?: Id<'people'>;
		roleIdProp?: Id<'circleRoles'>; // Passed to RoleCard component
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
		roleId,
		name,
		purpose,
		isCircle,
		status,
		onClick,
		onEdit,
		menuItems,
		onMemberSelect,
		onMemberRemove,
		memberMenuItems,
		currentPersonId,
		roleIdProp,
		circleId,
		canEdit,
		editReason,
		onNameChange,
		onPurposeChange,
		workspaceId,
		sessionId,
		class: className
	}: Props = $props();

	// Get sessionId reactively
	const getSessionId = () => $page.data.sessionId;

	// Query role fillers for this role
	const fillersQuery =
		browser && getSessionId()
			? useQuery(api.core.roles.index.getRoleFillers, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required');
					return { sessionId, circleRoleId: roleId };
				})
			: null;

	// Transform fillers to Member format
	// Use personId as primary identifier (architecture requirement - NEVER use userId)
	const members = $derived.by(() => {
		const fillers = fillersQuery?.data ?? [];
		return fillers.map((filler) => ({
			personId: filler.personId,
			name: filler.displayName ?? undefined,
			email: filler.email || '',
			avatarImage: undefined,
			scope: undefined
		}));
	});
</script>

<RoleCard
	{name}
	{purpose}
	{isCircle}
	{status}
	{onClick}
	{onEdit}
	{menuItems}
	{members}
	{onMemberSelect}
	{onMemberRemove}
	{memberMenuItems}
	{currentPersonId}
	roleId={roleIdProp ?? roleId}
	{circleId}
	{canEdit}
	{editReason}
	{onNameChange}
	{onPurposeChange}
	{workspaceId}
	{sessionId}
	class={className}
/>
