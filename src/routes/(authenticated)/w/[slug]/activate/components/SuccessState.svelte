<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Text } from '$lib/components/atoms';
	import { browser } from '$app/environment';

	interface Props {
		workspaceSlug: string;
	}

	let { workspaceSlug }: Props = $props();

	// Dynamically import canvas-confetti for client-side only
	let _confettiReady = $state(false);

	onMount(async () => {
		if (!browser) return;

		try {
			// Dynamically import canvas-confetti
			const confetti = (await import('canvas-confetti')).default;

			// Fire confetti from both sides
			const duration = 3000;
			const animationEnd = Date.now() + duration;

			const interval = setInterval(() => {
				const timeLeft = animationEnd - Date.now();

				if (timeLeft <= 0) {
					clearInterval(interval);
					return;
				}

				// Random confetti from left and right sides
				confetti({
					particleCount: 3,
					angle: 60,
					spread: 55,
					origin: { x: 0, y: 0.6 },
					// eslint-disable-next-line synergyos/no-hardcoded-design-values
					colors: ['#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6']
				});

				confetti({
					particleCount: 3,
					angle: 120,
					spread: 55,
					origin: { x: 1, y: 0.6 },
					// eslint-disable-next-line synergyos/no-hardcoded-design-values
					colors: ['#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6']
				});
			}, 50);

			_confettiReady = true;
		} catch (error) {
			console.error('Failed to load confetti:', error);
			// Graceful degradation - show success state without confetti
		}
	});
</script>

<div class="flex flex-col items-center justify-center" style="padding: var(--spacing-16);">
	<!-- Party Emojis -->
	<div
		class="gap-header flex items-center"
		style="margin-bottom: var(--spacing-6); font-size: 3rem;"
	>
		<span>🎉</span>
		<span>🎊</span>
		<span>🎉</span>
	</div>

	<!-- Heading -->
	<Text variant="heading" size="lg" color="default" weight="semibold" as="h1" class="mb-header">
		You did it! Workspace activated!
	</Text>

	<!-- Description -->
	<Text variant="body" size="md" color="secondary" as="p" class="mb-section text-center">
		Your organization is now live. Time to invite your colleagues to join.
	</Text>

	<!-- Action Button -->
	<Button variant="primary" size="md" href="/w/{workspaceSlug}/members">Invite Colleagues</Button>
</div>
