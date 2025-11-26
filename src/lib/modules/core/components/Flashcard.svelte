<script lang="ts">
	import { browser } from '$app/environment';

	interface Flashcard {
		question: string;
		answer: string;
	}

	interface Props {
		flashcard: Flashcard;
		isFlipped?: boolean;
		onFlip?: () => void;
		editable?: boolean;
		onQuestionChange?: (value: string) => void;
		onAnswerChange?: (value: string) => void;
	}

	let {
		flashcard,
		isFlipped = false,
		onFlip: _onFlip,
		editable = false,
		onQuestionChange,
		onAnswerChange
	}: Props = $props();

	let isEditingQuestion = $state(false);
	let isEditingAnswer = $state(false);
	let questionValue = $state(flashcard.question);
	let answerValue = $state(flashcard.answer);

	// Sync with prop changes
	$effect(() => {
		questionValue = flashcard.question;
		answerValue = flashcard.answer;
	});

	// TODO: Re-enable when flip functionality is needed
	// function handleFlip() {
	// 	if (onFlip) {
	// 		onFlip();
	// 	}
	// }

	function startEditingQuestion() {
		if (editable && onQuestionChange) {
			isEditingQuestion = true;
		}
	}

	function startEditingAnswer() {
		if (editable && onAnswerChange) {
			isEditingAnswer = true;
		}
	}

	function saveQuestion() {
		if (onQuestionChange && questionValue !== flashcard.question) {
			onQuestionChange(questionValue);
		}
		isEditingQuestion = false;
	}

	function saveAnswer() {
		if (onAnswerChange && answerValue !== flashcard.answer) {
			onAnswerChange(answerValue);
		}
		isEditingAnswer = false;
	}

	// Autofocus action for textareas
	function autofocus(node: HTMLTextAreaElement) {
		if (browser) {
			// Use setTimeout to ensure DOM is ready
			setTimeout(() => {
				node.focus();
				// Move cursor to end of text
				node.setSelectionRange(node.value.length, node.value.length);
			}, 0);
		}
		return {
			update() {
				if (browser) {
					setTimeout(() => {
						node.focus();
						node.setSelectionRange(node.value.length, node.value.length);
					}, 0);
				}
			}
		};
	}

	// Keyboard navigation is handled by parent component
</script>

<div class="perspective-1000 relative h-full w-full">
	<div
		class="transform-style-preserve-3d relative h-full w-full transition-transform duration-500 {isFlipped
			? 'rotate-y-180'
			: ''}"
	>
		<!-- Front Side (Question) -->
		<div
			class="card-face-front absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface shadow-xl backface-hidden"
			style="background: linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-elevated) 100%); border: 2px solid var(--color-border-base);"
		>
			<div class="flex min-w-0 flex-1 items-center justify-center overflow-auto p-inbox-container">
				{#if isEditingQuestion && editable && onQuestionChange}
					<div class="flex w-full min-w-0 items-center justify-center">
						<textarea
							bind:value={questionValue}
							onblur={saveQuestion}
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => {
								if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
									e.preventDefault();
									saveQuestion();
								}
								if (e.key === 'Escape') {
									e.preventDefault();
									questionValue = flashcard.question;
									isEditingQuestion = false;
								}
							}}
							use:autofocus
							class="flashcard-edit-question overflow-wrap-anywhere mx-auto field-sizing-content max-w-readable min-w-0 resize-none rounded-sm border-none bg-transparent p-0 px-inbox-container text-center text-2xl leading-readable break-words text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none sm:text-3xl"
							style="font-weight: inherit; word-break: break-word; overflow-wrap: anywhere; margin: 0; display: block; width: 100%; overflow: hidden;"
							placeholder="Question..."
						></textarea>
					</div>
				{:else if editable && onQuestionChange}
					<button
						type="button"
						class="flex h-full w-full min-w-0 cursor-text items-center justify-center border-none bg-transparent p-0"
						onclick={startEditingQuestion}
					>
						<p
							class="overflow-wrap-anywhere mx-auto max-w-readable min-w-0 px-inbox-container text-center text-2xl leading-readable break-words text-primary sm:text-3xl"
							style="word-break: break-word; overflow-wrap: anywhere;"
						>
							{flashcard.question}
						</p>
					</button>
				{:else}
					<div class="flex h-full w-full min-w-0 items-center justify-center">
						<p
							class="overflow-wrap-anywhere mx-auto max-w-readable min-w-0 px-inbox-container text-center text-2xl leading-readable break-words text-primary sm:text-3xl"
							style="word-break: break-word; overflow-wrap: anywhere;"
						>
							{flashcard.question}
						</p>
					</div>
				{/if}
			</div>
			<div
				class="flex flex-shrink-0 items-center justify-center gap-2 border-t border-base px-inbox-container py-system-header transition-colors {isEditingQuestion
					? 'bg-accent-primary/20'
					: 'bg-base/10'}"
			>
				<span class="text-sm text-secondary">↑/↓ Flip</span>
				{#if isEditingQuestion}
					<span class="text-sm font-medium text-accent-primary"
						>• Editing... (Click outside to save)</span
					>
				{:else if editable && onQuestionChange}
					<span class="text-sm text-secondary">• Click to edit</span>
				{/if}
			</div>
		</div>

		<!-- Back Side (Answer) - Precious/Shiny -->
		<div
			class="card-face-back card-shiny absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-lg bg-elevated shadow-xl backface-hidden"
			style="background: linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-accent-primary) 20%, var(--color-bg-elevated) 100%); border: 2px solid var(--color-accent-primary);"
		>
			<div class="flex min-w-0 flex-1 items-center justify-center overflow-auto p-inbox-container">
				{#if isEditingAnswer && editable && onAnswerChange}
					<div class="flex w-full min-w-0 items-center justify-center">
						<textarea
							bind:value={answerValue}
							onblur={saveAnswer}
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => {
								if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
									e.preventDefault();
									saveAnswer();
								}
								if (e.key === 'Escape') {
									e.preventDefault();
									answerValue = flashcard.answer;
									isEditingAnswer = false;
								}
							}}
							use:autofocus
							class="flashcard-edit-answer overflow-wrap-anywhere mx-auto field-sizing-content max-w-readable min-w-0 resize-none rounded-sm border-none bg-transparent p-0 px-inbox-container text-center text-xl leading-readable break-words text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none sm:text-2xl"
							style="font-weight: inherit; word-break: break-word; overflow-wrap: anywhere; margin: 0; display: block; width: 100%; overflow: hidden;"
							placeholder="Answer..."
						></textarea>
					</div>
				{:else if editable && onAnswerChange}
					<button
						type="button"
						class="flex h-full w-full min-w-0 cursor-text items-center justify-center border-none bg-transparent p-0"
						onclick={startEditingAnswer}
					>
						<p
							class="overflow-wrap-anywhere mx-auto max-w-readable min-w-0 px-inbox-container text-center text-xl leading-readable break-words text-primary sm:text-2xl"
							style="word-break: break-word; overflow-wrap: anywhere;"
						>
							{flashcard.answer}
						</p>
					</button>
				{:else}
					<div class="flex h-full w-full min-w-0 items-center justify-center">
						<p
							class="overflow-wrap-anywhere mx-auto max-w-readable min-w-0 px-inbox-container text-center text-xl leading-readable break-words text-primary sm:text-2xl"
							style="word-break: break-word; overflow-wrap: anywhere;"
						>
							{flashcard.answer}
						</p>
					</div>
				{/if}
			</div>
			<div
				class="flex flex-shrink-0 items-center justify-center gap-2 border-t border-accent-primary px-inbox-container py-system-header transition-colors {isEditingAnswer
					? 'bg-accent-primary/30'
					: 'bg-accent-primary/10'}"
			>
				<span class="text-sm text-secondary">↑/↓ Flip</span>
				{#if isEditingAnswer}
					<span class="text-sm font-medium text-accent-primary"
						>• Editing... (Click outside to save)</span
					>
				{:else if editable && onAnswerChange}
					<span class="text-sm text-secondary">• Click to edit</span>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.perspective-1000 {
		perspective: 1000px;
	}

	.transform-style-preserve-3d {
		transform-style: preserve-3d;
	}

	.backface-hidden {
		backface-visibility: hidden;
	}

	.rotate-y-180 {
		transform: rotateY(180deg);
	}

	.card-face-front {
		transform: rotateY(0deg);
	}

	.card-face-back {
		transform: rotateY(180deg);
	}

	.card-shiny {
		box-shadow: 0 25px 70px -10px oklch(55.4% 0.218 251.813 / 0.3);
	}

	.flashcard-edit-question {
		font-size: 1.5rem;
	}

	/* Token: --breakpoint-sm (640px) from design-system.json */
	@media (min-width: 640px) {
		.flashcard-edit-question {
			font-size: 1.875rem;
		}
	}

	.flashcard-edit-answer {
		font-size: 1.25rem;
	}

	/* Token: --breakpoint-sm (640px) from design-system.json */
	@media (min-width: 640px) {
		.flashcard-edit-answer {
			font-size: 1.5rem;
		}
	}
</style>
