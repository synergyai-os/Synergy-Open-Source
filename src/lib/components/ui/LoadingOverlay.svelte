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
			stages: [
				'Creating your account',
				'Preparing your workspace',
				'Setting up your first workspace'
			]
		},
		'account-linking': {
			title: (name: string) => `Linking ${name} to SynergyOS`,
			stages: [
				'Authenticating account',
				'Linking accounts',
				'Preparing workspace'
			]
		},
		'workspace-creation': {
			title: (name: string) => `Creating ${name}`,
			stages: [
				'Setting up workspace',
				'Configuring permissions',
				'Preparing workspace'
			]
		},
		'workspace-switching': {
			title: (name: string) => `Loading ${name}`,
			stages: [
				'Gathering workspace data',
				'Fetching your notes and highlights',
				'Preparing workspace'
			]
		},
		'workspace-joining': {
			title: (name: string) => `Joining ${name}`,
			stages: [
				'Validating invite',
				'Setting up permissions',
				'Preparing workspace'
			]
		},
		'onboarding': {
			title: (name: string) => `Welcome to SynergyOS, ${name}!`,
			stages: [
				'Setting up your workspace',
				'Preparing your first workspace',
				'Almost ready...'
			]
		},
		'custom': {
			title: (name: string) => title || 'Loading...',
			stages: customStages.length > 0 ? customStages : ['Loading...']
		}
	};

	const config = $derived(flowConfigs[flow]);
	const displayTitle = $derived(
		title || config.title(subtitle || 'workspace')
	);
	const stages = $derived(
		customStages.length > 0 ? customStages : config.stages
	);
	const currentStageText = $derived(stages[Math.min(stage, stages.length - 1)]);

	// Update stage based on elapsed time
	$effect(() => {
		if (!show) {
			stage = 0;
			return;
		}

		// Stage 1: Immediate
		stage = 0;

		// Stage 2+: After intervals
		const timers: ReturnType<typeof setTimeout>[] = [];

		stages.forEach((_, index) => {
			if (index === 0) return;
			const delay = index * 1500; // 1.5s between stages
			timers.push(
				setTimeout(() => {
					stage = index;
				}, delay)
			);
		});

		return () => {
			timers.forEach(clearTimeout);
		};
	});
</script>

{#if show}
	<!-- z-[9999] ensures it's above toasts (which typically use z-50) -->
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-accent-primary/10 via-base to-accent-primary/5 backdrop-blur-xl"
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

			<!-- Main title -->
			<div class="text-center max-w-md">
				<h2 class="text-2xl font-semibold text-primary">{displayTitle}</h2>
			</div>

			<!-- Progress stage -->
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

