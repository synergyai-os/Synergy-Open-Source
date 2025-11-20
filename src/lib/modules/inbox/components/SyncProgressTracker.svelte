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
		class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"
	>
		<h3 class="text-sm font-normal text-primary">Importing...</h3>
		{#if onCancel}
			<button
				type="button"
				onclick={onCancel}
				class="text-xs text-tertiary transition-colors hover:text-secondary"
			>
				Cancel
			</button>
		{/if}
	</div>

	<!-- Content -->
	<div
		class="flex flex-1 items-center justify-center overflow-y-auto px-inbox-container py-inbox-container"
	>
		<div class="flex w-full max-w-md flex-col gap-6">
			<!-- Progress Bar -->
			<div class="flex flex-col gap-3">
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between text-xs">
						<span class="font-medium text-secondary">{step}</span>
						{#if total}
							<span class="text-tertiary">{current} of {total}</span>
						{:else if current > 0}
							<span class="text-tertiary">{current} items</span>
						{/if}
					</div>

					<div class="h-2.5 w-full overflow-hidden rounded-full bg-base">
						<div
							class="bg-primary h-full transition-all duration-300 ease-out"
							style="width: {progressPercentage}%"
						></div>
					</div>
					{#if total}
						<p class="text-center text-xs text-tertiary">
							Processing {current} of {total} highlights...
						</p>
					{/if}
				</div>
			</div>

			<!-- Message -->
			{#if message}
				<p class="text-center text-sm text-secondary">{message}</p>
			{/if}

			<!-- Loading Indicator -->
			<div class="flex justify-center">
				<svg
					class="h-6 w-6 animate-spin text-primary"
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
