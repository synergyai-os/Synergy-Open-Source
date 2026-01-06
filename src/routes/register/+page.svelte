<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { RegisterBox } from '$lib/components/organisms';
	import { LoadingOverlay } from '$lib/components/atoms';
	import type { UseLoadingOverlayReturn } from '$lib/modules/core/composables/useLoadingOverlay.svelte';
	import { resolveRoute } from '$lib/utils/navigation';

	const redirectTarget = $derived(
		$page.url.searchParams.get('redirect') ??
			$page.url.searchParams.get('redirectTo') ??
			'/auth/redirect'
	);

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);
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
	});

	async function handleSubmit(event: {
		email: string;
		password: string;
		confirmPassword: string;
		firstName: string;
		lastName: string;
	}) {
		// Validate passwords match
		if (event.password !== event.confirmPassword) {
			errorMessage = 'Passwords do not match';
			isSubmitting = false;
			return;
		}

		// Validate password strength
		if (event.password.length < 8) {
			errorMessage = 'Password must be at least 8 characters';
			isSubmitting = false;
			return;
		}

		// Validate password doesn't contain email (WorkOS requirement)
		// Strip + aliases (e.g., "user+alias@example.com" -> "user")
		const emailLocalPart = event.email.trim().split('@')[0].split('+')[0].toLowerCase();
		const passwordLower = event.password.toLowerCase();

		if (emailLocalPart.length >= 4 && passwordLower.includes(emailLocalPart)) {
			errorMessage =
				'Password must not contain your email address. Please choose a different password.';
			isSubmitting = false;
			return;
		}

		errorMessage = null;
		isRateLimited = false;

		// Show loading overlay
		const accountName = event.firstName.trim() || event.email.trim() || 'account';
		if (loadingOverlay) {
			loadingOverlay.showOverlay({
				flow: 'account-registration',
				subtitle: accountName
			});
		} else {
			showLoadingOverlay = true;
		}

		try {
			const response = await fetch('/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					email: event.email.trim(),
					password: event.password,
					firstName: event.firstName.trim() || undefined,
					lastName: event.lastName.trim() || undefined,
					redirect: redirectTarget
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

				// Show the specific error message from the server
				errorMessage = data.error ?? 'Unable to create account. Please try again.';
				isSubmitting = false;
				// Hide overlay on error
				if (loadingOverlay) {
					loadingOverlay.hideOverlay();
				} else {
					showLoadingOverlay = false;
				}
				return;
			}

			// Success - redirect to verification page
			// Hide overlay before redirect
			if (loadingOverlay) {
				loadingOverlay.hideOverlay();
			} else {
				showLoadingOverlay = false;
			}

			await goto(
				`${resolveRoute('/verify-email')}?email=${encodeURIComponent(event.email.trim())}`
			);
		} catch (err) {
			console.error('Registration error:', err);
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
		class="pointer-events-none absolute inset-0 bg-radial-[at_50%_35%] from-[var(--gradient-overlay-hero-from)] via-[var(--gradient-overlay-hero-via)] to-transparent"
		aria-hidden="true"
	></div>
	<div
		class="px-page py-page relative mx-auto flex min-h-screen max-w-md items-center justify-center"
	>
		<RegisterBox
			bind:email
			bind:password
			bind:confirmPassword
			bind:firstName
			bind:lastName
			bind:isSubmitting
			bind:errorMessage
			bind:isRateLimited
			bind:rateLimitRetryAfter
			{redirectTarget}
			onSubmit={handleSubmit}
		/>
	</div>
</div>

<!-- Loading Overlay (for non-authenticated context) -->
{#if showLoadingOverlay && !loadingOverlay}
	<LoadingOverlay
		show={true}
		flow="account-registration"
		subtitle={firstName.trim() || email.trim() || 'account'}
	/>
{/if}
