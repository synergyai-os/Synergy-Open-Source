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
	<div class="p-card border-base w-full max-w-md rounded-card border bg-surface text-center">
		<h1 class="text-h3 font-semibold text-primary">Organization Required</h1>

		{#if hasOrganizations()}
			<!-- User has orgs but none selected -->
			<p class="text-button mt-2 text-secondary">
				Please select an organization to access Circles.
			</p>

			<div class="mt-6 space-y-2">
				{#each organizations ? (organizations.organizations ?? []) : [] as org (org.organizationId)}
					<button
						onclick={() => handleSelectOrg(org.organizationId)}
						class="border-base py-nav-item text-button hover:bg-sidebar-hover w-full rounded-button border bg-elevated px-2 text-left text-primary"
					>
						{org.name}
					</button>
				{/each}
			</div>
		{:else}
			<!-- No orgs, need to create one -->
			<p class="text-button mt-2 text-secondary">
				Circles require an organization. Create one to get started.
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
