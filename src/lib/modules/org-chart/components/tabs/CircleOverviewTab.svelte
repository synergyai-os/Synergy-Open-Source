<script lang="ts">
	import { getContext } from 'svelte';
	import { CIRCLE_DETAIL_KEY, type CircleDetailContext } from '../CircleDetailContext.svelte';
	import CategoryHeader from '../CategoryHeader.svelte';
	import RoleCard from '../RoleCard.svelte';
	import InlineEditText from '../InlineEditText.svelte';
	import CategoryItemsList from '../CategoryItemsList.svelte';
	import FormTextarea from '$lib/components/atoms/FormTextarea.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
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
	const isEditMode = $derived(ctx.isEditMode());

	// Access composables
	const { customFields, editCircle } = ctx;

	// Use helper functions
	const purposeValue = $derived(ctx.getFieldValueAsString('purpose'));
</script>

<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
<div
	class="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr)_minmax(400px,500px)]"
	style="gap: clamp(var(--spacing-5), 2.5vw, var(--spacing-10));"
>
	<!-- Left Column: Overview Details -->
	<div class="gap-section flex min-w-0 flex-col overflow-hidden">
		<!-- Purpose - from customFields only (SYOS-964) -->
		{#if customFields.getFieldBySystemKey('purpose')}
			{@const purposeField = customFields.getFieldBySystemKey('purpose')}
			<div>
				<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
					{purposeField.definition.name}
				</h4>
				{#if isEditMode}
					<FormTextarea
						label=""
						placeholder="What's the purpose of this circle?"
						value={editCircle.formValues.purpose}
						oninput={(e) => editCircle.setField('purpose', e.currentTarget.value)}
						rows={4}
					/>
				{:else if canEdit}
					<InlineEditText
						value={purposeValue}
						onSave={(purpose) => ctx.handleQuickUpdateCircle({ purpose })}
						multiline={true}
						placeholder="What's the purpose of this circle?"
						maxRows={4}
						size="md"
					/>
				{:else}
					<p class="text-button text-secondary leading-relaxed break-words">
						{purposeValue || 'No purpose set'}
					</p>
				{/if}
			</div>
		{/if}

		<!-- Domains -->
		<div>
			<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
				Domains
			</h4>
			<CategoryItemsList
				categoryName="Domains"
				items={ctx.getItemsForCategory('Domains')}
				{canEdit}
				{editReason}
				onCreate={(content) => ctx.handleAddMultiItemField('Domains', content)}
				onUpdate={(itemId, content) => ctx.handleUpdateMultiItemField('Domains', itemId, content)}
				onDelete={(itemId) => ctx.handleDeleteMultiItemField('Domains', itemId)}
				placeholder="What domains does this circle own?"
			/>
		</div>

		<!-- Accountabilities -->
		<div>
			<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
				Accountabilities
			</h4>
			<CategoryItemsList
				categoryName="Accountabilities"
				items={ctx.getItemsForCategory('Accountabilities')}
				{canEdit}
				{editReason}
				onCreate={(content) => ctx.handleAddMultiItemField('Accountabilities', content)}
				onUpdate={(itemId, content) =>
					ctx.handleUpdateMultiItemField('Accountabilities', itemId, content)}
				onDelete={(itemId) => ctx.handleDeleteMultiItemField('Accountabilities', itemId)}
				placeholder="What is this circle accountable for?"
			/>
		</div>

		<!-- Policies -->
		<div>
			<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
				Policies
			</h4>
			<CategoryItemsList
				categoryName="Policies"
				items={ctx.getItemsForCategory('Policies')}
				{canEdit}
				{editReason}
				onCreate={(content) => ctx.handleAddMultiItemField('Policies', content)}
				onUpdate={(itemId, content) => ctx.handleUpdateMultiItemField('Policies', itemId, content)}
				onDelete={(itemId) => ctx.handleDeleteMultiItemField('Policies', itemId)}
				placeholder="What policies govern this circle?"
			/>
		</div>

		<!-- Decision Rights -->
		<div>
			<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
				Decision Rights
			</h4>
			<CategoryItemsList
				categoryName="Decision Rights"
				items={ctx.getItemsForCategory('Decision Rights')}
				{canEdit}
				{editReason}
				onCreate={(content) => ctx.handleAddMultiItemField('Decision Rights', content)}
				onUpdate={(itemId, content) =>
					ctx.handleUpdateMultiItemField('Decision Rights', itemId, content)}
				onDelete={(itemId) => ctx.handleDeleteMultiItemField('Decision Rights', itemId)}
				placeholder="What decisions can this circle make?"
			/>
		</div>

		<!-- Notes -->
		<div>
			<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">Notes</h4>
			<CategoryItemsList
				categoryName="Notes"
				items={ctx.getItemsForCategory('Notes')}
				{canEdit}
				{editReason}
				onCreate={(content) => ctx.handleUpdateSingleField('Notes', content)}
				onUpdate={(itemId, content) => ctx.handleUpdateSingleField('Notes', content)}
				onDelete={(itemId) => ctx.handleUpdateSingleField('Notes', '')}
				placeholder="Additional notes about this circle"
			/>
		</div>
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
