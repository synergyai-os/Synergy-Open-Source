<script lang="ts">
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { StandardDialog } from '$lib/components/organisms';
	import { FormInput, FormTextarea } from '$lib/components/atoms';
	import { toast } from 'svelte-sonner';

	type Props = {
		open?: boolean;
		circleId: Id<'circles'>;
		circleName: string;
		workspaceId: Id<'workspaces'>;
		onSuccess?: () => void;
	};

	let {
		open = $bindable(false),
		circleId,
		circleName,
		workspaceId: _workspaceId,
		onSuccess
	}: Props = $props();

	const convexClient = useConvexClient();

	let name = $state('');
	let purpose = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit() {
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
			// Convert purpose to fieldValues format (SYOS-960)
			const fieldValues = purpose.trim()
				? [
						{
							systemKey: 'purpose',
							values: [purpose.trim()]
						}
					]
				: undefined;

			await convexClient.mutation(api.core.roles.index.create, {
				sessionId,
				circleId,
				name: name.trim(),
				fieldValues
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

	function handleClose() {
		if (!isSubmitting) {
			name = '';
			purpose = '';
		}
	}
</script>

<StandardDialog
	bind:open
	title="Add Role to {circleName}"
	description="Create a new role in this circle."
	submitLabel="Create Role"
	disabled={!name.trim()}
	loading={isSubmitting}
	onsubmit={handleSubmit}
	onclose={handleClose}
>
	<div class="gap-form flex flex-col">
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
	</div>
</StandardDialog>
