<script lang="ts">
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
	<div class="px-inbox-container py-inbox-container border-b border-base flex items-center justify-between flex-shrink-0">
		<h3 class="text-sm font-normal text-primary">Import Readwise Highlights</h3>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto px-inbox-container py-inbox-container">
		<div class="flex flex-col gap-6">
			<!-- Import Type Selection -->
			<div class="flex flex-col gap-2">
				<p class="text-sm font-medium text-secondary">Import by:</p>
				
				<div class="flex flex-col gap-2">
					<label for="type-time" class="flex items-center gap-icon cursor-pointer group">
						<input
							id="type-time"
							type="radio"
							name="importType"
							value="time"
							bind:group={importType}
							class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
						/>
						<span class="text-sm text-primary group-hover:text-secondary">Time range</span>
					</label>
					
					<label for="type-quantity" class="flex items-center gap-icon cursor-pointer group">
						<input
							id="type-quantity"
							type="radio"
							name="importType"
							value="quantity"
							bind:group={importType}
							class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
						/>
						<span class="text-sm text-primary group-hover:text-secondary">Number of items</span>
					</label>
					
					<label for="type-custom" class="flex items-center gap-icon cursor-pointer group">
						<input
							id="type-custom"
							type="radio"
							name="importType"
							value="custom"
							bind:group={importType}
							class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
						/>
						<span class="text-sm text-primary group-hover:text-secondary">Custom date range</span>
					</label>
				</div>
			</div>

			<!-- Time Range Selection -->
			{#if importType === 'time'}
				<div class="flex flex-col gap-2">
					<p class="text-sm font-medium text-secondary">Select time range:</p>
					
					<div class="flex flex-col gap-2">
						<label for="range-7d" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="range-7d"
								type="radio"
								name="dateRange"
								value="7d"
								bind:group={selectedRange}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 7 days</span>
						</label>
						
						<label for="range-30d" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="range-30d"
								type="radio"
								name="dateRange"
								value="30d"
								bind:group={selectedRange}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 30 days</span>
						</label>
						
						<label for="range-90d" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="range-90d"
								type="radio"
								name="dateRange"
								value="90d"
								bind:group={selectedRange}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 90 days</span>
						</label>
						
						<label for="range-180d" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="range-180d"
								type="radio"
								name="dateRange"
								value="180d"
								bind:group={selectedRange}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 180 days</span>
						</label>
						
						<label for="range-365d" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="range-365d"
								type="radio"
								name="dateRange"
								value="365d"
								bind:group={selectedRange}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 365 days</span>
						</label>
						
						<label for="range-all" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="range-all"
								type="radio"
								name="dateRange"
								value="all"
								bind:group={selectedRange}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">All time</span>
						</label>
					</div>
				</div>
			{/if}

			<!-- Quantity Selection -->
			{#if importType === 'quantity'}
				<div class="flex flex-col gap-2">
					<p class="text-sm font-medium text-secondary">Number of highlights:</p>
					
					<div class="flex flex-col gap-2">
						<label for="qty-5" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="qty-5"
								type="radio"
								name="quantity"
								value="5"
								bind:group={selectedQuantity}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 5 highlights</span>
						</label>
						
						<label for="qty-10" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="qty-10"
								type="radio"
								name="quantity"
								value="10"
								bind:group={selectedQuantity}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 10 highlights</span>
						</label>
						
						<label for="qty-25" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="qty-25"
								type="radio"
								name="quantity"
								value="25"
								bind:group={selectedQuantity}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 25 highlights</span>
						</label>
						
						<label for="qty-50" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="qty-50"
								type="radio"
								name="quantity"
								value="50"
								bind:group={selectedQuantity}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 50 highlights</span>
						</label>
						
						<label for="qty-100" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="qty-100"
								type="radio"
								name="quantity"
								value="100"
								bind:group={selectedQuantity}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 100 highlights</span>
						</label>
						
						<label for="qty-250" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="qty-250"
								type="radio"
								name="quantity"
								value="250"
								bind:group={selectedQuantity}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 250 highlights</span>
						</label>
						
						<label for="qty-500" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="qty-500"
								type="radio"
								name="quantity"
								value="500"
								bind:group={selectedQuantity}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 500 highlights</span>
						</label>
						
						<label for="qty-1000" class="flex items-center gap-icon cursor-pointer group">
							<input
								id="qty-1000"
								type="radio"
								name="quantity"
								value="1000"
								bind:group={selectedQuantity}
								class="w-4 h-4 text-primary border-base focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm text-primary group-hover:text-secondary">Last 1,000 highlights</span>
						</label>
					</div>
				</div>
			{/if}

			<!-- Custom Date Range -->
			{#if importType === 'custom'}
				<div class="flex flex-col gap-3">
					<div class="flex flex-col gap-2">
						<label for="start-date" class="text-sm font-medium text-secondary">Start date:</label>
						<input
							id="start-date"
							type="date"
							bind:value={customStartDate}
							class="px-3 py-2 text-sm border border-base rounded-md bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
					
					<div class="flex flex-col gap-2">
						<label for="end-date" class="text-sm font-medium text-secondary">End date:</label>
						<input
							id="end-date"
							type="date"
							bind:value={customEndDate}
							class="px-3 py-2 text-sm border border-base rounded-md bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				</div>
			{/if}

			<!-- Estimated Count (if available) -->
			{#if estimatedCount}
				<div class="flex flex-col gap-2 p-3 bg-hover rounded-md">
					<p class="text-xs font-medium text-tertiary">This will import approximately:</p>
					<ul class="text-sm text-secondary space-y-1">
						<li>• {estimatedCount.highlights} highlights</li>
						<li>• {estimatedCount.sources} sources</li>
					</ul>
				</div>
			{:else}
				<div class="flex flex-col gap-2 p-3 bg-hover rounded-md">
					<p class="text-xs text-tertiary">Click Import to start syncing from Readwise</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer Actions -->
	<div class="px-inbox-container py-inbox-container border-t border-base flex items-center justify-end gap-2 flex-shrink-0">
		<button
			type="button"
			onclick={onCancel}
			class="px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-hover-solid rounded-md transition-colors font-normal"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleImport}
			class="px-4 py-2 text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover transition-colors font-normal"
		>
			Import
		</button>
	</div>
</div>

