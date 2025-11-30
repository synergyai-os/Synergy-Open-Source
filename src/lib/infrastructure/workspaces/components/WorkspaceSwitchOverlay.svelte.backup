<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		show = false,
		workspaceName = 'workspace'
	}: {
		show?: boolean;
		workspaceName?: string;
	} = $props();

	// Progress stages with timing
	let stage = $state(0);

	// Main title showing the action
	const titleText = $derived(() => `Loading ${workspaceName}`);

	// Detailed progress steps - varied, actionable verbs
	const getStageMessage = (stageNum: number) => {
		if (stageNum === 0) {
			return 'Gathering organization data';
		}
		if (stageNum === 1) {
			return 'Syncing workspace settings';
		}
		return 'Preparing workspace';
	};

	// Update stage based on elapsed time
	$effect(() => {
		if (!show) {
			stage = 0;
			return;
		}

		// Stage 1: Immediate
		stage = 0;

		// Stage 2: After 1.5 seconds
		const timer1 = setTimeout(() => {
			stage = 1;
		}, 1500);

		// Stage 3: After 3.5 seconds
		const timer2 = setTimeout(() => {
			stage = 2;
		}, 3500);

		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
		};
	});

	const currentStageText = $derived(getStageMessage(stage));
</script>

{#if show}
	<div
		class="via-base from-accent-primary/10 to-accent-primary/5 fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br backdrop-blur-xl"
		in:fade={{ duration: 0 }}
		out:fade={{ duration: 300 }}
	>
		<div class="gap-content-section flex flex-col items-center">
			<!-- Animated spinner -->
			<div class="relative h-12 w-12">
				<div
					class="border-border-base border-t-accent-primary absolute inset-0 animate-spin rounded-full border-4"
				></div>
			</div>

			<!-- Main action title -->
			<div class="max-w-md text-center">
				<h2 class="text-2xl font-semibold text-primary">{titleText()}</h2>
			</div>

			<!-- Detailed progress step -->
			<div class="text-center">
				<p class="text-sm text-secondary">{currentStageText}</p>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
