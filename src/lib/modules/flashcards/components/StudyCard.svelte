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
			class="absolute right-0 bottom-0 left-0 flex flex-wrap items-center justify-center gap-icon border-t border-base bg-elevated px-inbox-container py-system-header"
		>
			<Button.Root
				onclick={() => handleRate('again')}
				disabled={isReviewing}
				class="rounded-md bg-red-600 px-menu-item py-menu-item text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Again (1)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('hard')}
				disabled={isReviewing}
				class="rounded-md bg-orange-600 px-menu-item py-menu-item text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Hard (2)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('good')}
				disabled={isReviewing}
				class="rounded-md bg-blue-600 px-menu-item py-menu-item text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Good (3)
			</Button.Root>
			<Button.Root
				onclick={() => handleRate('easy')}
				disabled={isReviewing}
				class="rounded-md bg-green-600 px-menu-item py-menu-item text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Easy (4)
			</Button.Root>
		</div>
	{/if}
</div>
