<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { browser } from '$app/environment';
	import FlashcardComponent from '$lib/components/Flashcard.svelte';

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

	let { open, flashcards, sourceContext, onClose, onApproveAll, onApproveSelected, onRejectAll }: Props =
		$props();

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

	function handleApproveAll() {
		approvedCards = [...reviewQueue];
		reviewQueue = [];
		onApproveAll();
		onClose();
	}

	function handleRejectAll() {
		rejectedCards = [...reviewQueue];
		reviewQueue = [];
		onRejectAll();
		onClose();
	}

	function updateFlashcard(field: 'question' | 'answer', value: string) {
		if (currentCard) {
			currentCard[field] = value;
			reviewQueue = [...reviewQueue];
		}
	}
</script>

<Dialog.Root
	open={open}
	onOpenChange={(isOpen) => {
		if (!isOpen) onClose();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 bg-black/50 z-50 transition-opacity" />
		<Dialog.Content
			class="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-elevated sm:rounded-lg shadow-xl sm:border border-base sm:max-w-4xl w-full h-full sm:h-[90vh] overflow-hidden z-50 flex flex-col"
		>
			<!-- Header -->
			<div class="px-inbox-container py-system-header h-system-header border-b border-base flex items-center justify-between flex-shrink-0 gap-icon">
				<div class="flex-1 min-w-0">
					<h2 class="text-lg font-semibold text-primary mb-2">Review Flashcards</h2>
					<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-icon text-sm">
						{#if sourceContext}
							<p class="text-secondary">From: {sourceContext}</p>
						{/if}
						{#if sourceContext}
							<span class="hidden sm:inline text-secondary">•</span>
						{/if}
						<p class="font-medium text-primary">{progressText}</p>
					</div>
				</div>
				<Dialog.Close
					type="button"
					onclick={onClose}
					class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary flex-shrink-0"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			<div class="flex-1 flex items-center justify-center p-inbox-container overflow-auto relative">
				{#if reviewQueue.length === 0}
					<div class="text-center py-readable-quote">
						<div class="text-6xl mb-4">✅</div>
						<p class="text-lg font-semibold text-primary mb-2">Review Complete!</p>
						<p class="text-secondary">
							Approved: {approvedCards.length} • Rejected: {rejectedCards.length}
						</p>
					</div>
				{:else if currentCard}
					<!-- Hotkey Hint: Decline (Left) -->
					<div class="absolute left-4 flex flex-col items-center gap-2 z-20 opacity-60">
						<div class="flex flex-col items-center gap-1">
							<!-- Keyboard key -->
							<div class="flex items-center justify-center w-12 h-12 rounded-lg bg-elevated border-2 border-base shadow-sm">
								<svg class="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
								</svg>
							</div>
							<!-- Small label -->
							<span class="text-xs text-secondary font-medium">Decline</span>
						</div>
					</div>

					<!-- Card Container with Animation -->
					<div
						class="relative transition-all duration-400 {isAnimating
							? (showFeedback === 'approved'
								? 'translate-x-full opacity-0 scale-95'
								: 'translate-x-[-100%] opacity-0 scale-95')
							: 'translate-x-0 opacity-100 scale-100'}"
						style="width: 500px; height: 700px; max-width: calc(100% - 2rem); max-height: calc(100% - 2rem);"
					>
						<!-- Visual Feedback Overlay -->
						{#if showFeedback}
							<div
								class="absolute inset-0 z-10 flex items-center justify-center rounded-lg {showFeedback === 'approved'
									? 'bg-green-500/20'
									: 'bg-red-500/20'}"
							>
								<svg
									class="w-20 h-20 {showFeedback === 'approved' ? 'text-green-500' : 'text-red-500'}"
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
						<div class="relative w-full h-full">
							<FlashcardComponent
								flashcard={currentCard}
								isFlipped={isFlipped}
								onFlip={handleFlip}
								editable={editMode}
								onQuestionChange={(value) => updateFlashcard('question', value)}
								onAnswerChange={(value) => updateFlashcard('answer', value)}
							/>
						</div>
					</div>

					<!-- Hotkey Hint: Accept (Right) -->
					<div class="absolute right-4 flex flex-col items-center gap-2 z-20 opacity-60">
						<div class="flex flex-col items-center gap-1">
							<!-- Keyboard key -->
							<div class="flex items-center justify-center w-12 h-12 rounded-lg bg-elevated border-2 border-base shadow-sm">
								<svg class="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
								</svg>
							</div>
							<!-- Small label -->
							<span class="text-xs text-secondary font-medium">Accept</span>
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
