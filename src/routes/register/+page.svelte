<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { Button } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { trackPosthogEvent } from '$lib/posthog/client';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	// VERSION IDENTIFIER - Update this with each fix
	const REGISTER_PAGE_VERSION = '2024-11-09-09:00-auth-config-fix';
	console.log('📦 [Register Page Version]:', REGISTER_PAGE_VERSION);

	const auth = useAuth();
	const { signIn } = auth;

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let name = $state('');
	let rememberMe = $state(false);
	let error = $state('');
	let isLoading = $state(false);
	let authLoadTimeout = $state(false);
	
	// Check if auth is ready
	const isAuthReady = $derived(signIn !== undefined && (auth.isLoading === false || authLoadTimeout));
	
	// Set timeout to allow registration even if isLoading is stuck
	$effect(() => {
		const timer = setTimeout(() => {
			if (auth.isLoading && signIn) {
				console.warn('⚠️ Auth loading timeout - enabling registration anyway');
				authLoadTimeout = true;
			}
		}, 2000);
		
		return () => clearTimeout(timer);
	});

	// Function to clear auth state if it's stuck
	function clearAuthState() {
		localStorage.removeItem('__convexAuthJWT');
		localStorage.removeItem('__convexAuthRefreshToken');
		localStorage.removeItem(`serverStateFetchTime:${PUBLIC_CONVEX_URL}`);
		console.log('🧹 Cleared auth state from localStorage');
		error = 'Auth state cleared. Please try again.';
		authLoadTimeout = true;
	}

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		console.log('🔵 [Register] Starting registration process...');
		console.log('🔵 [Register] signIn function exists:', !!signIn);
		console.log('🔵 [Register] auth.isLoading:', auth.isLoading);
		console.log('🔵 [Register] PUBLIC_CONVEX_URL:', PUBLIC_CONVEX_URL);

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
			// Ensure signIn is available before calling
			if (!signIn) {
				console.error('❌ [Register] signIn function is null/undefined!');
				throw new Error('Authentication system is not ready. Please refresh the page and try again.');
			}
			
			console.log('🔵 [Register] signIn function is available, proceeding...');
			
			// Store rememberMe preference in a temporary cookie
			// Server will read this and set appropriate cookie config
			if (rememberMe) {
				document.cookie = 'rememberMe=true; path=/; max-age=60'; // Expires in 60 seconds
			} else {
				// Clear any existing rememberMe cookie
				document.cookie = 'rememberMe=; path=/; max-age=0';
			}
			
			console.log('🔵 [Register] Calling signIn with flow: signUp...');
			console.log('🔵 [Register] Parameters:', { email, name: name, flow: 'signUp' });
			
			await signIn('password', {
				email,
				password,
				name,
				flow: 'signUp'
			});

			console.log('✅ [Register] signIn completed successfully!');

		await trackPosthogEvent({
			event: 'user_registered',
			distinctId: email,
			properties: {
				method: 'password',
				source: 'register_form'
			}
		});
		
		console.log('🔵 [Register] Redirecting to /inbox...');
		// Redirect to inbox after successful registration
		await goto('/inbox');
		} catch (err) {
			console.error('❌ [Register] Error during registration:', err);
			console.error('❌ [Register] Error type:', err?.constructor?.name);
			console.error('❌ [Register] Error message:', err instanceof Error ? err.message : String(err));
			console.error('❌ [Register] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
			
			error = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-base px-4 py-12 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-primary">Create your account</h2>
			<p class="mt-2 text-center text-sm text-secondary">
				Already have an account?
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
					Sign in
				</a>
			</p>
		</div>
		<form class="mt-8 space-y-6" onsubmit={handleRegister}>
			{#if error}
				<div class="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
					{error}
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-primary">Full Name</label>
					<input
						id="name"
						name="name"
						type="text"
						autocomplete="name"
						required
						bind:value={name}
						class="mt-1 block w-full px-3 py-2 border border-base rounded-md shadow-sm bg-elevated text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="John Doe"
						disabled={isLoading}
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-primary">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="mt-1 block w-full px-3 py-2 border border-base rounded-md shadow-sm bg-elevated text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="you@example.com"
						disabled={isLoading}
					/>
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-primary">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						bind:value={password}
						class="mt-1 block w-full px-3 py-2 border border-base rounded-md shadow-sm bg-elevated text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="At least 8 characters"
						disabled={isLoading}
					/>
					<p class="mt-1 text-xs text-tertiary">Must be at least 8 characters long</p>
				</div>
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-primary">Confirm Password</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						required
						bind:value={confirmPassword}
						class="mt-1 block w-full px-3 py-2 border border-base rounded-md shadow-sm bg-elevated text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
				class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-base rounded"
			/>
			<label for="rememberMe" class="ml-2 block text-sm text-primary">
				Keep me logged in
			</label>
		</div>

		<div>
			<Button.Root
				type="submit"
				disabled={isLoading || !isAuthReady}
				class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? 'Creating account...' : !isAuthReady ? 'Loading...' : 'Create account'}
			</Button.Root>
		</div>
	</form>
	
	{#if auth.isLoading && authLoadTimeout}
		<div class="mt-4 text-center">
			<p class="text-sm text-secondary mb-2">Authentication is taking longer than expected.</p>
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

