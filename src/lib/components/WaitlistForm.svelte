<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let email = $state('');
	let name = $state('');
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

			{#if error}
				<div class="error-message text-error" in:fly={{ y: -10, duration: 200 }}>
					{error}
				</div>
			{/if}

			<button type="submit" class="submit-button" disabled={isSubmitting}>
				{isSubmitting ? 'Joining...' : 'Join the Waitlist'}
			</button>

			<p class="privacy-note text-tertiary">
				We respect your privacy. No spam, just updates when we're ready.
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
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.form-input {
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-accent-primary-rgb, 59, 130, 246), 0.1);
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-input::placeholder {
		color: var(--color-text-tertiary);
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
		margin-top: 0.5rem;
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
