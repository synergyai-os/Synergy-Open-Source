<script lang="ts">
	/**
	 * Dashboard Page - User's action items and upcoming meetings
	 * Feature flag: meetings-module (SYOS-225)
	 */

	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import ActionItemsList from '$lib/components/dashboard/ActionItemsList.svelte';
	import { FeatureFlags } from '$lib/infrastructure/feature-flags';
	import { resolveRoute } from '$lib/utils/navigation';

	// Get session from page data
	const sessionId = $derived($page.data.sessionId);

	// Check feature flag
	const getSessionId = () => sessionId();
	const flagQuery =
		browser && getSessionId()
			? useQuery(api.featureFlags.checkFlag, () => {
					const session = getSessionId();
					if (!session) throw new Error('sessionId required');
					return {
						flag: FeatureFlags.MEETINGS_MODULE,
						sessionId: session
					};
				})
			: null;

	const featureEnabled = $derived(flagQuery?.data ?? false);

	// Redirect if feature not enabled
	$effect(() => {
		if (browser && !flagQuery?.isLoading && !featureEnabled) {
			goto(resolveRoute('/'));
		}
	});
</script>

<svelte:head>
	<title>Dashboard - SynergyOS</title>
</svelte:head>

{#if !featureEnabled && !flagQuery?.isLoading}
	<!-- Feature not enabled - will redirect -->
	<div class="flex min-h-screen items-center justify-center bg-base">
		<div class="text-text-secondary">Redirecting...</div>
	</div>
{:else if flagQuery?.isLoading}
	<!-- Loading -->
	<div class="flex min-h-screen items-center justify-center bg-base">
		<div class="text-text-secondary">Loading...</div>
	</div>
{:else}
	<!-- Dashboard Page -->
	<div class="h-full overflow-y-auto bg-base">
		<!-- Header -->
		<div class="border-b border-border-base bg-base">
			<div class="mx-auto max-w-6xl px-content-padding py-content-padding">
				<div class="flex items-center gap-icon">
					<!-- Icon -->
					<div
						class="flex size-avatar-lg items-center justify-center rounded-avatar bg-accent-primary"
					>
						<svg class="icon-lg text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
							/>
						</svg>
					</div>
					<div class="flex-1">
						<h1 class="text-h2 font-semibold text-text-primary">Dashboard</h1>
						<p class="mt-form-section text-small text-text-secondary">
							Track your action items and stay on top of what needs to get done.
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="mx-auto max-w-6xl px-content-padding py-content-padding">
			<!-- My Action Items Section -->
			<section class="mb-content-padding">
				<h2 class="mb-content-section text-h3 font-semibold text-text-primary">My Action Items</h2>
				<ActionItemsList {sessionId} />
			</section>

			<!-- Future: Decisions to Review -->
			<!-- <section class="mb-8">
				<h2 class="mb-4 text-lg font-semibold text-text-primary">Decisions to Review</h2>
				<div class="bg-surface rounded-card border border-dashed border-border-base py-readable-quote text-center text-text-tertiary">
					Coming soon
				</div>
			</section> -->

			<!-- Future: Upcoming Meetings -->
			<!-- <section>
				<h2 class="mb-4 text-lg font-semibold text-text-primary">Upcoming Meetings</h2>
				<div class="bg-surface rounded-card border border-dashed border-border-base py-readable-quote text-center text-text-tertiary">
					Coming soon
				</div>
			</section> -->
		</div>
	</div>
{/if}
