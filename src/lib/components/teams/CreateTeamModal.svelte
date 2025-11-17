<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { UseTeams } from '$lib/composables/useTeams.svelte';

	let {
		teams,
		open,
		onOpenChange
	}: {
		teams: Pick<UseTeams, 'loading' | 'createTeam'>;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	} = $props();

	let name = $state('');

	// Reset form when modal closes
	$effect(() => {
		if (!open) {
			name = '';
		}
	});

	async function submitCreateTeam() {
		await teams.createTeam(name);
		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 transition-opacity" />
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 w-[min(500px,90vw)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-base bg-surface text-primary shadow-xl"
		>
			<div class="space-y-6 px-inbox-container py-inbox-container">
				<div>
					<Dialog.Title class="text-lg font-semibold text-primary">Create team</Dialog.Title>
					<Dialog.Description class="mt-1 text-sm text-secondary">
						Teams are groups of people working together on projects or initiatives.
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
						<span class="text-sm font-medium text-primary">Team name *</span>
						<input
							class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
							placeholder="e.g. Active Platforms"
							bind:value={name}
							required
							minlength={2}
							disabled={teams.loading.createTeam}
						/>
					</label>

					<div class="flex items-center justify-end gap-2 pt-2">
						<button
							type="button"
							class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary disabled:opacity-50"
							onclick={() => onOpenChange(false)}
							disabled={teams.loading.createTeam}
						>
							Cancel
						</button>
						<button
							type="submit"
							class="text-on-solid rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
							disabled={teams.loading.createTeam || !name.trim()}
						>
							{teams.loading.createTeam ? 'Creating...' : 'Create'}
						</button>
					</div>
				</form>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
