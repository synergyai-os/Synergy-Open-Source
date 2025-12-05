<script lang="ts">
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import * as Dialog from '$lib/components/organisms/Dialog.svelte';
	import DialogContent from '$lib/components/organisms/Dialog.svelte';
	import { FormInput, FormTextarea, FormSelect } from '$lib/components/atoms';
	import { Button } from '$lib/components/atoms';
	import { toast } from 'svelte-sonner';
	import {
		CIRCLE_TYPES,
		DEFAULT_CIRCLE_TYPE_LABELS,
		DEFAULT_CIRCLE_TYPE_DESCRIPTIONS,
		type CircleType
	} from '$lib/infrastructure/organizational-model/constants';

	type Props = {
		open?: boolean;
		parentCircleId: Id<'circles'>;
		parentCircleName: string;
		workspaceId: Id<'workspaces'>;
		onSuccess?: () => void;
	};

	let {
		open = $bindable(false),
		parentCircleId,
		parentCircleName,
		workspaceId,
		onSuccess
	}: Props = $props();

	const convexClient = useConvexClient();

	let name = $state('');
	let purpose = $state('');
	let circleType = $state<CircleType>(CIRCLE_TYPES.HIERARCHY);
	let isSubmitting = $state(false);

	const circleTypeOptions = [
		{
			value: CIRCLE_TYPES.HIERARCHY,
			label: `${DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HIERARCHY]} - ${DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[CIRCLE_TYPES.HIERARCHY]}`
		},
		{
			value: CIRCLE_TYPES.EMPOWERED_TEAM,
			label: `${DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.EMPOWERED_TEAM]} - ${DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[CIRCLE_TYPES.EMPOWERED_TEAM]}`
		},
		{
			value: CIRCLE_TYPES.GUILD,
			label: `${DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.GUILD]} - ${DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[CIRCLE_TYPES.GUILD]}`
		},
		{
			value: CIRCLE_TYPES.HYBRID,
			label: `${DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HYBRID]} - ${DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[CIRCLE_TYPES.HYBRID]}`
		}
	];

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!name.trim()) {
			toast.error('Circle name is required');
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
			await convexClient.mutation(api.circles.create, {
				sessionId,
				workspaceId,
				name: name.trim(),
				purpose: purpose.trim() || undefined,
				parentCircleId,
				circleType
			});

			toast.success(`Circle "${name.trim()}" created`);
			name = '';
			purpose = '';
			circleType = CIRCLE_TYPES.HIERARCHY;
			open = false;
			onSuccess?.();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create circle';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen && !isSubmitting) {
			name = '';
			purpose = '';
			circleType = CIRCLE_TYPES.HIERARCHY;
		}
		open = newOpen;
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
		<DialogContent variant="default">
			<Dialog.Title>Add Sub-Circle to {parentCircleName}</Dialog.Title>
			<Dialog.Description>Create a new sub-circle within this circle.</Dialog.Description>

			<form onsubmit={handleSubmit} class="mt-section flex flex-col gap-form">
				<FormInput
					label="Name"
					placeholder="e.g., Engineering"
					bind:value={name}
					required
					disabled={isSubmitting}
				/>

				<FormSelect
					label="Circle Type"
					bind:value={circleType}
					options={circleTypeOptions}
					disabled={isSubmitting}
				/>

				<FormTextarea
					label="Purpose (optional)"
					placeholder="Describe the circle's purpose..."
					bind:value={purpose}
					rows={3}
					disabled={isSubmitting}
				/>

				<div class="mt-section flex items-center justify-end gap-button">
					<Dialog.Close asChild>
						<Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
					</Dialog.Close>
					<Button type="submit" disabled={isSubmitting || !name.trim()}>
						{isSubmitting ? 'Creating...' : 'Create Circle'}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog.Portal>
</Dialog.Root>
