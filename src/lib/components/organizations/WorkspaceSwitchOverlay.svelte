<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		show = false,
		workspaceName = 'workspace',
		workspaceType = 'personal' as 'personal' | 'organization'
	}: {
		show?: boolean;
		workspaceName?: string;
		workspaceType?: 'personal' | 'organization';
	} = $props();

	// Progress stages with timing
	let stage = $state(0);

	// Main title showing the action
	const titleText = $derived(() => {
		return workspaceType === 'personal'
			? `Loading ${workspaceName}'s workspace`
			: `Loading ${workspaceName}`;
	});

	// Detailed progress steps - varied, actionable verbs
	const getStageMessage = (stageNum: number) => {
		if (stageNum === 0) {
			return workspaceType === 'personal' ? 'Gathering user data' : 'Gathering organization data';
		}
		if (stageNum === 1) {
			return workspaceType === 'personal'
				? 'Fetching your notes and highlights'
				: 'Syncing workspace settings';
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
		class="via-base fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-accent-primary/10 to-accent-primary/5 backdrop-blur-xl"
		in:fade={{ duration: 0 }}
		out:fade={{ duration: 300 }}
	>
		<div class="flex flex-col items-center gap-content-section">
			<!-- Animated spinner -->
			<div class="relative h-12 w-12">
				<div
					class="absolute inset-0 animate-spin rounded-full border-4 border-border-base border-t-accent-primary"
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
