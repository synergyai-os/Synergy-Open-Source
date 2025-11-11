<script lang="ts">
	import { Button } from 'bits-ui';
	import { env } from '$env/dynamic/public';

	let isLoading = $state(false);

	function handleRegister() {
		isLoading = true;

		// Build WorkOS authorization URL with sign-up hint
		const authUrl = new URL('https://api.workos.com/user_management/authorize');
		authUrl.searchParams.set('client_id', env.PUBLIC_WORKOS_CLIENT_ID);
		authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
		authUrl.searchParams.set('response_type', 'code');
		authUrl.searchParams.set('provider', 'authkit'); // Specify AuthKit for email/password
		authUrl.searchParams.set('state', '/inbox');
		authUrl.searchParams.set('screen_hint', 'sign-up');

		// Redirect to WorkOS
		window.location.href = authUrl.toString();
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-base px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-primary">Create your account</h2>
			<p class="mt-2 text-center text-sm text-secondary">
				Already have an account?
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Sign in </a>
			</p>
		</div>

		<div>
			<Button.Root
				onclick={handleRegister}
				disabled={isLoading}
				class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isLoading ? 'Redirecting to sign up...' : 'Create account with WorkOS'}
			</Button.Root>
		</div>
	</div>
</div>
