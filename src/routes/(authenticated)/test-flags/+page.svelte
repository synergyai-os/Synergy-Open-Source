<script lang="ts">
	let { data } = $props();

	const getSessionId = () => data.sessionId;
	const getUserId = () => data.user?.userId;
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-6 text-2xl font-bold">Feature Flag Test Page</h1>

	{#if !getSessionId()}
		<p class="text-red-500">Not authenticated - please log in</p>
	{:else}
		<div class="space-y-4">
			<div class="rounded-lg border p-4">
				<h2 class="mb-2 text-lg font-semibold">Feature Flags Removed</h2>
				<p class="text-sm text-gray-600">
					All feature flags have been removed. Core features (meetings, circles, org chart) are
					always enabled.
				</p>
			</div>

			<div class="mt-6 rounded-lg bg-gray-100 p-4">
				<h3 class="mb-2 font-semibold">Debug Info</h3>
				<p class="text-sm">Session ID: {getSessionId() ?? 'N/A'}</p>
				<p class="text-sm">User ID: {getUserId() ?? 'N/A'}</p>
				<p class="text-sm">Email: {data.user?.email ?? 'N/A'}</p>
			</div>
		</div>
	{/if}
</div>
