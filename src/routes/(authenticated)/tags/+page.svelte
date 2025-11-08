<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { getContext } from 'svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
	import ShareTagModal from '$lib/components/tags/ShareTagModal.svelte';
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';
	import { AnalyticsEventName } from '$lib/analytics/events';

	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const convexClient = useConvexClient();

	// Fetch user's tags
	const tagsQuery = useQuery(api.tags.listUserTags, () => ({}));
	const userTags = $derived(tagsQuery?.data ?? []);
	const isLoading = $derived(tagsQuery?.isLoading ?? false);

	// Get organization data for sharing
	const organizationSummaries = $derived(() => organizations?.organizations ?? []);
	const activeOrganizationId = $derived(() => organizations?.activeOrganizationId ?? null);

	// Modal state
	let showShareModal = $state(false);
	let selectedTagForSharing = $state<typeof userTags[0] | null>(null);
	let isSharing = $state(false);

	function openShareModal(tag: typeof userTags[0]) {
		selectedTagForSharing = tag;
		showShareModal = true;
	}

	function closeShareModal() {
		showShareModal = false;
		selectedTagForSharing = null;
	}

	async function handleShare(shareWith: 'organization', targetId: string) {
		if (!selectedTagForSharing || !convexClient) return;

		isSharing = true;

		try {
			const result = await convexClient.mutation(api.tags.shareTag, {
				tagId: selectedTagForSharing._id,
				shareWith,
				organizationId: targetId as any,
			});

			// TEMPORARY: Client-side PostHog capture for testing
			// TODO: Move to server-side via HTTP action bridge
			if (browser && typeof posthog !== 'undefined') {
				const org = organizationSummaries().find(o => o.organizationId === targetId);
				
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
					organization_name: org?.name,
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

	// Get current context (personal, org, or team)
	const currentOrganizationId = $derived(activeOrganizationId());
	
	// Group tags by ownership and filter by active context
	const personalTags = $derived(() => {
		// Personal tags only show in personal workspace (no active org)
		if (currentOrganizationId) return [];
		return userTags.filter(t => !t.ownershipType || t.ownershipType === 'user');
	});
	
	const sharedTags = $derived(() => {
		// Shared tags only show when in that org's context
		if (!currentOrganizationId) return [];
		return userTags.filter(t => 
			(t.ownershipType === 'organization' || t.ownershipType === 'team') &&
			t.organizationId === currentOrganizationId
		);
	});
</script>

<!-- Page Header -->
<div class="sticky top-0 z-10 bg-base border-b border-base px-inbox-container py-system-header h-system-header flex items-center justify-between flex-shrink-0">
	<div class="flex items-center gap-icon">
		<svg class="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
		</svg>
		<h2 class="text-sm font-normal text-secondary">Tags & Collections</h2>
	</div>
</div>

<!-- Page Content -->
<div class="flex-1 overflow-auto">
	<div class="max-w-4xl mx-auto px-inbox-container py-8">
		
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<p class="text-secondary">Loading tags...</p>
			</div>
		{:else if personalTags().length === 0 && sharedTags().length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<svg class="w-16 h-16 text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
				</svg>
				<h3 class="text-lg font-semibold text-primary mb-2">
					{#if currentOrganizationId}
						No shared tags yet
					{:else}
						No tags yet
					{/if}
				</h3>
				<p class="text-sm text-secondary max-w-md">
					{#if currentOrganizationId}
						Share a tag from your personal workspace to make it available to your organization.
					{:else}
						Tags help you organize your highlights and flashcards. Create your first tag from the inbox or study pages.
					{/if}
				</p>
			</div>
		{:else}
			<!-- Personal Tags Section -->
			{#if personalTags().length > 0}
				<div class="mb-8">
					<h3 class="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
						<span>Personal Tags</span>
						<span class="text-xs text-tertiary font-normal">({personalTags().length})</span>
					</h3>
					<div class="space-y-2">
						{#each personalTags() as tag (tag._id)}
							<div class="bg-elevated border border-base rounded-lg p-inbox-container hover:border-accent-primary/50 transition-colors">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-icon-wide min-w-0 flex-1">
										<div 
											class="w-3 h-3 rounded-full flex-shrink-0" 
											style="background-color: {tag.color}"
										></div>
										<div class="flex flex-col min-w-0">
											<span class="font-medium text-sm text-primary truncate">{tag.displayName}</span>
											<span class="text-label text-tertiary">Personal workspace</span>
										</div>
									</div>
									<button
										type="button"
										onclick={() => openShareModal(tag)}
										class="px-3 py-1.5 text-sm font-medium text-accent-primary hover:bg-accent-primary/10 rounded-md transition-colors flex-shrink-0"
									>
										Transfer...
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Shared Tags Section -->
			{#if sharedTags().length > 0}
				<div>
					<h3 class="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
						<span>Shared Tags</span>
						<span class="text-xs text-tertiary font-normal">({sharedTags().length})</span>
					</h3>
					<div class="space-y-2">
						{#each sharedTags() as tag (tag._id)}
							<div class="bg-elevated border border-base rounded-lg p-inbox-container">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-icon-wide min-w-0 flex-1">
										<div 
											class="w-3 h-3 rounded-full flex-shrink-0" 
											style="background-color: {tag.color}"
										></div>
										<div class="flex flex-col min-w-0">
											<span class="font-medium text-sm text-primary truncate">{tag.displayName}</span>
											<span class="text-label text-tertiary">
												{#if tag.ownershipType === 'organization'}
													Shared with organization
												{:else if tag.ownershipType === 'team'}
													Shared with team
												{/if}
											</span>
										</div>
									</div>
									<span class="text-xs text-tertiary flex-shrink-0 flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
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
		organizations={organizationSummaries()}
		isSharing={isSharing}
		onShare={handleShare}
		onClose={closeShareModal}
	/>
{/if}

