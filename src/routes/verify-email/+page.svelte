<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { PinInput, Button, Text, Heading } from '$lib/components/atoms';
	import { verifyEmailBoxRecipe } from '$lib/design-system/recipes';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { onMount } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';

	const email = $derived($page.url.searchParams.get('email') ?? '');

	// Check if user is already authenticated
	const getSessionId = () => $page.data.sessionId;
	const isAuthenticated = $derived(() => {
		if (!browser) return false;
		return !!getSessionId();
	});

	let code = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);
	let isResending = $state(false);
	let resendSuccess = $state(false);
	let timeLeft = $state(600); // 10 minutes in seconds
	let mounted = $state(false);
	let redirectCountdown = $state(10); // 10 seconds countdown for auto-redirect
	let redirectTimer: ReturnType<typeof setInterval> | null = null;
	let shouldRedirectToLogin = $state(false); // Show redirect UI for "already registered" error

	// Redirect if no email provided
	$effect(() => {
		if (!email) {
			goto(resolveRoute('/register'));
		}
	});

	// Handle redirect if already authenticated (with countdown)
	$effect(() => {
		if (!browser || !isAuthenticated()) return;

		// Get redirect target
		const redirectParam = $page.url.searchParams.get('redirect');
		const redirectTarget = redirectParam
			? resolveRoute(redirectParam)
			: resolveRoute('/auth/redirect');

		// Start countdown timer
		redirectCountdown = 10;
		redirectTimer = setInterval(() => {
			redirectCountdown--;
			if (redirectCountdown <= 0) {
				if (redirectTimer) {
					clearInterval(redirectTimer);
					redirectTimer = null;
				}
				goto(redirectTarget);
			}
		}, 1000);

		// Cleanup on unmount
		return () => {
			if (redirectTimer) {
				clearInterval(redirectTimer);
				redirectTimer = null;
			}
		};
	});

	// Manual redirect function (for authenticated users)
	function handleRedirectNow() {
		if (redirectTimer) {
			clearInterval(redirectTimer);
			redirectTimer = null;
		}
		const redirectParam = $page.url.searchParams.get('redirect');
		const redirectTarget = redirectParam
			? resolveRoute(redirectParam)
			: resolveRoute('/auth/redirect');
		goto(redirectTarget);
	}

	// Redirect to login function (for "already registered" error)
	function handleRedirectToLogin() {
		if (redirectTimer) {
			clearInterval(redirectTimer);
			redirectTimer = null;
		}
		const redirectParam = $page.url.searchParams.get('redirect') ?? '/auth/redirect';
		goto(
			resolveRoute(
				`/login?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(redirectParam)}`
			)
		);
	}

	// Countdown timer + Auto-paste from clipboard
	onMount(() => {
		mounted = true;

		// NOTE: We intentionally do NOT auto-read the clipboard here.
		// The PinInput already supports pasting a 6-digit code. Auto-reading can pull stale
		// codes from previous attempts and cause confusing "Invalid verification code" errors.

		const interval = setInterval(() => {
			if (timeLeft > 0) {
				timeLeft--;
			}
		}, 1000);

		return () => clearInterval(interval);
	});

	const minutes = $derived(Math.floor(timeLeft / 60));
	const seconds = $derived(timeLeft % 60);

	async function handleVerification(pinValue: string) {
		if (isSubmitting) return;

		errorMessage = null;
		isSubmitting = true;

		try {
			const response = await fetch('/auth/verify-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					email,
					code: pinValue
				})
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle "email already registered" - show countdown and redirect UI
				if (data.redirectToLogin && email) {
					shouldRedirectToLogin = true;
					errorMessage = null; // Clear error message
					isSubmitting = false;
					code = ''; // Clear the code

					// Start countdown timer
					redirectCountdown = 10;
					if (redirectTimer) {
						clearInterval(redirectTimer);
					}
					redirectTimer = setInterval(() => {
						redirectCountdown--;
						if (redirectCountdown <= 0) {
							if (redirectTimer) {
								clearInterval(redirectTimer);
								redirectTimer = null;
							}
							handleRedirectToLogin();
						}
					}, 1000);
					return;
				}

				errorMessage = data.error ?? 'Invalid verification code';
				isSubmitting = false;
				code = ''; // Clear the code to allow retry
				return;
			}

			// Success - redirect (user is now authenticated)
			await goto(data.redirectTo ?? resolveRoute('/auth/redirect'));
		} catch (_err) {
			console.error('Verification error:', _err);
			errorMessage = 'Network error. Please check your connection and try again.';
			isSubmitting = false;
			code = ''; // Clear the code
		}
	}

	async function resendCode() {
		if (isResending) return;

		errorMessage = null;
		resendSuccess = false;
		isResending = true;

		try {
			const response = await fetch('/auth/resend-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					type: 'registration'
				})
			});

			const data = await response.json();

			if (!response.ok) {
				errorMessage = data.error ?? 'Failed to resend code. Please try again.';
				isResending = false;
				return;
			}

			resendSuccess = true;
			timeLeft = 600; // Reset timer
			setTimeout(() => {
				resendSuccess = false;
			}, 5000);
		} catch (_err) {
			console.error('Resend error:', _err);
			errorMessage = 'Network error. Please check your connection and try again.';
		} finally {
			isResending = false;
		}
	}
</script>

<div class="bg-base relative min-h-screen overflow-hidden">
	<!-- Animated background gradient -->
	{#if mounted}
		<div
			class="from-accent-primary/5 to-accent-primary/10 absolute inset-0 bg-gradient-to-br via-transparent"
		></div>
	{/if}

	<div
		class="py-system-content relative mx-auto flex min-h-screen max-w-2xl items-center justify-center px-2"
	>
		<div
			class={[verifyEmailBoxRecipe({ variant: 'default' }), 'w-full']}
			in:fly={{
				y: prefersReducedMotion.current ? 0 : 16,
				duration: 400,
				delay: 100,
				easing: cubicOut
			}}
		>
			<!-- Email icon -->
			<div
				class="bg-accent-primary/10 mb-header size-icon-xl mx-auto flex items-center justify-center rounded-full"
			>
				<svg
					class="text-accent-primary size-icon-md"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			</div>

			<!-- Header: Uses semantic tokens mb-header (12px), gap-header (12px) -->
			<header class="gap-header mb-header flex flex-col text-center">
				<Heading level={1}>Check your inbox</Heading>
				<Text variant="body" size="base" color="secondary">
					We sent a 6-digit code to<br />
					<span class="text-primary font-semibold">{email}</span>
				</Text>
			</header>

			<!-- Already authenticated message with countdown -->
			{#if isAuthenticated()}
				<div
					class="gap-fieldGroup rounded-input border-success bg-status-successLight px-input py-input mb-alert flex flex-col border"
					in:fly={{ y: prefersReducedMotion.current ? 0 : -8, duration: 200, easing: cubicOut }}
					out:fade={{ duration: 150 }}
				>
					<div class="gap-fieldGroup flex items-start">
						<svg
							class="size-icon-md text-success flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div class="flex-1">
							<Text variant="body" size="sm" color="success" class="font-medium">
								You're already signed in! Redirecting you in {redirectCountdown} seconds...
							</Text>
						</div>
					</div>
					<Button onclick={handleRedirectNow} variant="primary" class="w-full">Continue Now</Button>
				</div>
			{:else}
				<!-- Success message -->
				{#if resendSuccess}
					<div
						class="gap-fieldGroup rounded-input border-success bg-status-successLight px-input py-input mb-alert flex items-center border"
						in:fly={{ y: prefersReducedMotion.current ? 0 : -8, duration: 200, easing: cubicOut }}
						out:fade={{ duration: 150 }}
					>
						<svg
							class="size-icon-md text-success flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<Text variant="body" size="sm" color="success" class="font-medium">
							New code sent! Check your email.
						</Text>
					</div>
				{/if}

				<!-- Redirect to login message with countdown (for "already registered" error) -->
				{#if shouldRedirectToLogin}
					<div
						class="gap-fieldGroup rounded-input border-accent-primary bg-accent-primary/10 px-input py-input mb-alert flex flex-col border"
						in:fly={{ y: prefersReducedMotion.current ? 0 : -8, duration: 200, easing: cubicOut }}
						out:fade={{ duration: 150 }}
					>
						<div class="gap-fieldGroup flex items-start">
							<svg
								class="size-icon-md text-accent-primary flex-shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div class="flex-1">
								<Text variant="body" size="sm" color="primary" class="font-medium">
									This email is already registered. Redirecting you to sign in in {redirectCountdown}
									seconds...
								</Text>
							</div>
						</div>
						<Button onclick={handleRedirectToLogin} variant="primary" class="w-full"
							>Sign In Now</Button
						>
					</div>
				{:else if errorMessage}
					<!-- Error message -->
					<div
						class="gap-fieldGroup rounded-input border-error bg-status-errorLight px-input py-input mb-alert flex items-start border"
						in:scale={{ start: 0.98, duration: 200, easing: backOut }}
						out:fade={{ duration: 150 }}
					>
						<svg
							class="size-icon-md text-error flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<Text variant="body" size="sm" color="error" class="font-medium">{errorMessage}</Text>
					</div>
				{/if}

				<!-- Form: Uses semantic token gap-form (12px) -->
				<div class="gap-form flex flex-col">
					<PinInput
						bind:value={code}
						label="Enter verification code"
						error={errorMessage}
						disabled={isSubmitting}
						onComplete={handleVerification}
					/>

					<!-- Paste hint -->
					{#if !code && mounted}
						<Text variant="body" size="sm" color="tertiary" class="mt-fieldGroup text-center">
							💡 Tip: Copy the 6-digit code from your email, then paste it here
						</Text>
					{/if}
				</div>

				<!-- Timer display -->
				<div class="mb-alert text-center">
					{#if timeLeft > 0}
						<div
							class="bg-surface gap-fieldGroup px-button py-button inline-flex items-center rounded-full"
						>
							<svg
								class="size-icon-sm text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<Text
								variant="body"
								size="sm"
								color={timeLeft < 60 ? 'error' : 'tertiary'}
								class="font-medium"
							>
								{minutes}:{seconds.toString().padStart(2, '0')}
							</Text>
						</div>
					{:else}
						<Text variant="body" size="sm" color="error" class="font-medium">
							Code expired. Please request a new one.
						</Text>
					{/if}
				</div>

				<!-- Resend button -->
				<div class="mb-alert">
					<Button
						variant="secondary"
						onclick={resendCode}
						disabled={isResending || timeLeft > 540}
						class="w-full"
					>
						{#if isResending}
							<svg
								class="size-icon-sm mr-2 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Sending new code...
						{:else if timeLeft > 540}
							Request new code in {timeLeft - 540} sec
						{:else}
							Didn't receive it? Resend code
						{/if}
					</Button>
				</div>

				<!-- Helper text -->
				<div class="border-subtle mb-alert border-t pt-6 text-center">
					<Text variant="body" size="sm" color="secondary">
						Wrong email?
						<a href={resolveRoute('/register')} class="text-brand font-medium hover:underline">
							Start over
						</a>
					</Text>
				</div>
			{/if}
		</div>
	</div>
</div>
