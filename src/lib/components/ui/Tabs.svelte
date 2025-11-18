<script lang="ts">
	import { Tabs as BitsTabs } from 'bits-ui';

	type Tab = {
		value: string;
		label: string;
	};

	type Props = {
		tabs: Tab[];
		value?: string;
		onValueChange?: (value: string) => void;
		children: import('svelte').Snippet<[string]>;
	};

	let { tabs, value = $bindable(tabs[0]?.value ?? ''), onValueChange, children }: Props = $props();

	function handleValueChange(newValue: string | undefined) {
		if (newValue !== undefined) {
			value = newValue;
			onValueChange?.(newValue);
		}
	}
</script>

<BitsTabs.Root {value} onValueChange={handleValueChange} class="w-full">
	<BitsTabs.List
		class="inline-flex h-10 items-center justify-start rounded-md bg-surface p-1 text-secondary"
	>
		{#each tabs as tab (tab.value)}
			<BitsTabs.Trigger
				value={tab.value}
				class="ring-offset-base inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-elevated data-[state=active]:text-primary data-[state=active]:shadow-sm"
			>
				{tab.label}
			</BitsTabs.Trigger>
		{/each}
	</BitsTabs.List>
	{#each tabs as tab (tab.value)}
		<BitsTabs.Content
			value={tab.value}
			class="ring-offset-base mt-4 focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			{@render children(tab.value)}
		</BitsTabs.Content>
	{/each}
</BitsTabs.Root>
