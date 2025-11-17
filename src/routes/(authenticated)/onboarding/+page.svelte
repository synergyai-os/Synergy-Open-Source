<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	const organizations = getContext<UseOrganizations | undefined>('organizations');

	let orgName = $state('');
	let isCreating = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleCreate() {
		if (!orgName.trim() || !organizations) return;

		isCreating = true;
		errorMessage = null;

		try {
			await organizations.createOrganization({ name: orgName.trim() });
			// Redirect to /org/circles after successful creation
			goto(resolveRoute('/org/circles'));
		} catch (error) {
			console.error('Failed to create organization:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
		} finally {
			isCreating = false;
		}
	}
</script>

<div class="flex h-screen items-center justify-center bg-base">
	<div
		class="w-full max-w-md rounded-lg border border-base bg-surface px-inbox-container py-inbox-container"
	>
		<div class="space-y-6">
			<div>
				<h1 class="text-xl font-semibold text-primary">Create Your Organization</h1>
				<p class="mt-2 text-sm text-secondary">
					Get started by creating your organization. This will be your workspace for team
					collaboration.
				</p>
			</div>

			<form
				class="space-y-4"
				onsubmit={(event) => {
					event.preventDefault();
					handleCreate();
				}}
			>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-primary">Organization name</span>
					<input
						class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
						placeholder="e.g. Axon Labs"
						bind:value={orgName}
						required
						minlength={2}
						disabled={isCreating}
					/>
				</label>

				{#if errorMessage}
					<div
						class="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
					>
						{errorMessage}
					</div>
				{/if}

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="submit"
						disabled={isCreating || !orgName.trim()}
						class="text-on-solid rounded-md bg-accent-primary px-button-x py-button-y text-sm font-medium disabled:opacity-50"
					>
						{isCreating ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
