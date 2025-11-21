<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { browser } from '$app/environment';
	import { toast } from '$lib/utils/toast';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Button } from '$lib/components/ui';

	let {
		open,
		onOpenChange,
		type,
		targetId,
		targetName: _targetName,
		sessionId
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		type: 'organization' | 'circle';
		targetId: Id<'organizations'> | Id<'circles'>;
		targetName: string;
		sessionId: () => string | undefined;
	} = $props();

	const convexClient = browser ? useConvexClient() : null;

	let email = $state('');
	let inviteLink = $state('');
	let hasGeneratedInvite = $state(false);
	let emailError = $state<string | null>(null);
	let isLoading = $state(false);

	// Email validation: requires valid domain with TLD (at least 2 chars)
	const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{2,}$/;

	function validateEmail(emailValue: string): boolean {
		if (!emailValue.trim()) {
			emailError = 'Email is required';
			return false;
		}
		if (!emailRegex.test(emailValue.trim())) {
			emailError = 'Please enter a valid email address';
			return false;
		}
		emailError = null;
		return true;
	}

	// Reset form when modal closes
	$effect(() => {
		if (!open) {
			email = '';
			inviteLink = '';
			hasGeneratedInvite = false;
			emailError = null;
		}
	});

	async function handleInvite() {
		const trimmedEmail = email.trim();
		if (!validateEmail(trimmedEmail)) return;

		if (!convexClient) {
			toast.error('Convex client not available');
			return;
		}

		const currentSessionId = sessionId();
		if (!currentSessionId) {
			toast.error('You must be signed in to invite members');
			return;
		}

		isLoading = true;
		try {
			// Only organization invites are supported (circle invites not yet implemented)
			if (type !== 'organization') {
				toast.error('Circle invites are not yet implemented');
				return;
			}

			const mutation = api.organizations.createOrganizationInvite;
			const args = {
				sessionId: currentSessionId,
				organizationId: targetId as Id<'organizations'>,
				email: trimmedEmail
			};

			const result = await convexClient.mutation(mutation, args);
			const origin = browser ? window.location.origin : '';
			inviteLink = `${origin}/invite?code=${result.code}`;
			hasGeneratedInvite = true;
			toast.success('User invited');
		} catch (error) {
			// Handle errors - show user-friendly messages
			if (error instanceof Error) {
				if (error.message.includes('already exists') || error.message.includes('already has')) {
					emailError = 'This user has already been invited';
				} else if (error.message.includes('already a member')) {
					emailError = 'This user is already a member';
				} else if (error.message.includes('Invalid email')) {
					emailError = 'Please enter a valid email address';
				} else {
					toast.error(error.message);
				}
			} else {
				toast.error('Failed to create invite');
			}
			console.error('Failed to create invite:', error);
		} finally {
			isLoading = false;
		}
	}

	async function copyLink() {
		if (!inviteLink || !browser) return;

		try {
			await navigator.clipboard.writeText(inviteLink);
			toast.success('Invite link copied');
		} catch (error) {
			toast.error('Failed to copy link');
			console.error('Failed to copy to clipboard:', error);
		}
	}

	const entityType = type === 'organization' ? 'organization' : 'circle';
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 transition-opacity" />
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 w-[min(500px,90vw)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-base bg-surface text-primary shadow-xl"
		>
			<div class="space-y-6 px-inbox-container py-inbox-container">
				<div>
					<Dialog.Title class="text-lg font-semibold text-primary">Invite Member</Dialog.Title>
					<Dialog.Description class="mt-1 text-sm text-secondary">
						Send an invite to a specific user by email. They'll receive a link to join this
						{entityType}.
					</Dialog.Description>
				</div>

				{#if !hasGeneratedInvite}
					<form
						class="space-y-4"
						onsubmit={(event) => {
							event.preventDefault();
							handleInvite();
						}}
					>
						<label class="flex flex-col gap-1">
							<span class="text-sm font-medium text-primary">Email address *</span>
							<input
								type="email"
								class="w-full rounded-md border px-nav-item py-nav-item text-sm text-primary focus:outline-none disabled:opacity-50"
								class:border-base={!emailError}
								class:border-error={!!emailError}
								class:bg-elevated={!emailError}
								class:bg-error={!!emailError}
								class:focus:border-accent-primary={!emailError}
								class:focus:border-error={!!emailError}
								placeholder="colleague@example.com"
								bind:value={email}
								onblur={() => validateEmail(email)}
								oninput={() => {
									if (emailError) validateEmail(email);
								}}
								required
								disabled={isLoading}
							/>
							{#if emailError}
								<span class="text-sm text-error">{emailError}</span>
							{/if}
						</label>

						<div class="flex items-center justify-end gap-2 pt-2">
							<Button variant="outline" onclick={() => onOpenChange(false)} disabled={isLoading}>
								Cancel
							</Button>
							<Button
								variant="primary"
								type="submit"
								disabled={isLoading || !email.trim() || !!emailError}
							>
								{isLoading ? 'Inviting...' : 'Invite User'}
							</Button>
						</div>
					</form>
				{:else}
					<div class="space-y-4">
						<label class="flex flex-col gap-1">
							<span class="text-sm font-medium text-primary">Invite Link</span>
							<div class="flex gap-2">
								<input
									type="text"
									readonly
									class="flex-1 rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
									value={inviteLink}
									onclick={(e) => (e.target as HTMLInputElement).select()}
								/>
								<Button variant="primary" size="sm" onclick={copyLink}>Copy</Button>
							</div>
						</label>

						<div class="flex items-center justify-end gap-2 pt-2">
							<Button variant="primary" onclick={() => onOpenChange(false)}>Done</Button>
						</div>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
