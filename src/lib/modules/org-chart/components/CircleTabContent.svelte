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

	interface Props {
		tabId: string;
		childCircles: any[];
		coreRoles: any[];
		regularRoles: any[];
		membersWithoutRoles: any[];
		onRoleClick: (roleId: string, roleName: string) => void;
		onChildCircleClick: (circleId: string) => void;
		onQuickUpdateRole: (roleId: Id<'circleRoles'>, updates: any) => Promise<void>;
		onOpenAssignUserDialog: (type: 'role' | 'circle', entityId: any, entityName: string) => void;
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
		onOpenAssignUserDialog
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
		{onOpenAssignUserDialog}
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
