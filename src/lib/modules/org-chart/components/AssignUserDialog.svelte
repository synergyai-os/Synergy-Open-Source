<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';
	import { Combobox } from '$lib/components/atoms';
	import { toast } from 'svelte-sonner';
	import { Avatar, Text } from '$lib/components/atoms';
	import { invariant } from '$lib/utils/invariant';

	type Props = {
		open?: boolean;
		type: 'role' | 'circle';
		entityId: Id<'circleRoles'> | Id<'circles'>;
		entityName: string;
		workspaceId: Id<'workspaces'>;
		onSuccess?: () => void;
	};

	let {
		open = $bindable(false),
		type,
		entityId,
		entityName,
		workspaceId,
		onSuccess
	}: Props = $props();

	const convexClient = useConvexClient();

	let selectedPersonId = $state('');
	let isSubmitting = $state(false);

	// Get sessionId reactively
	const getSessionId = () => $page.data.sessionId;

	// Query workspace members
	const membersQuery =
		browser && getSessionId()
			? useQuery(api.core.workspaces.index.listMembers, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required');
					return { sessionId, workspaceId };
				})
			: null;

	// Query already-assigned persons based on type
	const assignedPersonsQuery =
		browser && getSessionId()
			? useQuery(
					type === 'role' ? api.core.roles.index.getRoleFillers : api.core.circles.index.getMembers,
					() => {
						const sessionId = getSessionId();
						invariant(sessionId, 'sessionId required');
						if (type === 'role') {
							return {
								sessionId,
								circleRoleId: entityId as Id<'circleRoles'>
							};
						} else {
							return {
								sessionId,
								circleId: entityId as Id<'circles'>
							};
						}
					}
				)
			: null;

	// Get assigned person IDs for filtering
	const assignedPersonIds = $derived(
		new Set(assignedPersonsQuery?.data?.map((person) => person.personId) ?? [])
	);

	// Filter out already-assigned persons and format for Combobox
	const availablePersons = $derived.by(() => {
		const members = membersQuery?.data ?? [];
		return members
			.filter((member) => !assignedPersonIds.has(member.personId))
			.map((member) => ({
				value: member.personId,
				label: member.name || member.email || 'Unknown',
				email: member.email,
				name: member.name
			}));
	});

	// Dialog title and description
	const dialogTitle = $derived(type === 'role' ? 'Assign User to Role' : 'Add User to Circle');
	const dialogDescription = $derived(
		type === 'role'
			? `Select a user to assign to the role "${entityName}".`
			: `Select a user to add to the circle "${entityName}".`
	);
	const submitLabel = $derived(
		isSubmitting
			? type === 'role'
				? 'Assigning...'
				: 'Adding...'
			: type === 'role'
				? 'Assign User'
				: 'Add User'
	);

	async function handleSubmit() {
		if (!selectedPersonId) {
			toast.error('Please select a user');
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
			if (type === 'role') {
				await convexClient.mutation(api.core.roles.index.assignPerson, {
					sessionId,
					circleRoleId: entityId as Id<'circleRoles'>,
					assigneePersonId: selectedPersonId as Id<'people'>
				});
				toast.success(`User assigned to role "${entityName}"`);
			} else {
				await convexClient.mutation(api.core.circles.index.addMember, {
					sessionId,
					circleId: entityId as Id<'circles'>,
					memberPersonId: selectedPersonId as Id<'people'>
				});
				toast.success(`User added to circle "${entityName}"`);
			}

			selectedPersonId = '';
			open = false;
			onSuccess?.();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to assign user';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		if (!isSubmitting) {
			selectedPersonId = '';
		}
	}

	const isSubmitDisabled = $derived(
		isSubmitting || !selectedPersonId || availablePersons.length === 0
	);
</script>

<StandardDialog
	bind:open
	title={dialogTitle}
	description={dialogDescription}
	{submitLabel}
	loading={isSubmitting}
	disabled={isSubmitDisabled}
	onsubmit={handleSubmit}
	onclose={handleClose}
	size="md"
>
	<div class="gap-form flex flex-col">
		<Combobox
			label="Person"
			placeholder="Search persons..."
			bind:value={selectedPersonId}
			options={availablePersons}
			required
			disabled={isSubmitting}
			maxHeight="14rem"
		>
			{#snippet children({ option, selected })}
				<div class="gap-fieldGroup flex items-center">
					<Avatar name={option.name || option.email || 'Unknown'} size="sm" class="flex-shrink-0" />
					<div class="min-w-0 flex-1">
						<Text variant="body" size="sm" color="primary" as="span" class="block truncate">
							{option.name || option.email || 'Unknown'}
						</Text>
						{#if option.name && option.email}
							<Text variant="label" size="sm" color="tertiary" as="span" class="block truncate">
								{option.email}
							</Text>
						{/if}
					</div>
					{#if selected}
						<div class="ml-auto flex-shrink-0">
							<svg
								class="size-icon-sm text-accent-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					{/if}
				</div>
			{/snippet}
		</Combobox>

		{#if availablePersons.length === 0}
			<Text variant="label" size="sm" color="tertiary" as="p" class="px-button">
				{assignedPersonIds.size > 0
					? 'All workspace members are already assigned.'
					: 'No workspace members available.'}
			</Text>
		{/if}
	</div>
</StandardDialog>
