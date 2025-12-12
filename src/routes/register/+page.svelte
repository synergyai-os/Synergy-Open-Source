<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { Button, FormInput } from '$lib/components/atoms';
	import { RateLimitError } from '$lib/components/organisms';
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

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting) return;

		errorMessage = null;
		isRateLimited = false;

		// Validate passwords match
		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}

		// Validate password strength
		if (password.length < 8) {
			errorMessage = 'Password must be at least 8 characters';
			return;
		}

		// Validate password doesn't contain email (WorkOS requirement)
		// Strip + aliases (e.g., "user+alias@example.com" -> "user")
		const emailLocalPart = email.trim().split('@')[0].split('+')[0].toLowerCase();
		const passwordLower = password.toLowerCase();

		if (emailLocalPart.length >= 4 && passwordLower.includes(emailLocalPart)) {
			errorMessage =
				'Password must not contain your email address. Please choose a different password.';
			return;
		}

		isSubmitting = true;

		// Show loading overlay
		const accountName = firstName.trim() || email.trim() || 'account';
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
					email: email.trim(),
					password,
					firstName: firstName.trim() || undefined,
					lastName: lastName.trim() || undefined,
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

			await goto(`${resolveRoute('/verify-email')}?email=${encodeURIComponent(email.trim())}`);
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

<div class="bg-base min-h-screen">
	<div
		class="py-system-content mx-auto flex min-h-screen max-w-2xl items-center justify-center px-2"
	>
		<div
			class="border-base p-content-padding rounded-modal bg-elevated w-full max-w-md border shadow-sm"
		>
			<header class="gap-form-section flex flex-col text-center">
				<h1 class="text-h2 text-primary font-semibold tracking-tight">Create your account</h1>
				<p class="text-small text-secondary">
					Already using SynergyOS?
					<a href={resolveRoute('/login')} class="hover:text-accent-hover text-accent-primary"
						>Sign in instead</a
					>.
				</p>
			</header>

			{#if isRateLimited}
				<div class="mt-content-section">
					<RateLimitError retryAfter={rateLimitRetryAfter} actionLabel="creating accounts" />
				</div>
			{:else if errorMessage}
				<div
					class="mt-content-section bg-error rounded-input border-error px-input-x py-input-y border"
				>
					<p class="text-small text-error-secondary font-medium">{errorMessage}</p>
				</div>
			{/if}

			<form class="mt-content-section gap-form-section flex flex-col" onsubmit={handleSubmit}>
				<div class="gap-form-section flex">
					<FormInput
						type="text"
						name="firstName"
						label="First name"
						placeholder="John"
						bind:value={firstName}
						required={false}
						autocomplete="given-name"
					/>
					<FormInput
						type="text"
						name="lastName"
						label="Last name"
						placeholder="Doe"
						bind:value={lastName}
						required={false}
						autocomplete="family-name"
					/>
				</div>

				<FormInput
					type="email"
					name="email"
					label="Email"
					placeholder="you@example.com"
					bind:value={email}
					required={true}
					autocomplete="email"
				/>

				<div>
					<FormInput
						type="password"
						name="password"
						label="Password"
						placeholder="At least 8 characters"
						bind:value={password}
						required={true}
						autocomplete="new-password"
					/>
					<p class="mt-section-y text-label text-tertiary">
						Must be at least 8 characters and not contain parts of your email (e.g., "randyhereman")
					</p>
				</div>

				<FormInput
					type="password"
					name="confirmPassword"
					label="Confirm password"
					placeholder="Re-enter your password"
					bind:value={confirmPassword}
					required={true}
					autocomplete="new-password"
				/>

				<Button variant="primary" type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						Creating account…
					{:else}
						Create account
					{/if}
				</Button>
			</form>

			<p class="mt-content-section text-label text-secondary text-center">
				By creating an account, you agree to our Terms of Service and Privacy Policy.
			</p>
		</div>
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
