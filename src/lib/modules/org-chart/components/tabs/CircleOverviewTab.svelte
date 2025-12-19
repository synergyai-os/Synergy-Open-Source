<script lang="ts">
	import { getContext } from 'svelte';
	import { CIRCLE_DETAIL_KEY, type CircleDetailContext } from '../CircleDetailContext.svelte';
	import CategoryHeader from '../CategoryHeader.svelte';
	import RoleCard from '../RoleCard.svelte';
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
			userId: Id<'users'>;
			name: string;
			email: string | null;
		}>;
		onRoleClick?: (roleId: Id<'circleRoles'>) => void;
		onChildCircleClick?: (circleId: Id<'circles'>) => void;
		onQuickUpdateRole?: (
			roleId: Id<'circleRoles'>,
			updates: { name?: string; purpose?: string }
		) => Promise<void>;
		onOpenAssignUserDialog?: (
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
		onOpenAssignUserDialog
	}: Props = $props();

	// Get shared context
	const ctx = getContext<CircleDetailContext>(CIRCLE_DETAIL_KEY);

	// Destructure reactive getters
	const circle = $derived(ctx.circle());
	const canEdit = $derived(ctx.canEdit());
	const editReason = $derived(ctx.editReason());

	// Access customFields from context
	const { customFields } = ctx;
</script>

<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
<div
	class="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr)_minmax(400px,500px)]"
	style="gap: clamp(var(--spacing-5), 2.5vw, var(--spacing-10));"
>
	<!-- Left Column: Custom Fields (DB-driven, ordered by definition.order) -->
	<div class="gap-section flex min-w-0 flex-col overflow-hidden">
		{#each customFields.fields as field (field.definition._id)}
			<CustomFieldSection
				{field}
				{canEdit}
				{editReason}
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
						<RoleCard
							name={role.name}
							purpose={role.purpose}
							status={roleStatus}
							roleId={role.roleId}
							circleId={circle?.circleId}
							{canEdit}
							{editReason}
							onNameChange={(name) => onQuickUpdateRole?.(role.roleId, { name })}
							onPurposeChange={(purpose) => onQuickUpdateRole?.(role.roleId, { purpose })}
							onClick={() => onRoleClick?.(role.roleId)}
							onEdit={() => {
								/* TODO: Implement edit role */
							}}
							onAddMember={() => {
								onOpenAssignUserDialog?.('role', role.roleId, role.name);
							}}
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
						<RoleCard
							name={role.name}
							purpose={role.purpose}
							status={roleStatus}
							roleId={role.roleId}
							circleId={circle?.circleId}
							{canEdit}
							{editReason}
							onNameChange={(name) => onQuickUpdateRole?.(role.roleId, { name })}
							onPurposeChange={(purpose) => onQuickUpdateRole?.(role.roleId, { purpose })}
							onClick={() => onRoleClick?.(role.roleId)}
							onEdit={() => {
								/* TODO: Implement edit role */
							}}
							onAddMember={() => {
								onOpenAssignUserDialog?.('role', role.roleId, role.name);
							}}
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
							onClick={() => onChildCircleClick?.(childCircle.circleId)}
							onEdit={() => {
								/* TODO: Implement edit circle */
							}}
							onAddMember={() => {
								onOpenAssignUserDialog?.('circle', childCircle.circleId, childCircle.name);
							}}
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
						onClick={() => {}}
						onAddMember={() => {
							if (circle) {
								onOpenAssignUserDialog?.('circle', circle.circleId, circle.name);
							}
						}}
						members={membersWithoutRoles.map((m) => ({
							userId: m.userId,
							name: m.name,
							email: m.email
						}))}
					/>
				</div>
			{:else}
				<p class="text-button text-secondary mb-section">All members are assigned to roles</p>
			{/if}
		</div>
	</div>
</div>
