<script lang="ts">
	/**
	 * Action Items List Component
	 *
	 * SYOS-467: Refactored to use composables for separation of concerns
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

	import type { Id } from '$lib/convex';
	import { Button, Text, Icon, Avatar } from '$lib/components/atoms';
	import { getContext } from 'svelte';
import { invariant } from '$lib/utils/invariant';

	interface Props {
		agendaItemId: Id<'meetingAgendaItems'>;
		meetingId: Id<'meetings'>;
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		circleId?: Id<'circles'>;
		readonly?: boolean;
	}

	const {
		agendaItemId,
		meetingId,
		sessionId,
		workspaceId,
		circleId,
		readonly = false
	}: Props = $props();

	const projects = getContext('projects-api') as
		| {
				useTasks: (options: unknown) => unknown;
				useTaskForm: (options: unknown) => unknown;
		  }
		| undefined;
invariant(projects, 'ProjectsModuleAPI context not found');

	// Data fetching composable
	const data = projects.useTasks({
		agendaItemId: () => agendaItemId,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId,
		circleId: () => circleId
	});

	// Form logic composable
	const form = projects.useTaskForm({
		sessionId: () => sessionId,
		workspaceId: () => workspaceId,
		meetingId: () => meetingId,
		agendaItemId: () => agendaItemId,
		circleId: () => circleId,
		members: () => data.members,
		roles: () => data.roles,
		readonly: () => readonly
	});
</script>

<div class="space-y-form-section">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<Text variant="body" size="sm" color="default" as="h3" class="font-semibold">Action Items</Text>
		{#if !readonly && !form.isAdding}
			<Button variant="outline" size="sm" onclick={() => form.startAdding()}>+ Add Action</Button>
		{/if}
	</div>

	<!-- Add Action Form (Inline) -->
	{#if form.isAdding}
		<div class="space-y-header border-border-base p-form-section rounded-button border bg-surface">
			<!-- Description -->
			<textarea
				bind:value={form.description}
				placeholder="What needs to be done?"
				rows="2"
				class="text-body-sm border-border-base px-menu-item py-menu-item placeholder-text-tertiary focus:ring-accent-primary w-full rounded-input border bg-elevated text-primary focus:border-accent-primary focus:ring-1 focus:outline-none"
			></textarea>

			<!-- Assignee Type Toggle -->
			<div class="gap-form-section flex items-center">
				<!-- Assignee Type Toggle (only if circle has roles) -->
				{#if circleId && data.roles.length > 0}
					<div class="flex items-center gap-fieldGroup">
						<Text variant="body" size="sm" color="tertiary" as="span">Assign to:</Text>
						<Button
							variant="outline"
							size="sm"
							ariaLabel="Toggle assignee type"
							onclick={() => (form.assigneeType = form.assigneeType === 'user' ? 'role' : 'user')}
						>
							{form.assigneeType === 'user' ? '👤 User' : '🎭 Role'}
						</Button>
					</div>
				{/if}
			</div>

			<!-- Assignee Selector -->
			<div>
				{#if form.assigneeType === 'user'}
					<select
						bind:value={form.assigneeUserId}
						class="text-body-sm border-border-base px-menu-item py-menu-item focus:ring-accent-primary w-full rounded-input border bg-elevated text-primary focus:border-accent-primary focus:ring-1 focus:outline-none"
					>
						<option value={null}>Select user...</option>
						{#each data.members as member (member.userId)}
							<option value={member.userId}>{member.name || member.email}</option>
						{/each}
					</select>
				{:else if form.assigneeType === 'role'}
					<select
						bind:value={form.assigneeRoleId}
						class="text-body-sm border-border-base px-menu-item py-menu-item focus:ring-accent-primary w-full rounded-input border bg-elevated text-primary focus:border-accent-primary focus:ring-1 focus:outline-none"
					>
						<option value={null}>Select role...</option>
						{#each data.roles as role (role.roleId)}
							<option value={role.roleId}>{role.name}</option>
						{/each}
					</select>
				{/if}
			</div>

			<!-- Due Date (Optional) -->
			<div class="flex items-center gap-fieldGroup">
				<label for="due-date">
					<Text variant="body" size="sm" color="tertiary" as="span">Due date (optional):</Text>
				</label>
				<input
					id="due-date"
					type="date"
					value={form.timestampToDateInput(form.dueDate)}
					onchange={form.handleDueDateChange}
					class="text-body-sm border-border-base px-menu-item py-menu-item focus:ring-accent-primary rounded-button border bg-elevated text-primary focus:border-accent-primary focus:ring-1 focus:outline-none"
				/>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-fieldGroup" style="padding-top: var(--spacing-3);">
				<Button variant="primary" onclick={form.handleCreate}>Add Action</Button>
				<Button variant="outline" onclick={form.resetForm}>Cancel</Button>
			</div>
		</div>
	{/if}

	<!-- Action Items List -->
	{#if data.tasks.length === 0}
		<!-- Empty State -->
		<div class="text-center" style="padding-block: var(--spacing-8);">
			<div class="mx-auto">
				<Icon type="dashboard" size="xl" color="tertiary" />
			</div>
			<Text variant="body" size="sm" color="tertiary" as="p" class="mt-form-section"
				>No action items yet</Text
			>
			{#if !readonly && !form.isAdding}
				<Button variant="outline" size="sm" onclick={() => form.startAdding()}>
					Add your first action
				</Button>
			{/if}
		</div>
	{:else}
		<!-- List of action items -->
		<div style="display: flex; flex-direction: column; gap: var(--spacing-2);">
			{#each data.tasks as item (item._id)}
				<div
					class="group p-header border-border-base flex items-start gap-header rounded-button border bg-surface transition-colors hover:bg-elevated"
				>
					<!-- Status Checkbox -->
					<button
						onclick={() => !readonly && form.handleToggleStatus(item._id, item.status)}
						disabled={readonly}
						class="mt-spacing-icon-gap-sm flex-shrink-0"
						aria-label="Toggle status"
					>
						{#if item.status === 'done'}
							<Icon type="flashcards" size="md" color="success" />
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
						<Text
							variant="body"
							size="sm"
							color="default"
							as="p"
							class={item.status === 'done' ? 'line-through' : ''}
							style={item.status === 'done' ? 'opacity: var(--opacity-60)' : ''}
						>
							{item.description}
						</Text>

						<!-- Metadata -->
						<div
							class="flex items-center gap-header text-label text-tertiary"
							style="margin-top: var(--spacing-2);"
						>
							<!-- Type Badge -->
							<span
								class="border-border-base px-badge py-badge inline-flex items-center gap-fieldGroup rounded border bg-elevated"
							>
								{item.type === 'next-step' ? '⚡' : '📦'}
								{item.type === 'next-step' ? 'Next Step' : 'Project'}
							</span>

							<!-- Assignee -->
							<span class="inline-flex items-center" style="gap: var(--spacing-1);">
								<Avatar
									initials={form.getInitials(form.getAssigneeName(item))}
									size="xs"
									variant="brand"
								/>
								{form.getAssigneeName(item)}
							</span>

							<!-- Due Date -->
							{#if item.dueDate}
								<span class="inline-flex items-center" style="gap: var(--spacing-1);">
									<Icon type="calendar" size="sm" />
									{form.formatDate(item.dueDate)}
								</span>
							{/if}
						</div>
					</div>

					<!-- Actions (visible on hover) -->
					{#if !readonly}
						<div
							class="action-delete-btn flex-shrink-0 transition-opacity"
							style="opacity: var(--opacity-0);"
						>
							<Button
								variant="outline"
								size="sm"
								iconOnly
								ariaLabel="Delete action"
								onclick={() => form.handleDelete(item._id)}
								class="hover:bg-error-hover text-error"
							>
								<Icon type="delete" size="sm" />
							</Button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Hover-reveal for delete button - uses CSS variables for opacity */
	.group:hover .action-delete-btn {
		opacity: var(--opacity-100, 1);
	}
</style>
