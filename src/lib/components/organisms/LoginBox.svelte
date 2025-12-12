<script lang="ts">
	import { Button, FormInput, Text, Heading } from '$lib/components/atoms';
	import { RateLimitError } from '$lib/components/organisms';
	import { loginBoxRecipe } from '$lib/design-system/recipes';
	import { resolveRoute } from '$lib/utils/navigation';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	type Props = {
		email?: string;
		password?: string;
		isSubmitting?: boolean;
		errorMessage?: string | null;
		showCreateAccountLink?: boolean;
		isRateLimited?: boolean;
		rateLimitRetryAfter?: number;
		linkingFlow?: boolean;
		redirectTarget?: string;
		variant?: 'default';
		class?: string;
		onSubmit?: (event: { email: string; password: string }) => void | Promise<void>;
	};

	let {
		email = $bindable(''),
		password = $bindable(''),
		isSubmitting = $bindable(false),
		errorMessage = $bindable<string | null>(null),
		showCreateAccountLink = $bindable(false),
		isRateLimited = $bindable(false),
		rateLimitRetryAfter = $bindable(0),
		linkingFlow = false,
		redirectTarget = '/auth/redirect',
		variant = 'default',
		class: className = '',
		onSubmit
	}: Props = $props();

	const classes = $derived([loginBoxRecipe({ variant }), className]);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting) return;

		errorMessage = null;
		isRateLimited = false;
		showCreateAccountLink = false;
		isSubmitting = true;

		if (onSubmit) {
			try {
				await onSubmit({ email: email.trim(), password });
				// Note: isSubmitting will be reset by parent component after success/error
			} catch (err) {
				console.error('Login error:', err);
				errorMessage = 'Network error. Please check your connection and try again.';
				isSubmitting = false;
			}
		} else {
			// If no onSubmit handler, reset submitting state
			isSubmitting = false;
		}
	}

	const registerUrl = $derived.by(() => {
		if (linkingFlow) {
			return `${resolveRoute('/register')}?linkAccount=1&redirect=${encodeURIComponent(redirectTarget)}&email=${encodeURIComponent(email)}`;
		}
		return `${resolveRoute('/register')}?redirect=${encodeURIComponent(redirectTarget)}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
	});
</script>

<div
	class={[classes, 'w-full']}
	in:fly={{ y: prefersReducedMotion.current ? 0 : 16, duration: 400, delay: 100, easing: cubicOut }}
>
	<!-- Header: Uses semantic tokens mb-header (32px), gap-header (12px) -->
	<header class="gap-header mb-header flex flex-col text-center">
		<Heading level={1}>Welcome back</Heading>
		<Text variant="body" size="base" color="secondary">
			Sign in to continue where you left off. Don't have an account?
			<a href={registerUrl} class="text-brand font-medium hover:underline"> Create one</a>.
		</Text>
	</header>

	<!-- Alerts: Use semantic token mb-alert (24px) -->
	{#if isRateLimited}
		<div
			class="mb-alert"
			in:fly={{ y: prefersReducedMotion.current ? 0 : -8, duration: 200, easing: cubicOut }}
			out:fade={{ duration: 150 }}
		>
			<RateLimitError retryAfter={rateLimitRetryAfter} actionLabel="logging in" />
		</div>
	{:else if errorMessage}
		<div
			class="rounded-input border-error bg-status-errorLight px-input py-input mb-alert border"
			in:scale={{ start: 0.98, duration: 200, easing: backOut }}
			out:fade={{ duration: 150 }}
		>
			<Text variant="body" size="sm" color="error" class="font-medium">{errorMessage}</Text>
			{#if showCreateAccountLink}
				<Text variant="body" size="sm" color="error" class="mt-fieldGroup">
					Don't have an account?
					<a
						href={`${resolveRoute('/register')}?email=${encodeURIComponent(email)}`}
						class="font-semibold underline"
					>
						Create one here
					</a>
				</Text>
			{/if}
		</div>
	{/if}
	{#if linkingFlow}
		<div
			class="gap-header rounded-input border-default bg-subtle px-input py-input mb-alert flex items-center border"
			in:fly={{ y: prefersReducedMotion.current ? 0 : 8, duration: 250, easing: cubicOut }}
			out:fade={{ duration: 150 }}
		>
			<!-- Icon: Uses semantic token size-icon-md (20px) -->
			<svg
				class="size-icon-md text-brand flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
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
			<Text variant="body" size="sm" color="secondary"
				>Link another email to your SynergyOS account.</Text
			>
		</div>
	{/if}

	<!-- Form: Uses semantic token gap-form (20px) -->
	<form class="gap-form flex flex-col" onsubmit={handleSubmit}>
		<FormInput
			type="email"
			label="Email"
			placeholder="you@example.com"
			bind:value={email}
			required={true}
			autocomplete="email"
		/>

		<!-- Field group: Uses semantic tokens gap-fieldGroup (8px) -->
		<div class="gap-fieldGroup flex flex-col">
			<FormInput
				type="password"
				label="Password"
				placeholder="Enter your password"
				bind:value={password}
				required={true}
				autocomplete="current-password"
			/>
			<div class="text-right">
				<a href={resolveRoute('/forgot-password')} class="text-brand hover:underline">
					<Text variant="body" size="sm" as="span">Forgot password?</Text>
				</a>
			</div>
		</div>

		<!-- Button: Uses semantic token mt-fieldGroup (8px) -->
		<div class="mt-fieldGroup">
			<Button variant="primary" type="submit" disabled={isSubmitting} class="w-full">
				{#if isSubmitting}
					Signing in…
				{:else}
					Sign in
				{/if}
			</Button>
		</div>
	</form>
</div>
