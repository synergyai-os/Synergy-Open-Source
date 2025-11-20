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

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold text-text-primary">Action Items</h3>
		{#if !readonly && !state.isAdding}
			<button
				onclick={() => (state.isAdding = true)}
				class="text-sm font-medium text-accent-primary transition-colors hover:text-accent-hover"
			>
				+ Add Action
			</button>
		{/if}
	</div>

	<!-- Add Action Form (Inline) -->
	{#if state.isAdding}
		<div class="space-y-3 rounded-md border border-border-base bg-surface p-4">
			<!-- Description -->
			<textarea
				bind:value={state.description}
				placeholder="What needs to be done?"
				rows="2"
				class="w-full rounded-md border border-border-base bg-elevated px-menu-item py-menu-item text-sm text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
			></textarea>

			<!-- Type Toggle + Assignee Type Toggle -->
			<div class="flex items-center gap-4">
				<!-- Type -->
				<div class="flex items-center gap-2">
					<span class="text-sm text-tertiary">Type:</span>
					<button
						aria-label="Toggle action item type"
						onclick={() => (state.type = state.type === 'next-step' ? 'project' : 'next-step')}
						class="rounded-md border border-border-base bg-elevated px-menu-item py-1 text-sm font-medium text-primary transition-colors hover:bg-hover"
					>
						{state.type === 'next-step' ? '⚡ Next Step' : '📦 Project'}
					</button>
				</div>

				<!-- Assignee Type Toggle (only if circle has roles) -->
				{#if circleId && roles.length > 0}
					<div class="flex items-center gap-2">
						<span class="text-sm text-tertiary">Assign to:</span>
						<button
							aria-label="Toggle assignee type"
							onclick={() => (state.assigneeType = state.assigneeType === 'user' ? 'role' : 'user')}
							class="rounded-md border border-border-base bg-elevated px-menu-item py-1 text-sm font-medium text-primary transition-colors hover:bg-hover"
						>
							{state.assigneeType === 'user' ? '👤 User' : '🎭 Role'}
						</button>
					</div>
				{/if}
			</div>

			<!-- Assignee Selector -->
			<div>
				{#if state.assigneeType === 'user'}
					<select
						bind:value={state.assigneeUserId}
						class="w-full rounded-md border border-border-base bg-elevated px-menu-item py-menu-item text-sm text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
					>
						<option value={null}>Select user...</option>
						{#each members as member (member.userId)}
							<option value={member.userId}>{member.name || member.email}</option>
						{/each}
					</select>
				{:else if state.assigneeType === 'role'}
					<select
						bind:value={state.assigneeRoleId}
						class="w-full rounded-md border border-border-base bg-elevated px-menu-item py-menu-item text-sm text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
					>
						<option value={null}>Select role...</option>
						{#each roles as role (role.roleId)}
							<option value={role.roleId}>{role.name}</option>
						{/each}
					</select>
				{/if}
			</div>

			<!-- Due Date (Optional) -->
			<div class="flex items-center gap-2">
				<label for="due-date" class="text-sm text-tertiary">Due date (optional):</label>
				<input
					id="due-date"
					type="date"
					value={timestampToDateInput(state.dueDate)}
					onchange={handleDueDateChange}
					class="rounded-md border border-border-base bg-elevated px-menu-item py-menu-item text-sm text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
				/>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-2 pt-2">
				<button
					onclick={handleCreate}
					class="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
				>
					Add Action
				</button>
				<button
					onclick={resetForm}
					class="rounded-md border border-border-base px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-hover"
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}

	<!-- Action Items List -->
	{#if actionItems.length === 0}
		<!-- Empty State -->
		<div class="py-8 text-center">
			<svg
				class="mx-auto h-12 w-12 text-text-tertiary"
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
			<p class="mt-4 text-sm text-text-tertiary">No action items yet</p>
			{#if !readonly && !state.isAdding}
				<button
					onclick={() => (state.isAdding = true)}
					class="mt-2 text-sm font-medium text-accent-primary hover:text-accent-hover"
				>
					Add your first action
				</button>
			{/if}
		</div>
	{:else}
		<!-- List of action items -->
		<div class="space-y-2">
			{#each actionItems as item (item._id)}
				<div
					class="group flex items-start gap-3 rounded-md border border-border-base bg-surface p-3 transition-colors hover:bg-elevated"
				>
					<!-- Status Checkbox -->
					<button
						onclick={() => !readonly && handleToggleStatus(item._id, item.status)}
						disabled={readonly}
						class="mt-0.5 flex-shrink-0"
						aria-label="Toggle status"
					>
						{#if item.status === 'done'}
							<svg
								class="h-5 w-5 text-green-600"
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
								class="h-5 w-5 text-text-tertiary transition-colors hover:text-accent-primary"
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
							class="text-sm text-primary {item.status === 'done' ? 'line-through opacity-60' : ''}"
						>
							{item.description}
						</p>

						<!-- Metadata -->
						<div class="mt-2 flex items-center gap-3 text-xs text-tertiary">
							<!-- Type Badge -->
							<span
								class="inline-flex items-center gap-1 rounded border border-border-base bg-elevated px-badge py-badge"
							>
								{item.type === 'next-step' ? '⚡' : '📦'}
								{item.type === 'next-step' ? 'Next Step' : 'Project'}
							</span>

							<!-- Assignee -->
							<span class="inline-flex items-center gap-1">
								<div
									class="flex h-4 w-4 items-center justify-center rounded-full bg-accent-primary text-[8px] font-medium text-white"
								>
									{getInitials(getAssigneeName(item))}
								</div>
								{getAssigneeName(item)}
							</span>

							<!-- Due Date -->
							{#if item.dueDate}
								<span class="inline-flex items-center gap-1">
									<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
							<button
								onclick={() => handleDelete(item._id)}
								class="rounded p-1 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
								aria-label="Delete action"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
