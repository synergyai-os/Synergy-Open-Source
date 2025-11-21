<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		retryAfter: number; // seconds
		message?: string;
		actionLabel?: string; // e.g., "logging in", "creating accounts", "switching"
	}

	let { retryAfter, message, actionLabel = 'making requests' }: Props = $props();

	let timeRemaining = $state(retryAfter);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		// Start countdown
		intervalId = setInterval(() => {
			timeRemaining--;
			if (timeRemaining <= 0) {
				if (intervalId) clearInterval(intervalId);
			}
		}, 1000);

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});

	const defaultMessage = $derived(`Whoa, slow down! You've tried ${actionLabel} too many times.`);
</script>

<div class="rounded-input border border-error bg-error px-input-x py-input-y">
	<div class="flex items-start gap-icon">
		<!-- Error Icon -->
		<svg
			class="icon-md flex-shrink-0 text-error"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>

		<div class="flex-1">
			<p class="text-button font-medium text-error-secondary">
				{message || defaultMessage}
			</p>

			{#if timeRemaining > 0}
				<p class="gap-form-field text-button text-error">
					Please wait <span class="font-semibold tabular-nums">{timeRemaining}</span>
					{timeRemaining === 1 ? 'second' : 'seconds'} before trying again.
				</p>
			{:else}
				<p class="gap-form-field text-button text-error">You can try again now!</p>
			{/if}
		</div>
	</div>
</div>
