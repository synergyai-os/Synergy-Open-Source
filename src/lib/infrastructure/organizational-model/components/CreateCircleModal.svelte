<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { UseCircles } from '../composables/useCircles.svelte';

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
		class="border-base shadow-card-hover w-[min(500px,90vw)] max-w-lg rounded-card border bg-surface text-primary"
	>
		<div class="px-inbox-container py-inbox-container space-y-6">
			<div>
				<Dialog.Title class="text-h3 font-semibold text-primary">Create circle</Dialog.Title>
				<Dialog.Description class="text-button mt-1 text-secondary">
					Circles represent work workspace units like value streams or coordination contexts.
				</Dialog.Description>
			</div>

			<form
				class="space-y-form-section"
				onsubmit={(event) => {
					event.preventDefault();
					submitCreateCircle();
				}}
			>
				<label class="flex flex-col gap-2">
					<span class="text-button font-medium text-primary">Circle name *</span>
					<input
						class="border-base py-nav-item text-button w-full rounded-button border bg-elevated px-2 text-primary focus:border-accent-primary focus:outline-none"
						placeholder="e.g. Active Platforms"
						bind:value={name}
						required
						minlength={2}
					/>
				</label>

				<label class="flex flex-col gap-2">
					<span class="text-button font-medium text-primary">Purpose (optional)</span>
					<textarea
						class="border-base py-nav-item text-button w-full rounded-button border bg-elevated px-2 text-primary focus:border-accent-primary focus:outline-none"
						placeholder="Why this work exists..."
						bind:value={purpose}
						rows={3}
					></textarea>
				</label>

				{#if availableCircles.length > 0}
					<label class="flex flex-col gap-2">
						<span class="text-button font-medium text-primary">Parent circle (optional)</span>
						<select
							class="border-base py-nav-item text-button w-full rounded-button border bg-elevated px-2 text-primary focus:border-accent-primary focus:outline-none"
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
						class="border-base px-card text-button rounded-button border py-input-y font-medium text-secondary hover:text-primary disabled:opacity-50"
						onclick={() => circles.closeModal('createCircle')}
						disabled={circles.loading.createCircle}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="text-on-solid px-card text-button rounded-button bg-accent-primary py-input-y font-medium disabled:opacity-50"
						disabled={circles.loading.createCircle}
					>
						{circles.loading.createCircle ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
