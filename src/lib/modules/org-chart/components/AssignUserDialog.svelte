<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import * as Dialog from '$lib/components/organisms/Dialog.svelte';
	import DialogContent from '$lib/components/organisms/Dialog.svelte';
	import { Combobox } from '$lib/components/atoms';
	import { Button } from '$lib/components/atoms';
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

	let selectedUserId = $state('');
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

	// Query already-assigned users based on type
	const assignedUsersQuery =
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

	// Get assigned user IDs for filtering
	const assignedUserIds = $derived(
		new Set(assignedUsersQuery?.data?.map((user) => user.userId) ?? [])
	);

	// Filter out already-assigned users and format for Combobox
	const availableUsers = $derived.by(() => {
		const members = membersQuery?.data ?? [];
		return members
			.filter((member) => !assignedUserIds.has(member.userId))
			.map((member) => ({
				value: member.userId,
				label: member.name || member.email || 'Unknown',
				email: member.email,
				name: member.name
			}));
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!selectedUserId) {
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
				await convexClient.mutation(api.core.roles.index.assignUser, {
					sessionId,
					circleRoleId: entityId as Id<'circleRoles'>,
					userId: selectedUserId as Id<'users'>
				});
				toast.success(`User assigned to role "${entityName}"`);
			} else {
				await convexClient.mutation(api.core.circles.index.addMember, {
					sessionId,
					circleId: entityId as Id<'circles'>,
					memberUserId: selectedUserId as Id<'users'>
				});
				toast.success(`User added to circle "${entityName}"`);
			}

			selectedUserId = '';
			open = false;
			onSuccess?.();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to assign user';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen && !isSubmitting) {
			selectedUserId = '';
		}
		open = newOpen;
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
		<DialogContent variant="default">
			<Dialog.Title>
				{type === 'role' ? 'Assign User to Role' : 'Add User to Circle'}
			</Dialog.Title>
			<Dialog.Description>
				{type === 'role'
					? `Select a user to assign to the role "${entityName}".`
					: `Select a user to add to the circle "${entityName}".`}
			</Dialog.Description>

			<form onsubmit={handleSubmit} class="mt-section gap-form flex flex-col">
				<Combobox
					label="User"
					placeholder="Search users..."
					bind:value={selectedUserId}
					options={availableUsers}
					required
					disabled={isSubmitting}
					maxHeight="14rem"
				>
					{#snippet children({ option, selected })}
						<div class="gap-fieldGroup flex items-center">
							<Avatar
								name={option.name || option.email || 'Unknown'}
								size="sm"
								class="flex-shrink-0"
							/>
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

				{#if availableUsers.length === 0}
					<Text variant="label" size="sm" color="tertiary" as="p" class="px-button">
						{assignedUserIds.size > 0
							? 'All workspace members are already assigned.'
							: 'No workspace members available.'}
					</Text>
				{/if}

				<div class="mt-section gap-button flex items-center justify-end">
					<Dialog.Close asChild>
						<Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
					</Dialog.Close>
					<Button
						type="submit"
						disabled={isSubmitting || !selectedUserId || availableUsers.length === 0}
					>
						{isSubmitting
							? type === 'role'
								? 'Assigning...'
								: 'Adding...'
							: type === 'role'
								? 'Assign User'
								: 'Add User'}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog.Portal>
</Dialog.Root>
