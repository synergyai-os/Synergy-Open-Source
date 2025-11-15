<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { UseCircles } from '$lib/composables/useCircles.svelte';

	let {
		circles,
		availableCircles = []
	}: {
		circles: Pick<UseCircles, 'modals' | 'loading' | 'closeModal' | 'createCircle'>;
		availableCircles?: Array<{ circleId: string; name: string }>;
	} = $props();

	let name = $state('');
	let purpose = $state('');
	let parentCircleId = $state<string>('');

	async function submitCreateCircle() {
		await circles.createCircle({
			name,
			purpose: purpose || undefined,
			parentCircleId: parentCircleId || undefined
		});
		// Only clear if modal closed (success)
		if (!circles.modals.createCircle) {
			name = '';
			purpose = '';
			parentCircleId = '';
		}
	}
</script>

<Dialog.Root
	open={circles.modals.createCircle}
	onOpenChange={(value) => !value && circles.closeModal('createCircle')}
>
	<Dialog.Content
		class="w-[min(500px,90vw)] max-w-lg rounded-lg border border-base bg-surface text-primary shadow-xl"
	>
		<div class="space-y-6 px-inbox-container py-inbox-container">
			<div>
				<Dialog.Title class="text-lg font-semibold text-primary">Create circle</Dialog.Title>
				<Dialog.Description class="mt-1 text-sm text-secondary">
					Circles represent work organization units like value streams or coordination contexts.
				</Dialog.Description>
			</div>

			<form
				class="space-y-4"
				onsubmit={(event) => {
					event.preventDefault();
					submitCreateCircle();
				}}
			>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-primary">Circle name *</span>
					<input
						class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
						placeholder="e.g. Active Platforms"
						bind:value={name}
						required
						minlength={2}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-primary">Purpose (optional)</span>
					<textarea
						class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
						placeholder="Why this work exists..."
						bind:value={purpose}
						rows={3}
					></textarea>
				</label>

				{#if availableCircles.length > 0}
					<label class="flex flex-col gap-1">
						<span class="text-sm font-medium text-primary">Parent circle (optional)</span>
						<select
							class="w-full rounded-md border border-base bg-elevated px-nav-item py-nav-item text-sm text-primary focus:border-accent-primary focus:outline-none"
							bind:value={parentCircleId}
						>
							<option value="">None (top-level circle)</option>
							{#each availableCircles as circle (circle.circleId)}
								<option value={circle.circleId}>{circle.name}</option>
							{/each}
						</select>
					</label>
				{/if}

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary disabled:opacity-50"
						onclick={() => circles.closeModal('createCircle')}
						disabled={circles.loading.createCircle}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="text-on-solid rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium disabled:opacity-50"
						disabled={circles.loading.createCircle}
					>
						{circles.loading.createCircle ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
