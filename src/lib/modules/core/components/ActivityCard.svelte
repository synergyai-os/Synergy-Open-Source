<script lang="ts">
	import { Button } from 'bits-ui';
	import type { Activity } from '$lib/stores/activityTracker.svelte';

	interface Props {
		activity: Activity;
		onDismiss?: () => void;
		onCancel?: () => void;
	}

	let { activity, onDismiss, onCancel }: Props = $props();

	const progressPercentage = $derived(() => {
		if (activity.progress?.indeterminate) return 0;
		if (activity.progress?.percentage !== undefined) {
			return activity.progress.percentage;
		}
		if (activity.progress?.current !== undefined && activity.progress?.total !== undefined) {
			return activity.progress.total > 0
				? Math.min(100, Math.round((activity.progress.current / activity.progress.total) * 100))
				: 0;
		}
		return 0;
	});

	const hasProgress = $derived(() => {
		return (
			activity.progress &&
			(activity.progress.current !== undefined ||
				activity.progress.indeterminate ||
				activity.progress.currentStep !== undefined)
		);
	});

	function handleQuickAction(action: () => void) {
		action();
		if (onDismiss) {
			onDismiss();
		}
	}
</script>

<div
	class="border-base bg-elevated max-w-[400px] min-w-[320px] overflow-hidden rounded-md border shadow-lg"
>
	<!-- Header -->
	<div
		class="border-base px-menu-item py-menu-item flex items-center justify-between gap-2 border-b"
	>
		<div class="flex min-w-0 flex-1 items-center gap-2">
			{#if activity.icon}
				<span class="flex-shrink-0 text-base">{activity.icon}</span>
			{:else if activity.status === 'running'}
				<svg
					class="text-primary h-4 w-4 flex-shrink-0 animate-spin"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			{:else if activity.status === 'completed'}
				<svg
					class="text-accent-primary h-4 w-4 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			{:else if activity.status === 'error'}
				<svg
					class="text-error h-4 w-4 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			{/if}

			<div class="min-w-0 flex-1">
				<h4 class="text-primary truncate text-sm font-medium">
					{activity.type === 'sync'
						? 'Syncing'
						: activity.type === 'generation'
							? 'Generating'
							: activity.type === 'notification'
								? 'Notification'
								: activity.type === 'export'
									? 'Exporting'
									: activity.type === 'bulk'
										? 'Processing'
										: 'Activity'}
					{#if activity.metadata?.source}
						<span class="text-tertiary font-normal"> {activity.metadata.source}</span>
					{/if}
				</h4>
			</div>
		</div>

		{#if onDismiss}
			<button
				type="button"
				onclick={onDismiss}
				class="hover:bg-hover-solid text-tertiary hover:text-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors"
				aria-label="Dismiss"
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Progress Section -->
	{#if hasProgress()}
		<div class="border-base px-menu-item py-menu-item border-b">
			{#if activity.progress?.step}
				<div class="mb-2 flex items-center justify-between text-xs">
					<span class="text-secondary flex-1 truncate font-medium">{activity.progress.step}</span>
					{#if activity.progress.current !== undefined && activity.progress.total !== undefined}
						<span class="text-tertiary ml-2 flex-shrink-0">
							{activity.progress.current} / {activity.progress.total}
						</span>
					{/if}
				</div>
			{/if}

			{#if !activity.progress?.indeterminate && progressPercentage() > 0}
				<div class="bg-base h-2 w-full overflow-hidden rounded-full">
					<div
						class="bg-interactive-primary h-full transition-all duration-300 ease-out"
						style="width: {progressPercentage()}%"
					></div>
				</div>
			{:else if activity.progress?.indeterminate}
				<div class="bg-base h-2 w-full overflow-hidden rounded-full">
					<div class="bg-interactive-primary h-full animate-pulse" style="width: 60%"></div>
				</div>
			{/if}

			{#if activity.progress?.message}
				<p class="text-tertiary mt-2 text-xs">{activity.progress.message}</p>
			{/if}
		</div>
	{/if}

	<!-- Quick Actions -->
	{#if activity.quickActions && activity.quickActions.length > 0}
		<div class="border-base px-menu-item py-menu-item flex flex-wrap items-center gap-2 border-b">
			{#each activity.quickActions as action, index (action.label || index)}
				<Button.Root
					onclick={() => handleQuickAction(action.action)}
					class="px-menu-item py-menu-item hover:bg-hover-solid text-primary flex items-center gap-2 rounded-md text-xs transition-colors"
				>
					{#if action.icon}
						<span>{action.icon}</span>
					{/if}
					{action.label}
				</Button.Root>
			{/each}
		</div>
	{/if}

	<!-- Actions Footer -->
	<div class="px-menu-item py-menu-item flex items-center justify-end gap-2">
		{#if activity.status === 'running' && onCancel}
			<Button.Root
				onclick={onCancel}
				class="px-menu-item py-menu-item hover:bg-hover-solid text-tertiary hover:text-secondary rounded-md text-xs transition-colors"
			>
				Cancel
			</Button.Root>
		{/if}
	</div>
</div>
