<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { Button } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { trackPosthogEvent } from '$lib/posthog/client';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	const auth = useAuth();
	const { signIn } = auth;
	
	// Get redirectTo parameter from URL query string
	const redirectTo = $derived($page.url.searchParams.get('redirectTo') || '/');

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let error = $state('');
	let isLoading = $state(false);
	let authLoadTimeout = $state(false);
	
	// Check if auth is ready - either loading finished OR signIn is available
	// Add timeout fallback in case isLoading gets stuck
	const isAuthReady = $derived(signIn !== undefined && (auth.isLoading === false || authLoadTimeout));
	
	// Set timeout to allow login even if isLoading is stuck
	$effect(() => {
		const timer = setTimeout(() => {
			if (auth.isLoading && signIn) {
				console.warn('⚠️ Auth loading timeout - enabling login anyway');
				authLoadTimeout = true;
			}
		}, 2000); // 2 second timeout
		
		return () => clearTimeout(timer);
	});

	// Function to clear auth state if it's stuck
	function clearAuthState() {
		localStorage.removeItem('__convexAuthJWT');
		localStorage.removeItem('__convexAuthRefreshToken');
		localStorage.removeItem(`serverStateFetchTime:${PUBLIC_CONVEX_URL}`);
		console.log('🧹 Cleared auth state from localStorage');
		error = 'Auth state cleared. Please try logging in again.';
		authLoadTimeout = true; // Enable the button
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		isLoading = true;

		try {
			// Ensure signIn is available before calling
			if (!signIn) {
				throw new Error('Authentication system is not ready. Please refresh the page and try again.');
			}
			
			// Store rememberMe preference in a temporary cookie
			// Server will read this and set appropriate cookie config
			if (rememberMe) {
				document.cookie = 'rememberMe=true; path=/; max-age=60'; // Expires in 60 seconds
			} else {
				// Clear any existing rememberMe cookie
				document.cookie = 'rememberMe=; path=/; max-age=0';
			}
			
			const result = await signIn('password', {
				email,
				password,
				flow: 'signIn'
			});
			
			// Check if sign-in was successful
			if (!result || (result && 'signingIn' in result && !result.signingIn)) {
				throw new Error('Failed to sign in. Please check your credentials.');
			}

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
			console.error('Failed to sign in:', err);
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
					disabled={isLoading || !isAuthReady}
					class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? 'Signing in...' : !isAuthReady ? 'Loading...' : 'Sign in'}
				</Button.Root>
			</div>
		</form>
		
		{#if auth.isLoading && authLoadTimeout}
			<div class="mt-4 text-center">
				<p class="text-sm text-gray-600 mb-2">Authentication is taking longer than expected.</p>
				<button
					type="button"
					onclick={clearAuthState}
					class="text-sm text-blue-600 hover:text-blue-500 underline"
				>
					Clear auth state and try again
				</button>
			</div>
		{/if}
	</div>
</div>

