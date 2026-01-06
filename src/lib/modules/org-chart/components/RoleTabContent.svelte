<script lang="ts">
	import type { Id } from '../../../../../convex/_generated/dataModel';
	import EmptyState from '../../../components/molecules/EmptyState.svelte';
	import CustomFieldSection from '../../../components/molecules/CustomFieldSection.svelte';
	import RoleCardWithMembers from './RoleCardWithMembers.svelte';
	import type { CustomFieldWithValue } from '../../../composables/useCustomFields.svelte.ts';

	type RoleForOverview = {
		roleId: Id<'circleRoles'>;
		name: string;
		purpose: string | null;
		circleId: Id<'circles'>;
		decisionRights: string[] | null;
	};

	let {
		tabId,
		displayRole,
		workspaceId,
		sessionId,
		canEdit,
		editReason,
		governancePurposeField,
		governanceDecisionRightsField,
		visibleCustomFields,
		onSaveRolePurpose,
		onDeleteRolePurpose,
		onSaveRoleDecisionRights,
		onDeleteRoleDecisionRights,
		onSaveCustomField,
		onDeleteCustomField,
		onRoleMemberAssignment,
		onRoleMemberRemoval
	}: {
		tabId: string;
		displayRole: RoleForOverview | null;
		workspaceId: Id<'workspaces'> | undefined;
		sessionId: string | undefined;
		canEdit: boolean;
		editReason?: string;
		governancePurposeField: CustomFieldWithValue;
		governanceDecisionRightsField: CustomFieldWithValue;
		visibleCustomFields: CustomFieldWithValue[];
		onSaveRolePurpose: (value: unknown) => Promise<void>;
		onDeleteRolePurpose: () => Promise<void>;
		onSaveRoleDecisionRights: (value: unknown) => Promise<void>;
		onDeleteRoleDecisionRights: () => Promise<void>;
		onSaveCustomField: (
			definitionId: Id<'customFieldDefinitions'>,
			value: unknown
		) => Promise<void>;
		onDeleteCustomField: (definitionId: Id<'customFieldDefinitions'>) => Promise<void>;
		onRoleMemberAssignment: (personIds: Id<'people'>[]) => Promise<void>;
		onRoleMemberRemoval: (personId: Id<'people'>) => Promise<void>;
	} = $props();
</script>

{#if tabId === 'overview'}
	<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
	<div
		class="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr)_minmax(400px,500px)]"
		style="gap: clamp(var(--spacing-5), 2.5vw, var(--spacing-10));"
	>
		<!-- Left Column: Purpose, Decision Rights, then Custom Fields (DB-driven order) -->
		<div class="gap-section flex min-w-0 flex-col overflow-hidden">
			<CustomFieldSection
				field={governancePurposeField}
				{canEdit}
				{editReason}
				onSave={onSaveRolePurpose}
				onDelete={onDeleteRolePurpose}
			/>

			<CustomFieldSection
				field={governanceDecisionRightsField}
				{canEdit}
				{editReason}
				onSave={onSaveRoleDecisionRights}
				onDelete={onDeleteRoleDecisionRights}
			/>

			{#each visibleCustomFields as field (field.definition._id)}
				<CustomFieldSection
					{field}
					{canEdit}
					{editReason}
					onSave={(value) => onSaveCustomField(field.definition._id, value)}
					onDelete={() => onDeleteCustomField(field.definition._id)}
				/>
			{/each}
		</div>

		<!-- Right Column: Filled By -->
		<div class="gap-section flex flex-col" style="padding-right: var(--spacing-page-x);">
			<div class="gap-content mb-section flex flex-col">
				{#if displayRole}
					<RoleCardWithMembers
						roleId={displayRole.roleId}
						roleIdProp={displayRole.roleId}
						name={displayRole.name}
						purpose={displayRole.purpose ?? undefined}
						circleId={displayRole.circleId}
						{workspaceId}
						{sessionId}
						canEdit={false}
						{editReason}
						onClick={() => {}}
						onMemberSelect={onRoleMemberAssignment}
						onMemberRemove={onRoleMemberRemoval}
					/>
				{/if}
			</div>
		</div>
	</div>
{:else if tabId === 'members'}
	<EmptyState
		icon="users"
		title="No members yet"
		description="Members assigned to this role will appear here. This feature will be available in a future update."
	/>
{:else if tabId === 'documents'}
	<EmptyState
		icon="file-text"
		title="No documents yet"
		description="Documents related to this role will appear here. This feature will be available in a future update."
	/>
{:else if tabId === 'activities'}
	<EmptyState
		icon="clock"
		title="No activities yet"
		description="Recent activities and updates for this role will appear here. This feature will be available in a future update."
	/>
{:else if tabId === 'metrics'}
	<EmptyState
		icon="bar-chart"
		title="No metrics yet"
		description="Performance metrics and analytics for this role will appear here. This feature will be available in a future update."
	/>
{:else if tabId === 'checklists'}
	<EmptyState
		icon="check-square"
		title="No checklists yet"
		description="Checklists and task lists for this role will appear here. This feature will be available in a future update."
	/>
{:else if tabId === 'projects'}
	<EmptyState
		icon="briefcase"
		title="No projects yet"
		description="Projects associated with this role will appear here. This feature will be available in a future update."
	/>
{/if}
