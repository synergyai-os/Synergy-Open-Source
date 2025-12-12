<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import ShareTagModal from '$lib/modules/core/components/ShareTagModal.svelte';
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';
	import { AnalyticsEventName } from '$lib/infrastructure/analytics/events';
	import type { Id } from '$lib/convex';
	import { invariant } from '$lib/utils/invariant';

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const convexClient = useConvexClient();

	// Get sessionId from page data
	const getSessionId = () => $page.data.sessionId;

	// Get workspace data for sharing
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const organizationSummaries = $derived(() => {
		if (!workspaces) return [];
		return workspaces.workspaces ?? [];
	});
	const activeWorkspaceId = $derived(() => {
		if (!workspaces) return null;
		return workspaces.activeWorkspaceId ?? null;
	});

	// Fetch user's tags filtered by active workspace
	const tagsQuery =
		browser && getSessionId()
			? useQuery(api.features.tags.index.listUserTags, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required'); // Should not happen due to outer check
					const orgId = activeWorkspaceId();
					return {
						sessionId,
						...(orgId ? { workspaceId: orgId as Id<'workspaces'> } : {})
					};
				})
			: null;
	const userTags = $derived(tagsQuery?.data ?? []);
	const isLoading = $derived(tagsQuery?.isLoading ?? false);

	// Modal state
	let showShareModal = $state(false);
	let selectedTagForSharing = $state<(typeof userTags)[0] | null>(null);
	let isSharing = $state(false);

	function openShareModal(tag: (typeof userTags)[0]) {
		selectedTagForSharing = tag;
		showShareModal = true;
	}

	function closeShareModal() {
		showShareModal = false;
		selectedTagForSharing = null;
	}

	async function handleShare(shareWith: 'workspace', targetId: string) {
		if (!selectedTagForSharing || !convexClient) return;

		isSharing = true;

		try {
			const sessionId = getSessionId();
			invariant(sessionId, 'Session ID is required');

			const result = await convexClient.mutation(api.features.tags.index.createTagShare, {
				sessionId,
				tagId: selectedTagForSharing._id,
				shareWith,
				workspaceId: targetId as Id<'workspaces'>
			});

			// TEMPORARY: Client-side PostHog capture for testing
			// TODO: Move to server-side via HTTP action bridge
			if (browser && typeof posthog !== 'undefined') {
				const org = organizationSummaries().find((o) => o.workspaceId === targetId);

				posthog.capture(AnalyticsEventName.TAG_SHARED, {
					scope: shareWith,
					tag_id: selectedTagForSharing._id,
					tag_name: selectedTagForSharing.displayName,
					shared_from: 'user',
					shared_at: Date.now(),
					organization_id: targetId,
					organization_name: org?.name,
					content_type: 'highlights',
					shared_via: 'tags_page'
				});

				console.log('📊 [TEST] PostHog event captured:', AnalyticsEventName.TAG_SHARED, {
					scope: shareWith,
					tag_id: selectedTagForSharing._id,
					tag_name: selectedTagForSharing.displayName,
					organization_name: org?.name
				});
			}

			console.log('✅ Tag shared successfully:', result);
			closeShareModal();
		} catch (error) {
			console.error('❌ Failed to share tag:', error);
			alert(`Failed to share tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isSharing = false;
		}
	}

	// Get current context (users always have an workspace)
	const currentOrganizationId = $derived(activeWorkspaceId());

	// Group tags by ownership - all tags are already filtered by workspaceId in the query
	const organizationTags = $derived(() => {
		// Tags for the active workspace (already filtered by backend query)
		return userTags.filter(
			(t) => t.ownershipType === 'workspace' && t.workspaceId === currentOrganizationId
		);
	});

	const userTagsList = $derived(() => {
		// User-owned tags (no workspaceId) - shown in all org contexts
		return userTags.filter((t) => !t.workspaceId || t.ownershipType === 'user');
	});
</script>

<!-- Page Header -->
<div
	class="h-system-header border-base py-system-header bg-base px-page sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b"
>
	<div class="flex items-center gap-2">
		<svg class="text-accent-primary h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
			/>
		</svg>
		<h2 class="text-secondary text-sm font-normal">Tags & Collections</h2>
	</div>
</div>

<!-- Page Content -->
<div class="flex-1 overflow-auto">
	<div class="px-page mx-auto max-w-4xl py-8">
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<p class="text-secondary">Loading tags...</p>
			</div>
		{:else if userTagsList().length === 0 && organizationTags().length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<svg
					class="text-tertiary mb-4 h-16 w-16"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
					/>
				</svg>
				<h3 class="text-primary mb-2 text-lg font-semibold">No tags yet</h3>
				<p class="text-secondary max-w-md text-sm">
					Tags help you organize your highlights and flashcards. Create your first tag from the
					inbox or study pages.
				</p>
			</div>
		{:else}
			<!-- User Tags Section -->
			{#if userTagsList().length > 0}
				<div class="mb-8">
					<h3 class="text-primary mb-4 flex items-center gap-2 text-sm font-semibold">
						<span>Your Tags</span>
						<span class="text-tertiary text-xs font-normal">({userTagsList().length})</span>
					</h3>
					<div class="space-y-2">
						{#each userTagsList() as tag (tag._id)}
							<div
								class="border-base p-inbox-container hover:border-accent-primary/50 bg-elevated rounded-lg border transition-colors"
							>
								<div class="flex items-center justify-between">
									<div class="gap-2-wide flex min-w-0 flex-1 items-center">
										<div
											class="h-3 w-3 flex-shrink-0 rounded-full"
											style="background-color: {tag.color}"
										></div>
										<div class="flex min-w-0 flex-col">
											<span class="text-primary truncate text-sm font-medium"
												>{tag.displayName}</span
											>
										</div>
									</div>
									{#if currentOrganizationId}
										<button
											type="button"
											onclick={() => openShareModal(tag)}
											class="hover:bg-accent-primary/10 text-accent-primary flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
										>
											Share...
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Organization Tags Section -->
			{#if organizationTags().length > 0}
				<div>
					<h3 class="text-primary mb-4 flex items-center gap-2 text-sm font-semibold">
						<span>Organization Tags</span>
						<span class="text-tertiary text-xs font-normal">({organizationTags().length})</span>
					</h3>
					<div class="space-y-2">
						{#each organizationTags() as tag (tag._id)}
							<div class="border-base p-inbox-container bg-elevated rounded-lg border">
								<div class="flex items-center justify-between">
									<div class="gap-2-wide flex min-w-0 flex-1 items-center">
										<div
											class="h-3 w-3 flex-shrink-0 rounded-full"
											style="background-color: {tag.color}"
										></div>
										<div class="flex min-w-0 flex-col">
											<span class="text-primary truncate text-sm font-medium"
												>{tag.displayName}</span
											>
											<span class="text-label text-tertiary">
												{#if tag.ownershipType === 'workspace'}
													Shared with workspace
												{:else if tag.ownershipType === 'team'}
													Shared with team
												{/if}
											</span>
										</div>
									</div>
									<span class="text-tertiary flex flex-shrink-0 items-center gap-1 text-xs">
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											/>
										</svg>
										Shared
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Share Tag Modal -->
{#if showShareModal && selectedTagForSharing}
	<ShareTagModal
		tag={selectedTagForSharing}
		workspaces={organizationSummaries()}
		{isSharing}
		onShare={handleShare}
		onClose={closeShareModal}
	/>
{/if}
