<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { resolveRoute } from '$lib/utils/navigation';
	import { Button } from '$lib/components/ui';
	import type { Id } from '$lib/convex';

	// Get invite code from URL
	const inviteCode = $derived($page.url.searchParams.get('code'));

	// Get sessionId from page data (may be undefined for unauthenticated users)
	const getSessionId = () => $page.data.sessionId;

	// Query invite details (public query - no auth required)
	// Only run in browser to avoid SSR issues
	const inviteQuery = browser
		? useQuery(api.organizations.getInviteByCode, () => {
				const code = inviteCode;
				if (!code) throw new Error('Code required');
				return { code };
			})
		: null;

	const invite = $derived(inviteQuery?.data);
	const isLoading = $derived(inviteQuery?.isLoading ?? false);
	const inviteError = $derived(inviteQuery?.error ? String(inviteQuery.error) : null);

	// Check if user is authenticated
	const isAuthenticated = $derived(() => {
		if (!browser) return false;
		return !!getSessionId();
	});

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// State for accepting invite
	let isAccepting = $state(false);
	let acceptError = $state<string | null>(null);

	// Accept invite handler
	async function handleAcceptInvite() {
		if (!inviteCode || !convexClient || !isAuthenticated()) return;

		const sessionId = getSessionId();
		if (!sessionId) {
			acceptError = 'You must be signed in to accept an invite';
			return;
		}

		isAccepting = true;
		acceptError = null;

		try {
			const result = await convexClient.mutation(api.organizations.acceptOrganizationInvite, {
				sessionId,
				code: inviteCode
			});

			// Redirect to organization page
			await goto(resolveRoute(`/org/${result.organizationId}`));
		} catch (err) {
			acceptError = err instanceof Error ? err.message : 'Failed to accept invite';
			isAccepting = false;
		}
	}

	// Format role for display
	function formatRole(role: string): string {
		return role.charAt(0).toUpperCase() + role.slice(1);
	}
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-base px-marketing-container-x py-marketing-section-y"
>
	<div class="w-full max-w-md">
		{#if !inviteCode}
			<!-- No code provided -->
			<div class="rounded-lg border border-error-border bg-error-bg p-content-padding text-center">
				<h1 class="mb-2 text-xl font-semibold text-error-text">Invalid Invite Link</h1>
				<p class="text-sm text-error-text-secondary">
					This invite link is missing a code. Please check the link and try again.
				</p>
			</div>
		{:else if isLoading}
			<!-- Loading state -->
			<div class="rounded-lg border border-base bg-surface p-content-padding text-center">
				<div class="mb-4 text-secondary">Loading invite...</div>
			</div>
		{:else if inviteError || !invite}
			<!-- Error state or invite not found -->
			<div class="rounded-lg border border-error-border bg-error-bg p-content-padding text-center">
				<h1 class="mb-2 text-xl font-semibold text-error-text">Invite Not Found</h1>
				<p class="text-sm text-error-text-secondary">
					{inviteError ||
						'This invite may have expired, been revoked, or already been used. Please contact the person who invited you for a new invite.'}
				</p>
			</div>
		{:else}
			<!-- Invite details -->
			<div class="rounded-lg border border-base bg-surface p-content-padding">
				<div class="mb-6 text-center">
					<h1 class="mb-2 text-2xl font-semibold text-primary">You've been invited!</h1>
					<p class="text-sm text-secondary">
						You've been invited to join an organization on SynergyOS
					</p>
				</div>

				<div class="mb-6 space-y-4">
					<!-- Organization name -->
					<div>
						<div class="mb-1 text-xs font-medium text-secondary">Organization</div>
						<div class="text-lg font-semibold text-primary">{invite.organizationName}</div>
					</div>

					<!-- Inviter -->
					<div>
						<div class="mb-1 text-xs font-medium text-secondary">Invited by</div>
						<div class="text-sm text-primary">{invite.inviterName}</div>
					</div>

					<!-- Role -->
					<div>
						<div class="mb-1 text-xs font-medium text-secondary">Role</div>
						<div class="text-sm text-primary">{formatRole(invite.role)}</div>
					</div>
				</div>

				{#if acceptError}
					<!-- Accept error -->
					<div class="mb-4 rounded-md border border-error-border bg-error-bg p-3">
						<p class="text-sm text-error-text">{acceptError}</p>
					</div>
				{/if}

				{#if isAuthenticated()}
					<!-- Authenticated: Show Accept button -->
					<div class="space-y-3">
						<Button
							onclick={handleAcceptInvite}
							disabled={isAccepting}
							class="text-on-solid w-full bg-accent-primary hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isAccepting ? 'Accepting...' : 'Accept Invite'}
						</Button>
					</div>
				{:else}
					{@const redirectUrl = `/invite?code=${inviteCode}`}
					{@const emailParam = invite.email ? `&email=${encodeURIComponent(invite.email)}` : ''}
					<!-- Unauthenticated: Show Sign in / Create account links -->
					<div class="space-y-3">
						<p class="text-center text-sm text-secondary">
							Sign in or create an account to accept this invite
						</p>
						<div class="flex gap-3">
							<a
								href={resolveRoute(
									`/login?redirect=${encodeURIComponent(redirectUrl)}${emailParam}`
								)}
								class="flex-1 rounded-md border border-base bg-elevated px-button-x py-button-y text-center text-sm font-medium text-primary transition-colors hover:bg-sidebar-hover"
							>
								Sign In
							</a>
							<a
								href={resolveRoute(
									`/register?redirect=${encodeURIComponent(redirectUrl)}${emailParam}`
								)}
								class="text-on-solid flex-1 rounded-md bg-accent-primary px-button-x py-button-y text-center text-sm font-medium transition-colors hover:bg-accent-hover"
							>
								Create Account
							</a>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
