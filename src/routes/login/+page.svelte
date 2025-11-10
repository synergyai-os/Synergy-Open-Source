<script lang="ts">
	import { Button } from 'bits-ui';
	import { page } from '$app/stores';
	import { env } from '$env/dynamic/public';

	// Get redirectTo parameter from URL query string
	const redirectTo = $derived($page.url.searchParams.get('redirectTo') || '/inbox');

	let isLoading = $state(false);

	function handleLogin() {
		isLoading = true;

		// Build WorkOS authorization URL
		const authUrl = new URL('https://api.workos.com/user_management/authorize');
		authUrl.searchParams.set('client_id', env.PUBLIC_WORKOS_CLIENT_ID);
		authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
		authUrl.searchParams.set('response_type', 'code');
		authUrl.searchParams.set('provider', 'authkit'); // Specify AuthKit for email/password
		authUrl.searchParams.set('state', redirectTo);
		authUrl.searchParams.set('screen_hint', 'sign-in');

		// Redirect to WorkOS
		window.location.href = authUrl.toString();
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-base px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-primary">Sign in to your account</h2>
			<p class="mt-2 text-center text-sm text-secondary">
				Or
				<a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
					create a new account
				</a>
			</p>
		</div>

		<div>
			<Button.Root
				onclick={handleLogin}
				disabled={isLoading}
				class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isLoading ? 'Redirecting to sign in...' : 'Sign in with WorkOS'}
			</Button.Root>
		</div>
	</div>
</div>
