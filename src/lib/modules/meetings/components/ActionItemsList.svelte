<script lang="ts">
	/**
	 * Action Items List Component
	 *
	 * SYOS-223: UI for capturing action items linked to agenda items
	 *
	 * Features:
	 * - List action items for current agenda item
	 * - Inline "Add Action" button + form
	 * - Type toggle: "Next Step" | "Project"
	 * - Assignee selector: User OR Role (polymorphic)
	 * - Due date picker (optional)
	 * - Status checkbox (todo/done)
	 * - Edit/delete actions
	 *
	 * Design: Linear-style compact UI with design tokens
	 */

	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui';

	interface Props {
		agendaItemId: Id<'meetingAgendaItems'>;
		meetingId: Id<'meetings'>;
		sessionId: string;
		organizationId: Id<'organizations'>;
		circleId?: Id<'circles'>;
		readonly?: boolean;
	}

	const {
		agendaItemId,
		meetingId,
		sessionId,
		organizationId,
		circleId,
		readonly = false
	}: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	// State
	const state = $state({
		isAdding: false,
		editingId: null as Id<'meetingActionItems'> | null,
		// Form state
		description: '',
		type: 'next-step' as 'next-step' | 'project',
		assigneeType: 'user' as 'user' | 'role',
		assigneeUserId: null as Id<'users'> | null,
		assigneeRoleId: null as Id<'circleRoles'> | null,
		dueDate: null as number | null
	});

	// Query action items for this agenda item
	const actionItemsQuery =
		browser && sessionId
			? useQuery(api.meetingActionItems.listByAgendaItem, () => {
					if (!sessionId) throw new Error('sessionId required');
					return { sessionId, agendaItemId };
				})
			: null;

	// Query organization members (for user dropdown)
	const membersQuery =
		browser && sessionId
			? useQuery(api.organizations.getMembers, () => {
					if (!sessionId) throw new Error('sessionId required');
					return { sessionId, organizationId };
				})
			: null;

	// Query circle roles (for role dropdown) - only if circle exists
	const rolesQuery =
		browser && sessionId && circleId
			? useQuery(api.circleRoles.listByCircle, () => {
					if (!sessionId) throw new Error('sessionId required');
					if (!circleId) throw new Error('circleId required');
					return { sessionId, circleId };
				})
			: null;

	// Derived data
	const actionItems = $derived(actionItemsQuery?.data ?? []);
	const members = $derived(membersQuery?.data ?? []);
	const roles = $derived(rolesQuery?.data ?? []);

	// Reset form
	function resetForm() {
		state.description = '';
		state.type = 'next-step';
		state.assigneeType = 'user';
		state.assigneeUserId = null;
		state.assigneeRoleId = null;
		state.dueDate = null;
		state.isAdding = false;
		state.editingId = null;
	}

	// Handle create action item
	async function handleCreate() {
		if (!state.description.trim()) {
			toast.error('Description is required');
			return;
		}

		// Validate assignee
		if (state.assigneeType === 'user' && !state.assigneeUserId) {
			toast.error('Please select a user');
			return;
		}

		if (state.assigneeType === 'role' && !state.assigneeRoleId) {
			toast.error('Please select a role');
			return;
		}

		try {
			await convexClient?.mutation(api.meetingActionItems.create, {
				sessionId,
				meetingId,
				agendaItemId,
				circleId,
				type: state.type,
				assigneeType: state.assigneeType,
				assigneeUserId: state.assigneeUserId ?? undefined,
				assigneeRoleId: state.assigneeRoleId ?? undefined,
				description: state.description.trim(),
				dueDate: state.dueDate ?? undefined
			});

			toast.success('Action item created');
			resetForm();
		} catch (error) {
			console.error('Failed to create action item:', error);
			toast.error('Failed to create action item');
		}
	}

	// Handle toggle status
	async function handleToggleStatus(
		actionItemId: Id<'meetingActionItems'>,
		currentStatus: 'todo' | 'in-progress' | 'done'
	) {
		try {
			const newStatus = currentStatus === 'done' ? 'todo' : 'done';
			await convexClient?.mutation(api.meetingActionItems.updateStatus, {
				sessionId,
				actionItemId,
				status: newStatus
			});
		} catch (error) {
			console.error('Failed to update status:', error);
			toast.error('Failed to update status');
		}
	}

	// Handle delete
	async function handleDelete(actionItemId: Id<'meetingActionItems'>) {
		if (!confirm('Delete this action item?')) return;

		try {
			await convexClient?.mutation(api.meetingActionItems.remove, {
				sessionId,
				actionItemId
			});
			toast.success('Action item deleted');
		} catch (error) {
			console.error('Failed to delete action item:', error);
			toast.error('Failed to delete action item');
		}
	}

	// Format date
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Get assignee name
	function getAssigneeName(item: (typeof actionItems)[number]): string {
		if (item.assigneeType === 'user' && item.assigneeUserId) {
			const member = members.find((m) => m.userId === item.assigneeUserId);
			return member?.name || member?.email || 'Unknown User';
		}

		if (item.assigneeType === 'role' && item.assigneeRoleId) {
			const role = roles.find((r) => r.roleId === item.assigneeRoleId);
			return role?.name || 'Unknown Role';
		}

		return 'Unassigned';
	}

	// Get initials for avatar
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Handle due date change (convert to timestamp)
	function handleDueDateChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.value) {
			state.dueDate = new Date(input.value).getTime();
		} else {
			state.dueDate = null;
		}
	}

	// Convert timestamp to date input value (YYYY-MM-DD)
	function timestampToDateInput(timestamp: number | null): string {
		if (!timestamp) return '';
		return new Date(timestamp).toISOString().split('T')[0];
	}
</script>

<div class="space-y-form-section">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-body-sm font-semibold text-text-primary">Action Items</h3>
		{#if !readonly && !state.isAdding}
			<Button variant="outline" size="sm" onclick={() => (state.isAdding = true)}>
				+ Add Action
			</Button>
		{/if}
	</div>

	<!-- Add Action Form (Inline) -->
	{#if state.isAdding}
		<div class="space-y-header rounded-button border border-border-base bg-surface p-form-section">
			<!-- Description -->
			<textarea
				bind:value={state.description}
				placeholder="What needs to be done?"
				rows="2"
				class="text-body-sm w-full rounded-input border border-border-base bg-elevated px-menu-item py-menu-item text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
			></textarea>

			<!-- Type Toggle + Assignee Type Toggle -->
			<div class="flex items-center gap-form-section">
				<!-- Type -->
				<div class="flex items-center gap-meeting-card">
					<span class="text-body-sm text-tertiary">Type:</span>
					<Button
						variant="outline"
						size="sm"
						ariaLabel="Toggle action item type"
						onclick={() => (state.type = state.type === 'next-step' ? 'project' : 'next-step')}
					>
						{state.type === 'next-step' ? '⚡ Next Step' : '📦 Project'}
					</Button>
				</div>

				<!-- Assignee Type Toggle (only if circle has roles) -->
				{#if circleId && roles.length > 0}
					<div class="flex items-center gap-meeting-card">
						<span class="text-body-sm text-tertiary">Assign to:</span>
						<Button
							variant="outline"
							size="sm"
							ariaLabel="Toggle assignee type"
							onclick={() => (state.assigneeType = state.assigneeType === 'user' ? 'role' : 'user')}
						>
							{state.assigneeType === 'user' ? '👤 User' : '🎭 Role'}
						</Button>
					</div>
				{/if}
			</div>

			<!-- Assignee Selector -->
			<div>
				{#if state.assigneeType === 'user'}
					<select
						bind:value={state.assigneeUserId}
						class="text-body-sm w-full rounded-input border border-border-base bg-elevated px-menu-item py-menu-item text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
					>
						<option value={null}>Select user...</option>
						{#each members as member (member.userId)}
							<option value={member.userId}>{member.name || member.email}</option>
						{/each}
					</select>
				{:else if state.assigneeType === 'role'}
					<select
						bind:value={state.assigneeRoleId}
						class="text-body-sm w-full rounded-input border border-border-base bg-elevated px-menu-item py-menu-item text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
					>
						<option value={null}>Select role...</option>
						{#each roles as role (role.roleId)}
							<option value={role.roleId}>{role.name}</option>
						{/each}
					</select>
				{/if}
			</div>

			<!-- Due Date (Optional) -->
			<div class="flex items-center gap-meeting-card">
				<label for="due-date" class="text-body-sm text-tertiary">Due date (optional):</label>
				<input
					id="due-date"
					type="date"
					value={timestampToDateInput(state.dueDate)}
					onchange={handleDueDateChange}
					class="text-body-sm rounded-button border border-border-base bg-elevated px-menu-item py-menu-item text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
				/>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-meeting-card pt-meeting-card">
				<Button variant="primary" onclick={handleCreate}>Add Action</Button>
				<Button variant="outline" onclick={resetForm}>Cancel</Button>
			</div>
		</div>
	{/if}

	<!-- Action Items List -->
	{#if actionItems.length === 0}
		<!-- Empty State -->
		<div class="py-meeting-section text-center">
			<svg
				class="mx-auto size-icon-xl text-text-tertiary"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
				/>
			</svg>
			<p class="text-body-sm mt-form-section text-text-tertiary">No action items yet</p>
			{#if !readonly && !state.isAdding}
				<Button variant="outline" size="sm" onclick={() => (state.isAdding = true)}>
					Add your first action
				</Button>
			{/if}
		</div>
	{:else}
		<!-- List of action items -->
		<div class="space-y-meeting-card">
			{#each actionItems as item (item._id)}
				<div
					class="group gap-header p-header flex items-start rounded-button border border-border-base bg-surface transition-colors hover:bg-elevated"
				>
					<!-- Status Checkbox -->
					<button
						onclick={() => !readonly && handleToggleStatus(item._id, item.status)}
						disabled={readonly}
						class="mt-spacing-icon-gap-sm flex-shrink-0"
						aria-label="Toggle status"
					>
						{#if item.status === 'done'}
							<svg
								class="icon-md text-success"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						{:else}
							<svg
								class="icon-md text-text-tertiary transition-colors hover:text-accent-primary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<circle cx="12" cy="12" r="9" stroke-width="2" />
							</svg>
						{/if}
					</button>

					<!-- Content -->
					<div class="min-w-0 flex-1">
						<p
							class="text-body-sm text-primary {item.status === 'done'
								? 'line-through opacity-60'
								: ''}"
						>
							{item.description}
						</p>

						<!-- Metadata -->
						<div class="gap-header mt-meeting-card flex items-center text-label text-tertiary">
							<!-- Type Badge -->
							<span
								class="gap-icon-sm inline-flex items-center rounded border border-border-base bg-elevated px-badge py-badge"
							>
								{item.type === 'next-step' ? '⚡' : '📦'}
								{item.type === 'next-step' ? 'Next Step' : 'Project'}
							</span>

							<!-- Assignee -->
							<span class="inline-flex items-center gap-meeting-avatar">
								<div
									class="flex size-icon-sm items-center justify-center rounded-avatar bg-accent-primary text-label font-medium text-primary"
								>
									{getInitials(getAssigneeName(item))}
								</div>
								{getAssigneeName(item)}
							</span>

							<!-- Due Date -->
							{#if item.dueDate}
								<span class="inline-flex items-center gap-meeting-avatar">
									<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									{formatDate(item.dueDate)}
								</span>
							{/if}
						</div>
					</div>

					<!-- Actions (visible on hover) -->
					{#if !readonly}
						<div class="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
							<Button
								variant="outline"
								size="sm"
								iconOnly
								ariaLabel="Delete action"
								onclick={() => handleDelete(item._id)}
								class="text-error hover:bg-error hover:bg-error-hover"
							>
								<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</Button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
