<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import { api } from '$lib/convex';
	import {
		activityState,
		removeActivity,
		updateActivity,
		startPolling,
		stopPolling,
		setupAutoDismiss,
		type Activity
	} from '$lib/stores/activityTracker.svelte';
	import ActivityCard from './ActivityCard.svelte';
	
	// Convex client setup
	const convexClient = browser ? useConvexClient() : null;
	const inboxApi = browser
		? {
				getSyncProgress: makeFunctionReference('inbox:getSyncProgress') as any
		  }
		: null;
	
	const activities = $derived(activityState.activities);
	
	/**
	 * Poll for sync progress updates
	 */
	async function pollSyncProgress(): Promise<void> {
		if (!browser || !convexClient || !inboxApi) return;
		
		// Find all sync activities
		const syncActivities = activities.filter(a => a.type === 'sync' && a.status === 'running');
		
		if (syncActivities.length === 0) return;
		
		try {
			const progress = await convexClient.query(inboxApi.getSyncProgress, {});
			
			// Update all sync activities
			for (const activity of syncActivities) {
				if (progress) {
					// Progress is active
					updateActivity(activity.id, {
						status: 'running',
						progress: {
							step: progress.step,
							current: progress.current,
							total: progress.total,
							message: progress.message
						}
					});
				} else {
					// Progress cleared = sync completed
					updateActivity(activity.id, {
						status: 'completed',
						progress: undefined
					});
					
					// Auto-dismiss after delay if configured
					setupAutoDismiss();
				}
			}
		} catch (error) {
			console.error('Failed to poll sync progress:', error);
		}
	}
	
	/**
	 * Start polling for all activities
	 */
	function startGlobalPolling(): void {
		if (!browser) return;
		
		// Poll for all activity types
		startPolling(async () => {
			await pollSyncProgress();
			// Future: Add polling for other activity types here
		});
	}
	
	/**
	 * Handle activity dismiss
	 */
	function handleDismiss(activity: Activity): void {
		if (activity.onDismiss) {
			activity.onDismiss();
		}
		removeActivity(activity.id);
	}
	
	/**
	 * Handle activity cancel
	 */
	function handleCancel(activity: Activity): void {
		if (activity.onCancel) {
			activity.onCancel();
		}
		removeActivity(activity.id);
	}
	
	// Start polling when component mounts and activities exist
	$effect(() => {
		if (browser && activities.length > 0 && !activityState.pollingInterval) {
			startGlobalPolling();
		}
		
		if (browser && activities.length === 0 && activityState.pollingInterval) {
			stopPolling();
		}
	});
	
	// Cleanup on unmount
	onDestroy(() => {
		stopPolling();
	});
	
	// Auto-dismiss completed activities
	$effect(() => {
		if (activities.length > 0) {
			setupAutoDismiss();
		}
	});
</script>

{#if activities.length > 0}
	<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
		{#each activities as activity (activity.id)}
			<ActivityCard
				{activity}
				onDismiss={() => handleDismiss(activity)}
				onCancel={() => handleCancel(activity)}
			/>
		{/each}
	</div>
{/if}

<style>
	/* Ensure tracker stays above other content */
	:global(.fixed.bottom-4.right-4) {
		z-index: 9999;
	}
</style>

