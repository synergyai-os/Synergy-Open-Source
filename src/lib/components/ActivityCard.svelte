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
		return activity.progress && (
			activity.progress.current !== undefined ||
			activity.progress.indeterminate ||
			activity.progress.currentStep !== undefined
		);
	});
	
	function handleQuickAction(action: () => void) {
		action();
		if (onDismiss) {
			onDismiss();
		}
	}
</script>

<div class="bg-elevated border border-base rounded-md shadow-lg min-w-[320px] max-w-[400px] overflow-hidden">
	<!-- Header -->
	<div class="px-menu-item py-menu-item border-b border-base flex items-center justify-between gap-icon">
		<div class="flex items-center gap-icon flex-1 min-w-0">
			{#if activity.icon}
				<span class="text-base flex-shrink-0">{activity.icon}</span>
			{:else}
				{#if activity.status === 'running'}
					<svg
						class="w-4 h-4 animate-spin text-primary flex-shrink-0"
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
						class="w-4 h-4 text-accent-primary flex-shrink-0"
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
						class="w-4 h-4 text-error flex-shrink-0"
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
			{/if}
			
			<div class="flex-1 min-w-0">
				<h4 class="text-sm font-medium text-primary truncate">
					{activity.type === 'sync' ? 'Syncing' : 
					 activity.type === 'generation' ? 'Generating' :
					 activity.type === 'notification' ? 'Notification' :
					 activity.type === 'export' ? 'Exporting' :
					 activity.type === 'bulk' ? 'Processing' :
					 'Activity'}
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
				class="w-5 h-5 flex items-center justify-center rounded hover:bg-hover-solid transition-colors text-tertiary hover:text-secondary flex-shrink-0"
				aria-label="Dismiss"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		<div class="px-menu-item py-menu-item border-b border-base">
			{#if activity.progress?.step}
				<div class="flex items-center justify-between text-xs mb-2">
					<span class="text-secondary font-medium truncate flex-1">{activity.progress.step}</span>
					{#if activity.progress.current !== undefined && activity.progress.total !== undefined}
						<span class="text-tertiary ml-2 flex-shrink-0">
							{activity.progress.current} / {activity.progress.total}
						</span>
					{/if}
				</div>
			{/if}
			
			{#if !activity.progress?.indeterminate && progressPercentage() > 0}
				<div class="w-full h-2 bg-base rounded-full overflow-hidden">
					<div
						class="h-full bg-primary transition-all duration-300 ease-out"
						style="width: {progressPercentage()}%"
					></div>
				</div>
			{:else if activity.progress?.indeterminate}
				<div class="w-full h-2 bg-base rounded-full overflow-hidden">
					<div class="h-full bg-primary animate-pulse" style="width: 60%"></div>
				</div>
			{/if}
			
			{#if activity.progress?.message}
				<p class="text-xs text-tertiary mt-2">{activity.progress.message}</p>
			{/if}
		</div>
	{/if}
	
	<!-- Quick Actions -->
	{#if activity.quickActions && activity.quickActions.length > 0}
		<div class="px-menu-item py-menu-item border-b border-base flex items-center gap-2 flex-wrap">
			{#each activity.quickActions as action}
				<Button.Root
					onclick={() => handleQuickAction(action.action)}
					class="px-menu-item py-menu-item text-xs text-primary hover:bg-hover-solid rounded-md transition-colors flex items-center gap-icon"
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
				class="px-menu-item py-menu-item text-xs text-tertiary hover:text-secondary hover:bg-hover-solid rounded-md transition-colors"
			>
				Cancel
			</Button.Root>
		{/if}
	</div>
</div>

