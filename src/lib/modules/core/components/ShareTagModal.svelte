<script lang="ts">
	import type { Id } from '$convex/_generated/dataModel';
	import { onMount } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	type Tag = {
		_id: Id<'tags'>;
		displayName: string;
		color: string;
	};

	type Organization = {
		workspaceId: string;
		name: string;
		slug: string;
	};

	type Props = {
		tag: Tag;
		workspaces: Organization[];
		isSharing: boolean;
		onShare: (shareWith: 'workspace', targetId: string) => void;
		onClose: () => void;
	};

	let { tag, workspaces, isSharing, onShare, onClose }: Props = $props();

	const getSessionId = () => $page.data.sessionId;
	let selectedOrganization = $state<string>('');

	// Fetch item counts for this tag
	const itemCountsQuery =
		browser && getSessionId()
			? useQuery(api.tags.countTagItems, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					return {
						sessionId,
						tagId: tag._id
					};
				})
			: null;
	const itemCounts = $derived(itemCountsQuery?.data ?? { highlights: 0, flashcards: 0, total: 0 });

	// Auto-select first org if available
	onMount(() => {
		if (workspaces.length > 0) {
			selectedOrganization = workspaces[0].workspaceId;
		}
	});

	function handleSubmit() {
		if (!selectedOrganization) return;
		onShare('workspace', selectedOrganization);
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
	class="p-modal-padding fixed inset-0 z-50 flex items-center justify-center bg-black/50"
	onclick={handleBackdropClick}
	role="presentation"
>
	<!-- Modal Content -->
	<div
		class="border-base w-full max-w-md rounded-card border bg-elevated shadow-card"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal Header -->
		<div class="border-base px-card py-card border-b">
			<h2 id="modal-title" class="text-h3 flex items-center gap-2 font-semibold text-primary">
				<div class="icon-xs flex-shrink-0 rounded-full" style="background-color: {tag.color}"></div>
				Transfer "{tag.displayName}"
			</h2>
		</div>

		<!-- Modal Body -->
		<div class="space-y-content-section px-card py-card">
			{#if workspaces.length === 0}
				<div class="text-small text-secondary">
					<p class="mb-form-field-gap">You're not part of any workspaces yet.</p>
					<p class="text-tertiary">Create or join an workspace to share tags with your team.</p>
				</div>
			{:else}
				<!-- Transfer To -->
				<div>
					<label
						for="workspace-select"
						class="mb-form-field-gap text-small block font-medium text-primary"
					>
						Transfer to workspace
					</label>
					<select
						id="workspace-select"
						bind:value={selectedOrganization}
						class="border-base text-small focus:ring-accent-primary w-full rounded-input border bg-base px-input-x py-input-y text-primary focus:border-transparent focus:ring-2 focus:outline-none"
						disabled={isSharing}
					>
						{#each workspaces as org (org.workspaceId)}
							<option value={org.workspaceId}>{org.name}</option>
						{/each}
					</select>
				</div>

				<!-- Items to Transfer -->
				{#if itemCounts.total > 0}
					<div class="border-base px-card py-card rounded-card border bg-base">
						<p class="mb-form-field-gap text-small font-medium text-primary">This will transfer:</p>
						<ul class="space-y-form-field-gap text-small text-secondary">
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
				<div
					class="border-accent-primary/20 bg-accent-primary/10 px-card py-card rounded-card border"
				>
					<div class="flex gap-2">
						<svg
							class="mt-form-field-gap size-icon-md flex-shrink-0 text-accent-primary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div class="text-small">
							<p class="mb-form-field-gap font-medium text-accent-primary">After transferring:</p>
							<ul class="space-y-form-field-gap text-label text-tertiary">
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
		<div
			class="gap-content-section border-base px-card py-card flex items-center justify-end border-t"
		>
			<button
				type="button"
				onclick={onClose}
				disabled={isSharing}
				class="text-small px-button-x py-button-y font-medium text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
			>
				Cancel
			</button>
			{#if workspaces.length > 0}
				<button
					type="button"
					onclick={handleSubmit}
					disabled={isSharing || !selectedOrganization}
					class="text-small hover:bg-accent-primary/90 flex items-center gap-2 rounded-button bg-accent-primary px-button-x py-button-y font-medium text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSharing}
						<svg class="icon-sm animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
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
