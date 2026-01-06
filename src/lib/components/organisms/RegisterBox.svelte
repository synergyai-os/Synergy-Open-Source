<script lang="ts">
	import { Button, FormInput, Text, Heading } from '$lib/components/atoms';
	import { RateLimitError } from '$lib/components/organisms';
	import { registerBoxRecipe } from '$lib/design-system/recipes';
	import { resolveRoute } from '$lib/utils/navigation';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	type Props = {
		email?: string;
		password?: string;
		confirmPassword?: string;
		firstName?: string;
		lastName?: string;
		isSubmitting?: boolean;
		errorMessage?: string | null;
		isRateLimited?: boolean;
		rateLimitRetryAfter?: number;
		redirectTarget?: string;
		variant?: 'default';
		class?: string;
		onSubmit?: (event: {
			email: string;
			password: string;
			confirmPassword: string;
			firstName: string;
			lastName: string;
		}) => void | Promise<void>;
	};

	let {
		email = $bindable(''),
		password = $bindable(''),
		confirmPassword = $bindable(''),
		firstName = $bindable(''),
		lastName = $bindable(''),
		isSubmitting = $bindable(false),
		errorMessage = $bindable<string | null>(null),
		isRateLimited = $bindable(false),
		rateLimitRetryAfter = $bindable(0),
		redirectTarget = '/auth/redirect',
		variant = 'default',
		class: className = '',
		onSubmit
	}: Props = $props();

	const classes = $derived([registerBoxRecipe({ variant }), className]);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting) return;

		errorMessage = null;
		isRateLimited = false;
		isSubmitting = true;

		if (onSubmit) {
			try {
				await onSubmit({
					email: email.trim(),
					password,
					confirmPassword,
					firstName: firstName.trim(),
					lastName: lastName.trim()
				});
				// Note: isSubmitting will be reset by parent component after success/error
			} catch (err) {
				console.error('Registration error:', err);
				errorMessage = 'Network error. Please check your connection and try again.';
				isSubmitting = false;
			}
		} else {
			// If no onSubmit handler, reset submitting state
			isSubmitting = false;
		}
	}

	const loginUrl = $derived.by(() => {
		return `${resolveRoute('/login')}?redirect=${encodeURIComponent(redirectTarget)}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
	});
</script>

<div
	class={[classes, 'w-full']}
	in:fly={{ y: prefersReducedMotion.current ? 0 : 16, duration: 400, delay: 100, easing: cubicOut }}
>
	<!-- Header: Uses semantic tokens mb-header (32px), gap-header (12px) -->
	<header class="gap-header mb-header flex flex-col text-center">
		<Heading level={1}>Create your account</Heading>
		<Text variant="body" size="base" color="secondary">
			Already using SynergyOS?
			<a href={loginUrl} class="text-brand font-medium hover:underline"> Sign in instead</a>.
		</Text>
	</header>

	<!-- Alerts: Use semantic token mb-alert (24px) -->
	{#if isRateLimited}
		<div
			class="mb-alert"
			in:fly={{ y: prefersReducedMotion.current ? 0 : -8, duration: 200, easing: cubicOut }}
			out:fade={{ duration: 150 }}
		>
			<RateLimitError retryAfter={rateLimitRetryAfter} actionLabel="creating accounts" />
		</div>
	{:else if errorMessage}
		<div
			class="rounded-input border-error bg-status-errorLight px-input py-input mb-alert border"
			in:scale={{ start: 0.98, duration: 200, easing: backOut }}
			out:fade={{ duration: 150 }}
		>
			<Text variant="body" size="sm" color="error" class="font-medium">{errorMessage}</Text>
		</div>
	{/if}

	<!-- Form: Uses semantic token gap-form (20px) -->
	<form class="gap-form flex flex-col" onsubmit={handleSubmit}>
		<!-- Name fields: Responsive - stacked on mobile, side-by-side on md+ -->
		<div class="gap-fieldGroup flex flex-col md:flex-row">
			<div class="min-w-0 flex-1">
				<FormInput
					type="text"
					name="firstName"
					label="First name"
					placeholder="John"
					bind:value={firstName}
					required={false}
					autocomplete="given-name"
				/>
			</div>
			<div class="min-w-0 flex-1">
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

		<!-- Password field group: Uses semantic tokens gap-fieldGroup (8px) -->
		<div class="gap-fieldGroup flex flex-col">
			<FormInput
				type="password"
				name="password"
				label="Password"
				placeholder="At least 8 characters"
				bind:value={password}
				required={true}
				autocomplete="new-password"
			/>
			<Text variant="body" size="sm" color="tertiary" class="mt-fieldGroup">
				Must be at least 8 characters and not contain parts of your email (e.g., "randyhereman")
			</Text>
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

		<!-- Button: Uses semantic token mt-fieldGroup (8px) -->
		<div class="mt-fieldGroup">
			<Button variant="primary" type="submit" disabled={isSubmitting} class="w-full">
				{#if isSubmitting}
					Creating account…
				{:else}
					Create account
				{/if}
			</Button>
		</div>
	</form>

	<!-- Terms: Uses semantic token mt-content-section (24px) -->
	<Text variant="body" size="sm" color="secondary" class="mt-content-section text-center">
		By creating an account, you agree to our Terms of Service and Privacy Policy.
	</Text>
</div>
