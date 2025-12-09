<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { PinInput, Button } from '$lib/components/atoms';
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

		// Auto-paste from clipboard if it contains a 6-digit code
		const tryAutoPaste = async () => {
			try {
				// Check if clipboard API is available
				if (!navigator.clipboard || !navigator.clipboard.readText) {
					console.log('📋 Clipboard API not available');
					return;
				}

				// Request clipboard permission and read text
				const clipboardText = await navigator.clipboard.readText();
				console.log('📋 Clipboard content available');

				// Check if clipboard contains exactly 6 digits
				const sixDigitMatch = clipboardText.match(/\b\d{6}\b/);
				if (sixDigitMatch) {
					const sixDigitCode = sixDigitMatch[0];
					console.log('✅ Found 6-digit code in clipboard, auto-pasting...');
					code = sixDigitCode;
					// The $effect will trigger handleVerification automatically
				} else {
					console.log('📋 No 6-digit code found in clipboard');
				}
			} catch (_err) {
				// Silently fail - user might have denied clipboard permission
				// or there might be no clipboard access (Firefox private mode, etc.)
				console.log('📋 Could not read clipboard (permission denied or not available)');
			}
		};

		// Try auto-paste after a short delay to ensure the page is fully loaded
		setTimeout(tryAutoPaste, 500);

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

<div class="relative min-h-screen overflow-hidden bg-base">
	<!-- Animated background gradient -->
	{#if mounted}
		<div
			class="animate-gradient from-accent-primary/5 to-accent-primary/10 absolute inset-0 bg-gradient-to-br via-transparent"
			style="animation: gradient 15s ease infinite; background-size: 200% 200%;"
		></div>
	{/if}

	<div
		class="py-system-content relative mx-auto flex min-h-screen max-w-2xl items-center justify-center px-2"
	>
		<div
			class="border-base p-content-padding w-full max-w-md rounded-modal border bg-elevated shadow-lg transition-all duration-300 hover:shadow-xl"
			style="animation: fadeInUp 0.5s ease-out"
		>
			<!-- Email icon with animation -->
			<div
				class="bg-accent-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
			>
				<svg
					class="h-8 w-8 text-accent-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					style="animation: pulse 2s ease-in-out infinite"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			</div>

			<header class="gap-form-section flex flex-col text-center">
				<h1 class="text-3xl font-bold tracking-tight text-primary">Check your inbox</h1>
				<p class="text-base leading-relaxed text-secondary">
					We sent a 6-digit code to<br />
					<span class="font-semibold text-primary">{email}</span>
				</p>
			</header>

			<!-- Already authenticated message with countdown -->
			{#if isAuthenticated()}
				<div
					class="mt-content-section rounded-input border border-green-500 bg-green-50 px-input-x py-input-y shadow-sm"
					style="animation: slideDown 0.3s ease-out"
				>
					<div class="flex flex-col gap-3">
						<div class="flex items-start gap-2">
							<svg
								class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
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
								<p class="text-sm font-medium text-green-700">
									You're already signed in! Redirecting you in {redirectCountdown} seconds...
								</p>
							</div>
						</div>
						<Button
							onclick={handleRedirectNow}
							class="w-full bg-green-600 text-white hover:bg-green-700"
						>
							Continue Now
						</Button>
					</div>
				</div>
			{:else}
				<!-- Success message with animation -->
				{#if resendSuccess}
					<div
						class="mt-content-section rounded-input border border-green-500 bg-green-50 px-input-x py-input-y shadow-sm"
						style="animation: slideDown 0.3s ease-out"
					>
						<div class="flex items-center gap-2">
							<svg
								class="h-5 w-5 text-green-600"
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
							<p class="text-sm font-medium text-green-700">New code sent! Check your email.</p>
						</div>
					</div>
				{/if}

				<!-- Redirect to login message with countdown (for "already registered" error) -->
				{#if shouldRedirectToLogin}
					<div
						class="mt-content-section bg-accent-primary/10 rounded-input border border-accent-primary px-input-x py-input-y shadow-sm"
						style="animation: slideDown 0.3s ease-out"
					>
						<div class="flex flex-col gap-3">
							<div class="flex items-start gap-2">
								<svg
									class="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-primary"
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
									<p class="text-sm font-medium text-primary">
										This email is already registered. Redirecting you to sign in in {redirectCountdown}
										seconds...
									</p>
								</div>
							</div>
							<Button onclick={handleRedirectToLogin} class="w-full">Sign In Now</Button>
						</div>
					</div>
				{:else if errorMessage}
					<!-- Error message with animation -->
					<div
						class="mt-content-section bg-error rounded-input border border-error px-input-x py-input-y shadow-sm"
						style="animation: shake 0.5s ease-out"
					>
						<div class="flex items-start gap-2">
							<svg
								class="text-error-secondary mt-0.5 h-5 w-5 flex-shrink-0"
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
							<p class="text-error-secondary text-sm font-medium">{errorMessage}</p>
						</div>
					</div>
				{/if}

				<div class="mt-8">
					<PinInput
						bind:value={code}
						label="Enter verification code"
						error={errorMessage}
						disabled={isSubmitting}
						onComplete={handleVerification}
					/>

					<!-- Paste hint -->
					{#if !code && mounted}
						<p class="mt-2 text-center text-sm text-tertiary">
							💡 Tip: Copy the code from your email and it will auto-paste
						</p>
					{/if}
				</div>

				<!-- Timer display with visual feedback -->
				<div class="mt-6 text-center">
					{#if timeLeft > 0}
						<div class="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2">
							<svg
								class="h-4 w-4 text-tertiary"
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
							<span class="text-sm font-medium {timeLeft < 60 ? 'text-error' : 'text-tertiary'}">
								{minutes}:{seconds.toString().padStart(2, '0')}
							</span>
						</div>
					{:else}
						<p class="text-sm font-medium text-error">Code expired. Please request a new one.</p>
					{/if}
				</div>

				<!-- Resend button with better styling -->
				<div class="mt-6">
					<Button
						variant="secondary"
						onclick={resendCode}
						disabled={isResending || timeLeft > 540}
						class="w-full"
					>
						{#if isResending}
							<svg
								class="mr-2 h-4 w-4 animate-spin"
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
				<div class="border-base mt-6 border-t pt-6 text-center">
					<p class="text-sm text-secondary">
						Wrong email?
						<a
							href={resolveRoute('/register')}
							class="hover:text-accent-hover font-medium text-accent-primary transition-colors"
						>
							Start over
						</a>
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		10%,
		30%,
		50%,
		70%,
		90% {
			transform: translateX(-5px);
		}
		20%,
		40%,
		60%,
		80% {
			transform: translateX(5px);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.05);
		}
	}
</style>
