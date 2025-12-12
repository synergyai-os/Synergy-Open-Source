<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { LoginBox } from '$lib/components/organisms';
	import { LoadingOverlay } from '$lib/components/atoms';
	import type { UseLoadingOverlayReturn } from '$lib/modules/core/composables/useLoadingOverlay.svelte';
	import { resolveRoute } from '$lib/utils/navigation';

	function parseBooleanFlag(value: string | null): boolean {
		if (!value) return false;
		const normalized = value.toLowerCase();
		return normalized === '1' || normalized === 'true' || normalized === 'yes';
	}

	const redirectTarget = $derived(
		$page.url.searchParams.get('redirect') ??
			$page.url.searchParams.get('redirectTo') ??
			'/auth/redirect'
	);
	const linkingFlow = $derived(() =>
		parseBooleanFlag(
			$page.url.searchParams.get('linkAccount') ?? $page.url.searchParams.get('link_account')
		)
	);

	const errorMessages: Record<string, string> = {
		invalid_state: 'Your session expired. Please try signing in again.',
		invalid_callback: 'We could not verify the login callback. Please try again.',
		callback_failed: 'Sign in failed. Please try again.',
		invalid_credentials: 'Invalid email or password. Please try again.'
	};

	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);
	let showCreateAccountLink = $state(false);
	let isRateLimited = $state(false);
	let rateLimitRetryAfter = $state(0);
	let showLoadingOverlay = $state(false);

	// Try to get loadingOverlay from context (if authenticated), otherwise use local state
	let loadingOverlay = $state<UseLoadingOverlayReturn | null>(null);
	try {
		loadingOverlay = getContext<UseLoadingOverlayReturn>('loadingOverlay');
	} catch {
		// Not in authenticated context, use local state
	}

	$effect(() => {
		const prefill = $page.url.searchParams.get('email') ?? $page.url.searchParams.get('login_hint');
		if (prefill) {
			email = prefill;
		}

		// Check for error in URL
		const key = $page.url.searchParams.get('error');
		if (key) {
			errorMessage = errorMessages[key] ?? 'Authentication failed. Please try again.';
		}
	});

	async function handleSubmit(event: { email: string; password: string }) {
		// Show loading overlay for account linking
		if (linkingFlow()) {
			if (loadingOverlay) {
				loadingOverlay.showOverlay({
					flow: 'account-linking',
					subtitle: event.email.trim() || 'account'
				});
			} else {
				showLoadingOverlay = true;
			}
		}

		try {
			const response = await fetch('/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include', // Include cookies so session can be resolved for account linking
				body: JSON.stringify({
					email: event.email.trim(),
					password: event.password,
					redirect: redirectTarget,
					linkAccount: linkingFlow() // Pass the linkAccount flag
				})
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle rate limiting with delightful countdown
				if (response.status === 429) {
					const retryAfter = parseInt(
						data.retryAfter || response.headers.get('Retry-After') || '60'
					);
					isRateLimited = true;
					rateLimitRetryAfter = retryAfter;
					isSubmitting = false;
					// Hide overlay on error
					if (loadingOverlay) {
						loadingOverlay.hideOverlay();
					} else {
						showLoadingOverlay = false;
					}
					return;
				}

				errorMessage = data.error ?? 'Unable to sign in. Please try again.';

				// Show "Create Account" link if credentials are wrong (might not have account)
				if (response.status === 401 || response.status === 404) {
					showCreateAccountLink = true;
				}

				isSubmitting = false;
				// Hide overlay on error
				if (loadingOverlay) {
					loadingOverlay.hideOverlay();
				} else {
					showLoadingOverlay = false;
				}
				return;
			}

			// Success - redirect to target (overlay will persist through redirect)
			await goto(data.redirectTo ?? resolveRoute('/auth/redirect'));
		} catch (err) {
			console.error('Login error:', err);
			errorMessage = 'Network error. Please check your connection and try again.';
			isSubmitting = false;
			// Hide overlay on error
			if (loadingOverlay) {
				loadingOverlay.hideOverlay();
			} else {
				showLoadingOverlay = false;
			}
		}
	}
</script>

<!--
  Page Background
  - Uses semantic token bg-subtle
  - Radial gradient uses brand hue (195) at 8% opacity for subtle depth
  - This is a page-level effect, not a design token (intentional)
-->
<div class="bg-subtle relative min-h-screen overflow-hidden">
	<!-- Radial glow: brand hue at 8% opacity - visible but subtle -->
	<div
		class="pointer-events-none absolute inset-0 bg-radial-[at_50%_35%] from-[oklch(55%_0.12_195_/_0.08)] via-[oklch(55%_0.06_195_/_0.03)] to-transparent"
		aria-hidden="true"
	></div>
	<div
		class="px-page py-page relative mx-auto flex min-h-screen max-w-md items-center justify-center"
	>
		<LoginBox
			bind:email
			bind:password
			bind:isSubmitting
			bind:errorMessage
			bind:showCreateAccountLink
			bind:isRateLimited
			bind:rateLimitRetryAfter
			linkingFlow={linkingFlow()}
			{redirectTarget}
			onSubmit={handleSubmit}
		/>
	</div>
</div>

<!-- Loading Overlay (for non-authenticated context) -->
{#if showLoadingOverlay && !loadingOverlay}
	<LoadingOverlay show={true} flow="account-linking" subtitle={email.trim() || 'account'} />
{/if}
