<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { FeatureFlags } from '$lib/featureFlags';
	import { reportFeatureFlagCheck } from '$lib/utils/errorReporting';
	import { browser } from '$app/environment';

	let { data } = $props();

	// Get sessionId from page data - use function getter pattern for reactivity
	// Pattern matches other authenticated pages (inbox, tags, etc.)
	const getSessionId = () => data.sessionId;

	// Batch query all flags at once for better performance
	// Reduces 3 network round trips → 1, validates session once instead of 3x
	const flagsQuery =
		browser && getSessionId()
			? useQuery(api.featureFlags.checkFlags, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					return {
						sessionId,
						flags: [
							FeatureFlags.ORG_MODULE_BETA,
							FeatureFlags.MEETING_MODULE_BETA,
							FeatureFlags.MEETING_INTEGRATIONS_BETA
						]
					};
				})
			: null;

	const orgEnabled = $derived(flagsQuery?.data?.[FeatureFlags.ORG_MODULE_BETA] ?? false);
	const meetingEnabled = $derived(flagsQuery?.data?.[FeatureFlags.MEETING_MODULE_BETA] ?? false);
	const integrationsEnabled = $derived(
		flagsQuery?.data?.[FeatureFlags.MEETING_INTEGRATIONS_BETA] ?? false
	);

	// Track flag checks to PostHog when flags data is available
	// Get userId from page data for PostHog tracking
	const getUserId = () => data.user?.userId;

	if (browser) {
		$effect(() => {
			const userId = getUserId();
			const flagsData = flagsQuery?.data;
			if (flagsData && userId) {
				// Track all flags when data becomes available
				reportFeatureFlagCheck(FeatureFlags.ORG_MODULE_BETA, orgEnabled, userId);
				reportFeatureFlagCheck(FeatureFlags.MEETING_MODULE_BETA, meetingEnabled, userId);
				reportFeatureFlagCheck(FeatureFlags.MEETING_INTEGRATIONS_BETA, integrationsEnabled, userId);
			}
		});
	}
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-6 text-2xl font-bold">Feature Flag Test Page</h1>

	{#if !getSessionId()}
		<p class="text-red-500">Not authenticated - please log in</p>
	{:else}
		<div class="space-y-4">
			<div class="rounded-lg border p-4">
				<h2 class="mb-2 text-lg font-semibold">Org Module Beta</h2>
				<p class="mb-2 text-sm text-gray-600">Flag: {FeatureFlags.ORG_MODULE_BETA}</p>
				<p class="text-lg">
					Status: <span class="font-bold">{orgEnabled ? '✅ Enabled' : '❌ Disabled'}</span>
				</p>
				{#if flagsQuery === undefined}
					<p class="text-sm text-gray-500">Loading...</p>
				{/if}
			</div>

			<div class="rounded-lg border p-4">
				<h2 class="mb-2 text-lg font-semibold">Meeting Module Beta</h2>
				<p class="mb-2 text-sm text-gray-600">Flag: {FeatureFlags.MEETING_MODULE_BETA}</p>
				<p class="text-lg">
					Status: <span class="font-bold">{meetingEnabled ? '✅ Enabled' : '❌ Disabled'}</span>
				</p>
				{#if flagsQuery === undefined}
					<p class="text-sm text-gray-500">Loading...</p>
				{/if}
			</div>

			<div class="rounded-lg border p-4">
				<h2 class="mb-2 text-lg font-semibold">Meeting Integrations Beta</h2>
				<p class="mb-2 text-sm text-gray-600">
					Flag: {FeatureFlags.MEETING_INTEGRATIONS_BETA}
				</p>
				<p class="text-lg">
					Status:
					<span class="font-bold">{integrationsEnabled ? '✅ Enabled' : '❌ Disabled'}</span>
				</p>
				{#if flagsQuery === undefined}
					<p class="text-sm text-gray-500">Loading...</p>
				{/if}
			</div>

			<div class="mt-6 rounded-lg bg-gray-100 p-4">
				<h3 class="mb-2 font-semibold">Debug Info</h3>
				<p class="text-sm">Session ID: {getSessionId() ?? 'N/A'}</p>
				<p class="text-sm">User ID: {getUserId() ?? 'N/A'}</p>
				<p class="text-sm">Email: {data.user?.email ?? 'N/A'}</p>
			</div>
		</div>
	{/if}
</div>
