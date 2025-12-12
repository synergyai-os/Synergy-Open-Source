<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import StudyCard from '$lib/modules/flashcards/components/StudyCard.svelte';
	import TagFilter from '$lib/modules/core/components/TagFilter.svelte';
	import { Button } from 'bits-ui';
	import { api } from '$lib/convex';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type { FlashcardsModuleAPI } from '$lib/modules/flashcards/api';
	import type { Id } from '$lib/convex';
	import { invariant } from '$lib/utils/invariant';

	const getSessionId = () => $page.data.sessionId;

	// Get flashcards API from context (enables loose coupling - see SYOS-315)
	const flashcardsAPI = getContext<FlashcardsModuleAPI | undefined>('flashcards-api');

	// Initialize study session composable via API
	invariant(flashcardsAPI, 'FlashcardsModuleAPI not available in context');
	const study = flashcardsAPI.useStudySession({
		sessionId: getSessionId
	});

	// Get workspace context
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const activeWorkspaceId = $derived(() => workspaces?.activeWorkspaceId ?? null);

	// Query all tags for filtering (filtered by active workspace)
	const allTagsQuery =
		browser && getSessionId()
			? useQuery(api.features.tags.index.listAllTags, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required'); // Should not happen due to outer check
					const orgId = activeWorkspaceId();
					return {
						sessionId,
						...(orgId ? { workspaceId: orgId as Id<'workspaces'> } : {})
					};
				})
			: null;
	const allTags = $derived(allTagsQuery?.data ?? []);

	// Keyboard shortcuts for ratings
	$effect(() => {
		if (!browser) return;

		function handleKeyDown(e: KeyboardEvent) {
			// Ignore if user is typing in input/textarea
			const activeElement = document.activeElement;
			const isInputFocused =
				activeElement?.tagName === 'INPUT' ||
				activeElement?.tagName === 'TEXTAREA' ||
				(activeElement instanceof HTMLElement && activeElement.isContentEditable);

			if (isInputFocused) return;

			// ESC to reset session
			if (e.key === 'Escape') {
				study.resetSession();
				return;
			}

			// Up/Down arrows to flip
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				e.preventDefault();
				if (!study.isReviewing) {
					study.flipCard();
				}
				return;
			}

			// Number keys for ratings (only when flipped)
			if (study.isFlipped && !study.isReviewing) {
				if (e.key === '1') {
					e.preventDefault();
					study.rateCard('again');
					return;
				}
				if (e.key === '2') {
					e.preventDefault();
					study.rateCard('hard');
					return;
				}
				if (e.key === '3') {
					e.preventDefault();
					study.rateCard('good');
					return;
				}
				if (e.key === '4') {
					e.preventDefault();
					study.rateCard('easy');
					return;
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	const totalCards = $derived(study.reviewQueue.length + study.cardsReviewed);
	const progressPercent = $derived(totalCards > 0 ? (study.cardsReviewed / totalCards) * 100 : 0);
	const sessionDuration = $derived(
		study.sessionStartTime ? Math.floor((Date.now() - study.sessionStartTime) / 1000) : 0
	);
</script>

<div class="bg-base h-full overflow-y-auto">
	<!-- Header -->
	<div
		class="h-system-header border-base py-system-header bg-surface px-page sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b"
	>
		<h2 class="text-secondary text-sm font-normal">Study Session</h2>
		<div class="flex items-center gap-2">
			{#if study.sessionStartTime}
				<Button.Root
					onclick={() => study.resetSession()}
					class="py-nav-item hover:bg-hover-solid text-secondary hover:text-primary rounded-md px-2 text-sm transition-colors"
				>
					Reset
				</Button.Root>
			{/if}
		</div>
	</div>

	<!-- Content -->
	<div class="p-inbox-container flex min-h-0 flex-1 flex-col items-center justify-center">
		<!-- Tag Filter (shown when no active session) -->
		{#if !study.sessionStartTime && study.reviewQueue.length === 0 && study.cardsReviewed === 0}
			<div class="mx-auto mb-6 w-full max-w-4xl">
				<TagFilter
					selectedTagIds={study.selectedTagIds}
					availableTags={allTags}
					onTagsChange={study.setSelectedTagIds}
				/>
			</div>
		{/if}

		{#if study.isLoading}
			<div class="text-center" style="padding-block: var(--spacing-8);">
				<p class="text-secondary">Loading flashcards...</p>
			</div>
		{:else if study.error}
			<div class="text-center" style="padding-block: var(--spacing-8);">
				<p class="text-primary mb-2 font-medium">Error</p>
				<p class="text-secondary">{study.error}</p>
			</div>
		{:else if study.reviewQueue.length === 0 && study.cardsReviewed === 0}
			<!-- Empty State -->
			<div class="max-w-readable mx-auto text-center" style="padding-block: var(--spacing-8);">
				<div class="mb-4 text-6xl">📚</div>
				<p class="text-primary mb-2 text-lg font-semibold">No cards due for review</p>
				<p class="text-secondary">All caught up! Check back later for more cards to study.</p>
			</div>
		{:else if study.reviewQueue.length === 0 && study.cardsReviewed > 0}
			<!-- Session Complete -->
			<div class="max-w-readable mx-auto text-center" style="padding-block: var(--spacing-8);">
				<div class="mb-4 text-6xl">✅</div>
				<p class="text-primary mb-2 text-lg font-semibold">Session Complete!</p>
				<p class="text-secondary mb-4">
					You reviewed {study.cardsReviewed} card{study.cardsReviewed !== 1 ? 's' : ''} in
					{Math.floor(sessionDuration / 60)}:{String(sessionDuration % 60).padStart(2, '0')}
				</p>
				<Button.Root
					onclick={() => study.startSession()}
					class="px-menu-item py-menu-item bg-accent-primary rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
				>
					Start New Session
				</Button.Root>
			</div>
		{:else if study.currentCard}
			<!-- Study Interface -->
			<div class="mx-auto w-full max-w-4xl">
				<!-- Progress Bar -->
				<div class="mb-6">
					<div class="text-secondary mb-2 flex items-center justify-between text-sm">
						<span>
							Card {study.cardsReviewed + 1} of {totalCards}
						</span>
						<span>{Math.round(progressPercent)}%</span>
					</div>
					<div class="border-base bg-base h-2 w-full overflow-hidden rounded-full border">
						<div
							class="bg-accent-primary h-2 rounded-full transition-all duration-300"
							style="width: {progressPercent}%"
						></div>
					</div>
				</div>

				<!-- Card Container (centered, fixed size) -->
				<div
					class="relative flex flex-1 items-center justify-center overflow-auto"
					style="min-height: 500px;"
				>
					<div
						class="relative transition-all duration-400 {study.isReviewing
							? 'scale-95 opacity-50'
							: 'scale-100 opacity-100'}"
						style="width: 500px; height: 700px; max-width: calc(100% - 2rem); max-height: calc(100% - 2rem);"
					>
						<StudyCard
							flashcard={study.currentCard}
							isFlipped={study.isFlipped}
							onFlip={study.flipCard}
							onRate={study.rateCard}
							isReviewing={study.isReviewing}
						/>
					</div>
				</div>

				<!-- Instructions -->
				<div class="mt-6 text-center">
					<p class="text-secondary text-sm">
						{study.isFlipped ? 'Press 1-4 to rate, ↑/↓ to flip back' : '↑/↓ to flip card'}
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.duration-400 {
		transition-duration: 400ms;
	}
</style>
