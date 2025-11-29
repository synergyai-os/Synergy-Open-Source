<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import type { FunctionReference } from 'convex/server';
	import { page } from '$app/stores';
	import { Icon, Text } from '$lib/components/atoms';
	import { navItemRecipe } from '$lib/design-system/recipes';

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

	// Use NavItem recipe for consistent styling
	const buttonClasses = $derived(navItemRecipe({ state: 'default', collapsed: false }));

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
	<div class="space-y-1">
		<p class="px-2 py-1 text-label text-tertiary">Are you sure?</p>
		<button
			type="button"
			onclick={handleClean}
			disabled={isCleaning}
			class="group flex w-full items-center gap-button rounded-button bg-status-error px-2 py-[0.375rem] text-sm text-inverse transition-all duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
		>
			<Icon type="delete" size="sm" />
			<Text variant="body" size="sm" as="span" class="font-normal">
				{isCleaning ? 'Cleaning...' : 'Confirm Delete'}
			</Text>
		</button>
		<button type="button" onclick={handleCancel} disabled={isCleaning} class={buttonClasses}>
			<Text variant="body" size="sm" as="span" class="font-normal">Cancel</Text>
		</button>
		{#if error}
			<p class="px-2 text-label text-error">{error}</p>
		{/if}
		{#if success}
			<p class="px-2 text-label text-success">Cleaned! Reloading...</p>
		{/if}
	</div>
{:else}
	<button type="button" onclick={handleClean} class={buttonClasses}>
		<Icon type="delete" size="sm" />
		<Text variant="body" size="sm" as="span" class="min-w-0 flex-1 font-normal">
			Clean Readwise Sync
		</Text>
	</button>
{/if}
