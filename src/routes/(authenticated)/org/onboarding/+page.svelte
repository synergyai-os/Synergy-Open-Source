<script lang="ts">
	import { getContext } from 'svelte';
	import type { WorkspacesModuleAPI } from '$lib/modules/core/workspaces/composables/useWorkspaces.svelte';

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');

	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const hasOrganizations = $derived(() => {
		if (!workspaces) return false;
		return (workspaces.workspaces ?? []).length > 0;
	});

	function handleCreateOrg() {
		workspaces?.openModal('createWorkspace');
	}

	function handleSelectOrg(orgId: string) {
		workspaces?.setActiveWorkspace(orgId);
	}
</script>

<div class="flex h-full items-center justify-center bg-base">
	<div class="p-card border-base w-full max-w-md rounded-card border bg-surface text-center">
		<h1 class="text-h3 font-semibold text-primary">Organization Required</h1>

		{#if hasOrganizations()}
			<!-- User has orgs but none selected -->
			<p class="text-button mt-2 text-secondary">Please select an workspace to access Circles.</p>

			<div class="mt-6 space-y-2">
				{#each workspaces ? (workspaces.workspaces ?? []) : [] as org (org.workspaceId)}
					<button
						onclick={() => handleSelectOrg(org.workspaceId)}
						class="border-base py-nav-item text-button hover:bg-sidebar-hover w-full rounded-button border bg-elevated px-2 text-left text-primary"
					>
						{org.name}
					</button>
				{/each}
			</div>
		{:else}
			<!-- No orgs, need to create one -->
			<p class="text-button mt-2 text-secondary">
				Circles require an workspace. Create one to get started.
			</p>

			<button
				onclick={handleCreateOrg}
				class="text-on-solid bg-accent-primary py-nav-item text-button hover:bg-accent-hover mt-6 rounded-button px-2 font-medium"
			>
				Create Organization
			</button>
		{/if}
	</div>
</div>
