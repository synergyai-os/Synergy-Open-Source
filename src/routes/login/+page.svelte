<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { Button, FormInput } from '$lib/components/ui';
	import { RateLimitError } from '$lib/components/organisms';
	import { LoadingOverlay } from '$lib/components/atoms';
	import type { UseLoadingOverlayReturn } from '$lib/modules/core/composables/useLoadingOverlay.svelte';
	import { resolveRoute } from '$lib/utils/navigation';

	function parseBooleanFlag(value: string | null): boolean {
		if (!value) return false;
		const normalized = value.toLowerCase();
		return normalized === '1' || normalized === 'true' || normalized === 'yes';
	}

	const redirectTarget = $derived(
		$page.url.searchParams.get('redirect') ?? $page.url.searchParams.get('redirectTo') ?? '/inbox'
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

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting) return;

		errorMessage = null;
		isRateLimited = false;
		showCreateAccountLink = false;
		isSubmitting = true;

		// Show loading overlay for account linking
		if (linkingFlow()) {
			if (loadingOverlay) {
				loadingOverlay.showOverlay({
					flow: 'account-linking',
					subtitle: email.trim() || 'account'
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
					email: email.trim(),
					password,
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
			await goto(data.redirectTo ?? resolveRoute('/inbox'));
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

<div class="min-h-screen bg-base">
	<div
		class="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-section py-system-content"
	>
		<div
			class="w-full max-w-md rounded-modal border border-base bg-elevated p-content-padding shadow-sm"
		>
			<header class="flex flex-col gap-form-section text-center">
				<h1 class="text-2xl font-semibold tracking-tight text-primary">Welcome back</h1>
				<p class="text-sm text-secondary">
					Sign in to continue where you left off. Don't have an account?
					<a
						href={linkingFlow()
							? `${resolveRoute('/register')}?linkAccount=1&redirect=${encodeURIComponent(redirectTarget)}&email=${encodeURIComponent(email)}`
							: `${resolveRoute('/register')}?redirect=${encodeURIComponent(redirectTarget)}${email ? `&email=${encodeURIComponent(email)}` : ''}`}
						class="text-accent-primary hover:text-accent-hover">Create one</a
					>.
				</p>
			</header>

			{#if isRateLimited}
				<div class="mt-content-section">
					<RateLimitError retryAfter={rateLimitRetryAfter} actionLabel="logging in" />
				</div>
			{:else if errorMessage}
				<div
					class="mt-content-section rounded-input border border-error bg-error px-input-x py-input-y"
				>
					<p class="text-sm font-medium text-error-secondary">{errorMessage}</p>
					{#if showCreateAccountLink}
						<p class="mt-2 text-sm text-error">
							Don't have an account?
							<a
								href={`${resolveRoute('/register')}?email=${encodeURIComponent(email)}`}
								class="font-semibold text-error-secondary underline hover:text-error"
							>
								Create one here
							</a>
						</p>
					{/if}
				</div>
			{/if}
			{#if linkingFlow()}
				<div
					class="bg-hover-subtle mt-content-section flex items-center gap-icon rounded-input border border-base px-input-x py-input-y text-sm text-secondary"
				>
					<svg
						class="h-4 w-4 flex-shrink-0 text-accent-primary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 01-5.656-5.656l1-1"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10.172 13.828a4 4 0 010-5.656l2-2a4 4 0 015.656 5.656l-1 1"
						/>
					</svg>
					<span>Link another email to your SynergyOS account.</span>
				</div>
			{/if}

			<form class="mt-content-section flex flex-col gap-form-section" onsubmit={handleSubmit}>
				<FormInput
					type="email"
					label="Email"
					placeholder="you@example.com"
					bind:value={email}
					required={true}
					autocomplete="email"
				/>

				<div class="flex flex-col gap-form-field">
					<FormInput
						type="password"
						label="Password"
						placeholder="Enter your password"
						bind:value={password}
						required={true}
						autocomplete="current-password"
					/>
					<div class="text-right">
						<a
							href={resolveRoute('/forgot-password')}
							class="text-sm text-accent-primary hover:text-accent-hover"
						>
							Forgot password?
						</a>
					</div>
				</div>

				<Button variant="primary" type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						Signing in…
					{:else}
						Sign in
					{/if}
				</Button>
			</form>
		</div>
	</div>
</div>

<!-- Loading Overlay (for non-authenticated context) -->
{#if showLoadingOverlay && !loadingOverlay}
	<LoadingOverlay show={true} flow="account-linking" subtitle={email.trim() || 'account'} />
{/if}
