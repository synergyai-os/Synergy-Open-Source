<script lang="ts">
	/**
	 * ImportProposalModal Component
	 *
	 * Modal for importing proposals into a governance meeting.
	 * Shows proposals filtered by meeting's circle, allows multi-select.
	 *
	 * SYOS-666 Phase 3: Meeting Import
	 */

	import { browser } from '$app/environment';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import * as Dialog from '$lib/components/organisms/Dialog.svelte';
	import DialogContent from '$lib/components/organisms/Dialog.svelte';
	import { Button, Heading, Text, Icon } from '$lib/components/atoms';
	import ProposalCard from './ProposalCard.svelte';
	import type { Proposal } from '../../composables/useProposals.svelte';
	import { useProposalMutations } from '../../composables/useProposals.svelte';
	import { toast } from 'svelte-sonner';
	import { SvelteSet } from 'svelte/reactivity';

	type Props = {
		open: boolean;
		meetingId: Id<'meetings'>;
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		onOpenChange: (open: boolean) => void;
		onImportComplete?: () => void;
	};

	let { open, meetingId, sessionId, workspaceId, onOpenChange, onImportComplete }: Props = $props();

	// Query meeting to check if it has a circleId
	const meetingQuery = $derived(
		browser && open && sessionId && meetingId
			? useQuery(api.features.meetings.meetings.get, () => ({
					sessionId,
					meetingId
				}))
			: null
	);

	const meeting = $derived(meetingQuery?.data);
	const hasCircleId = $derived(!!meeting?.circleId);

	// Query importable proposals
	const proposalsQuery = $derived(
		browser && open && sessionId && meetingId && hasCircleId
			? useQuery(api.core.proposals.index.listForMeetingImport, () => ({
					sessionId,
					meetingId
				}))
			: null
	);

	const proposals = $derived((proposalsQuery?.data ?? []) as Proposal[]);
	const isLoading = $derived(proposalsQuery?.isLoading ?? meetingQuery?.isLoading ?? false);
	const error = $derived(proposalsQuery?.error ?? meetingQuery?.error ?? null);

	// Selected proposals state
	let selectedIds = new SvelteSet<Id<'circleProposals'>>();

	// Mutations
	const mutations = useProposalMutations({
		sessionId: () => sessionId,
		workspaceId: () => workspaceId
	});

	// Toggle proposal selection
	function toggleSelection(proposalId: Id<'circleProposals'>) {
		if (selectedIds.has(proposalId)) {
			selectedIds.delete(proposalId);
		} else {
			selectedIds.add(proposalId);
		}
	}

	// Select all / deselect all
	function toggleSelectAll() {
		if (selectedIds.size === proposals.length) {
			selectedIds.clear();
		} else {
			selectedIds = new SvelteSet(proposals.map((p) => p._id));
		}
	}

	// Handle import
	async function handleImport() {
		if (selectedIds.size === 0) {
			toast.error('Please select at least one proposal');
			return;
		}

		try {
			await mutations.importToMeeting({
				meetingId,
				proposalIds: Array.from(selectedIds)
			});

			toast.success(`Imported ${selectedIds.size} proposal${selectedIds.size === 1 ? '' : 's'}`);
			selectedIds = new SvelteSet();
			onOpenChange(false);
			onImportComplete?.();
		} catch (err) {
			console.error('Failed to import proposals:', err);
			toast.error(mutations.error || 'Failed to import proposals');
		}
	}

	// Reset selection when modal closes
	$effect(() => {
		if (!open) {
			selectedIds = new SvelteSet();
		}
	});
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm" />
		<DialogContent variant="wide" class="max-h-[90vh]">
			<!-- Header -->
			<div class="border-border pb-header mb-section flex items-center justify-between border-b">
				<Heading level={2} size="h3" class="font-semibold">Import Proposals</Heading>
				<Dialog.Close>
					<Button variant="ghost" size="sm" class="text-tertiary">
						<Icon name="close" size="sm" />
					</Button>
				</Dialog.Close>
			</div>

			<!-- Content -->
			<div class="space-y-section">
				{#if isLoading}
					<div class="flex h-64 items-center justify-center">
						<Text variant="body" color="secondary">Loading proposals...</Text>
					</div>
				{:else if error}
					<div class="flex h-64 flex-col items-center justify-center">
						<Text variant="body" color="error" class="mb-2">
							Failed to load proposals: {error?.message ?? 'Unknown error'}
						</Text>
						<Button variant="outline" size="sm" onclick={() => window.location.reload()}>
							Reload Page
						</Button>
					</div>
				{:else if !hasCircleId}
					<!-- No Circle Linked -->
					<div class="flex h-64 flex-col items-center justify-center">
						<div class="mb-4 text-6xl">🔗</div>
						<Heading level={3} class="mb-2">Meeting Not Linked to Circle</Heading>
						<Text variant="body" color="secondary" class="max-w-md text-center">
							This governance meeting needs to be linked to a circle to import proposals. Please
							link the meeting to a circle in the meeting settings.
						</Text>
					</div>
				{:else if proposals.length === 0}
					<!-- Empty State -->
					<div class="flex h-64 flex-col items-center justify-center">
						<div class="mb-4 text-6xl">📋</div>
						<Heading level={3} class="mb-2">No proposals available</Heading>
						<Text variant="body" color="secondary" class="max-w-md text-center">
							There are no submitted proposals for this circle. Create proposals by editing circles
							or roles and clicking "Save as Proposal".
						</Text>
					</div>
				{:else}
					<!-- Proposals List -->
					<div>
						<div class="mb-header flex items-center justify-between">
							<Text variant="label" color="secondary">
								{proposals.length} proposal{proposals.length === 1 ? '' : 's'} available
							</Text>
							{#if proposals.length > 0}
								<Button variant="ghost" size="sm" onclick={toggleSelectAll}>
									{selectedIds.size === proposals.length ? 'Deselect All' : 'Select All'}
								</Button>
							{/if}
						</div>

						<div class="max-h-[60vh] space-y-2 overflow-y-auto">
							{#each proposals as proposal (proposal._id)}
								<label
									class="border-border p-card hover:bg-surface-hover gap-fieldGroup rounded-card bg-surface flex cursor-pointer items-start border transition-colors {selectedIds.has(
										proposal._id
									)
										? 'bg-accent-primary/5 border-accent-primary'
										: ''}"
								>
									<!-- Checkbox -->
									<input
										type="checkbox"
										checked={selectedIds.has(proposal._id)}
										onchange={() => toggleSelection(proposal._id)}
										class="border-border focus:ring-accent-primary size-icon-sm text-accent-primary mt-1 cursor-pointer rounded focus:ring-2 focus:ring-offset-1"
									/>

									<!-- Proposal Card Content -->
									<div class="min-w-0 flex-1">
										<ProposalCard {proposal} />
									</div>
								</label>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer Actions -->
			{#if proposals.length > 0}
				<div
					class="mt-section border-border pt-header gap-button flex items-center justify-end border-t"
				>
					<Dialog.Close>
						<Button variant="outline">Cancel</Button>
					</Dialog.Close>
					<Button
						variant="primary"
						onclick={handleImport}
						disabled={selectedIds.size === 0 || mutations.isImporting}
					>
						{mutations.isImporting
							? 'Importing...'
							: `Import ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
					</Button>
				</div>
			{/if}
		</DialogContent>
	</Dialog.Portal>
</Dialog.Root>
