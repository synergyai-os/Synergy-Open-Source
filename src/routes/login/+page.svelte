<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { Button } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { trackPosthogEvent } from '$lib/posthog/client';

	const auth = useAuth();
	const { signIn } = auth;
	
	// Get redirectTo parameter from URL query string
	const redirectTo = $derived($page.url.searchParams.get('redirectTo') || '/');

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let error = $state('');
	let isLoading = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		error = '';
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
				flow: 'signIn'
			});

			await trackPosthogEvent({
				event: 'user_signed_in',
				distinctId: email,
				properties: {
					method: 'password',
					rememberMe,
					status: 'success'
				}
			});
			// Redirect to intended destination or home page after successful login
			await goto(redirectTo);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.';
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Or
				<a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
					create a new account
				</a>
			</p>
		</div>
		<form class="mt-8 space-y-6" onsubmit={handleLogin}>
			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			{/if}

			<div class="space-y-4">
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
						autocomplete="current-password"
						required
						bind:value={password}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="Enter your password"
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
					{isLoading ? 'Signing in...' : 'Sign in'}
				</Button.Root>
			</div>
		</form>
	</div>
</div>

