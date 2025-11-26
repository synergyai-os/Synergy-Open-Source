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
	class="max-w-[400px] min-w-[320px] overflow-hidden rounded-md border border-base bg-elevated shadow-lg"
>
	<!-- Header -->
	<div
		class="flex items-center justify-between gap-2 border-b border-base px-menu-item py-menu-item"
	>
		<div class="flex min-w-0 flex-1 items-center gap-2">
			{#if activity.icon}
				<span class="flex-shrink-0 text-base">{activity.icon}</span>
			{:else if activity.status === 'running'}
				<svg
					class="h-4 w-4 flex-shrink-0 animate-spin text-primary"
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
					class="h-4 w-4 flex-shrink-0 text-accent-primary"
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
					class="h-4 w-4 flex-shrink-0 text-error"
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
				<h4 class="truncate text-sm font-medium text-primary">
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
						<span class="font-normal text-tertiary"> {activity.metadata.source}</span>
					{/if}
				</h4>
			</div>
		</div>

		{#if onDismiss}
			<button
				type="button"
				onclick={onDismiss}
				class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-tertiary transition-colors hover:bg-hover-solid hover:text-secondary"
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
		<div class="border-b border-base px-menu-item py-menu-item">
			{#if activity.progress?.step}
				<div class="mb-2 flex items-center justify-between text-xs">
					<span class="flex-1 truncate font-medium text-secondary">{activity.progress.step}</span>
					{#if activity.progress.current !== undefined && activity.progress.total !== undefined}
						<span class="ml-2 flex-shrink-0 text-tertiary">
							{activity.progress.current} / {activity.progress.total}
						</span>
					{/if}
				</div>
			{/if}

			{#if !activity.progress?.indeterminate && progressPercentage() > 0}
				<div class="h-2 w-full overflow-hidden rounded-full bg-base">
					<div
						class="bg-interactive-primary h-full transition-all duration-300 ease-out"
						style="width: {progressPercentage()}%"
					></div>
				</div>
			{:else if activity.progress?.indeterminate}
				<div class="h-2 w-full overflow-hidden rounded-full bg-base">
					<div class="bg-interactive-primary h-full animate-pulse" style="width: 60%"></div>
				</div>
			{/if}

			{#if activity.progress?.message}
				<p class="mt-2 text-xs text-tertiary">{activity.progress.message}</p>
			{/if}
		</div>
	{/if}

	<!-- Quick Actions -->
	{#if activity.quickActions && activity.quickActions.length > 0}
		<div class="flex flex-wrap items-center gap-2 border-b border-base px-menu-item py-menu-item">
			{#each activity.quickActions as action, index (action.label || index)}
				<Button.Root
					onclick={() => handleQuickAction(action.action)}
					class="flex items-center gap-2 rounded-md px-menu-item py-menu-item text-xs text-primary transition-colors hover:bg-hover-solid"
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
	<div class="flex items-center justify-end gap-2 px-menu-item py-menu-item">
		{#if activity.status === 'running' && onCancel}
			<Button.Root
				onclick={onCancel}
				class="rounded-md px-menu-item py-menu-item text-xs text-tertiary transition-colors hover:bg-hover-solid hover:text-secondary"
			>
				Cancel
			</Button.Root>
		{/if}
	</div>
</div>
