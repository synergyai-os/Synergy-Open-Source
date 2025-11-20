<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { browser } from '$app/environment';
	import FlashcardComponent from '$lib/modules/core/components/Flashcard.svelte';

	interface Flashcard {
		question: string;
		answer: string;
	}

	interface Props {
		open: boolean;
		flashcards: Flashcard[];
		sourceContext?: string;
		onClose: () => void;
		onApproveAll: () => void;
		onApproveSelected: (cards: Flashcard[]) => void;
		onRejectAll: () => void;
	}

	let {
		open,
		flashcards,
		sourceContext,
		onClose,
		onApproveAll: _onApproveAll,
		onApproveSelected,
		onRejectAll: _onRejectAll
	}: Props = $props();

	// Study mode state - cards are removed from queue when rated
	let reviewQueue = $state<Flashcard[]>([]);
	let isFlipped = $state(false);
	let approvedCards = $state<Flashcard[]>([]);
	let rejectedCards = $state<Flashcard[]>([]);
	let showFeedback = $state<'approved' | 'rejected' | null>(null);
	let isAnimating = $state(false);
	let editMode = $state(true); // Always enabled - click to edit

	// Initialize when modal opens
	$effect(() => {
		if (open) {
			reviewQueue = flashcards.map((fc) => ({ ...fc }));
			isFlipped = false;
			approvedCards = [];
			rejectedCards = [];
			showFeedback = null;
			isAnimating = false;
			editMode = true;
		}
	});

	// Keyboard navigation
	$effect(() => {
		if (!browser || !open) return;

		function handleKeyDown(e: KeyboardEvent) {
			// Ignore if user is typing in input/textarea
			const activeElement = document.activeElement;
			const isInputFocused =
				activeElement?.tagName === 'INPUT' ||
				activeElement?.tagName === 'TEXTAREA' ||
				(activeElement instanceof HTMLElement && activeElement.isContentEditable);

			if (isInputFocused) return;

			// ESC to close
			if (e.key === 'Escape') {
				onClose();
				return;
			}

			// Up/Down arrows to flip
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				e.preventDefault();
				if (!isAnimating) {
					isFlipped = !isFlipped;
				}
				return;
			}

			// Left = Decline, Right = Accept
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				if (!isAnimating && reviewQueue.length > 0) {
					handleRejectCurrent();
				}
				return;
			}

			if (e.key === 'ArrowRight') {
				e.preventDefault();
				if (!isAnimating && reviewQueue.length > 0) {
					handleApproveCurrent();
				}
				return;
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	const currentCard = $derived(reviewQueue[0]);
	const totalCards = $derived(flashcards.length);
	const remainingCards = $derived(reviewQueue.length);
	const progressText = $derived(
		remainingCards > 0 ? `${totalCards - remainingCards + 1} of ${totalCards}` : 'Complete'
	);

	function handleFlip() {
		if (!isAnimating) {
			isFlipped = !isFlipped;
		}
	}

	function handleApproveCurrent() {
		if (isAnimating || reviewQueue.length === 0) return;

		const card = reviewQueue[0];
		approvedCards.push(card);
		showFeedback = 'approved';
		isAnimating = true;

		// Animate card out (Tinder-like)
		setTimeout(() => {
			// Remove from queue
			reviewQueue = reviewQueue.slice(1);
			isFlipped = false;
			showFeedback = null;
			isAnimating = false;

			// If no more cards, show completion
			if (reviewQueue.length === 0) {
				setTimeout(() => {
					handleComplete();
				}, 300);
			}
		}, 400);
	}

	function handleRejectCurrent() {
		if (isAnimating || reviewQueue.length === 0) return;

		const card = reviewQueue[0];
		rejectedCards.push(card);
		showFeedback = 'rejected';
		isAnimating = true;

		// Animate card out (Tinder-like)
		setTimeout(() => {
			// Remove from queue
			reviewQueue = reviewQueue.slice(1);
			isFlipped = false;
			showFeedback = null;
			isAnimating = false;

			// If no more cards, show completion
			if (reviewQueue.length === 0) {
				setTimeout(() => {
					handleComplete();
				}, 300);
			}
		}, 400);
	}

	function handleComplete() {
		// Save approved cards (with any edits applied)
		if (approvedCards.length > 0) {
			onApproveSelected(approvedCards);
		}
		onClose();
	}

	// TODO: Re-enable when needed
	// function handleApproveAll() {
	// 	approvedCards = [...reviewQueue];
	// 	reviewQueue = [];
	// 	onApproveAll();
	// 	onClose();
	// }

	// TODO: Re-enable when needed
	// function handleRejectAll() {
	// 	rejectedCards = [...reviewQueue];
	// 	reviewQueue = [];
	// 	onRejectAll();
	// 	onClose();
	// }

	function updateFlashcard(field: 'question' | 'answer', value: string) {
		if (currentCard) {
			currentCard[field] = value;
			reviewQueue = [...reviewQueue];
		}
	}
</script>

<Dialog.Root
	{open}
	onOpenChange={(isOpen) => {
		if (!isOpen) onClose();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 transition-opacity" />
		<Dialog.Content
			class="fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden border-base bg-elevated shadow-xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[90vh] sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border"
		>
			<!-- Header -->
			<div
				class="flex h-system-header flex-shrink-0 items-center justify-between gap-icon border-b border-base px-inbox-container py-system-header"
			>
				<div class="min-w-0 flex-1">
					<h2 class="mb-2 text-lg font-semibold text-primary">Review Flashcards</h2>
					<div class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-icon">
						{#if sourceContext}
							<p class="text-secondary">From: {sourceContext}</p>
						{/if}
						{#if sourceContext}
							<span class="hidden text-secondary sm:inline">•</span>
						{/if}
						<p class="font-medium text-primary">{progressText}</p>
					</div>
				</div>
				<Dialog.Close
					type="button"
					onclick={onClose}
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</Dialog.Close>
			</div>

			<!-- Content - Flashcard Display (Centered) -->
			<div class="relative flex flex-1 items-center justify-center overflow-auto p-inbox-container">
				{#if reviewQueue.length === 0}
					<div class="py-readable-quote text-center">
						<div class="mb-4 text-6xl">✅</div>
						<p class="mb-2 text-lg font-semibold text-primary">Review Complete!</p>
						<p class="text-secondary">
							Approved: {approvedCards.length} • Rejected: {rejectedCards.length}
						</p>
					</div>
				{:else if currentCard}
					<!-- Hotkey Hint: Decline (Left) -->
					<div class="absolute left-4 z-20 flex flex-col items-center gap-2 opacity-60">
						<div class="flex flex-col items-center gap-1">
							<!-- Keyboard key -->
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-base bg-elevated shadow-sm"
							>
								<svg
									class="h-7 w-7 text-secondary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2.5"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</div>
							<!-- Small label -->
							<span class="text-xs font-medium text-secondary">Decline</span>
						</div>
					</div>

					<!-- Card Container with Animation -->
					<div
						class="relative transition-all duration-400 {isAnimating
							? showFeedback === 'approved'
								? 'translate-x-full scale-95 opacity-0'
								: 'translate-x-[-100%] scale-95 opacity-0'
							: 'translate-x-0 scale-100 opacity-100'}"
						style="width: 500px; height: 700px; max-width: calc(100% - 2rem); max-height: calc(100% - 2rem);"
					>
						<!-- Visual Feedback Overlay -->
						{#if showFeedback}
							<div
								class="absolute inset-0 z-10 flex items-center justify-center rounded-lg {showFeedback ===
								'approved'
									? 'bg-green-500/20'
									: 'bg-red-500/20'}"
							>
								<svg
									class="h-20 w-20 {showFeedback === 'approved'
										? 'text-green-500'
										: 'text-red-500'}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									{#if showFeedback === 'approved'}
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									{:else}
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									{/if}
								</svg>
							</div>
						{/if}

						<!-- Flashcard Component -->
						<div class="relative h-full w-full">
							<FlashcardComponent
								flashcard={currentCard}
								{isFlipped}
								onFlip={handleFlip}
								editable={editMode}
								onQuestionChange={(value) => updateFlashcard('question', value)}
								onAnswerChange={(value) => updateFlashcard('answer', value)}
							/>
						</div>
					</div>

					<!-- Hotkey Hint: Accept (Right) -->
					<div class="absolute right-4 z-20 flex flex-col items-center gap-2 opacity-60">
						<div class="flex flex-col items-center gap-1">
							<!-- Keyboard key -->
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-base bg-elevated shadow-sm"
							>
								<svg
									class="h-7 w-7 text-secondary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2.5"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
							<!-- Small label -->
							<span class="text-xs font-medium text-secondary">Accept</span>
						</div>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.duration-400 {
		transition-duration: 400ms;
	}
</style>
