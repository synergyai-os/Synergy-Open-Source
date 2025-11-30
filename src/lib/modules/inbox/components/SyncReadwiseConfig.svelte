<script lang="ts">
	import { ToggleGroup, RadioGroup } from 'bits-ui';
	import { Button } from '$lib/components/atoms';
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
		class="h-system-header border-base px-inbox-container py-system-header flex flex-shrink-0 items-center justify-between border-b"
	>
		<h3 class="text-small font-normal text-secondary">Import Readwise Highlights</h3>
	</div>

	<!-- Content - Centered top-middle -->
	<div class="px-inbox-container py-system-content flex-1 overflow-y-auto">
		<div class="gap-settings-section mx-auto flex max-w-md flex-col">
			<!-- Import Type Toggle Switcher -->
			<fieldset class="flex flex-col gap-2">
				<legend class="text-small font-normal text-secondary">Import by:</legend>
				<ToggleGroup.Root
					type="single"
					bind:value={importType}
					class="flex rounded-button bg-surface"
					style="gap: var(--spacing-1);"
				>
					<ToggleGroup.Item
						value="time"
						class="px-menu-item py-menu-item text-small flex-1 rounded font-normal text-secondary transition-colors hover:text-primary data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
					>
						Time range
					</ToggleGroup.Item>
					<ToggleGroup.Item
						value="quantity"
						class="px-menu-item py-menu-item text-small flex-1 rounded font-normal text-secondary transition-colors hover:text-primary data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
					>
						Number of items
					</ToggleGroup.Item>
					<ToggleGroup.Item
						value="custom"
						class="px-menu-item py-menu-item text-small flex-1 rounded font-normal text-secondary transition-colors hover:text-primary data-[state=on]:bg-elevated data-[state=on]:text-primary data-[state=on]:shadow-sm"
					>
						Custom date
					</ToggleGroup.Item>
				</ToggleGroup.Root>
			</fieldset>

			<!-- Time Range Selection -->
			{#if importType === 'time'}
				<fieldset class="flex flex-col gap-2">
					<legend class="text-small font-normal text-tertiary">Select time range:</legend>
					<RadioGroup.Root
						bind:value={selectedRange}
						class="flex flex-col"
						style="gap: var(--spacing-1);"
					>
						<RadioGroup.Item
							value="7d"
							class="px-menu-item py-menu-item flex cursor-pointer items-center rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 7 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="30d"
							class="px-menu-item py-menu-item flex cursor-pointer items-center rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 30 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="90d"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 90 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="180d"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 180 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="365d"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 365 days</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="all"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
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
				<fieldset class="flex flex-col gap-2">
					<legend class="text-small font-normal text-tertiary">Number of highlights:</legend>
					<RadioGroup.Root
						bind:value={selectedQuantity}
						class="flex flex-col"
						style="gap: var(--spacing-1);"
					>
						<RadioGroup.Item
							value="5"
							class="px-menu-item py-menu-item flex cursor-pointer items-center rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 5 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="10"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 10 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="25"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 25 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="50"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 50 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="100"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 100 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="250"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 250 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="500"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
						>
							{#snippet children({ checked })}
								<span class="text-small {checked ? 'text-primary' : 'text-primary'}"
									>Last 500 highlights</span
								>
							{/snippet}
						</RadioGroup.Item>
						<RadioGroup.Item
							value="1000"
							class="py-menu-item flex cursor-pointer items-center gap-2 rounded-button transition-colors hover:bg-hover data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary"
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
				<div class="flex flex-col gap-2">
					<div class="flex flex-col gap-2">
						<label for="start-date" class="text-small font-normal text-tertiary">Start date:</label>
						<input
							id="start-date"
							type="date"
							bind:value={customStartDate}
							class="focus:ring-primary border-base px-menu-item py-menu-item text-small rounded-button border bg-surface text-primary focus:ring-2 focus:outline-none"
						/>
					</div>
					<div class="flex flex-col gap-2">
						<label for="end-date" class="text-small font-normal text-tertiary">End date:</label>
						<input
							id="end-date"
							type="date"
							bind:value={customEndDate}
							class="focus:ring-primary border-base px-menu-item py-menu-item text-small rounded-button border bg-surface text-primary focus:ring-2 focus:outline-none"
						/>
					</div>
				</div>
			{/if}

			<!-- Action Buttons - Directly attached to options -->
			<div
				class="mt-nav-container border-base pt-nav-container flex items-center justify-between gap-2 border-t"
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
				<div class="flex items-center gap-2">
					<Button variant="outline" onclick={onCancel}>Cancel</Button>
					<Button variant="primary" onclick={handleImport}>Import</Button>
				</div>
			</div>
		</div>
	</div>
</div>
