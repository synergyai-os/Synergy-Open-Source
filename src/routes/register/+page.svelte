<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { Button } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { trackPosthogEvent } from '$lib/posthog/client';

	const auth = useAuth();
	const { signIn } = auth;

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let name = $state('');
	let rememberMe = $state(false);
	let error = $state('');
	let isLoading = $state(false);

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		// Validation
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		isLoading = true;

		try {
			// Store rememberMe preference in a temporary cookie
			// Server will read this and set appropriate cookie config
			if (rememberMe) {
				document.cookie = 'rememberMe=true; path=/; max-age=60'; // Expires in 60 seconds
			} else {
				// Clear any existing rememberMe cookie
				document.cookie = 'rememberMe=; path=/; max-age=0';
			}
			
			await signIn('password', {
				email,
				password,
				name,
				flow: 'signUp'
			});

			await trackPosthogEvent({
				event: 'user_registered',
				distinctId: email,
				properties: {
					method: 'password',
					source: 'register_form'
				}
			});
			// Redirect to home page after successful registration
			await goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Already have an account?
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
					Sign in
				</a>
			</p>
		</div>
		<form class="mt-8 space-y-6" onsubmit={handleRegister}>
			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
					<input
						id="name"
						name="name"
						type="text"
						autocomplete="name"
						required
						bind:value={name}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="John Doe"
						disabled={isLoading}
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="you@example.com"
						disabled={isLoading}
					/>
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						bind:value={password}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="At least 8 characters"
						disabled={isLoading}
					/>
					<p class="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
				</div>
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						required
						bind:value={confirmPassword}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="Confirm your password"
						disabled={isLoading}
					/>
				</div>
			</div>

			<div class="flex items-center">
				<input
					id="rememberMe"
					name="rememberMe"
					type="checkbox"
					bind:checked={rememberMe}
					disabled={isLoading}
					class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
				/>
				<label for="rememberMe" class="ml-2 block text-sm text-gray-700">
					Keep me logged in
				</label>
			</div>

			<div>
				<Button.Root
					type="submit"
					disabled={isLoading}
					class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? 'Creating account...' : 'Create account'}
				</Button.Root>
			</div>
		</form>
	</div>
</div>

