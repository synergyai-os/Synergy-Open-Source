<script lang="ts">
	interface Props {
		step: string;
		current: number;
		total?: number;
		message?: string;
		onCancel?: () => void;
	}

	let { step, current, total, message, onCancel }: Props = $props();

	const progressPercentage = $derived(
		total && total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
	);
</script>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div
		class="h-system-header border-base px-inbox-container py-system-header flex flex-shrink-0 items-center justify-between border-b"
	>
		<h3 class="text-small font-normal text-primary">Importing...</h3>
		{#if onCancel}
			<button
				type="button"
				onclick={onCancel}
				class="text-label text-tertiary transition-colors hover:text-secondary"
			>
				Cancel
			</button>
		{/if}
	</div>

	<!-- Content -->
	<div
		class="px-inbox-container py-inbox-container flex flex-1 items-center justify-center overflow-y-auto"
	>
		<div class="gap-settings-section flex w-full max-w-md flex-col">
			<!-- Progress Bar -->
			<div class="gap-form-section flex flex-col">
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between text-label">
						<span class="font-medium text-secondary">{step}</span>
						{#if total}
							<span class="text-tertiary">{current} of {total}</span>
						{:else if current > 0}
							<span class="text-tertiary">{current} items</span>
						{/if}
					</div>

					<div class="rounded-chip h-2.5 w-full overflow-hidden bg-base">
						<div
							class="h-full bg-interactive-primary transition-all duration-300 ease-out"
							style="width: {progressPercentage}%"
						></div>
					</div>
					{#if total}
						<p class="text-center text-label text-tertiary">
							Processing {current} of {total} highlights...
						</p>
					{/if}
				</div>
			</div>

			<!-- Message -->
			{#if message}
				<p class="text-small text-center text-secondary">{message}</p>
			{/if}

			<!-- Loading Indicator -->
			<div class="flex justify-center">
				<svg
					class="icon-md animate-spin text-primary"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			</div>
		</div>
	</div>
</div>
