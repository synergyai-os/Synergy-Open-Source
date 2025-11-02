<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';

	let isCleaning = $state(false);
	let showConfirm = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	const convexClient = browser ? useConvexClient() : null;
	const cleanApi = browser ? makeFunctionReference('cleanReadwiseData:cleanReadwiseData') as any : null;

	async function handleClean() {
		if (!browser || !convexClient || !cleanApi) return;

		if (!showConfirm) {
			showConfirm = true;
			return;
		}

		isCleaning = true;
		error = null;
		success = false;

		try {
			const result = await convexClient.action(cleanApi, {});
			console.log('Cleanup result:', result);
			success = true;
			
			// Reload page after 1 second to refresh data
			setTimeout(() => {
				if (browser) {
					window.location.reload();
				}
			}, 1000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to clean data';
			console.error('Cleanup error:', err);
		} finally {
			isCleaning = false;
		}
	}

	function handleCancel() {
		showConfirm = false;
		error = null;
		success = false;
	}
</script>

{#if showConfirm}
	<div class="space-y-0.5">
		<p class="text-label text-sidebar-tertiary px-nav-item py-1 mb-1">
			Are you sure?
		</p>
		<button
			type="button"
			onclick={handleClean}
			disabled={isCleaning}
			class="group w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 text-sm text-white font-normal"
		>
			<svg
				class="w-4 h-4 flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
				/>
			</svg>
			<span>{isCleaning ? 'Cleaning...' : 'Confirm Delete'}</span>
		</button>
		<button
			type="button"
			onclick={handleCancel}
			disabled={isCleaning}
			class="group w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary font-normal"
		>
			<span>Cancel</span>
		</button>
		{#if error}
			<p class="text-label text-red-500 px-nav-item">{error}</p>
		{/if}
		{#if success}
			<p class="text-label text-green-500 px-nav-item">Cleaned! Reloading...</p>
		{/if}
	</div>
{:else}
	<button
		type="button"
		onclick={handleClean}
		class="group flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
	>
		<svg
			class="w-4 h-4 flex-shrink-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
			/>
		</svg>
		<span class="font-normal">Clean Readwise Sync</span>
	</button>
{/if}

