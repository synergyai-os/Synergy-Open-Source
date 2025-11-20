<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Dialog } from 'bits-ui';
	import { useConvexClient } from 'convex-svelte';
	import FlashcardComponent from '$lib/modules/core/components/Flashcard.svelte';
	import FlashcardMetadata from './FlashcardMetadata.svelte';
	import { api } from '$lib/convex';
	import { Button } from 'bits-ui';
	import type { Id } from '$lib/convex';

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
	// TODO: Re-enable when needed
	// const getUserId = () => $page.data.user?.userId;
	const getSessionId = () => $page.data.sessionId;

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

			// Ignore if dropdown/combobox is open (e.g., tag selector, color picker)
			const isDropdownOpen =
				document.querySelector('[data-bits-combobox-content]') !== null ||
				document.querySelector('[role="listbox"]') !== null;

			if ((isInputFocused || isDropdownOpen) && e.key !== 'Escape') return;

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
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			await convexClient.mutation(api.flashcards.updateFlashcard, {
				sessionId,
				flashcardId: currentCard._id,
				question: questionValue,
				answer: answerValue
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
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			await convexClient.mutation(api.flashcards.deleteFlashcard, {
				sessionId,
				flashcardId: currentCard._id
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

	// TODO: Re-enable when needed
	// function handleQuestionChange(value: string) {
	// 	questionValue = value;
	// }

	// function handleAnswerChange(value: string) {
	// 	answerValue = value;
	// }

	const progressText = $derived(`Card ${currentIndex + 1} of ${flashcards.length}`);
</script>

<Dialog.Root
	{open}
	onOpenChange={(isOpen) => {
		if (!isOpen) onClose();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 transition-opacity" />
		<Dialog.Content class="fixed inset-0 z-50 flex flex-col overflow-hidden bg-base">
			<!-- Header -->
			<div
				class="flex h-system-header flex-shrink-0 items-center justify-between gap-icon border-b border-base px-inbox-container py-system-header"
			>
				<div class="min-w-0 flex-1">
					<h2 class="mb-1 text-lg font-semibold text-primary">
						{collectionName || 'Flashcards'}
					</h2>
					<p class="text-sm text-secondary">{progressText}</p>
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

			<!-- Content Area -->
			<div class="flex min-h-0 flex-1 overflow-hidden bg-base">
				<!-- Left: Card View -->
				<div
					class="flex flex-1 items-center justify-center overflow-auto bg-base p-inbox-container"
				>
					{#if currentCard}
						<div
							class="relative transition-all duration-400"
							style="width: 500px; height: 700px; max-width: calc(100% - 2rem); max-height: calc(100% - 2rem);"
						>
							{#if isEditing}
								<!-- Edit Mode -->
								<div
									class="flex h-full w-full flex-col overflow-hidden rounded-lg border-2 border-accent-primary bg-elevated shadow-xl"
								>
									<div class="flex flex-1 flex-col overflow-auto p-inbox-container">
										<div class="mb-4">
											<label
												for="flashcard-question"
												class="mb-2 block text-sm font-medium text-secondary">Question</label
											>
											<textarea
												id="flashcard-question"
												bind:value={questionValue}
												class="w-full resize-none rounded-md border border-base bg-base px-inbox-card py-inbox-card text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
												rows="4"
												placeholder="Question..."
											></textarea>
										</div>
										<div>
											<label
												for="flashcard-answer"
												class="mb-2 block text-sm font-medium text-secondary">Answer</label
											>
											<textarea
												id="flashcard-answer"
												bind:value={answerValue}
												class="w-full resize-none rounded-md border border-base bg-base px-inbox-card py-inbox-card text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
												rows="6"
												placeholder="Answer..."
											></textarea>
										</div>
									</div>
									<div
										class="flex items-center justify-end gap-icon border-t border-base px-inbox-container py-system-header"
									>
										<Button.Root
											onclick={handleCancel}
											disabled={isSaving}
											class="rounded-md border border-base bg-base px-nav-item py-nav-item text-sm font-medium transition-colors hover:bg-hover-solid disabled:opacity-50"
										>
											Cancel
										</Button.Root>
										<Button.Root
											onclick={handleSave}
											disabled={isSaving}
											class="rounded-md bg-accent-primary px-nav-item py-nav-item text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
										answer: currentCard.answer
									}}
									{isFlipped}
									onFlip={flipCard}
									editable={false}
								/>
							{/if}
						</div>
					{:else}
						<div class="py-readable-quote text-center">
							<p class="text-secondary">No cards in this collection</p>
						</div>
					{/if}
				</div>

				<!-- Right: Metadata Sidebar -->
				{#if currentCard}
					<div
						class="w-80 flex-shrink-0 overflow-y-auto border-l border-base bg-surface p-inbox-container"
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
					class="flex h-system-header flex-shrink-0 items-center justify-between gap-icon border-t border-base bg-surface px-inbox-container py-system-header"
				>
					<Button.Root
						onclick={previousCard}
						disabled={currentIndex === 0}
						class="flex items-center gap-icon rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm font-medium text-secondary transition-colors hover:bg-hover-solid disabled:cursor-not-allowed disabled:text-tertiary disabled:opacity-40 disabled:hover:bg-elevated"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
						class="flex items-center gap-icon rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm font-medium text-secondary transition-colors hover:bg-hover-solid disabled:cursor-not-allowed disabled:text-tertiary disabled:opacity-40 disabled:hover:bg-elevated"
					>
						Next
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
