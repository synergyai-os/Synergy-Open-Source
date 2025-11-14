<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { resolve } from '$app/paths';
	import { resolveRoute } from '$lib/utils/navigation';

	let email = $state('');
	let name = $state('');
	let agreedToUpdates = $state(false);
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	const client = useConvexClient();

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email || email.trim().length === 0) {
			error = 'Email is required';
			return;
		}

		if (!agreedToUpdates) {
			error = 'Please agree to receive updates';
			return;
		}

		isSubmitting = true;
		error = null;

		try {
			await client.mutation(api.waitlist.joinWaitlist, {
				email: email.trim(),
				name: name.trim() || undefined
			});

			success = true;
			email = '';
			name = '';
			agreedToUpdates = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to join waitlist';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="waitlist-form-container">
	{#if success}
		<div class="success-message bg-elevated" in:fly={{ y: 20, duration: 300, easing: quintOut }}>
			<div class="success-icon">✅</div>
			<h3 class="text-primary">You're on the list!</h3>
			<p class="text-secondary">We'll reach out when we're ready for you.</p>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="waitlist-form">
			<div class="form-group">
				<label for="email" class="form-label text-secondary">
					Email <span class="text-error">*</span>
				</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="you@company.com"
					class="form-input bg-surface text-primary"
					required
					disabled={isSubmitting}
				/>
			</div>

			<div class="form-group">
				<label for="name" class="form-label text-secondary">
					Name <span class="text-tertiary">(optional)</span>
				</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					placeholder="Your name"
					class="form-input bg-surface text-primary"
					disabled={isSubmitting}
				/>
			</div>

			<div class="form-checkbox-group">
				<label class="checkbox-label">
					<input
						type="checkbox"
						bind:checked={agreedToUpdates}
						class="checkbox-input"
						disabled={isSubmitting}
					/>
					<span class="checkbox-text text-secondary">
						I want to receive updates about SynergyOS. You can unsubscribe anytime.
						<a href={resolveRoute('/privacy')} class="privacy-link text-accent">Privacy Policy</a>
					</span>
				</label>
			</div>

			{#if error}
				<div class="error-message text-error" in:fly={{ y: -10, duration: 200 }}>
					{error}
				</div>
			{/if}

			<button type="submit" class="submit-button" disabled={isSubmitting || !agreedToUpdates}>
				{isSubmitting ? 'Joining...' : 'Join the Waitlist'}
			</button>

			<p class="privacy-note text-tertiary">
				<svg
					class="inline-icon"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
				</svg>
				We respect your privacy. No spam. Build together.
			</p>
		</form>
	{/if}
</div>

<style lang="postcss">
	.waitlist-form-container {
		max-width: 28rem;
		margin: 0 auto;
	}

	.waitlist-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: left;
	}

	.form-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.form-input {
		padding: 0.875rem 1rem;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-accent-primary) 10%, transparent);
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.form-checkbox-group {
		text-align: left;
	}

	.checkbox-label {
		display: flex;
		gap: 0.75rem;
		cursor: pointer;
		align-items: flex-start;
	}

	.checkbox-input {
		flex-shrink: 0;
		width: 1.125rem;
		height: 1.125rem;
		margin-top: 0.125rem;
		border: 1px solid var(--color-border-base);
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
		accent-color: var(--color-accent-primary);
	}

	.checkbox-input:hover {
		border-color: var(--color-accent-primary);
	}

	.checkbox-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.checkbox-text {
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.privacy-link {
		text-decoration: underline;
		transition: opacity 0.2s ease;
	}

	.privacy-link:hover {
		opacity: 0.8;
	}

	.submit-button {
		padding: 0.875rem 1.5rem;
		background: var(--color-accent-primary);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.submit-button:hover:not(:disabled) {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(var(--color-accent-primary-rgb, 59, 130, 246), 0.3);
	}

	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.error-message {
		font-size: 0.875rem;
		padding: 0.75rem 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid var(--color-error);
		border-radius: 0.5rem;
	}

	.privacy-note {
		font-size: 0.8125rem;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
	}

	.inline-icon {
		flex-shrink: 0;
		opacity: 0.5;
	}

	.success-message {
		text-align: center;
		padding: 3rem 2rem;
		border-radius: 1rem;
		border: 1px solid var(--color-border-base);
	}

	.success-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.success-message h3 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.success-message p {
		font-size: 1rem;
	}
</style>
