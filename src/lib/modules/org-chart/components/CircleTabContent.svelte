<script lang="ts">
	import type { Id } from '$lib/convex/_generated/dataModel';
	import {
		CircleOverviewTab,
		CircleMembersTab,
		CircleDocumentsTab,
		CircleActivitiesTab,
		CircleMetricsTab,
		CircleChecklistsTab,
		CircleProjectsTab
	} from './tabs';

	type ChildCircle = {
		circleId: Id<'circles'>;
		name: string;
		purpose: string | null;
	};

	type Role = {
		roleId: Id<'circleRoles'>;
		name: string;
		purpose: string | null;
		status: 'active' | 'draft';
		isHiring: boolean;
	};

	type MemberWithoutRole = {
		personId: Id<'people'>;
		name: string;
		email: string | null;
	};

	interface Props {
		tabId: string;
		childCircles: ChildCircle[];
		coreRoles: Role[];
		regularRoles: Role[];
		membersWithoutRoles: MemberWithoutRole[];
		onRoleClick: (roleId: Id<'circleRoles'>, roleName: string) => void;
		onChildCircleClick: (circleId: Id<'circles'>) => void;
		onQuickUpdateRole: (
			roleId: Id<'circleRoles'>,
			updates: { name?: string; purpose?: string }
		) => Promise<void>;
		onOpenAssignPersonDialog: (
			type: 'role' | 'circle',
			entityId: Id<'circleRoles'> | Id<'circles'>,
			entityName: string
		) => void;
	}

	let {
		tabId,
		childCircles,
		coreRoles,
		regularRoles,
		membersWithoutRoles,
		onRoleClick,
		onChildCircleClick,
		onQuickUpdateRole,
		onOpenAssignPersonDialog
	}: Props = $props();
</script>

{#if tabId === 'overview'}
	<CircleOverviewTab
		{childCircles}
		{coreRoles}
		{regularRoles}
		{membersWithoutRoles}
		{onRoleClick}
		{onChildCircleClick}
		{onQuickUpdateRole}
		{onOpenAssignPersonDialog}
	/>
{:else if tabId === 'members'}
	<CircleMembersTab />
{:else if tabId === 'documents'}
	<CircleDocumentsTab />
{:else if tabId === 'activities'}
	<CircleActivitiesTab />
{:else if tabId === 'metrics'}
	<CircleMetricsTab />
{:else if tabId === 'checklists'}
	<CircleChecklistsTab />
{:else if tabId === 'projects'}
	<CircleProjectsTab />
{/if}
