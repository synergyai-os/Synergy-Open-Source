<script lang="ts">
	import { ToggleGroup, RadioGroup } from 'bits-ui';
	import { Button } from '$lib/components/ui';
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

<div class="flex h-full flex-col">
	<!-- Header -->
	<div
		class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"
	>
		<h3 class="text-small font-normal text-secondary">Import Readwise Highlights</h3>
	</div>

	<!-- Content - Centered top-middle -->
	<div class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		<div class="mx-auto flex max-w-md flex-col gap-settings-section">
			<!-- Import Type Toggle Switcher -->
			<fieldset class="flex flex-col gap-icon">
				<legend class="text-small font-normal text-secondary">Import by:</legend>
				<ToggleGroup.Root
					type="single"
					bind:value={importType}
					class="flex gap-control-item-gap rounded-button bg-surface"
				>
					<ToggleGroup.Item
						value="time"
						class="flex-1 rounded px-menu-item py-menu-item text-small font-normal text-secondary transition-colors hover:text-primary data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
					>
						Time range
					</ToggleGroup.Item>
					<ToggleGroup.Item
						value="quantity"
						class="flex-1 rounded px-menu-item py-menu-item text-small font-normal text-secondary transition-colors hover:text-primary data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
					>
						Number of items
					</ToggleGroup.Item>
					<ToggleGroup.Item
						value="custom"
						class="flex-1 rounded px-menu-item py-menu-item text-small font-normal text-secondary transition-colors hover:text-primary data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
					>
						Custom date
					</ToggleGroup.Item>
				</ToggleGroup.Root>
			</fieldset>

			<!-- Time Range Selection -->
			{#if importType === 'time'}
				<fieldset class="flex flex-col gap-icon">
					<legend class="text-small font-normal text-tertiary">Select time range:</legend>
					<RadioGroup.Root bind:value={selectedRange} class="flex flex-col gap-control-item-gap">
						<RadioGroup.Item
							value="7d"
							class="flex cursor-pointer items-center rounded-button px-menu-item py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 7 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="30d"
							class="flex cursor-pointer items-center rounded-button px-menu-item py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 30 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="90d"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 90 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="180d"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 180 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="365d"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 365 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="all"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}">All time</span>
							{/snippet}
						</RadioGroup.Item>
					</RadioGroup.Root>
				</fieldset>
			{/if}

			<!-- Quantity Selection -->
			{#if importType === 'quantity'}
				<fieldset class="flex flex-col gap-icon">
					<legend class="text-small font-normal text-tertiary">Number of highlights:</legend>
					<RadioGroup.Root bind:value={selectedQuantity} class="flex flex-col gap-control-item-gap">
						<RadioGroup.Item
							value="5"
							class="flex cursor-pointer items-center rounded-button px-menu-item py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 5 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="10"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 10 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="25"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 25 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="50"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 50 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="100"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 100 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="250"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 250 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="500"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 500 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="1000"
							class="flex cursor-pointer items-center gap-icon rounded-button py-menu-item transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 1,000 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
					</RadioGroup.Root>
				</fieldset>
			{/if}

			<!-- Custom Date Range -->
			{#if importType === 'custom'}
				<div class="flex flex-col gap-icon">
					<div class="flex flex-col gap-icon">
						<label for="start-date" class="text-small font-normal text-tertiary">Start date:</label>
						<input
							id="start-date"
							type="date"
							bind:value={customStartDate}
							class="focus:ring-primary rounded-button border border-base bg-surface px-menu-item py-menu-item text-small text-primary focus:ring-2 focus:outline-none"
						/>
					</div>
					<div class="flex flex-col gap-icon">
						<label for="end-date" class="text-small font-normal text-tertiary">End date:</label>
						<input
							id="end-date"
							type="date"
							bind:value={customEndDate}
							class="focus:ring-primary rounded-button border border-base bg-surface px-menu-item py-menu-item text-small text-primary focus:ring-2 focus:outline-none"
						/>
					</div>
				</div>
			{/if}

			<!-- Action Buttons - Directly attached to options -->
			<div
				class="mt-nav-container flex items-center justify-between gap-icon border-t border-base pt-nav-container"
			>
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
					<Button variant="outline" onclick={onCancel}>Cancel</Button>
					<Button variant="primary" onclick={handleImport}>Import</Button>
				</div>
			</div>
		</div>
	</div>
</div>
