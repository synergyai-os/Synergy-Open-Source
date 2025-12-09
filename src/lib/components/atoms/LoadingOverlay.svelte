<script lang="ts">
	import { fade } from 'svelte/transition';

	export type LoadingFlow =
		| 'account-registration'
		| 'account-linking'
		| 'workspace-creation'
		| 'workspace-switching'
		| 'workspace-joining'
		| 'onboarding'
		| 'custom';

	let {
		show = false,
		flow = 'custom' as LoadingFlow,
		title = '',
		subtitle = '',
		customStages = [] as string[]
	}: {
		show?: boolean;
		flow?: LoadingFlow;
		title?: string;
		subtitle?: string;
		customStages?: string[];
	} = $props();

	let stage = $state(0);

	// Flow-specific configurations
	const flowConfigs = {
		'account-registration': {
			title: (name: string) => `Setting up ${name}'s account`,
			stages: ['Creating your account', 'Setting up your workspace', 'Almost ready...']
		},
		'account-linking': {
			title: (name: string) => `Linking ${name} to SynergyOS`,
			stages: ['Authenticating account', 'Linking accounts', 'Preparing workspace']
		},
		'workspace-creation': {
			title: (name: string) => `Creating ${name}`,
			stages: ['Setting up workspace', 'Configuring permissions', 'Preparing workspace']
		},
		'workspace-switching': {
			title: (name: string) => {
				if (name === 'account') return 'Switching account';
				if (name === 'workspace') return 'Loading workspace';
				return `Loading ${name}`; // Fallback for other cases
			},
			// Stages are determined dynamically based on subtitle (account vs workspace)
			stages: [] // Will be set dynamically below
		},
		'workspace-joining': {
			title: (name: string) => `Joining ${name}`,
			stages: ['Validating invite', 'Setting up permissions', 'Preparing workspace']
		},
		onboarding: {
			title: (name: string) => `Welcome to SynergyOS, ${name}!`,
			stages: ['Setting up your workspace', 'Loading workspace context', 'Almost ready...']
		},
		custom: {
			title: (_name: string) => title || 'Loading...',
			stages: customStages.length > 0 ? customStages : ['Loading...']
		}
	};

	const config = $derived(flowConfigs[flow]);
	const displayTitle = $derived(title || config.title(subtitle || 'workspace'));

	// Track previous subtitle/flow to detect changes
	let previousSubtitle = $state<string | undefined>(undefined);
	let previousFlow = $state<LoadingFlow | undefined>(undefined);

	// Determine stages based on flow and subtitle
	const stages = $derived.by(() => {
		// Use custom stages if provided
		if (customStages.length > 0) return customStages;

		// For workspace-switching flow, use different stages based on subtitle
		if (flow === 'workspace-switching') {
			if (subtitle === 'account') {
				// Account switching stages (2 stages: 0ms, 1.5s)
				return ['Authenticating account', 'Loading account data'];
			} else {
				// Workspace loading stages (2 stages: 0ms, 1.5s)
				return ['Gathering workspace data', 'Preparing workspace'];
			}
		}

		// Default to config stages
		return config.stages;
	});

	// Reset stage synchronously BEFORE derived values recompute (using $effect.pre)
	// This ensures stage resets to 0 before currentStageText recomputes with new stages array
	$effect.pre(() => {
		if (show && (previousFlow !== flow || previousSubtitle !== subtitle)) {
			// Reset stage synchronously when flow/subtitle changes (before derived recomputes)
			stage = 0;
			previousFlow = flow;
			previousSubtitle = subtitle;
		}
	});

	const currentStageText = $derived(stages[Math.min(stage, stages.length - 1)]);

	// Track overlay state and manage timers
	let previousShow = $state(false);
	let activeTimers = $state<ReturnType<typeof setTimeout>[]>([]);

	// Manage timers: create when overlay shows or subtitle/flow changes
	// This runs AFTER stage reset (regular $effect runs after $effect.pre)
	$effect(() => {
		if (!show) {
			// Clear timers when overlay hides
			if (previousShow) {
				activeTimers.forEach(clearTimeout);
				activeTimers = [];
			}
			previousShow = false;
			return;
		}

		const overlayJustShown = !previousShow;
		const subtitleOrFlowChanged = previousSubtitle !== subtitle || previousFlow !== flow;

		// Create timers when:
		// 1. Overlay just appeared
		// 2. Subtitle or flow changed (stage already reset by $effect.pre)
		if (overlayJustShown || subtitleOrFlowChanged) {
			// Clear any existing timers first
			activeTimers.forEach(clearTimeout);
			activeTimers = [];

			previousShow = true;

			// Create timers for stage progression
			stages.forEach((_, index) => {
				if (index === 0) return; // Skip stage 0 (already set)
				const delay = index * 1500; // 1.5s between stages
				const timer = setTimeout(() => {
					stage = index;
				}, delay);
				activeTimers.push(timer);
			});
		}
		// If overlay was already showing and subtitle/flow didn't change, do nothing
		// (timers are already running)
	});
</script>

{#if show}
	<!-- z-[9999] ensures it's above toasts (which typically use z-50) -->
	<div
		class="via-base from-accent-primary/10 to-accent-primary/5 fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br backdrop-blur-xl"
		in:fade={{ duration: 0 }}
		out:fade={{ duration: 300 }}
	>
		<div class="gap-content-section flex flex-col items-center">
			<!-- Animated spinner -->
			<div class="size-avatar-lg relative">
				<div
					class="border-border-base border-t-accent-primary absolute inset-0 animate-spin rounded-avatar border-4"
				></div>
			</div>

			<!-- Main title -->
			<div class="max-w-md text-center">
				<h2 class="text-h1 font-semibold text-primary">{displayTitle}</h2>
			</div>

			<!-- Progress stage -->
			<div class="text-center">
				<p class="text-button text-secondary">{currentStageText}</p>
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
