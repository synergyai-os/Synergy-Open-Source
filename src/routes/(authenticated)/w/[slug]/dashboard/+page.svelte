<script lang="ts">
	/**
	 * Dashboard Page - User's action items and upcoming meetings
	 */

	import { page } from '$app/stores';
	import ActionItemsList from '$lib/modules/core/components/dashboard/ActionItemsList.svelte';

	// Get session from page data
	const sessionId = $derived($page.data.sessionId);
</script>

<!-- Title is set by workspace layout -->

<!-- Dashboard Page -->
<div class="bg-base h-full overflow-y-auto">
	<!-- Header -->
	<div class="border-border-base bg-base border-b">
		<div class="px-page py-page mx-auto max-w-6xl">
			<div class="flex items-center gap-2">
				<!-- Icon -->
				<div
					class="size-avatar-lg rounded-avatar bg-accent-primary flex items-center justify-center"
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
					<h1 class="text-h2 text-text-primary font-semibold">Dashboard</h1>
					<p class="mt-form-section text-small text-text-secondary">
						Track your action items and stay on top of what needs to get done.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="px-page py-page mx-auto max-w-6xl">
		<!-- My Action Items Section -->
		<section class="mb-content-padding">
			<h2 class="text-h3 mb-content-section text-text-primary font-semibold">My Action Items</h2>
			<ActionItemsList {sessionId} />
		</section>

		<!-- Future: Decisions to Review -->
		<!-- <section class="mb-content-padding">
				<h2 class="mb-content-section text-h3 font-semibold text-text-primary">Decisions to Review</h2>
				<div class="bg-surface rounded-card border border-dashed border-border-base text-center text-text-tertiary" style="padding-block: var(--spacing-8);">
					Coming soon
				</div>
			</section> -->

		<!-- Future: Upcoming Meetings -->
		<!-- <section>
				<h2 class="mb-content-section text-h3 font-semibold text-text-primary">Upcoming Meetings</h2>
				<div class="bg-surface rounded-card border border-dashed border-border-base text-center text-text-tertiary" style="padding-block: var(--spacing-8);">
					Coming soon
				</div>
			</section> -->
	</div>
</div>
