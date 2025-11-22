<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button, FormInput } from '$lib/components/atoms';
	import { RateLimitError } from '$lib/components/organisms';
	import { resolveRoute } from '$lib/utils/navigation';

	const token = $derived($page.url.searchParams.get('token') ?? '');

	let newPassword = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let isRateLimited = $state(false);
	let rateLimitRetryAfter = $state(0);

	// Redirect if no token provided
	$effect(() => {
		if (!token) {
			goto(resolveRoute('/forgot-password'));
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting) return;

		errorMessage = null;
		successMessage = null;
		isRateLimited = false;

		// Validate passwords match
		if (newPassword !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}

		// Validate password strength
		if (newPassword.length < 8) {
			errorMessage = 'Password must be at least 8 characters';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token,
					newPassword
				})
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle rate limiting
				if (response.status === 429) {
					const retryAfter = parseInt(
						data.retryAfter || response.headers.get('Retry-After') || '60'
					);
					isRateLimited = true;
					rateLimitRetryAfter = retryAfter;
					isSubmitting = false;
					return;
				}

				errorMessage = data.error ?? 'Unable to reset password. Please try again.';
				isSubmitting = false;
				return;
			}

			// Success - show message and redirect to login after delay
			successMessage = data.message;
			isSubmitting = false;

			// Redirect to login after 3 seconds
			setTimeout(() => {
				goto(resolveRoute('/login'));
			}, 3000);
		} catch (err) {
			console.error('Reset password error:', err);
			errorMessage = 'Network error. Please check your connection and try again.';
			isSubmitting = false;
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
				<h1 class="text-h2 font-semibold tracking-tight text-primary">Set new password</h1>
				<p class="text-small text-secondary">Enter your new password below.</p>
			</header>

			{#if isRateLimited}
				<div class="mt-content-section">
					<RateLimitError retryAfter={rateLimitRetryAfter} actionLabel="password reset attempts" />
				</div>
			{:else if successMessage}
				<div
					class="mt-content-section rounded-input border border-accent-primary bg-surface px-input-x py-input-y"
				>
					<p class="text-small font-medium text-primary">{successMessage}</p>
				</div>
				<div class="mt-content-section text-center">
					<p class="text-small text-secondary">Redirecting to login...</p>
				</div>
			{:else if errorMessage}
				<div
					class="mt-content-section rounded-input border border-error bg-error px-input-x py-input-y"
				>
					<p class="text-small font-medium text-error-secondary">{errorMessage}</p>
				</div>
			{/if}

			{#if !successMessage}
				<form class="mt-content-section flex flex-col gap-form-section" onsubmit={handleSubmit}>
					<FormInput
						type="password"
						name="newPassword"
						label="New password"
						placeholder="Enter your new password"
						bind:value={newPassword}
						required={true}
						autocomplete="new-password"
					/>

					<FormInput
						type="password"
						name="confirmPassword"
						label="Confirm password"
						placeholder="Confirm your new password"
						bind:value={confirmPassword}
						required={true}
						autocomplete="new-password"
					/>

					<Button variant="primary" type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							Resetting password…
						{:else}
							Reset password
						{/if}
					</Button>
				</form>
			{/if}

			<div class="mt-content-section text-center">
				<p class="text-small text-secondary">
					Remember your password?
					<a href={resolveRoute('/login')} class="text-accent-primary hover:text-accent-hover"
						>Sign in</a
					>
				</p>
			</div>
		</div>
	</div>
</div>
