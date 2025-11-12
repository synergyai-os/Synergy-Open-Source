<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useQuery } from 'convex-svelte';
	import { useStudySession } from '$lib/composables/useStudySession.svelte';
	import StudyCard from '$lib/components/study/StudyCard.svelte';
	import TagFilter from '$lib/components/TagFilter.svelte';
	import { Button } from 'bits-ui';
	import { api } from '$lib/convex';

	const getSessionId = () => $page.data.sessionId;
	const study = useStudySession(getSessionId);

	// Query all tags for filtering
	const allTagsQuery = browser && getSessionId()
		? useQuery(api.tags.listAllTags, () => {
				const sessionId = getSessionId();
				if (!sessionId) return null;
				return { sessionId };
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

<div class="h-full overflow-y-auto bg-base">
	<!-- Header -->
	<div
		class="sticky top-0 z-10 flex h-system-header flex-shrink-0 items-center justify-between border-b border-base bg-surface px-inbox-container py-system-header"
	>
		<h2 class="text-sm font-normal text-secondary">Study Session</h2>
		<div class="flex items-center gap-icon">
			{#if study.sessionStartTime}
				<Button.Root
					onclick={() => study.resetSession()}
					class="rounded-md px-nav-item py-nav-item text-sm text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
				>
					Reset
				</Button.Root>
			{/if}
		</div>
	</div>

	<!-- Content -->
	<div class="flex min-h-0 flex-1 flex-col items-center justify-center p-inbox-container">
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
			<div class="py-readable-quote text-center">
				<p class="text-secondary">Loading flashcards...</p>
			</div>
		{:else if study.error}
			<div class="py-readable-quote text-center">
				<p class="mb-2 font-medium text-primary">Error</p>
				<p class="text-secondary">{study.error}</p>
			</div>
		{:else if study.reviewQueue.length === 0 && study.cardsReviewed === 0}
			<!-- Empty State -->
			<div class="mx-auto max-w-readable py-readable-quote text-center">
				<div class="mb-4 text-6xl">📚</div>
				<p class="mb-2 text-lg font-semibold text-primary">No cards due for review</p>
				<p class="text-secondary">All caught up! Check back later for more cards to study.</p>
			</div>
		{:else if study.reviewQueue.length === 0 && study.cardsReviewed > 0}
			<!-- Session Complete -->
			<div class="mx-auto max-w-readable py-readable-quote text-center">
				<div class="mb-4 text-6xl">✅</div>
				<p class="mb-2 text-lg font-semibold text-primary">Session Complete!</p>
				<p class="mb-4 text-secondary">
					You reviewed {study.cardsReviewed} card{study.cardsReviewed !== 1 ? 's' : ''} in{' '}
					{Math.floor(sessionDuration / 60)}:{String(sessionDuration % 60).padStart(2, '0')}
				</p>
				<Button.Root
					onclick={() => study.startSession()}
					class="rounded-md bg-accent-primary px-menu-item py-menu-item text-sm font-medium text-white transition-opacity hover:opacity-90"
				>
					Start New Session
				</Button.Root>
			</div>
		{:else if study.currentCard}
			<!-- Study Interface -->
			<div class="mx-auto w-full max-w-4xl">
				<!-- Progress Bar -->
				<div class="mb-6">
					<div class="mb-2 flex items-center justify-between text-sm text-secondary">
						<span>
							Card {study.cardsReviewed + 1} of {totalCards}
						</span>
						<span>{Math.round(progressPercent)}%</span>
					</div>
					<div class="h-2 w-full overflow-hidden rounded-full border border-base bg-base">
						<div
							class="h-2 rounded-full bg-accent-primary transition-all duration-300"
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
					<p class="text-sm text-secondary">
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
