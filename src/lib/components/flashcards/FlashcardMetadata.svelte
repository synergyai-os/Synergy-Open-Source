<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { Button } from 'bits-ui';
	import type { Id } from '../../../../convex/_generated/dataModel';
	import type { OrganizationsModuleAPI } from '$lib/composables/useOrganizations.svelte';
	import type { InboxModuleAPI } from '$lib/modules/inbox/api';
	import type { CoreModuleAPI } from '$lib/modules/core/api';

	type Flashcard = {
		_id: Id<'flashcards'>;
		fsrsStability?: number;
		fsrsDifficulty?: number;
		fsrsDue?: number;
		fsrsState?: 'new' | 'learning' | 'review' | 'relearning';
		reps: number;
		lapses: number;
		lastReviewAt?: number;
		createdAt: number;
	};

	type Props = {
		flashcard: Flashcard;
		onEdit: () => void;
		onDelete: () => void;
	};

	let { flashcard, onEdit, onDelete }: Props = $props();

	const _convexClient = browser ? useConvexClient() : null;
	const getUserId = () => $page.data.user?.userId;
	const getSessionId = () => $page.data.sessionId;

	// Get workspace context for organization filtering
	const organizations = getContext<OrganizationsModuleAPI | undefined>('organizations');
	const activeOrganizationId = $derived(() => organizations?.activeOrganizationId ?? null);

	// Get core module API from context for TagSelector (enables loose coupling - see SYOS-308)
	const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
	const TagSelector = coreAPI?.TagSelector;

	// Get inbox module API from context for tagging composable (enables loose coupling - see SYOS-306)
	const inboxAPI = getContext<InboxModuleAPI | undefined>('inbox-api');
	// Setup tagging system for flashcards using inbox API
	const tagging = inboxAPI?.useTagging('flashcard', getUserId, getSessionId, () =>
		activeOrganizationId()
	);

	// Load all available tags (filtered by active organization)
	const allTagsQuery =
		browser && getSessionId()
			? useQuery(api.tags.listAllTags, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					const orgId = activeOrganizationId();
					return {
						sessionId,
						...(orgId ? { organizationId: orgId as Id<'organizations'> } : {})
					};
				})
			: null;
	const availableTags = $derived(allTagsQuery?.data ?? []);

	// Query tags for this flashcard (using the correct endpoint we created)
	const flashcardTagsQuery =
		browser && getSessionId()
			? useQuery(api.tags.getTagsForFlashcard, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					return {
						sessionId,
						flashcardId: flashcard._id
					};
				})
			: null;

	// TODO: Re-enable when needed
	// const tags = $derived(flashcardTagsQuery?.data ?? []);

	// Track selected tag IDs for TagSelector
	let selectedTagIds = $state<Id<'tags'>[]>([]);

	// Track tag combobox open state for keyboard shortcut
	let tagComboboxOpen = $state(false);

	// Update selectedTagIds when tags load
	$effect(() => {
		if (flashcardTagsQuery?.data) {
			selectedTagIds = flashcardTagsQuery.data.map((t) => t._id);
		}
	});

	// Handle tag changes
	async function handleTagsChange(newTagIds: Id<'tags'>[]) {
		if (!tagging) {
			console.error('Tagging API not available');
			return;
		}
		try {
			await tagging.assignTags(flashcard._id, newTagIds);
		} catch (error) {
			console.error('Failed to assign tags:', error);
		}
	}

	// Handle new tag creation
	async function handleCreateTag(
		displayName: string,
		color: string,
		parentId?: Id<'tags'>
	): Promise<Id<'tags'>> {
		if (!tagging) {
			throw new Error('Tagging API not available');
		}
		try {
			return await tagging.createTag(displayName, color, parentId);
		} catch (error) {
			console.error('Failed to create tag:', error);
			throw error;
		}
	}

	// Keyboard shortcut: 'T' to focus tag selector
	function handleKeyDown(event: KeyboardEvent) {
		// Don't trigger if typing in an input/textarea
		const target = event.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
			return;
		}

		// Check for 'T' key
		if (event.key === 't' || event.key === 'T') {
			event.preventDefault();
			// Open the combobox - TagSelector's auto-focus effect will handle focusing the input
			tagComboboxOpen = true;
		}
	}

	// Add keyboard event listener
	if (browser) {
		$effect(() => {
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		});
	}

	// Format date
	function formatDate(timestamp: number): string {
		const _date = new Date(timestamp);
		const now = Date.now();
		const diffMs = now - timestamp;
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return `${Math.floor(diffDays / 365)} years ago`;
	}

	// Format next review date
	function formatNextReview(due?: number): string {
		if (!due) return 'Not scheduled';
		const now = Date.now();
		const diffMs = due - now;
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return 'Overdue';
		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Tomorrow';
		if (diffDays < 7) return `In ${diffDays} days`;
		if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
		return `In ${Math.floor(diffDays / 30)} months`;
	}

	// Get review count (we'll need to query this separately or add to flashcard)
	// For now, using reps as a proxy
	const reviewCount = $derived(flashcard.reps || 0);
</script>

<div class="flex h-full flex-col gap-settings-section">
	<!-- Tags Section - Now Interactive! -->
	{#if TagSelector}
		<div class="gap-section pb-settings-row flex flex-col border-b border-base">
			<TagSelector
				bind:comboboxOpen={tagComboboxOpen}
				bind:selectedTagIds
				{availableTags}
				onTagsChange={handleTagsChange}
				onCreateTagWithColor={handleCreateTag}
			/>
		</div>
	{/if}

	<!-- FSRS Stats Section -->
	<div class="gap-section pb-settings-row flex flex-col border-b border-base">
		<h3 class="mb-2 text-label tracking-wider text-secondary uppercase">FSRS Stats</h3>
		<div class="flex flex-col gap-settings-row">
			<div class="flex items-center justify-between">
				<span class="text-sm text-secondary">Stability</span>
				<span class="text-sm font-medium text-primary">
					{flashcard.fsrsStability?.toFixed(2) ?? 'N/A'}
				</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-secondary">Difficulty</span>
				<span class="text-sm font-medium text-primary">
					{flashcard.fsrsDifficulty?.toFixed(2) ?? 'N/A'}
				</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-secondary">State</span>
				<span class="text-sm font-medium text-primary capitalize">
					{flashcard.fsrsState ?? 'new'}
				</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-secondary">Next Review</span>
				<span class="text-sm font-medium text-primary">
					{formatNextReview(flashcard.fsrsDue)}
				</span>
			</div>
		</div>
	</div>

	<!-- Review History Section -->
	<div class="gap-section pb-settings-row flex flex-col border-b border-base">
		<h3 class="mb-2 text-label tracking-wider text-secondary uppercase">Review History</h3>
		<div class="flex flex-col gap-settings-row">
			<div class="flex items-center justify-between">
				<span class="text-sm text-secondary">Total Reviews</span>
				<span class="text-sm font-medium text-primary">{reviewCount}</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-secondary">Lapses</span>
				<span class="text-sm font-medium text-primary">{flashcard.lapses || 0}</span>
			</div>
			{#if flashcard.lastReviewAt}
				<div class="flex items-center justify-between">
					<span class="text-sm text-secondary">Last Reviewed</span>
					<span class="text-sm font-medium text-primary">
						{formatDate(flashcard.lastReviewAt)}
					</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Card Info Section -->
	<div class="gap-section pb-settings-row flex flex-col border-b border-base">
		<h3 class="mb-2 text-label tracking-wider text-secondary uppercase">Card Info</h3>
		<div class="flex flex-col gap-settings-row">
			<div class="flex items-center justify-between">
				<span class="text-sm text-secondary">Created</span>
				<span class="text-sm font-medium text-primary">{formatDate(flashcard.createdAt)}</span>
			</div>
		</div>
	</div>

	<!-- Actions -->
	<div class="gap-section pt-settings-section mt-auto flex flex-col">
		<Button.Root
			onclick={onEdit}
			class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm font-medium text-primary transition-colors hover:bg-hover-solid"
		>
			Edit Card
		</Button.Root>
		<Button.Root
			onclick={onDelete}
			class="w-full rounded-md bg-red-600 px-nav-item py-nav-item text-sm font-medium text-white transition-colors hover:bg-red-700"
		>
			Delete Card
		</Button.Root>
	</div>
</div>
