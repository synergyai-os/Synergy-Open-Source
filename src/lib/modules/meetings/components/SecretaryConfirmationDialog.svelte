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
	import { Button, Text, Heading } from '$lib/components/atoms';

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
		class="p-card fixed inset-0 z-50 flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
	>
		<div
			class="max-w-dialog-md rounded-dialog border-border-base p-modal-padding w-full border bg-surface shadow-card"
			role="document"
		>
			<!-- Header -->
			<Heading level="h2" size="h2" id="dialog-title">Secretary Change Request</Heading>

			<!-- Content -->
			<div class="mt-content-section">
				<Text variant="body" size="sm" color="secondary" as="p">
					<Text variant="body" size="sm" color="default" as="span">{request.requestedByName}</Text>
					requests to change the secretary to
					<Text variant="body" size="sm" color="default" as="span">{request.requestedForName}</Text
					>.
				</Text>
				<Text variant="body" size="sm" color="secondary" as="p" class="mt-content-gap">
					Do you approve this change?
				</Text>
			</div>

			<!-- Actions -->
			<div class="mt-section-gap flex justify-end gap-fieldGroup">
				<Button variant="outline" onclick={handleDeny} disabled={isProcessing}>Deny</Button>
				<Button variant="primary" onclick={handleApprove} disabled={isProcessing}>
					{isProcessing ? 'Processing...' : 'Approve'}
				</Button>
			</div>
		</div>
	</div>
{/if}
