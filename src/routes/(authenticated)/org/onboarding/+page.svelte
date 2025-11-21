<script lang="ts">
	import { getContext } from 'svelte';
	import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/composables/useOrganizations.svelte';

	const organizations = getContext<OrganizationsModuleAPI | undefined>('organizations');

	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const hasOrganizations = $derived(() => {
		if (!organizations) return false;
		return (organizations.organizations ?? []).length > 0;
	});

	function handleCreateOrg() {
		organizations?.openModal('createOrganization');
	}

	function handleSelectOrg(orgId: string) {
		organizations?.setActiveOrganization(orgId);
	}
</script>

<div class="flex h-full items-center justify-center bg-base">
	<div class="p-card w-full max-w-md rounded-card border border-base bg-surface text-center">
		<h1 class="text-h3 font-semibold text-primary">Organization Required</h1>

		{#if hasOrganizations()}
			<!-- User has orgs but none selected -->
			<p class="mt-2 text-button text-secondary">
				Please select an organization to access Circles.
			</p>

			<div class="mt-6 space-y-2">
				{#each organizations ? (organizations.organizations ?? []) : [] as org (org.organizationId)}
					<button
						onclick={() => handleSelectOrg(org.organizationId)}
						class="w-full rounded-button border border-base bg-elevated px-nav-item py-nav-item text-left text-button text-primary hover:bg-sidebar-hover"
					>
						{org.name}
					</button>
				{/each}
			</div>
		{:else}
			<!-- No orgs, need to create one -->
			<p class="mt-2 text-button text-secondary">
				Circles require an organization. Create one to get started.
			</p>

			<button
				onclick={handleCreateOrg}
				class="text-on-solid mt-6 rounded-button bg-accent-primary px-nav-item py-nav-item text-button font-medium hover:bg-accent-hover"
			>
				Create Organization
			</button>
		{/if}
	</div>
</div>
