<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as ScrollArea from './ScrollArea.svelte';

	const { Story } = defineMeta({
		component: ScrollArea.Root,
		title: 'Design System/Atoms/ScrollArea',
		tags: ['autodocs']
	});
</script>

<Story name="Default" args={{}}>
	{#snippet template(_args)}
		<ScrollArea.Root class="border-base h-[200px] w-[350px] rounded-card border">
			<ScrollArea.Viewport class="h-full w-full rounded-card">
				<div class="p-4">
					{#each Array(20) as _, i (i)}
						<div class="mb-4 text-primary">
							<h4 class="mb-2 font-semibold">Item {i + 1}</h4>
							<p class="text-secondary">
								This is some content for item {i + 1}. Scroll to see more items below.
							</p>
						</div>
					{/each}
				</div>
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar
				orientation="vertical"
				class="border-base flex touch-none border-l p-0.5 transition-colors select-none"
			>
				<ScrollArea.Thumb
					class="relative flex-1 rounded-full bg-base before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
				/>
			</ScrollArea.Scrollbar>
			<ScrollArea.Corner />
		</ScrollArea.Root>
	{/snippet}
</Story>

<Story name="Horizontal" args={{}}>
	{#snippet template(_args)}
		<ScrollArea.Root class="border-base h-[200px] w-[350px] rounded-card border">
			<ScrollArea.Viewport class="h-full w-full rounded-card">
				<div class="flex gap-4 p-4">
					{#each Array(10) as _, i (i)}
						<div
							class="flex h-[150px] min-w-[200px] items-center justify-center rounded-card bg-elevated text-primary"
						>
							Item {i + 1}
						</div>
					{/each}
				</div>
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar
				orientation="horizontal"
				class="border-base flex touch-none border-t p-0.5 transition-colors select-none"
			>
				<ScrollArea.Thumb
					class="relative flex-1 rounded-full bg-base before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
				/>
			</ScrollArea.Scrollbar>
			<ScrollArea.Corner />
		</ScrollArea.Root>
	{/snippet}
</Story>

<Story name="Both Directions" args={{}}>
	{#snippet template(_args)}
		<ScrollArea.Root class="border-base h-[200px] w-[350px] rounded-card border">
			<ScrollArea.Viewport class="h-full w-full rounded-card">
				<div class="p-4">
					<div class="flex gap-4">
						{#each Array(5) as _, i (i)}
							<div class="flex min-w-[200px] flex-col gap-4">
								{#each Array(10) as _, j (j)}
									<div class="rounded-card bg-elevated p-4 text-primary">
										Item {i + 1}-{j + 1}
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar
				orientation="vertical"
				class="border-base flex touch-none border-l p-0.5 transition-colors select-none"
			>
				<ScrollArea.Thumb
					class="relative flex-1 rounded-full bg-base before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
				/>
			</ScrollArea.Scrollbar>
			<ScrollArea.Scrollbar
				orientation="horizontal"
				class="border-base flex touch-none border-t p-0.5 transition-colors select-none"
			>
				<ScrollArea.Thumb
					class="relative flex-1 rounded-full bg-base before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
				/>
			</ScrollArea.Scrollbar>
			<ScrollArea.Corner />
		</ScrollArea.Root>
	{/snippet}
</Story>
