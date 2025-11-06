<script lang="ts">
	import { browser } from '$app/environment';
	import { Dialog } from 'bits-ui';
	import { useConvexClient } from 'convex-svelte';
	import FlashcardComponent from '$lib/components/Flashcard.svelte';
	import FlashcardMetadata from './FlashcardMetadata.svelte';
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
		open: boolean;
		flashcards: Flashcard[];
		initialIndex?: number;
		collectionName?: string;
		onClose: () => void;
	};

	let { open, flashcards, initialIndex = 0, collectionName, onClose }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	// State
	let currentIndex = $state(initialIndex);
	let isFlipped = $state(false);
	let isEditing = $state(false);
	let isSaving = $state(false);
	let questionValue = $state('');
	let answerValue = $state('');

	// Current card
	const currentCard = $derived(flashcards[currentIndex] ?? null);

	// Sync values when card changes
	$effect(() => {
		if (currentCard) {
			questionValue = currentCard.question;
			answerValue = currentCard.answer;
			isFlipped = false;
			isEditing = false;
		}
	});

	// Reset when modal opens
	$effect(() => {
		if (open) {
			currentIndex = initialIndex;
			isFlipped = false;
			isEditing = false;
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

			if (isInputFocused && e.key !== 'Escape') return;

			// ESC to close
			if (e.key === 'Escape') {
				if (isEditing) {
					// Cancel editing
					isEditing = false;
					if (currentCard) {
						questionValue = currentCard.question;
						answerValue = currentCard.answer;
					}
				} else {
					onClose();
				}
				return;
			}

			// E to edit
			if (e.key === 'e' && !isEditing) {
				e.preventDefault();
				isEditing = true;
				return;
			}

			// Don't handle other keys if editing
			if (isEditing) return;

			// Arrow Left/Right for navigation
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				previousCard();
				return;
			}

			if (e.key === 'ArrowRight') {
				e.preventDefault();
				nextCard();
				return;
			}

			// Arrow Up/Down, Space, Enter to flip
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				flipCard();
				return;
			}

			// Delete key (with confirmation)
			if (e.key === 'Delete' || e.key === 'Backspace') {
				if (e.metaKey || e.ctrlKey) {
					e.preventDefault();
					handleDelete();
				}
				return;
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	function flipCard() {
		if (!isEditing) {
			isFlipped = !isFlipped;
		}
	}

	function nextCard() {
		if (currentIndex < flashcards.length - 1) {
			currentIndex++;
			isFlipped = false;
		}
	}

	function previousCard() {
		if (currentIndex > 0) {
			currentIndex--;
			isFlipped = false;
		}
	}

	async function handleSave() {
		if (!currentCard || !convexClient || isSaving) return;

		// Check if values changed
		if (questionValue === currentCard.question && answerValue === currentCard.answer) {
			isEditing = false;
			return;
		}

		isSaving = true;
		try {
			await convexClient.mutation(api.flashcards.updateFlashcard, {
				flashcardId: currentCard._id,
				question: questionValue,
				answer: answerValue,
			});
			isEditing = false;
		} catch (err) {
			console.error('Failed to update flashcard:', err);
			alert('Failed to save changes. Please try again.');
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		if (currentCard) {
			questionValue = currentCard.question;
			answerValue = currentCard.answer;
		}
		isEditing = false;
	}

	async function handleDelete() {
		if (!currentCard || !convexClient) return;

		if (!confirm('Are you sure you want to delete this flashcard? This action cannot be undone.')) {
			return;
		}

		try {
			await convexClient.mutation(api.flashcards.deleteFlashcard, {
				flashcardId: currentCard._id,
			});

			// Remove from local array
			const cardIndex = flashcards.findIndex((f) => f._id === currentCard._id);
			if (cardIndex !== -1) {
				flashcards.splice(cardIndex, 1);
			}

			// Adjust current index
			if (flashcards.length === 0) {
				// No cards left, close modal
				onClose();
			} else if (currentIndex >= flashcards.length) {
				// Moved past end, go to last card
				currentIndex = flashcards.length - 1;
			}
		} catch (err) {
			console.error('Failed to delete flashcard:', err);
			alert('Failed to delete flashcard. Please try again.');
		}
	}

	function handleQuestionChange(value: string) {
		questionValue = value;
	}

	function handleAnswerChange(value: string) {
		answerValue = value;
	}

	const progressText = $derived(
		`Card ${currentIndex + 1} of ${flashcards.length}`
	);
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
			class="fixed inset-0 bg-base z-50 flex flex-col overflow-hidden"
		>
			<!-- Header -->
			<div
				class="px-inbox-container py-system-header h-system-header border-b border-base flex items-center justify-between flex-shrink-0 gap-icon"
			>
				<div class="flex-1 min-w-0">
					<h2 class="text-lg font-semibold text-primary mb-1">
						{collectionName || 'Flashcards'}
					</h2>
					<p class="text-sm text-secondary">{progressText}</p>
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

			<!-- Content Area -->
			<div class="flex-1 flex overflow-hidden min-h-0 bg-base">
				<!-- Left: Card View -->
				<div class="flex-1 flex items-center justify-center p-inbox-container overflow-auto bg-base">
					{#if currentCard}
						<div
							class="relative transition-all duration-400"
							style="width: 500px; height: 700px; max-width: calc(100% - 2rem); max-height: calc(100% - 2rem);"
						>
							{#if isEditing}
								<!-- Edit Mode -->
								<div class="w-full h-full bg-elevated border-2 border-accent-primary rounded-lg shadow-xl flex flex-col overflow-hidden">
									<div class="flex-1 flex flex-col p-inbox-container overflow-auto">
										<div class="mb-4">
											<label class="block text-sm font-medium text-secondary mb-2">Question</label>
											<textarea
												bind:value={questionValue}
												class="w-full px-inbox-card py-inbox-card rounded-md border border-base bg-base text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
												rows="4"
												placeholder="Question..."
											></textarea>
										</div>
										<div>
											<label class="block text-sm font-medium text-secondary mb-2">Answer</label>
											<textarea
												bind:value={answerValue}
												class="w-full px-inbox-card py-inbox-card rounded-md border border-base bg-base text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
												rows="6"
												placeholder="Answer..."
											></textarea>
										</div>
									</div>
									<div class="px-inbox-container py-system-header border-t border-base flex items-center justify-end gap-icon">
										<Button.Root
											onclick={handleCancel}
											disabled={isSaving}
											class="px-nav-item py-nav-item text-sm font-medium rounded-md bg-base border border-base hover:bg-hover-solid transition-colors disabled:opacity-50"
										>
											Cancel
										</Button.Root>
										<Button.Root
											onclick={handleSave}
											disabled={isSaving}
											class="px-nav-item py-nav-item text-sm font-medium rounded-md bg-accent-primary text-white hover:opacity-90 transition-opacity disabled:opacity-50"
										>
											{isSaving ? 'Saving...' : 'Save'}
										</Button.Root>
									</div>
								</div>
							{:else}
								<!-- View Mode -->
								<FlashcardComponent
									flashcard={{
										question: currentCard.question,
										answer: currentCard.answer,
									}}
									isFlipped={isFlipped}
									onFlip={flipCard}
									editable={false}
								/>
							{/if}
						</div>
					{:else}
						<div class="text-center py-readable-quote">
							<p class="text-secondary">No cards in this collection</p>
						</div>
					{/if}
				</div>

				<!-- Right: Metadata Sidebar -->
				{#if currentCard}
					<div
						class="w-80 border-l border-base bg-surface p-inbox-container overflow-y-auto flex-shrink-0"
					>
						<FlashcardMetadata
							flashcard={currentCard}
							onEdit={() => {
								isEditing = true;
							}}
							onDelete={handleDelete}
						/>
					</div>
				{/if}
			</div>

			<!-- Footer: Navigation -->
			{#if currentCard && !isEditing}
				<div
					class="px-inbox-container py-system-header h-system-header border-t border-base bg-surface flex items-center justify-between flex-shrink-0 gap-icon"
				>
					<Button.Root
						onclick={previousCard}
						disabled={currentIndex === 0}
						class="px-nav-item py-nav-item text-sm font-medium rounded-md bg-elevated border border-base hover:bg-hover-solid transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-elevated flex items-center gap-icon text-secondary disabled:text-tertiary"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Previous
					</Button.Root>

					<div class="flex items-center gap-icon text-sm text-secondary">
						<span class="text-label">Press ↑/↓ or Space to flip</span>
					</div>

					<Button.Root
						onclick={nextCard}
						disabled={currentIndex === flashcards.length - 1}
						class="px-nav-item py-nav-item text-sm font-medium rounded-md bg-elevated border border-base hover:bg-hover-solid transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-elevated flex items-center gap-icon text-secondary disabled:text-tertiary"
					>
						Next
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</Button.Root>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.duration-400 {
		transition-duration: 400ms;
	}
</style>

