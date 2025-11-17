<script lang="ts">
	/**
	 * Dashboard Action Items List Component
	 *
	 * SYOS-225: Dashboard view of user's action items across all meetings
	 *
	 * Features:
	 * - Filter tabs: All | To Do | In Progress | Done
	 * - Shows action items from all meetings
	 * - Status toggle (checkbox)
	 * - Link to meeting
	 * - Type badge (Next Step | Project)
	 * - Due date badge
	 * - Empty states per filter
	 */

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { toast } from 'svelte-sonner';
	import { resolveRoute } from '$lib/utils/navigation';

	interface Props {
		sessionId: string;
	}

	const { sessionId }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	// State
	const state = $state({
		activeFilter: 'all' as 'all' | 'todo' | 'in-progress' | 'done'
	});

	// Query user's action items (defaults to current user)
	const actionItemsQuery =
		browser && sessionId
			? useQuery(api.meetingActionItems.listByAssignee, () => {
					if (!sessionId) throw new Error('sessionId required');
					return { sessionId };
				})
			: null;

	const actionItems = $derived(actionItemsQuery?.data ?? []);

	// Filter action items by status
	const filteredItems = $derived(() => {
		if (state.activeFilter === 'all') return actionItems;
		return actionItems.filter((item) => item.status === state.activeFilter);
	});

	// Handle toggle status
	async function handleToggleStatus(
		actionItemId: Id<'meetingActionItems'>,
		currentStatus: 'todo' | 'in-progress' | 'done'
	) {
		try {
			// Cycle through states: todo -> in-progress -> done -> todo
			let newStatus: 'todo' | 'in-progress' | 'done';
			if (currentStatus === 'todo') newStatus = 'in-progress';
			else if (currentStatus === 'in-progress') newStatus = 'done';
			else newStatus = 'todo';

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

	// Navigate to meeting
	function handleNavigateToMeeting(meetingId: Id<'meetings'>) {
		goto(resolveRoute(`/meetings/${meetingId}`));
	}

	// Format date
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Get status icon
	function getStatusIcon(status: 'todo' | 'in-progress' | 'done') {
		if (status === 'done') {
			return '✓'; // Checkmark
		} else if (status === 'in-progress') {
			return '◐'; // Half circle
		}
		return '○'; // Empty circle
	}

	// Get status color
	function getStatusColor(status: 'todo' | 'in-progress' | 'done') {
		if (status === 'done') return 'text-green-600';
		if (status === 'in-progress') return 'text-accent-primary';
		return 'text-text-tertiary';
	}
</script>

<!-- Filter Tabs -->
<div class="mb-content-section flex gap-2 border-b border-border-base">
	<button
		onclick={() => (state.activeFilter = 'all')}
		class="border-b-2 px-nav-item py-nav-item text-sm font-medium transition-colors {state.activeFilter ===
		'all'
			? 'border-accent-primary text-accent-primary'
			: 'border-transparent text-text-secondary hover:text-text-primary'}"
	>
		All ({actionItems.length})
	</button>
	<button
		onclick={() => (state.activeFilter = 'todo')}
		class="border-b-2 px-nav-item py-nav-item text-sm font-medium transition-colors {state.activeFilter ===
		'todo'
			? 'border-accent-primary text-accent-primary'
			: 'border-transparent text-text-secondary hover:text-text-primary'}"
	>
		To Do ({actionItems.filter((item) => item.status === 'todo').length})
	</button>
	<button
		onclick={() => (state.activeFilter = 'in-progress')}
		class="border-b-2 px-nav-item py-nav-item text-sm font-medium transition-colors {state.activeFilter ===
		'in-progress'
			? 'border-accent-primary text-accent-primary'
			: 'border-transparent text-text-secondary hover:text-text-primary'}"
	>
		In Progress ({actionItems.filter((item) => item.status === 'in-progress').length})
	</button>
	<button
		onclick={() => (state.activeFilter = 'done')}
		class="border-b-2 px-nav-item py-nav-item text-sm font-medium transition-colors {state.activeFilter ===
		'done'
			? 'border-accent-primary text-accent-primary'
			: 'border-transparent text-text-secondary hover:text-text-primary'}"
	>
		Done ({actionItems.filter((item) => item.status === 'done').length})
	</button>
</div>

<!-- Action Items List -->
{#if actionItemsQuery?.isLoading}
	<div class="py-12 text-center text-text-secondary">Loading action items...</div>
{:else if filteredItems().length === 0}
	<!-- Empty State -->
	<div
		class="bg-surface-secondary rounded-lg border border-dashed border-border-base py-12 text-center"
	>
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
		<p class="mt-4 text-sm font-medium text-text-primary">
			{#if state.activeFilter === 'all'}
				No action items yet
			{:else if state.activeFilter === 'todo'}
				No action items to do
			{:else if state.activeFilter === 'in-progress'}
				No action items in progress
			{:else}
				No completed action items
			{/if}
		</p>
		<p class="mt-1 text-sm text-text-tertiary">
			Action items are created during meetings and appear here.
		</p>
	</div>
{:else}
	<!-- List of action items -->
	<div class="divide-border-subtle bg-surface-base divide-y rounded-lg border border-border-base">
		{#each filteredItems() as item (item._id)}
			<div
				class="group p-inbox-card hover:bg-surface-hover flex items-start gap-icon-gap transition-colors"
			>
				<!-- Status Checkbox -->
				<button
					onclick={() => handleToggleStatus(item._id, item.status)}
					class="mt-0.5 flex-shrink-0"
					aria-label="Toggle status"
				>
					<div
						class="flex h-5 w-5 items-center justify-center rounded-full {getStatusColor(
							item.status
						)} transition-colors hover:scale-110"
					>
						<span class="text-base font-medium">
							{getStatusIcon(item.status)}
						</span>
					</div>
				</button>

				<!-- Content -->
				<div class="min-w-0 flex-1">
					<p
						class="text-sm text-text-primary {item.status === 'done'
							? 'line-through opacity-60'
							: ''}"
					>
						{item.description}
					</p>

					<!-- Metadata -->
					<div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
						<!-- Type Badge -->
						<span
							class="bg-surface-secondary inline-flex items-center gap-1 rounded border border-border-base px-badge py-badge"
						>
							{item.type === 'next-step' ? '⚡' : '📦'}
							{item.type === 'next-step' ? 'Next Step' : 'Project'}
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

						<!-- Meeting Link -->
						<button
							onclick={() => handleNavigateToMeeting(item.meetingId)}
							class="inline-flex items-center gap-1 text-accent-primary transition-colors hover:text-accent-hover"
						>
							<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							View meeting
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
