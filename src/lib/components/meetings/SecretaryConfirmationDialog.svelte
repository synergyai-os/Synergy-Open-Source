<script lang="ts">
	/**
	 * Secretary Confirmation Dialog Component
	 *
	 * Modal dialog that shows when someone requests a secretary change
	 * Only visible to current secretary
	 * Real-time subscription via parent
	 */

	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { toast } from 'svelte-sonner';

	interface SecretaryRequest {
		_id: Id<'secretaryChangeRequests'>;
		requestedByName: string;
		requestedForName: string;
	}

	interface Props {
		request: SecretaryRequest | null;
		sessionId: string;
		onClose: () => void;
	}

	const { request, sessionId, onClose }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	let isProcessing = $state(false);

	async function handleApprove() {
		if (!convexClient || !request || isProcessing) return;
		isProcessing = true;

		try {
			await convexClient.mutation(api.meetings.approveSecretaryChange, {
				sessionId,
				requestId: request._id
			});

			toast.success(`${request.requestedForName} is now the secretary`);
			onClose();
		} catch (error) {
			console.error('Failed to approve secretary change:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to approve change');
		} finally {
			isProcessing = false;
		}
	}

	async function handleDeny() {
		if (!convexClient || !request || isProcessing) return;
		isProcessing = true;

		try {
			await convexClient.mutation(api.meetings.denySecretaryChange, {
				sessionId,
				requestId: request._id
			});

			toast.info('Secretary change request denied');
			onClose();
		} catch (error) {
			console.error('Failed to deny secretary change:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to deny change');
		} finally {
			isProcessing = false;
		}
	}
</script>

{#if request}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-50 bg-black/50"
		onclick={handleDeny}
		aria-label="Close dialog"
	></button>

	<!-- Modal -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
	>
		<div
			class="bg-surface-base w-full max-w-md rounded-lg border border-border-base p-6 shadow-lg"
			role="document"
		>
			<!-- Header -->
			<h2 id="dialog-title" class="text-xl font-semibold text-text-primary">
				Secretary Change Request
			</h2>

			<!-- Content -->
			<div class="mt-4 text-sm text-text-secondary">
				<span class="text-text-primary">{request.requestedByName}</span>
				requests to change the secretary to
				<span class="text-text-primary">{request.requestedForName}</span>.
				<br /><br />
				Do you approve this change?
			</div>

			<!-- Actions -->
			<div class="mt-6 flex justify-end gap-3">
				<button
					type="button"
					onclick={handleDeny}
					disabled={isProcessing}
					class="hover:bg-surface-hover rounded-md border border-border-base px-4 py-2 text-sm font-medium text-text-secondary transition-colors disabled:opacity-50"
				>
					Deny
				</button>
				<button
					type="button"
					onclick={handleApprove}
					disabled={isProcessing}
					class="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
				>
					{isProcessing ? 'Processing...' : 'Approve'}
				</button>
			</div>
		</div>
	</div>
{/if}
