<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { OrganizationsModuleAPI } from '../api';

	let {
		organizations,
		activeOrganizationName: _activeOrganizationName
	}: {
		organizations: Pick<
			OrganizationsModuleAPI,
			'modals' | 'loading' | 'closeModal' | 'createOrganization' | 'joinOrganization'
		>;
		activeOrganizationName: string | null;
	} = $props();

	let organizationName = $state('');
	let organizationCode = $state('');

	async function submitCreateOrganization() {
		await organizations.createOrganization({ name: organizationName });
		// Only clear if modal closed (success)
		if (!organizations.modals.createOrganization) {
			organizationName = '';
		}
	}

	function submitJoinOrganization() {
		organizations.joinOrganization({ code: organizationCode });
		organizationCode = '';
	}
</script>

<Dialog.Root
	open={organizations.modals.createOrganization}
	onOpenChange={(value) => !value && organizations.closeModal('createOrganization')}
>
	<Dialog.Content
		class="border-base w-[min(500px,90vw)] max-w-lg rounded-lg border bg-surface text-primary shadow-xl"
	>
		<div class="px-inbox-container py-inbox-container space-y-6">
			<div>
				<Dialog.Title class="text-lg font-semibold text-primary">Create organization</Dialog.Title>
				<Dialog.Description class="mt-1 text-sm text-secondary">
					Spin up a new workspace for another company or product team.
				</Dialog.Description>
			</div>

			<form
				class="space-y-4"
				onsubmit={(event) => {
					event.preventDefault();
					submitCreateOrganization();
				}}
			>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-primary">Organization name</span>
					<input
						class="border-base py-nav-item focus:border-accent-primary w-full rounded-md border bg-elevated px-2 text-sm text-primary focus:outline-none"
						placeholder="e.g. SynergyOS Labs"
						bind:value={organizationName}
						required
						minlength={2}
					/>
				</label>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						class="border-base rounded-md border px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary disabled:opacity-50"
						onclick={() => organizations.closeModal('createOrganization')}
						disabled={organizations.loading.createOrganization}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="text-on-solid bg-accent-primary flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
						disabled={organizations.loading.createOrganization}
					>
						{#if organizations.loading.createOrganization}
							<svg
								class="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Creating...
						{:else}
							Create
						{/if}
					</button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={organizations.modals.joinOrganization}
	onOpenChange={(value) => !value && organizations.closeModal('joinOrganization')}
>
	<Dialog.Content
		class="border-base w-[min(500px,90vw)] max-w-lg rounded-lg border bg-surface text-primary shadow-xl"
	>
		<div class="px-inbox-container py-inbox-container space-y-6">
			<div>
				<Dialog.Title class="text-lg font-semibold text-primary">Join organization</Dialog.Title>
				<Dialog.Description class="mt-1 text-sm text-secondary">
					Paste the invite code or link that a teammate shared with you.
				</Dialog.Description>
			</div>

			<form
				class="space-y-4"
				onsubmit={(event) => {
					event.preventDefault();
					submitJoinOrganization();
				}}
			>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-primary">Invite code</span>
					<input
						class="border-base py-nav-item focus:border-accent-primary w-full rounded-md border bg-elevated px-2 text-sm text-primary focus:outline-none"
						placeholder="POA-ADMIN-4820"
						bind:value={organizationCode}
						required
					/>
				</label>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						class="border-base rounded-md border px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary"
						onclick={() => organizations.closeModal('joinOrganization')}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="text-on-solid bg-accent-primary rounded-md px-3 py-1.5 text-sm font-medium"
					>
						Join
					</button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
