<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Button, FormInput, Text } from '$lib/components/atoms';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';

	type Step = 'choice' | 'email';

	type Props = {
		open: boolean; // bindable
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		circleId?: Id<'circles'>;
		defaultDisplayName: string;
		workspaceRole?: 'owner' | 'admin' | 'member';
		onCreated?: (personId: Id<'people'>) => void;
	};

	let {
		open = $bindable(false),
		sessionId,
		workspaceId,
		circleId,
		defaultDisplayName,
		workspaceRole = 'member',
		onCreated
	}: Props = $props();

	const state = $state({
		step: 'choice' as Step,
		displayName: defaultDisplayName,
		email: '',
		loading: false,
		error: null as string | null
	});

	$effect(() => {
		// When opening, reset to a clean state with the latest suggested display name.
		if (!open) return;
		state.step = 'choice';
		state.displayName = defaultDisplayName;
		state.email = '';
		state.loading = false;
		state.error = null;
	});

	// Convex client (SSR-safe)
	const convexClient = browser ? useConvexClient() : null;

	async function handleCreatePlaceholder() {
		if (!convexClient) {
			state.error = 'Convex client not available';
			return;
		}
		const name = state.displayName.trim();
		if (!name) {
			state.error = 'Name is required';
			return;
		}

		state.loading = true;
		state.error = null;
		try {
			const personId = await convexClient.mutation(api.core.people.mutations.createPlaceholder, {
				sessionId,
				workspaceId,
				displayName: name,
				workspaceRole
			});
			if (circleId) {
				try {
					await convexClient.mutation(api.core.circles.mutations.addMember, {
						sessionId,
						circleId,
						memberPersonId: personId
					});
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: 'Failed to add placeholder to circle (created in workspace)';
					state.error = `Created placeholder, but could not add to circle: ${message}`;
					return;
				}
			}
			onCreated?.(personId);
			open = false;
		} catch (error) {
			state.error = error instanceof Error ? error.message : 'Failed to create placeholder';
		} finally {
			state.loading = false;
		}
	}

	function handleInviteClick() {
		state.step = 'email';
		state.email = '';
		state.error = null;
	}

	async function handleInviteSubmit() {
		if (!convexClient) {
			state.error = 'Convex client not available';
			return;
		}

		const email = state.email.trim();
		if (!email) {
			state.error = 'Email is required';
			return;
		}

		// Basic email validation (UI hint only; Convex is source of truth)
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			state.error = 'Please enter a valid email address';
			return;
		}

		state.loading = true;
		state.error = null;
		try {
			const displayName = state.displayName.trim();
			const personId = await convexClient.mutation(api.core.people.mutations.createInvitedPerson, {
				sessionId,
				workspaceId,
				email,
				workspaceRole,
				...(displayName.length > 0 ? { displayName } : {})
			});
			if (circleId) {
				try {
					await convexClient.mutation(api.core.circles.mutations.addMember, {
						sessionId,
						circleId,
						memberPersonId: personId
					});
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: 'Failed to add invited person to circle (invited in workspace)';
					state.error = `Sent invite, but could not add to circle: ${message}`;
					return;
				}
			}
			onCreated?.(personId);
			open = false;
		} catch (error) {
			state.error = error instanceof Error ? error.message : 'Failed to send invitation';
		} finally {
			state.loading = false;
		}
	}

	function handleBackOrClose() {
		if (state.step === 'email') {
			state.step = 'choice';
			state.email = '';
			state.error = null;
			return;
		}
		open = false;
	}
</script>

<StandardDialog
	bind:open
	title={state.step === 'choice' ? `Add "${state.displayName}"` : 'Enter Email Address'}
	description={state.step === 'choice'
		? 'Choose how to add this person:'
		: 'Provide an email address to send an invitation.'}
	size="sm"
	onclose={() => {
		state.step = 'choice';
		state.error = null;
	}}
>
	{#if state.step === 'choice'}
		<div class="gap-fieldGroup flex flex-col">
			<div class="gap-fieldGroup flex flex-col">
				<Text variant="label" color="tertiary" as="span">Name</Text>
				<FormInput
					type="text"
					placeholder="Full name"
					bind:value={state.displayName}
					disabled={state.loading}
				/>
			</div>

			<Button
				variant="outline"
				size="md"
				class="w-full justify-start"
				onclick={handleCreatePlaceholder}
				disabled={state.loading}
			>
				<span class="flex-1 text-left">Create placeholder</span>
			</Button>

			<Button
				variant="primary"
				size="md"
				class="w-full justify-start"
				onclick={handleInviteClick}
				disabled={state.loading}
			>
				<span class="flex-1 text-left">Send invitation</span>
			</Button>

			{#if state.error}
				<Text variant="label" color="error" as="div" class="text-center">{state.error}</Text>
			{/if}
		</div>
	{:else}
		<div class="gap-fieldGroup flex flex-col">
			<div class="gap-fieldGroup flex flex-col">
				<Text variant="label" color="tertiary" as="span">Email Address</Text>
				<FormInput
					type="email"
					placeholder="person@example.com"
					bind:value={state.email}
					disabled={state.loading}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							void handleInviteSubmit();
						}
					}}
				/>
			</div>

			{#if state.error}
				<Text variant="label" color="error" as="div" class="text-center">{state.error}</Text>
			{/if}

			<div class="gap-fieldGroup flex justify-end">
				<Button variant="outline" size="md" onclick={handleBackOrClose} disabled={state.loading}>
					Back
				</Button>
				<Button
					variant="primary"
					size="md"
					onclick={() => void handleInviteSubmit()}
					disabled={state.loading || !state.email.trim()}
				>
					{state.loading ? 'Sending...' : 'Send Invitation'}
				</Button>
			</div>
		</div>
	{/if}
</StandardDialog>
