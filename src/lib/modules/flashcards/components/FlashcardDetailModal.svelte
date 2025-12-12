<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Dialog } from 'bits-ui';
	import { useConvexClient } from 'convex-svelte';
	import FlashcardMetadata from './FlashcardMetadata.svelte';
	import { api } from '$lib/convex';
	import { Button } from 'bits-ui';
	import type { Id } from '$lib/convex';
	import { getContext } from 'svelte';
	import type { CoreModuleAPI } from '$lib/modules/core/api';
	import { invariant } from '$lib/utils/invariant';

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

	const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
	const FlashcardComponent = coreAPI?.Flashcard;

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
			invariant(sessionId, 'Session ID is required');

			await convexClient.mutation(api.features.flashcards.index.updateFlashcard, {
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
			invariant(sessionId, 'Session ID is required');

			await convexClient.mutation(api.features.flashcards.index.archiveFlashcard, {
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
		<Dialog.Content class="bg-base fixed inset-0 z-50 flex flex-col overflow-hidden">
			<!-- Header -->
			<div
				class="h-system-header border-base px-inbox-container py-system-header flex flex-shrink-0 items-center justify-between gap-2 border-b"
			>
				<div class="min-w-0 flex-1">
					<h2 class="text-h3 text-primary font-semibold">
						{collectionName || 'Flashcards'}
					</h2>
					<p class="text-small text-secondary">{progressText}</p>
				</div>
				<Dialog.Close type="button" onclick={onClose} class="dialog-close-button flex-shrink-0">
					<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			<div class="bg-base flex min-h-0 flex-1 overflow-hidden">
				<!-- Left: Card View -->
				<div
					class="px-inbox-container py-inbox-container bg-base flex flex-1 items-center justify-center overflow-auto"
				>
					{#if currentCard}
						<div class="flashcard-modal-container relative transition-all duration-400">
							{#if isEditing}
								<!-- Edit Mode -->
								<div
									class="shadow-card-hover rounded-card border-accent-primary bg-elevated flex h-full w-full flex-col overflow-hidden border-2"
								>
									<div
										class="px-inbox-container py-inbox-container flex flex-1 flex-col overflow-auto"
									>
										<div class="mb-form-section">
											<label
												for="flashcard-question"
												class="text-small text-secondary block font-medium">Question</label
											>
											<textarea
												id="flashcard-question"
												bind:value={questionValue}
												class="border-base px-inbox-card py-inbox-card focus:ring-accent-primary rounded-button bg-base text-primary w-full resize-none border focus:ring-2 focus:outline-none"
												rows="4"
												placeholder="Question..."
											></textarea>
										</div>
										<div>
											<label
												for="flashcard-answer"
												class="text-small text-secondary block font-medium">Answer</label
											>
											<textarea
												id="flashcard-answer"
												bind:value={answerValue}
												class="border-base px-inbox-card py-inbox-card focus:ring-accent-primary rounded-button bg-base text-primary w-full resize-none border focus:ring-2 focus:outline-none"
												rows="6"
												placeholder="Answer..."
											></textarea>
										</div>
									</div>
									<div
										class="border-base px-inbox-container py-system-header flex items-center justify-end gap-2 border-t"
									>
										<Button.Root
											onclick={handleCancel}
											disabled={isSaving}
											class="border-base py-nav-item text-small hover:bg-hover-solid rounded-button bg-base border px-2 font-medium transition-colors disabled:opacity-50"
										>
											Cancel
										</Button.Root>
										<Button.Root
											onclick={handleSave}
											disabled={isSaving}
											class="py-nav-item text-small rounded-button bg-accent-primary text-primary px-2 font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
										>
											{isSaving ? 'Saving...' : 'Save'}
										</Button.Root>
									</div>
								</div>
							{:else}
								<!-- View Mode -->
								{#if FlashcardComponent}
									<FlashcardComponent
										flashcard={{
											question: currentCard.question,
											answer: currentCard.answer
										}}
										{isFlipped}
										onFlip={flipCard}
										editable={false}
									/>
								{:else}
									<p class="text-small text-secondary">Flashcard component unavailable</p>
								{/if}
							{/if}
						</div>
					{:else}
						<div class="text-center" style="padding-block: var(--spacing-8);">
							<p class="text-secondary">No cards in this collection</p>
						</div>
					{/if}
				</div>

				<!-- Right: Metadata Sidebar -->
				{#if currentCard}
					<div
						class="w-sidebar-detail border-base px-inbox-container py-inbox-container bg-surface flex-shrink-0 overflow-y-auto border-l"
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
					class="h-system-header border-base px-inbox-container py-system-header bg-surface flex flex-shrink-0 items-center justify-between gap-2 border-t"
				>
					<Button.Root
						onclick={previousCard}
						disabled={currentIndex === 0}
						class="border-base py-nav-item text-small hover:bg-hover-solid rounded-button bg-elevated text-secondary disabled:text-tertiary disabled:hover:bg-elevated flex items-center gap-2 border px-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
					>
						<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Previous
					</Button.Root>

					<div class="text-small text-secondary flex items-center gap-2">
						<span class="text-label">Press ↑/↓ or Space to flip</span>
					</div>

					<Button.Root
						onclick={nextCard}
						disabled={currentIndex === flashcards.length - 1}
						class="border-base py-nav-item text-small hover:bg-hover-solid rounded-button bg-elevated text-secondary disabled:text-tertiary disabled:hover:bg-elevated flex items-center gap-2 border px-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
					>
						Next
						<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

	.flashcard-modal-container {
		width: 500px;
		height: 700px;
		max-width: calc(100% - 2rem);
		max-height: calc(100% - 2rem);
	}
</style>
