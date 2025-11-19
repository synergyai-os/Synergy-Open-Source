<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { OrganizationsModuleAPI } from '$lib/composables/useOrganizations.svelte';

	let {
		organizations,
		activeOrganizationName
	}: {
		organizations: Pick<
			OrganizationsModuleAPI,
			| 'modals'
			| 'loading'
			| 'closeModal'
			| 'createOrganization'
			| 'joinOrganization'
			| 'createTeam'
			| 'joinTeam'
		>;
		activeOrganizationName: string | null;
	} = $props();

	let organizationName = $state('');
	let organizationCode = $state('');
	let teamName = $state('');
	let teamCode = $state('');

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

	function submitCreateTeam() {
		organizations.createTeam({ name: teamName });
		teamName = '';
	}

	function submitJoinTeam() {
		organizations.joinTeam({ code: teamCode });
		teamCode = '';
	}
</script>

<Dialog.Root
	open={organizations.modals.createOrganization}
	onOpenChange={(value) => !value && organizations.closeModal('createOrganization')}
>
	<Dialog.Content
		class="w-[min(500px,90vw)] max-w-lg rounded-lg border border-base bg-surface text-primary shadow-xl"
	>
		<div class="space-y-6 px-inbox-container py-inbox-container">
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
						class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
						placeholder="e.g. Axon Labs"
						bind:value={organizationName}
						required
						minlength={2}
					/>
				</label>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary disabled:opacity-50"
						onclick={() => organizations.closeModal('createOrganization')}
						disabled={organizations.loading.createOrganization}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="text-on-solid flex items-center gap-2 rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
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
		class="w-[min(500px,90vw)] max-w-lg rounded-lg border border-base bg-surface text-primary shadow-xl"
	>
		<div class="space-y-6 px-inbox-container py-inbox-container">
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
						class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
						placeholder="POA-ADMIN-4820"
						bind:value={organizationCode}
						required
					/>
				</label>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary"
						onclick={() => organizations.closeModal('joinOrganization')}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="text-on-solid rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium"
					>
						Join
					</button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={organizations.modals.createTeam}
	onOpenChange={(value) => !value && organizations.closeModal('createTeam')}
>
	<Dialog.Content
		class="w-[min(500px,90vw)] max-w-lg rounded-lg border border-base bg-surface text-primary shadow-xl"
	>
		<div class="space-y-6 px-inbox-container py-inbox-container">
			<div>
				<Dialog.Title class="text-lg font-semibold text-primary">Create team</Dialog.Title>
				<Dialog.Description class="mt-1 text-sm text-secondary">
					Organize members inside {activeOrganizationName ?? 'this organization'} with dedicated permissions.
				</Dialog.Description>
			</div>

			<form
				class="space-y-4"
				onsubmit={(event) => {
					event.preventDefault();
					submitCreateTeam();
				}}
			>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-primary">Team name</span>
					<input
						class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
						placeholder="e.g. Research Guild"
						bind:value={teamName}
						required
						minlength={2}
					/>
				</label>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary"
						onclick={() => organizations.closeModal('createTeam')}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="text-on-solid rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium"
					>
						Create team
					</button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={organizations.modals.joinTeam}
	onOpenChange={(value) => !value && organizations.closeModal('joinTeam')}
>
	<Dialog.Content
		class="w-[min(500px,90vw)] max-w-lg rounded-lg border border-base bg-surface text-primary shadow-xl"
	>
		<div class="space-y-6 px-inbox-container py-inbox-container">
			<div>
				<Dialog.Title class="text-lg font-semibold text-primary">Join team</Dialog.Title>
				<Dialog.Description class="mt-1 text-sm text-secondary">
					Teams inherit permissions from their parent organization. Join with an invite code below.
				</Dialog.Description>
			</div>

			<form
				class="space-y-4"
				onsubmit={(event) => {
					event.preventDefault();
					submitJoinTeam();
				}}
			>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-primary">Invite code</span>
					<input
						class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
						placeholder="TEAM-OPS-9412"
						bind:value={teamCode}
						required
					/>
				</label>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary"
						onclick={() => organizations.closeModal('joinTeam')}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="text-on-solid rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium"
					>
						Join team
					</button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
