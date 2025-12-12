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
	import { page } from '$app/stores';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { DEFAULT_LOCALE, DEFAULT_SHORT_DATE_FORMAT } from '$lib/utils/locale';
	import { toast } from 'svelte-sonner';
	import { resolveRoute } from '$lib/utils/navigation';
	import { Tabs, Badge } from '$lib/components/atoms';
	import { invariant } from '$lib/utils/invariant';

	interface Props {
		sessionId: string;
	}

	const { sessionId }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	// State - use filter as tab value
	let activeFilter = $state<'all' | 'todo' | 'in-progress' | 'done'>('all');

	// Query user's action items (defaults to current user)
	const actionItemsQuery =
		browser && sessionId
			? useQuery(api.features.tasks.index.listByAssignee, () => {
					invariant(sessionId, 'sessionId required');
					return { sessionId };
				})
			: null;

	const actionItems = $derived(actionItemsQuery?.data ?? []);

	// Computed counts
	const allCount = $derived(actionItems.length);
	const todoCount = $derived(actionItems.filter((item) => item.status === 'todo').length);
	const inProgressCount = $derived(
		actionItems.filter((item) => item.status === 'in-progress').length
	);
	const doneCount = $derived(actionItems.filter((item) => item.status === 'done').length);

	// Filter action items by status
	const filteredItems = $derived(() => {
		if (activeFilter === 'all') return actionItems;
		return actionItems.filter((item) => item.status === activeFilter);
	});

	// Handle toggle status
	async function handleToggleStatus(
		actionItemId: Id<'tasks'>,
		currentStatus: 'todo' | 'in-progress' | 'done'
	) {
		try {
			// Cycle through states: todo -> in-progress -> done -> todo
			let newStatus: 'todo' | 'in-progress' | 'done';
			if (currentStatus === 'todo') newStatus = 'in-progress';
			else if (currentStatus === 'in-progress') newStatus = 'done';
			else newStatus = 'todo';

			await convexClient?.mutation(api.features.tasks.index.updateStatus, {
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
		// Get workspace slug from page params (component is used in /w/[slug]/dashboard)
		const slug = $page.params.slug;
		if (!slug) {
			console.error('Cannot navigate to meeting: workspace slug not available');
			return;
		}
		goto(resolveRoute(`/w/${slug}/meetings/${meetingId}`));
	}

	// Format date
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString(DEFAULT_LOCALE, DEFAULT_SHORT_DATE_FORMAT);
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
		if (status === 'done') return 'text-success';
		if (status === 'in-progress') return 'text-accent-primary';
		return 'text-text-tertiary';
	}
</script>

<!-- Filter Tabs -->
<Tabs.Root bind:value={activeFilter}>
	<Tabs.List
		class="mb-content-section size-tab rounded-tab-container border-border-base flex gap-2 border-b"
	>
		<Tabs.Trigger
			value="all"
			class="py-nav-item text-small text-text-secondary hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary border-b-2 border-transparent px-2 font-medium transition-colors"
		>
			All <Badge>{allCount}</Badge>
		</Tabs.Trigger>
		<Tabs.Trigger
			value="todo"
			class="py-nav-item text-small text-text-secondary hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary border-b-2 border-transparent px-2 font-medium transition-colors"
		>
			To Do <Badge>{todoCount}</Badge>
		</Tabs.Trigger>
		<Tabs.Trigger
			value="in-progress"
			class="py-nav-item text-small text-text-secondary hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary border-b-2 border-transparent px-2 font-medium transition-colors"
		>
			In Progress <Badge>{inProgressCount}</Badge>
		</Tabs.Trigger>
		<Tabs.Trigger
			value="done"
			class="py-nav-item text-small text-text-secondary hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary border-b-2 border-transparent px-2 font-medium transition-colors"
		>
			Done <Badge>{doneCount}</Badge>
		</Tabs.Trigger>
	</Tabs.List>

	<!-- Action Items List -->
	<Tabs.Content value={activeFilter}>
		{#if actionItemsQuery?.isLoading}
			<div class="text-text-secondary text-center" style="padding-block: var(--spacing-8);">
				Loading action items...
			</div>
		{:else if filteredItems().length === 0}
			<!-- Empty State -->
			<div
				class="border-border-base rounded-card bg-surface border border-dashed text-center"
				style="padding-block: var(--spacing-8);"
			>
				<svg
					class="icon-xl text-text-tertiary mx-auto"
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
				<p class="mt-content-section text-small text-text-primary font-medium">
					{#if activeFilter === 'all'}
						No action items yet
					{:else if activeFilter === 'todo'}
						No action items to do
					{:else if activeFilter === 'in-progress'}
						No action items in progress
					{:else}
						No completed action items
					{/if}
				</p>
				<p class="mt-form-section text-small text-text-tertiary">
					Action items are created during meetings and appear here.
				</p>
			</div>
		{:else}
			<!-- List of action items -->
			<div class="divide-border-base border-border-base rounded-card bg-surface divide-y border">
				{#each filteredItems() as item (item._id)}
					<div
						class="group p-inbox-card hover:bg-surface-hover gap-2-gap flex items-start transition-colors"
					>
						<!-- Status Checkbox -->
						<button
							onclick={() => handleToggleStatus(item._id, item.status)}
							class="flex-shrink-0"
							aria-label="Toggle status"
						>
							<div
								class="rounded-avatar flex h-5 w-5 items-center justify-center {getStatusColor(
									item.status
								)} transition-colors hover:scale-110"
							>
								<span class="text-body font-medium">
									{getStatusIcon(item.status)}
								</span>
							</div>
						</button>

						<!-- Content -->
						<div class="min-w-0 flex-1">
							<p
								class="text-small text-text-primary {item.status === 'done'
									? 'line-through opacity-60'
									: ''}"
							>
								{item.description}
							</p>

							<!-- Metadata -->
							<div
								class="mt-content-section gap-content-section text-text-tertiary text-label flex flex-wrap items-center"
							>
								<!-- Task Badge (tasks are always individual tasks, no type field) -->
								<span
									class="rounded-chip border-border-base px-badge py-badge bg-surface inline-flex items-center border"
									style="gap: var(--spacing-1);"
								>
									⚡ Task
								</span>

								<!-- Due Date -->
								{#if item.dueDate}
									<span class="inline-flex items-center" style="gap: var(--spacing-1);">
										<svg class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
									class="hover:text-accent-hover text-accent-primary inline-flex items-center transition-colors"
									style="gap: var(--spacing-1);"
								>
									<svg class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
	</Tabs.Content>
</Tabs.Root>
