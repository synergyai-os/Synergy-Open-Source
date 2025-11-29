<script lang="ts">
	import FlashcardComponent from '$lib/modules/core/components/Flashcard.svelte';
	import { Button } from 'bits-ui';
	import type { StudyFlashcard } from '$lib/modules/flashcards/composables/useStudySession.svelte';
	import type { FlashcardRating } from '$lib/modules/flashcards/composables/useStudySession.svelte';

	interface Props {
		flashcard: StudyFlashcard;
		isFlipped: boolean;
		onFlip: () => void;
		onRate: (rating: FlashcardRating) => Promise<void>;
		isReviewing: boolean;
	}

	let { flashcard, isFlipped, onFlip, onRate, isReviewing }: Props = $props();

	// Convert flashcard to format expected by FlashcardComponent
	const flashcardData = $derived({
		question: flashcard.question,
		answer: flashcard.answer
	});

	async function handleRate(rating: FlashcardRating) {
		if (!isReviewing) {
			await onRate(rating);
		}
	}
</script>

<div class="relative h-full w-full">
	<!-- Flashcard Component (reused) -->
	<FlashcardComponent flashcard={flashcardData} {isFlipped} {onFlip} editable={false} />

	<!-- Rating Buttons (shown when flipped) -->
	{#if isFlipped}
		<div
			class="border-base px-inbox-container py-system-header absolute right-0 bottom-0 left-0 flex flex-wrap items-center justify-center gap-2 border-t bg-elevated"
		>
			<Button.Root
				onclick={() => handleRate('again')}
				disabled={isReviewing}
				class="bg-rating-again px-menu-item py-menu-item text-small hover:bg-rating-again-hover rounded-button font-medium text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			>
				Again (1)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('hard')}
				disabled={isReviewing}
				class="bg-rating-hard px-menu-item py-menu-item text-small hover:bg-rating-hard-hover rounded-button font-medium text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			>
				Hard (2)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('good')}
				disabled={isReviewing}
				class="bg-rating-good px-menu-item py-menu-item text-small hover:bg-rating-good-hover rounded-button font-medium text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			>
				Good (3)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('easy')}
				disabled={isReviewing}
				class="bg-rating-easy px-menu-item py-menu-item text-small hover:bg-rating-easy-hover rounded-button font-medium text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			>
				Easy (4)
			</Button.Root>
		</div>
	{/if}
</div>
