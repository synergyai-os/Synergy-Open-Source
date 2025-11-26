<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import { Button } from '$lib/components/atoms';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { useAuthSession } from '$lib/infrastructure/auth/composables/useAuthSession.svelte';

	const error = $derived($page.error);
	let linkedAccounts = $state<Array<{ userId: string; email: string; name: string }>>([]);
	let isLoadingAccounts = $state(false);
	let isSwitching = $state(false);
	const authSession = useAuthSession();

	onMount(async () => {
		if (!browser) return;

		try {
			isLoadingAccounts = true;
			const response = await fetch('/auth/linked-sessions');
			if (response.ok) {
				const data = await response.json();
				linkedAccounts = (data.sessions || []).map(
					(session: { userId: string; email: string; userName?: string }) => ({
						userId: session.userId,
						email: session.email,
						name: session.userName || session.email
					})
				);
			}
		} catch (err) {
			console.error('Failed to load linked accounts:', err);
		} finally {
			isLoadingAccounts = false;
		}
	});

	async function switchAccount(targetUserId: string) {
		if (!browser || isSwitching) return;

		try {
			isSwitching = true;
			// Use the same switchAccount function from useAuthSession composable
			// It handles POST request, CSRF token, and redirect properly
			// Preserve full URL including query parameters and hash
			const redirectUrl = `${$page.url.pathname}${$page.url.search}${$page.url.hash}`;
			await authSession.switchAccount(targetUserId, redirectUrl);
		} catch (err) {
			console.error('Failed to switch account:', err);
			isSwitching = false;
		}
	}

	function goHome() {
		goto(resolveRoute('/inbox'));
	}
</script>

<div
	class="flex min-h-screen items-center justify-center px-container"
	style="padding-block: var(--spacing-12);"
>
	<div class="space-y-error-page w-full max-w-md text-center">
		<!-- Icon -->
		<div class="size-avatar-sm bg-error-bg mx-auto flex items-center justify-center rounded-avatar">
			<svg
				class="icon-lg text-error-text"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
				/>
			</svg>
		</div>

		<!-- Title -->
		<div>
			<h1 class="text-h2 text-primary font-semibold">Admin Access Required</h1>
			<p class="text-small text-secondary mt-form-field-gap">
				You need system administrator privileges to access this page.
			</p>
		</div>

		<!-- Error Details (if available) -->
		{#if error}
			<div class="p-card border-base bg-elevated rounded-card border text-left">
				<p class="text-label text-tertiary font-medium">Error Details</p>
				<p class="text-small text-secondary mt-section-y">
					{error instanceof Error
						? error.message
						: typeof error === 'string'
							? error
							: 'System admin access required'}
				</p>
			</div>
		{/if}

		<!-- Account Switching -->
		{#if isLoadingAccounts}
			<div class="border-base bg-elevated rounded-card border p-card-compact">
				<p class="text-small text-secondary">Loading accounts...</p>
			</div>
		{:else if linkedAccounts.length > 0}
			<div class="space-y-form-section">
				<p class="text-small text-primary font-medium">Switch to an account with admin access:</p>
				<div class="space-y-form-field-gap">
					{#each linkedAccounts as account (account.userId)}
						<button
							type="button"
							onclick={() => switchAccount(account.userId)}
							disabled={isSwitching}
							class="hover:bg-elevated-hover border-base bg-elevated w-full rounded-card border p-card-compact text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
						>
							<p class="text-small text-primary font-medium">{account.name || account.email}</p>
							<p class="text-label text-secondary mt-badge-y">{account.email}</p>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex flex-col gap-form-section pt-content-section">
			<Button variant="primary" onclick={goHome} class="w-full">Go Back to SynergyOS</Button>
			{#if linkedAccounts.length === 0}
				<p class="text-label text-tertiary">
					Don't have admin access? Contact your system administrator or switch to an account that
					has admin privileges.
				</p>
			{/if}
		</div>
	</div>
</div>
