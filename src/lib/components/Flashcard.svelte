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
		onFlip,
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

	function handleFlip() {
		if (onFlip) {
			onFlip();
		}
	}

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

<div class="relative w-full h-full perspective-1000">
	<div
		class="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d {isFlipped
			? 'rotate-y-180'
			: ''}"
	>
		<!-- Front Side (Question) -->
		<div
			class="absolute inset-0 w-full h-full backface-hidden card-face-front rounded-lg shadow-xl flex flex-col overflow-hidden bg-surface"
			style="background: linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-elevated) 100%); border: 2px solid var(--color-border-base);"
		>
			<div class="flex-1 flex items-center justify-center p-inbox-container overflow-auto min-w-0">
				{#if isEditingQuestion && editable && onQuestionChange}
					<div class="w-full flex items-center justify-center min-w-0">
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
							class="text-primary text-2xl sm:text-3xl leading-readable text-center max-w-readable mx-auto px-inbox-container flashcard-edit-question break-words overflow-wrap-anywhere min-w-0 bg-transparent border-none p-0 focus:outline-none resize-none field-sizing-content"
							style="font-weight: inherit; word-break: break-word; overflow-wrap: anywhere; margin: 0; display: block; width: 100%; overflow: hidden;"
							placeholder="Question..."
						></textarea>
					</div>
				{:else}
					{#if editable && onQuestionChange}
						<button
							type="button"
							class="w-full h-full flex items-center justify-center cursor-text bg-transparent border-none p-0 min-w-0"
							onclick={startEditingQuestion}
						>
							<p class="text-primary text-2xl sm:text-3xl leading-readable text-center max-w-readable mx-auto px-inbox-container break-words overflow-wrap-anywhere min-w-0" style="word-break: break-word; overflow-wrap: anywhere;">
								{flashcard.question}
							</p>
						</button>
					{:else}
						<div class="w-full h-full flex items-center justify-center min-w-0">
							<p class="text-primary text-2xl sm:text-3xl leading-readable text-center max-w-readable mx-auto px-inbox-container break-words overflow-wrap-anywhere min-w-0" style="word-break: break-word; overflow-wrap: anywhere;">
								{flashcard.question}
							</p>
						</div>
					{/if}
				{/if}
			</div>
			<div class="px-inbox-container py-system-header border-t border-base flex items-center justify-center gap-icon flex-shrink-0 bg-base/10">
				<span class="text-sm text-secondary">↑/↓ Flip</span>
				{#if editable && onQuestionChange && !isEditingQuestion}
					<span class="text-sm text-secondary">• Click to edit</span>
				{/if}
			</div>
		</div>

		<!-- Back Side (Answer) - Precious/Shiny -->
		<div
			class="absolute inset-0 w-full h-full backface-hidden card-face-back rounded-lg shadow-xl flex flex-col overflow-hidden bg-elevated card-shiny"
			style="background: linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-accent-primary) 20%, var(--color-bg-elevated) 100%); border: 2px solid var(--color-accent-primary);"
		>
			<div class="flex-1 flex items-center justify-center p-inbox-container overflow-auto min-w-0">
				{#if isEditingAnswer && editable && onAnswerChange}
					<div class="w-full flex items-center justify-center min-w-0">
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
							class="text-primary text-xl sm:text-2xl leading-readable text-center max-w-readable mx-auto px-inbox-container flashcard-edit-answer break-words overflow-wrap-anywhere min-w-0 bg-transparent border-none p-0 focus:outline-none resize-none field-sizing-content"
							style="font-weight: inherit; word-break: break-word; overflow-wrap: anywhere; margin: 0; display: block; width: 100%; overflow: hidden;"
							placeholder="Answer..."
						></textarea>
					</div>
				{:else}
					{#if editable && onAnswerChange}
						<button
							type="button"
							class="w-full h-full flex items-center justify-center cursor-text bg-transparent border-none p-0 min-w-0"
							onclick={startEditingAnswer}
						>
							<p class="text-primary text-xl sm:text-2xl leading-readable text-center max-w-readable mx-auto px-inbox-container break-words overflow-wrap-anywhere min-w-0" style="word-break: break-word; overflow-wrap: anywhere;">
								{flashcard.answer}
							</p>
						</button>
					{:else}
						<div class="w-full h-full flex items-center justify-center min-w-0">
							<p class="text-primary text-xl sm:text-2xl leading-readable text-center max-w-readable mx-auto px-inbox-container break-words overflow-wrap-anywhere min-w-0" style="word-break: break-word; overflow-wrap: anywhere;">
								{flashcard.answer}
							</p>
						</div>
					{/if}
				{/if}
			</div>
			<div class="px-inbox-container py-system-header border-t border-accent-primary flex items-center justify-center gap-icon flex-shrink-0 bg-accent-primary/10">
				<span class="text-sm text-secondary">↑/↓ Flip</span>
				{#if editable && onAnswerChange && !isEditingAnswer}
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

	@media (min-width: 640px) {
		.flashcard-edit-question {
			font-size: 1.875rem;
		}
	}

	.flashcard-edit-answer {
		font-size: 1.25rem;
	}

	@media (min-width: 640px) {
		.flashcard-edit-answer {
			font-size: 1.5rem;
		}
	}
</style>

