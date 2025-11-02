<script lang="ts">
	import { ToggleGroup, RadioGroup } from 'bits-ui';
	type DateRange = '7d' | '30d' | '90d' | '180d' | '365d' | 'all';
	type ImportType = 'time' | 'quantity' | 'custom';
	type Quantity = 5 | 10 | 25 | 50 | 100 | 250 | 500 | 1000;

	interface Props {
		onImport: (options: {
			dateRange?: DateRange;
			quantity?: Quantity;
			customStartDate?: string;
			customEndDate?: string;
		}) => void;
		onCancel: () => void;
		estimatedCount?: { highlights: number; sources: number };
	}

	let { onImport, onCancel, estimatedCount }: Props = $props();

	let importType = $state<ImportType>('time');
	let selectedRange = $state<DateRange>('30d');
	let selectedQuantity = $state<string>('10'); // String for radio value, default to 10 for quick testing
	let customStartDate = $state<string>('');
	let customEndDate = $state<string>('');

	// Set default end date to today
	$effect(() => {
		if (importType === 'custom' && !customEndDate) {
			const today = new Date();
			customEndDate = today.toISOString().split('T')[0];
		}
	});

	function handleImport() {
		if (importType === 'time') {
			onImport({ dateRange: selectedRange });
		} else if (importType === 'quantity') {
			onImport({ quantity: parseInt(selectedQuantity) as Quantity });
		} else if (importType === 'custom') {
			if (!customStartDate || !customEndDate) {
				alert('Please select both start and end dates');
				return;
			}
			onImport({ customStartDate, customEndDate });
		}
	}
</script>

<div class="h-full flex flex-col">
	<!-- Header -->
	<div
		class="px-inbox-container py-system-header border-b border-base flex items-center justify-between flex-shrink-0"
	>
		<h3 class="text-sm font-normal text-secondary">Import Readwise Highlights</h3>
	</div>

	<!-- Content - Centered top-middle -->
	<div class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		<div class="max-w-md mx-auto flex flex-col gap-6">
			<!-- Import Type Toggle Switcher -->
			<div class="flex flex-col gap-icon">
				<label class="text-sm font-normal text-secondary">Import by:</label>
				<ToggleGroup.Root type="single" bind:value={importType} class="flex gap-0.5 bg-surface p-0.5 rounded-md">
				<ToggleGroup.Item
					value="time"
					class="flex-1 px-menu-item py-menu-item text-sm text-secondary hover:text-primary rounded transition-colors font-normal data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
				>
					Time range
				</ToggleGroup.Item>
				<ToggleGroup.Item
					value="quantity"
					class="flex-1 px-menu-item py-menu-item text-sm text-secondary hover:text-primary rounded transition-colors font-normal data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
				>
					Number of items
				</ToggleGroup.Item>
				<ToggleGroup.Item
					value="custom"
					class="flex-1 px-menu-item py-menu-item text-sm text-secondary hover:text-primary rounded transition-colors font-normal data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
				>
					Custom date
				</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>

			<!-- Time Range Selection -->
			{#if importType === 'time'}
				<div class="flex flex-col gap-icon">
					<label class="text-sm font-normal text-tertiary">Select time range:</label>
					<RadioGroup.Root bind:value={selectedRange} class="flex flex-col gap-0.5">
						<RadioGroup.Item
							value="7d"
							class="flex items-center px-menu-item py-menu-item cursor-pointer rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 7 days</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="30d"
							class="flex items-center px-menu-item py-menu-item cursor-pointer rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 30 days</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="90d"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 90 days</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="180d"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 180 days</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="365d"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 365 days</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="all"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">All time</span>
							{/snippet}
						</RadioGroup.Item>
					</RadioGroup.Root>
				</div>
			{/if}

			<!-- Quantity Selection -->
			{#if importType === 'quantity'}
				<div class="flex flex-col gap-icon">
					<label class="text-sm font-normal text-tertiary">Number of highlights:</label>
					<RadioGroup.Root bind:value={selectedQuantity} class="flex flex-col gap-0.5">
						<RadioGroup.Item
							value="5"
							class="flex items-center px-menu-item py-menu-item cursor-pointer rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 5 highlights</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="10"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 10 highlights</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="25"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 25 highlights</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="50"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 50 highlights</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="100"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 100 highlights</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="250"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 250 highlights</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="500"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 500 highlights</span>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="1000"
							class="flex items-center gap-icon cursor-pointer py-menu-item rounded-md hover:bg-hover transition-colors data-[state=checked]:bg-accent-primary data-[state=checked]:text-white"
						>
							{#snippet children({ checked })}
								<span class="text-sm {checked ? 'text-white' : 'text-primary'}">Last 1,000 highlights</span>
							{/snippet}
						</RadioGroup.Item>
					</RadioGroup.Root>
				</div>
			{/if}

			<!-- Custom Date Range -->
			{#if importType === 'custom'}
				<div class="flex flex-col gap-icon">
					<div class="flex flex-col gap-icon">
						<label for="start-date" class="text-sm font-normal text-tertiary">Start date:</label>
						<input
							id="start-date"
							type="date"
							bind:value={customStartDate}
							class="px-menu-item py-menu-item text-sm border border-base rounded-md bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
					<div class="flex flex-col gap-icon">
						<label for="end-date" class="text-sm font-normal text-tertiary">End date:</label>
						<input
							id="end-date"
							type="date"
							bind:value={customEndDate}
							class="px-menu-item py-menu-item text-sm border border-base rounded-md bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				</div>
			{/if}

			<!-- Action Buttons - Directly attached to options -->
			<div class="flex items-center justify-between gap-icon pt-2 mt-2 border-t border-base">
				<!-- Helper Text / Estimated Count -->
				<div class="flex-1">
					{#if estimatedCount}
						<p class="text-label text-tertiary">
							Approx. {estimatedCount.highlights} highlights • {estimatedCount.sources} sources
						</p>
					{:else}
						<p class="text-label text-tertiary">Ready to import from Readwise</p>
					{/if}
				</div>
				<div class="flex items-center gap-icon">
					<button
						type="button"
						onclick={onCancel}
						class="px-menu-item py-menu-item text-sm text-secondary hover:text-primary hover:bg-hover-solid rounded-md transition-colors font-normal"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleImport}
						class="px-menu-item py-menu-item text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover transition-colors font-normal"
					>
						Import
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
