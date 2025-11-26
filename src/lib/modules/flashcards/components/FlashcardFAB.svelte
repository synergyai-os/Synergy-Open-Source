<script lang="ts">
	import { Button } from 'bits-ui';

	interface Props {
		selectedItemId: string | null;
		isGenerating?: boolean;
		onClick: () => void;
	}

	let { selectedItemId, isGenerating = false, onClick }: Props = $props();

	// Only show FAB when an item is selected
	const isVisible = $derived(selectedItemId !== null);
</script>

{#if isVisible}
	<div class="absolute bottom-6 left-1/2 z-50 -translate-x-1/2">
		<Button.Root
			onclick={onClick}
			disabled={isGenerating}
			class="flex items-center gap-2 rounded-button bg-accent-primary px-menu-item py-menu-item font-medium text-primary shadow-card transition-all duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if isGenerating}
				<!-- Loading spinner -->
				<svg class="size-icon-md animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<span>Generating...</span>
			{:else}
				<!-- Flashcard icon -->
				<svg class="size-icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span>Generate Flashcard</span>
			{/if}
		</Button.Root>
	</div>
{/if}
