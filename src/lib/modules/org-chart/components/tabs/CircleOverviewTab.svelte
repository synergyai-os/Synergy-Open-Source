<script lang="ts">
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { CIRCLE_DETAIL_KEY, type CircleDetailContext } from '../CircleDetailContext.svelte';
	import CategoryHeader from '../CategoryHeader.svelte';
	import RoleCard from '../RoleCard.svelte';
	import RoleCardWithMembers from '../RoleCardWithMembers.svelte';
	import { CustomFieldSection } from '$lib/components/molecules';
	import type { Id } from '$lib/convex/_generated/dataModel';

	// Props: Allow passing child circles, roles, and members (optional override)
	interface Props {
		childCircles?: Array<{
			circleId: Id<'circles'>;
			name: string;
			purpose: string | null;
		}>;
		coreRoles?: Array<{
			roleId: Id<'circleRoles'>;
			name: string;
			purpose: string | null;
			status: 'active' | 'draft';
			isHiring: boolean;
		}>;
		regularRoles?: Array<{
			roleId: Id<'circleRoles'>;
			name: string;
			purpose: string | null;
			status: 'active' | 'draft';
			isHiring: boolean;
		}>;
		membersWithoutRoles?: Array<{
			personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId)
			name: string;
			email: string | null;
		}>;
		onRoleClick?: (roleId: Id<'circleRoles'>, roleName: string) => void;
		onChildCircleClick?: (circleId: Id<'circles'>) => void;
		onQuickUpdateRole?: (
			roleId: Id<'circleRoles'>,
			updates: { name?: string; purpose?: string }
		) => Promise<void>;
		onOpenAssignPersonDialog?: (
			type: 'role' | 'circle',
			entityId: Id<'circleRoles'> | Id<'circles'>,
			entityName: string
		) => void;
	}

	let {
		childCircles = [],
		coreRoles = [],
		regularRoles = [],
		membersWithoutRoles = [],
		onRoleClick,
		onChildCircleClick,
		onQuickUpdateRole,
		onOpenAssignPersonDialog: _onOpenAssignPersonDialog
	}: Props = $props();

	// Get shared context
	const ctx = getContext<CircleDetailContext>(CIRCLE_DETAIL_KEY);

	// Destructure reactive getters
	const circle = $derived(ctx.circle());
	const canEdit = $derived(ctx.canEdit());
	const editReason = $derived(ctx.editReason());
	const isDesignPhase = $derived(ctx.isDesignPhase());
	const sessionId = $derived(ctx.sessionId());
	const workspaceId = $derived(ctx.workspaceId());

	// IMPORTANT:
	// - `canEdit` means "can edit directly in design OR can propose in active" (see useCanEdit)
	// - Direct inline saves in this tab call `api.core.circles.index.updateInline`, which only works in design phase.
	const canInlineEdit = $derived(canEdit && isDesignPhase);
	const inlineEditReason = $derived.by(() => {
		if (canInlineEdit) return editReason;
		if (canEdit && !isDesignPhase) {
			return 'Direct edits only allowed in design phase. Click Edit to propose changes.';
		}
		return editReason;
	});

	// Access customFields from context
	const { customFields } = ctx;
	const visibleCustomFields = $derived(
		customFields.fields.filter((f) => {
			const key = f.definition.systemKey;
			const name = f.definition.name;
			return key !== 'purpose' && name !== 'Purpose';
		})
	);

	const governancePurposeField = $derived.by(() => ({
		definition: {
			// Sentinel ID: rendered via CustomFieldSection but not stored in customFieldDefinitions
			_id: '' as unknown as Id<'customFieldDefinitions'>,
			name: 'Purpose',
			order: -1,
			systemKey: 'purpose',
			isSystemField: true,
			fieldType: 'longText'
		},
		value: null,
		parsedValue: circle?.purpose ?? ''
	}));

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// Handle role member assignment
	async function handleRoleMemberAssignment(roleId: Id<'circleRoles'>, personIds: Id<'people'>[]) {
		if (!convexClient || !sessionId || personIds.length === 0) return;

		const personId = personIds[0]; // Single selection for roles
		await convexClient.mutation(api.core.roles.index.assignPerson, {
			sessionId,
			circleRoleId: roleId,
			assigneePersonId: personId
		});
	}

	// Handle role member removal (from pinned "Assigned" section)
	async function handleRoleMemberRemoval(roleId: Id<'circleRoles'>, personId: Id<'people'>) {
		if (!convexClient || !sessionId) return;

		await convexClient.mutation(api.core.roles.index.removePerson, {
			sessionId,
			circleRoleId: roleId,
			assigneePersonId: personId
		});
	}

	// Handle circle member assignment
	async function handleCircleMemberAssignment(circleId: Id<'circles'>, personIds: Id<'people'>[]) {
		if (!convexClient || !sessionId || personIds.length === 0) return;

		const personId = personIds[0]; // Single selection for circles
		await convexClient.mutation(api.core.circles.index.addMember, {
			sessionId,
			circleId,
			memberPersonId: personId
		});
	}

	async function saveCirclePurpose(value: unknown) {
		const next = typeof value === 'string' ? value : '';
		await ctx.handleQuickUpdateCircle({ purpose: next });
	}

	async function deleteCirclePurpose() {
		// Circle purpose is a governance field; keep UX aligned with CustomFieldSection by showing a tooltip+message elsewhere.
		// For now, just clear to empty string and let server-side validation enforce GOV-* if applicable.
		await ctx.handleQuickUpdateCircle({ purpose: '' });
	}
</script>

<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
<div
	class="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr)_minmax(400px,500px)]"
	style="gap: clamp(var(--spacing-5), 2.5vw, var(--spacing-10));"
>
	<!-- Left Column: Custom Fields (DB-driven, ordered by definition.order) -->
	<div class="gap-section flex min-w-0 flex-col overflow-hidden">
		<CustomFieldSection
			field={governancePurposeField}
			canEdit={canInlineEdit}
			editReason={inlineEditReason}
			onSave={saveCirclePurpose}
			onDelete={deleteCirclePurpose}
		/>

		{#each visibleCustomFields as field (field.definition._id)}
			<CustomFieldSection
				{field}
				canEdit={canInlineEdit}
				editReason={inlineEditReason}
				onSave={(value) => customFields.setFieldValue(field.definition._id, value)}
				onDelete={() => customFields.deleteFieldValue(field.definition._id)}
			/>
		{/each}
	</div>

	<!-- Right Column: Roles & Circles -->
	<div class="gap-section flex flex-col" style="padding-right: var(--spacing-page-x);">
		<!-- Core Roles Section -->
		{#if coreRoles.length > 0}
			<div>
				<CategoryHeader
					variant="plain"
					title="Core Roles"
					count={coreRoles.length}
					onEdit={() => {
						/* TODO: Implement edit roles */
					}}
					onAdd={() => {
						/* TODO: Implement add role */
					}}
				/>
				<div class="gap-content mb-section flex flex-col">
					{#each coreRoles as role (role.roleId)}
						{@const roleStatus =
							role.status === 'draft' ? 'draft' : role.isHiring ? 'hiring' : undefined}
						<RoleCardWithMembers
							roleId={role.roleId}
							roleIdProp={role.roleId}
							name={role.name}
							purpose={role.purpose}
							status={roleStatus}
							circleId={circle?.circleId}
							{workspaceId}
							{sessionId}
							canEdit={canInlineEdit}
							editReason={inlineEditReason}
							onNameChange={canInlineEdit
								? (name) => onQuickUpdateRole?.(role.roleId, { name })
								: undefined}
							onPurposeChange={canInlineEdit
								? (purpose) => onQuickUpdateRole?.(role.roleId, { purpose })
								: undefined}
							onClick={() => onRoleClick?.(role.roleId, role.name)}
							onEdit={() => {
								/* TODO: Implement edit role */
							}}
							onMemberSelect={(personIds) => handleRoleMemberAssignment(role.roleId, personIds)}
							onMemberRemove={(personId) => handleRoleMemberRemoval(role.roleId, personId)}
							menuItems={[
								{ label: 'Edit role', onclick: () => {} },
								{ label: 'Remove', onclick: () => {}, danger: true }
							]}
						/>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Regular Roles Section -->
		{#if regularRoles.length > 0}
			<div>
				<CategoryHeader
					variant="plain"
					title="Roles"
					count={regularRoles.length}
					onEdit={() => {
						/* TODO: Implement edit roles */
					}}
					onAdd={() => {
						/* TODO: Implement add role */
					}}
				/>
				<div class="gap-content mb-section flex flex-col">
					{#each regularRoles as role (role.roleId)}
						{@const roleStatus =
							role.status === 'draft' ? 'draft' : role.isHiring ? 'hiring' : undefined}
						<RoleCardWithMembers
							roleId={role.roleId}
							roleIdProp={role.roleId}
							name={role.name}
							purpose={role.purpose}
							status={roleStatus}
							circleId={circle?.circleId}
							{workspaceId}
							{sessionId}
							canEdit={canInlineEdit}
							editReason={inlineEditReason}
							onNameChange={canInlineEdit
								? (name) => onQuickUpdateRole?.(role.roleId, { name })
								: undefined}
							onPurposeChange={canInlineEdit
								? (purpose) => onQuickUpdateRole?.(role.roleId, { purpose })
								: undefined}
							onClick={() => onRoleClick?.(role.roleId, role.name)}
							onEdit={() => {
								/* TODO: Implement edit role */
							}}
							onMemberSelect={(personIds) => handleRoleMemberAssignment(role.roleId, personIds)}
							onMemberRemove={(personId) => handleRoleMemberRemoval(role.roleId, personId)}
							menuItems={[
								{ label: 'Edit role', onclick: () => {} },
								{ label: 'Remove', onclick: () => {}, danger: true }
							]}
						/>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Child Circles Section -->
		{#if childCircles.length > 0}
			<div>
				<CategoryHeader
					variant="plain"
					title="Circles"
					count={childCircles.length}
					onAdd={() => {
						/* TODO: Implement add circle */
					}}
				/>
				<div class="gap-content mb-section flex flex-col">
					{#each childCircles as childCircle (childCircle.circleId)}
						<RoleCard
							name={childCircle.name}
							purpose={childCircle.purpose}
							isCircle={true}
							circleId={childCircle.circleId}
							{workspaceId}
							{sessionId}
							onClick={() => onChildCircleClick?.(childCircle.circleId)}
							onEdit={() => {
								/* TODO: Implement edit circle */
							}}
							onMemberSelect={(personIds) =>
								handleCircleMemberAssignment(childCircle.circleId, personIds)}
							menuItems={[
								{ label: 'Edit circle', onclick: () => {} },
								{ label: 'Remove', onclick: () => {}, danger: true }
							]}
						/>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Members Without Roles Section -->
		<div>
			<CategoryHeader
				variant="plain"
				title="Members without role"
				count={membersWithoutRoles.length}
				onAdd={() => {
					/* TODO: Implement add member */
				}}
			/>
			{#if membersWithoutRoles.length > 0}
				<div class="gap-content mb-section flex flex-col">
					<RoleCard
						name="Members without role"
						isCircle={false}
						circleId={circle?.circleId}
						{workspaceId}
						{sessionId}
						onClick={() => {}}
						onMemberSelect={(personIds) => {
							if (circle) {
								handleCircleMemberAssignment(circle.circleId, personIds);
							}
						}}
						members={membersWithoutRoles.map((m) => ({
							personId: m.personId,
							name: m.name,
							email: m.email ?? ''
						}))}
					/>
				</div>
			{:else}
				<p class="text-button text-secondary mb-section">All members are assigned to roles</p>
			{/if}
		</div>
	</div>
</div>
