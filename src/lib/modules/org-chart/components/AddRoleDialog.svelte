<script lang="ts">
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import * as Dialog from '$lib/components/organisms/Dialog.svelte';
	import DialogContent from '$lib/components/organisms/Dialog.svelte';
	import { FormInput, FormTextarea } from '$lib/components/atoms';
	import { Button } from '$lib/components/atoms';
	import { toast } from 'svelte-sonner';

	type Props = {
		open?: boolean;
		circleId: Id<'circles'>;
		circleName: string;
		workspaceId: Id<'workspaces'>;
		onSuccess?: () => void;
	};

	let { open = $bindable(false), circleId, circleName, workspaceId, onSuccess }: Props = $props();

	const convexClient = useConvexClient();

	let name = $state('');
	let purpose = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!name.trim()) {
			toast.error('Role name is required');
			return;
		}

		if (!convexClient) {
			toast.error('Convex client not available');
			return;
		}

		const sessionId = $page.data.sessionId;
		if (!sessionId) {
			toast.error('Session not available');
			return;
		}

		isSubmitting = true;
		try {
			await convexClient.mutation(api.circleRoles.create, {
				sessionId,
				circleId,
				name: name.trim(),
				purpose: purpose.trim() || undefined
			});

			toast.success(`Role "${name.trim()}" created`);
			name = '';
			purpose = '';
			open = false;
			onSuccess?.();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create role';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen && !isSubmitting) {
			name = '';
			purpose = '';
		}
		open = newOpen;
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
		<DialogContent variant="default">
			<Dialog.Title>Add Role to {circleName}</Dialog.Title>
			<Dialog.Description>Create a new role in this circle.</Dialog.Description>

			<form onsubmit={handleSubmit} class="mt-section flex flex-col gap-form">
				<FormInput
					label="Name"
					placeholder="e.g., Senior Engineer"
					bind:value={name}
					required
					disabled={isSubmitting}
				/>

				<FormTextarea
					label="Purpose (optional)"
					placeholder="Describe the role's purpose..."
					bind:value={purpose}
					rows={3}
					disabled={isSubmitting}
				/>

				<div class="mt-section flex items-center justify-end gap-button">
					<Dialog.Close asChild>
						<Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
					</Dialog.Close>
					<Button type="submit" disabled={isSubmitting || !name.trim()}>
						{isSubmitting ? 'Creating...' : 'Create Role'}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog.Portal>
</Dialog.Root>
