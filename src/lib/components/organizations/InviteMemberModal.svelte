<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { browser } from '$app/environment';
	import { toast } from '$lib/utils/toast';
	import type { UseOrganizationMembers } from '$lib/composables/useOrganizationMembers.svelte';

	let {
		members,
		open,
		onOpenChange
	}: {
		members: Pick<UseOrganizationMembers, 'inviteMember' | 'loading'>;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	} = $props();

	let email = $state('');
	let inviteLink = $state('');
	let hasGeneratedInvite = $state(false);
	let emailError = $state<string | null>(null);

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

		try {
			const code = await members.inviteMember(trimmedEmail);
			const origin = browser ? window.location.origin : '';
			inviteLink = `${origin}/invite?code=${code}`;
			hasGeneratedInvite = true;
			toast.success('User invited');
		} catch (error) {
			// Error already handled by composable toast
			// Reset form state on error so user can try again
			if (error instanceof Error && error.message.includes('already exists')) {
				emailError = 'This user has already been invited';
			}
			console.error('Failed to create invite:', error);
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
						organization.
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
								disabled={members.loading.invite}
							/>
							{#if emailError}
								<span class="text-sm text-error">{emailError}</span>
							{/if}
						</label>

						<div class="flex items-center justify-end gap-2 pt-2">
							<button
								type="button"
								class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary disabled:opacity-50"
								onclick={() => onOpenChange(false)}
								disabled={members.loading.invite}
							>
								Cancel
							</button>
							<button
								type="submit"
								class="text-on-solid rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
								disabled={members.loading.invite || !email.trim() || !!emailError}
							>
								{members.loading.invite ? 'Inviting...' : 'Invite User'}
							</button>
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
								<button
									type="button"
									class="text-on-solid rounded-md bg-accent-primary px-nav-item py-nav-item text-sm font-medium transition-colors hover:bg-accent-hover"
									onclick={copyLink}
								>
									Copy
								</button>
							</div>
						</label>

						<div class="flex items-center justify-end gap-2 pt-2">
							<button
								type="button"
								class="text-on-solid rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent-hover"
								onclick={() => onOpenChange(false)}
							>
								Done
							</button>
						</div>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
