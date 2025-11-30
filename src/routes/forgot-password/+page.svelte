<script lang="ts">
	import { Button, FormInput } from '$lib/components/atoms';
	import { RateLimitError } from '$lib/components/organisms';
	import { resolveRoute } from '$lib/utils/navigation';

	let email = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let isRateLimited = $state(false);
	let rateLimitRetryAfter = $state(0);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting) return;

		errorMessage = null;
		successMessage = null;
		isRateLimited = false;

		// Validate email
		if (!email.trim()) {
			errorMessage = 'Please enter your email address';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: email.trim()
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

				errorMessage = data.error ?? 'Unable to send reset email. Please try again.';
				isSubmitting = false;
				return;
			}

			// Success
			successMessage = data.message;
			isSubmitting = false;
		} catch (err) {
			console.error('Forgot password error:', err);
			errorMessage = 'Network error. Please check your connection and try again.';
			isSubmitting = false;
		}
	}
</script>

<div class="min-h-screen bg-base">
	<div
		class="py-system-content mx-auto flex min-h-screen max-w-2xl items-center justify-center px-2"
	>
		<div
			class="border-base p-content-padding w-full max-w-md rounded-modal border bg-elevated shadow-sm"
		>
			<header class="gap-form-section flex flex-col text-center">
				<h1 class="text-h2 font-semibold tracking-tight text-primary">Reset your password</h1>
				<p class="text-small text-secondary">
					Enter your email address and we'll send you a link to reset your password.
				</p>
			</header>

			{#if isRateLimited}
				<div class="mt-content-section">
					<RateLimitError retryAfter={rateLimitRetryAfter} actionLabel="password reset requests" />
				</div>
			{:else if successMessage}
				<div
					class="mt-content-section rounded-input border border-accent-primary bg-surface px-input-x py-input-y"
				>
					<p class="text-small font-medium text-primary">{successMessage}</p>
				</div>
				<div class="mt-content-section text-center">
					<p class="text-small text-secondary">
						Check your email for the reset link. It may take a few minutes to arrive.
					</p>
				</div>
			{:else if errorMessage}
				<div
					class="mt-content-section bg-error rounded-input border border-error px-input-x py-input-y"
				>
					<p class="text-small text-error-secondary font-medium">{errorMessage}</p>
				</div>
			{/if}

			{#if !successMessage}
				<form class="mt-content-section gap-form-section flex flex-col" onsubmit={handleSubmit}>
					<FormInput
						type="email"
						label="Email"
						placeholder="you@example.com"
						bind:value={email}
						required={true}
						autocomplete="email"
					/>

					<Button variant="primary" type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							Sending reset link…
						{:else}
							Send reset link
						{/if}
					</Button>
				</form>
			{/if}

			<div class="mt-content-section text-center">
				<p class="text-small text-secondary">
					Remember your password?
					<a href={resolveRoute('/login')} class="hover:text-accent-hover text-accent-primary"
						>Sign in</a
					>
				</p>
			</div>
		</div>
	</div>
</div>
