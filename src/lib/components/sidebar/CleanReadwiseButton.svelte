<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import type { FunctionReference } from 'convex/server';
	import { page } from '$app/stores';

	let isCleaning = $state(false);
	let showConfirm = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	const convexClient = browser ? useConvexClient() : null;
	const cleanApi = browser
		? (makeFunctionReference('cleanReadwiseData:cleanReadwiseData') as FunctionReference<
				'action',
				'public',
				{ sessionId: string },
				{
					inboxItemsDeleted: number;
					highlightsDeleted: number;
					sourcesDeleted: number;
					orphanedAuthorsDeleted: number;
					orphanedTagsDeleted: number;
				}
			>)
		: null;

	async function handleClean() {
		if (!browser || !convexClient || !cleanApi) return;

		if (!showConfirm) {
			showConfirm = true;
			return;
		}

		const sessionId = $page.data.sessionId;
		if (!sessionId) {
			error = 'Session ID required';
			return;
		}

		isCleaning = true;
		error = null;
		success = false;

		try {
			const result = await convexClient.action(cleanApi, { sessionId });
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
		<p class="mb-1 px-nav-item py-1 text-label text-sidebar-tertiary">Are you sure?</p>
		<button
			type="button"
			onclick={handleClean}
			disabled={isCleaning}
			class="group flex w-full items-center gap-icon rounded-md bg-red-600 px-nav-item py-nav-item text-sm font-normal text-white transition-all duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			<svg
				class="h-4 w-4 flex-shrink-0"
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
			class="group flex w-full items-center gap-icon rounded-md px-nav-item py-nav-item text-sm font-normal text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
		>
			<span>Cancel</span>
		</button>
		{#if error}
			<p class="px-nav-item text-label text-red-500">{error}</p>
		{/if}
		{#if success}
			<p class="px-nav-item text-label text-green-500">Cleaned! Reloading...</p>
		{/if}
	</div>
{:else}
	<button
		type="button"
		onclick={handleClean}
		class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
	>
		<svg
			class="h-4 w-4 flex-shrink-0"
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
