<script lang="ts">
	import type { Id } from '../../../../convex/_generated/dataModel';
	import { onMount } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';

	type Tag = {
		_id: Id<'tags'>;
		displayName: string;
		color: string;
		ownershipType?: 'user' | 'organization' | 'team';
	};

	type Organization = {
		organizationId: string;
		name: string;
		slug: string;
	};

	type Props = {
		tag: Tag;
		organizations: Organization[];
		isSharing: boolean;
		onShare: (shareWith: 'organization', targetId: string) => void;
		onClose: () => void;
	};

	let { tag, organizations, isSharing, onShare, onClose }: Props = $props();

	let selectedOrganization = $state<string>('');

	// Fetch item counts for this tag
	const itemCountsQuery = useQuery(api.tags.countTagItems, () => ({ tagId: tag._id }));
	const itemCounts = $derived(itemCountsQuery?.data ?? { highlights: 0, flashcards: 0, total: 0 });

	// Auto-select first org if available
	onMount(() => {
		if (organizations.length > 0) {
			selectedOrganization = organizations[0].organizationId;
		}
	});

	function handleSubmit() {
		if (!selectedOrganization) return;
		onShare('organization', selectedOrganization);
	}

	// Handle backdrop click
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	// Handle escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Modal Backdrop -->
<div
	class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
	onclick={handleBackdropClick}
	role="presentation"
>
	<!-- Modal Content -->
	<div
		class="bg-elevated border border-base rounded-lg shadow-lg max-w-md w-full"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal Header -->
		<div class="border-b border-base px-6 py-4">
			<h2 id="modal-title" class="text-lg font-semibold text-primary flex items-center gap-2">
				<div 
					class="w-3 h-3 rounded-full flex-shrink-0" 
					style="background-color: {tag.color}"
				></div>
				Transfer "{tag.displayName}"
			</h2>
		</div>

		<!-- Modal Body -->
		<div class="px-6 py-5 space-y-4">
			{#if organizations.length === 0}
				<div class="text-sm text-secondary">
					<p class="mb-2">You're not part of any organizations yet.</p>
					<p class="text-tertiary">Create or join an organization to share tags with your team.</p>
				</div>
			{:else}
				<!-- Transfer To -->
				<div>
					<label for="organization-select" class="block text-sm font-medium text-primary mb-2">
						Transfer to organization
					</label>
					<select
						id="organization-select"
						bind:value={selectedOrganization}
						class="w-full px-3 py-2 bg-base border border-base rounded-md text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
						disabled={isSharing}
					>
						{#each organizations as org (org.organizationId)}
							<option value={org.organizationId}>{org.name}</option>
						{/each}
					</select>
				</div>

				<!-- Items to Transfer -->
				{#if itemCounts.total > 0}
					<div class="bg-base border border-base rounded-md p-3">
						<p class="text-sm font-medium text-primary mb-2">This will transfer:</p>
						<ul class="text-sm text-secondary space-y-1">
							<li>• The collection itself</li>
							{#if itemCounts.highlights > 0}
								<li>• {itemCounts.highlights} highlight{itemCounts.highlights !== 1 ? 's' : ''}</li>
							{/if}
							{#if itemCounts.flashcards > 0}
								<li>• {itemCounts.flashcards} flashcard{itemCounts.flashcards !== 1 ? 's' : ''}</li>
							{/if}
						</ul>
					</div>
				{/if}

				<!-- Warning Message -->
				<div class="bg-accent-primary/10 border border-accent-primary/20 rounded-md p-3">
					<div class="flex gap-2">
						<svg class="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div class="text-sm">
							<p class="font-medium text-accent-primary mb-1">After transferring:</p>
							<ul class="text-tertiary space-y-1 text-label">
								<li>• Organization will own this collection</li>
								<li>• All members can view and contribute</li>
								<li>• You'll still have access as a member</li>
								<li>• It won't appear in your personal space</li>
							</ul>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Modal Footer -->
		<div class="border-t border-base px-6 py-4 flex items-center justify-end gap-3">
			<button
				type="button"
				onclick={onClose}
				disabled={isSharing}
				class="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Cancel
			</button>
			{#if organizations.length > 0}
				<button
					type="button"
					onclick={handleSubmit}
					disabled={isSharing || !selectedOrganization}
					class="px-4 py-2 text-sm font-medium bg-accent-primary text-white rounded-md hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{#if isSharing}
						<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Transferring...
					{:else}
						Transfer to Organization
					{/if}
				</button>
			{/if}
		</div>
	</div>
</div>

