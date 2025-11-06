<script lang="ts">
	import FlashcardComponent from '$lib/components/Flashcard.svelte';
	import { Button } from 'bits-ui';
	import type { StudyFlashcard } from '$lib/composables/useStudySession.svelte';
	import type { FlashcardRating } from '$lib/composables/useStudySession.svelte';

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
		answer: flashcard.answer,
	});

	async function handleRate(rating: FlashcardRating) {
		if (!isReviewing) {
			await onRate(rating);
		}
	}
</script>

<div class="relative w-full h-full">
	<!-- Flashcard Component (reused) -->
	<FlashcardComponent
		flashcard={flashcardData}
		isFlipped={isFlipped}
		onFlip={onFlip}
		editable={false}
	/>

	<!-- Rating Buttons (shown when flipped) -->
	{#if isFlipped}
		<div
			class="absolute bottom-0 left-0 right-0 bg-elevated border-t border-base px-inbox-container py-system-header flex items-center justify-center gap-icon flex-wrap"
		>
			<Button.Root
				onclick={() => handleRate('again')}
				disabled={isReviewing}
				class="px-menu-item py-menu-item text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				Again (1)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('hard')}
				disabled={isReviewing}
				class="px-menu-item py-menu-item text-sm font-medium rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				Hard (2)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('good')}
				disabled={isReviewing}
				class="px-menu-item py-menu-item text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				Good (3)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('easy')}
				disabled={isReviewing}
				class="px-menu-item py-menu-item text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				Easy (4)
			</Button.Root>
		</div>
	{/if}
</div>

