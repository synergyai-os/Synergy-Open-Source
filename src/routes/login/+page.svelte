<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { Button } from 'bits-ui';
	import { goto } from '$app/navigation';

	const auth = useAuth();
	const { signIn } = auth;

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		isLoading = true;

		try {
			await signIn('password', {
				email,
				password,
				flow: 'signIn'
			});
			// Redirect to home page after successful login
			await goto('/');
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

