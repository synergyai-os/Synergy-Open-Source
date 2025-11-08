<script lang="ts">
	import { Popover } from 'bits-ui';

	type Variant = 'toolbar' | 'popover' | 'embedded';

	type Props = {
		variant?: Variant;
		open?: boolean; // For popover variant
		onOpenChange?: (open: boolean) => void;
		children: import('svelte').Snippet;
		trigger?: import('svelte').Snippet; // For popover variant
	};

	let {
		variant = 'embedded',
		open = $bindable(false),
		onOpenChange,
		children,
		trigger
	}: Props = $props();
</script>

{#if variant === 'popover'}
	<Popover.Root {open} onOpenChange={onOpenChange}>
		{#if trigger}
			<Popover.Trigger>
				{@render trigger()}
			</Popover.Trigger>
		{/if}
		<Popover.Content
			class="bg-control border border-control-border rounded-md shadow-lg p-control-panel-padding z-50"
			side="bottom"
			align="start"
			sideOffset={8}
		>
			{@render children()}
		</Popover.Content>
	</Popover.Root>
{:else if variant === 'toolbar'}
	<div
		class="flex items-center gap-control-group bg-control border-b border-control-border p-control-panel-padding"
	>
		{@render children()}
	</div>
{:else}
	<div class="flex items-center gap-control-group p-control-panel-padding">
		{@render children()}
	</div>
{/if}

