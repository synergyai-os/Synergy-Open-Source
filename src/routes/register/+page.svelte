<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button, FormInput } from '$lib/components/ui';
	import RateLimitError from '$lib/components/ui/RateLimitError.svelte';

	const redirectTarget = $derived(
		$page.url.searchParams.get('redirect') ??
			$page.url.searchParams.get('redirectTo') ??
			'/inbox'
	);
	const linkingFlow = $derived(() => {
		const value = $page.url.searchParams.get('linkAccount') ?? $page.url.searchParams.get('link_account');
		return value === '1' || value === 'true' || value === 'yes';
	});

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);
	let isRateLimited = $state(false);
	let rateLimitRetryAfter = $state(0);

	$effect(() => {
		const prefill =
			$page.url.searchParams.get('email') ?? $page.url.searchParams.get('login_hint');
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

		isSubmitting = true;

		try {
			const response = await fetch('/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include', // Include cookies so session can be resolved for account linking
				body: JSON.stringify({
					email: email.trim(),
					password,
					firstName: firstName.trim() || undefined,
					lastName: lastName.trim() || undefined,
					redirect: redirectTarget,
					linkAccount: linkingFlow() // Pass the linkAccount flag
				})
			});

		const data = await response.json();

		if (!response.ok) {
			// Handle rate limiting with delightful countdown
			if (response.status === 429) {
				const retryAfter = parseInt(data.retryAfter || response.headers.get('Retry-After') || '60');
				isRateLimited = true;
				rateLimitRetryAfter = retryAfter;
				isSubmitting = false;
				return;
			}
			
			// If email already exists, show helpful message and redirect to login
			if (data.redirectToLogin && response.status === 409) {
				errorMessage = 'This email is already registered. Taking you to the login page...';
				// Redirect to login with email prefilled after 2 seconds
				setTimeout(() => {
					goto(`/login?email=${encodeURIComponent(email)}`);
				}, 2000);
				return;
			}
			
			// Show the specific error message from the server
			errorMessage = data.error ?? 'Unable to create account. Please try again.';
			isSubmitting = false;
			return;
		}

		// Success - redirect to target
		await goto(data.redirectTo ?? '/inbox');
		} catch (err) {
			console.error('Registration error:', err);
			errorMessage = 'Network error. Please check your connection and try again.';
			isSubmitting = false;
		}
	}
</script>

<div class="min-h-screen bg-base">
	<div class="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-section py-system-content">
		<div class="w-full max-w-md rounded-modal border border-base bg-elevated shadow-sm p-content-padding">
			<header class="flex flex-col gap-form-section text-center">
				<h1 class="text-2xl font-semibold tracking-tight text-primary">Create your account</h1>
				<p class="text-sm text-secondary">
					Already using SynergyOS?
					<a href="/login" class="text-accent-primary hover:text-accent-hover">Sign in instead</a>.
				</p>
			</header>

			{#if isRateLimited}
				<div class="mt-content-section">
					<RateLimitError 
						retryAfter={rateLimitRetryAfter}
						actionLabel="creating accounts"
					/>
				</div>
			{:else if errorMessage}
				<div class="mt-content-section rounded-input border border-error bg-error px-input-x py-input-y">
					<p class="text-sm font-medium text-error-secondary">{errorMessage}</p>
				</div>
			{/if}

			<form class="mt-content-section flex flex-col gap-form-section" onsubmit={handleSubmit}>
				<div class="flex gap-form-section">
					<FormInput
						type="text"
						label="First name"
						placeholder="John"
						bind:value={firstName}
						required={false}
						autocomplete="given-name"
					/>
					<FormInput
						type="text"
						label="Last name"
						placeholder="Doe"
						bind:value={lastName}
						required={false}
						autocomplete="family-name"
					/>
				</div>

				<FormInput
					type="email"
					label="Email"
					placeholder="you@example.com"
					bind:value={email}
					required={true}
					autocomplete="email"
				/>

				<FormInput
					type="password"
					label="Password"
					placeholder="At least 8 characters"
					bind:value={password}
					required={true}
					autocomplete="new-password"
				/>

				<FormInput
					type="password"
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

			<p class="mt-content-section text-center text-label text-secondary">
				By creating an account, you agree to our Terms of Service and Privacy Policy.
			</p>
		</div>
	</div>
</div>
