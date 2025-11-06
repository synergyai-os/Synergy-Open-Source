<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { Button } from 'bits-ui';
	import type { Id } from '../../../../convex/_generated/dataModel';

	type Flashcard = {
		_id: Id<'flashcards'>;
		question: string;
		answer: string;
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

	const convexClient = browser ? useConvexClient() : null;

	// Query tags for this flashcard
	const tagsQuery = browser
		? useQuery(api.flashcards.getFlashcardTags, () => ({
				flashcardId: flashcard._id,
			}))
		: null;

	const tags = $derived(tagsQuery?.data ?? []);

	// Format date
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
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

<div class="flex flex-col gap-settings-section h-full">
	<!-- Tags Section -->
	<div class="flex flex-col gap-section pb-settings-row border-b border-base">
		<h3 class="text-label text-secondary uppercase tracking-wider mb-2">Tags</h3>
		{#if tagsQuery?.isLoading}
			<p class="text-sm text-secondary">Loading tags...</p>
		{:else if tags.length === 0}
			<p class="text-sm text-secondary">No tags</p>
		{:else}
			<div class="flex flex-wrap gap-icon">
				{#each tags as tag}
					<span
						class="inline-flex items-center px-badge py-badge rounded-md text-label font-medium"
						style="background-color: {tag.color}20; color: {tag.color}; border: 1px solid {tag.color}40;"
					>
						{tag.displayName}
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<!-- FSRS Stats Section -->
	<div class="flex flex-col gap-section pb-settings-row border-b border-base">
		<h3 class="text-label text-secondary uppercase tracking-wider mb-2">FSRS Stats</h3>
		<div class="flex flex-col gap-settings-row">
			<div class="flex justify-between items-center">
				<span class="text-sm text-secondary">Stability</span>
				<span class="text-sm font-medium text-primary">
					{flashcard.fsrsStability?.toFixed(2) ?? 'N/A'}
				</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm text-secondary">Difficulty</span>
				<span class="text-sm font-medium text-primary">
					{flashcard.fsrsDifficulty?.toFixed(2) ?? 'N/A'}
				</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm text-secondary">State</span>
				<span class="text-sm font-medium text-primary capitalize">
					{flashcard.fsrsState ?? 'new'}
				</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm text-secondary">Next Review</span>
				<span class="text-sm font-medium text-primary">
					{formatNextReview(flashcard.fsrsDue)}
				</span>
			</div>
		</div>
	</div>

	<!-- Review History Section -->
	<div class="flex flex-col gap-section pb-settings-row border-b border-base">
		<h3 class="text-label text-secondary uppercase tracking-wider mb-2">Review History</h3>
		<div class="flex flex-col gap-settings-row">
			<div class="flex justify-between items-center">
				<span class="text-sm text-secondary">Total Reviews</span>
				<span class="text-sm font-medium text-primary">{reviewCount}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm text-secondary">Lapses</span>
				<span class="text-sm font-medium text-primary">{flashcard.lapses || 0}</span>
			</div>
			{#if flashcard.lastReviewAt}
				<div class="flex justify-between items-center">
					<span class="text-sm text-secondary">Last Reviewed</span>
					<span class="text-sm font-medium text-primary">
						{formatDate(flashcard.lastReviewAt)}
					</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Card Info Section -->
	<div class="flex flex-col gap-section pb-settings-row border-b border-base">
		<h3 class="text-label text-secondary uppercase tracking-wider mb-2">Card Info</h3>
		<div class="flex flex-col gap-settings-row">
			<div class="flex justify-between items-center">
				<span class="text-sm text-secondary">Created</span>
				<span class="text-sm font-medium text-primary">{formatDate(flashcard.createdAt)}</span>
			</div>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex flex-col gap-section mt-auto pt-settings-section">
		<Button.Root
			onclick={onEdit}
			class="w-full px-nav-item py-nav-item text-sm font-medium rounded-md bg-elevated border border-base hover:bg-hover-solid transition-colors text-primary"
		>
			Edit Card
		</Button.Root>
		<Button.Root
			onclick={onDelete}
			class="w-full px-nav-item py-nav-item text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
		>
			Delete Card
		</Button.Root>
	</div>
</div>

