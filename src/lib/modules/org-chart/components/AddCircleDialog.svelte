<script lang="ts">
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { StandardDialog } from '$lib/components/organisms';
	import { FormInput, FormTextarea, FormSelect } from '$lib/components/atoms';
	import { toast } from 'svelte-sonner';
	import {
		LEAD_AUTHORITY,
		DEFAULT_LEAD_AUTHORITY_LABELS,
		DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS,
		type LeadAuthority
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
	let leadAuthority = $state<LeadAuthority>(LEAD_AUTHORITY.DECIDES);
	let isSubmitting = $state(false);

	const leadAuthorityOptions = [
		{
			value: LEAD_AUTHORITY.DECIDES,
			label: `${DEFAULT_LEAD_AUTHORITY_LABELS[LEAD_AUTHORITY.DECIDES]} - ${DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS[LEAD_AUTHORITY.DECIDES]}`
		},
		{
			value: LEAD_AUTHORITY.FACILITATES,
			label: `${DEFAULT_LEAD_AUTHORITY_LABELS[LEAD_AUTHORITY.FACILITATES]} - ${DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS[LEAD_AUTHORITY.FACILITATES]}`
		},
		{
			value: LEAD_AUTHORITY.CONVENES,
			label: `${DEFAULT_LEAD_AUTHORITY_LABELS[LEAD_AUTHORITY.CONVENES]} - ${DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS[LEAD_AUTHORITY.CONVENES]}`
		}
	];

	async function handleSubmit() {
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
			await convexClient.mutation(api.core.circles.index.create, {
				sessionId,
				workspaceId,
				name: name.trim(),
				purpose: purpose.trim() || undefined,
				parentCircleId,
				leadAuthority
			});

			toast.success(`Circle "${name.trim()}" created`);
			name = '';
			purpose = '';
			leadAuthority = LEAD_AUTHORITY.DECIDES;
			open = false;
			onSuccess?.();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create circle';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		if (!isSubmitting) {
			name = '';
			purpose = '';
			leadAuthority = LEAD_AUTHORITY.DECIDES;
		}
	}
</script>

<StandardDialog
	bind:open
	title="Add Sub-Circle to {parentCircleName}"
	description="Create a new sub-circle within this circle."
	submitLabel="Create Circle"
	disabled={!name.trim()}
	loading={isSubmitting}
	onsubmit={handleSubmit}
	onclose={handleClose}
>
	<div class="gap-form flex flex-col">
		<FormInput
			label="Name"
			placeholder="e.g., Engineering"
			bind:value={name}
			required
			disabled={isSubmitting}
		/>

		<FormSelect
			label="Lead Authority"
			bind:value={leadAuthority}
			options={leadAuthorityOptions}
			disabled={isSubmitting}
		/>

		<FormTextarea
			label="Purpose (optional)"
			placeholder="Describe the circle's purpose..."
			bind:value={purpose}
			rows={3}
			disabled={isSubmitting}
		/>
	</div>
</StandardDialog>
