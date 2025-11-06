<script lang="ts">
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

	function handleFlip() {
		if (onFlip) {
			onFlip();
		}
	}
</script>

<div
	class="relative w-full h-full perspective-1000"
	role="button"
	tabindex="0"
	onclick={handleFlip}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleFlip();
		}
	}}
>
	<div
		class="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d {isFlipped
			? 'rotate-y-180'
			: ''}"
	>
		<!-- Front Side (Question) -->
		<div
			class="absolute inset-0 w-full h-full backface-hidden card-face-front bg-surface border-2 border-base rounded-lg shadow-lg flex flex-col"
		>
			<div class="flex-1 flex items-center justify-center p-inbox-container overflow-auto">
				{#if editable && onQuestionChange}
					<textarea
						value={flashcard.question}
						oninput={(e) => onQuestionChange(e.currentTarget.value)}
						onclick={(e) => e.stopPropagation()}
						class="w-full h-full px-inbox-card py-inbox-card bg-elevated border border-base rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none text-center text-xl sm:text-2xl leading-readable"
						placeholder="Question..."
					></textarea>
				{:else}
					<p class="text-primary text-2xl sm:text-3xl leading-readable text-center max-w-readable mx-auto px-inbox-container">
						{flashcard.question}
					</p>
				{/if}
			</div>
			<div class="px-inbox-container py-system-header border-t border-base flex items-center justify-center flex-shrink-0">
				<span class="text-sm text-secondary">Click to flip</span>
			</div>
		</div>

		<!-- Back Side (Answer) -->
		<div
			class="absolute inset-0 w-full h-full backface-hidden card-face-back bg-elevated border-2 border-accent-primary rounded-lg shadow-lg flex flex-col"
		>
			<div class="flex-1 flex items-center justify-center p-inbox-container overflow-auto">
				{#if editable && onAnswerChange}
					<textarea
						value={flashcard.answer}
						oninput={(e) => onAnswerChange(e.currentTarget.value)}
						onclick={(e) => e.stopPropagation()}
						class="w-full h-full px-inbox-card py-inbox-card bg-surface border border-base rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none text-center text-lg sm:text-xl leading-readable"
						placeholder="Answer..."
					></textarea>
				{:else}
					<p class="text-primary text-xl sm:text-2xl leading-readable text-center max-w-readable mx-auto px-inbox-container">
						{flashcard.answer}
					</p>
				{/if}
			</div>
			<div class="px-inbox-container py-system-header border-t border-base flex items-center justify-center flex-shrink-0">
				<span class="text-sm text-secondary">Click to flip</span>
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
</style>

