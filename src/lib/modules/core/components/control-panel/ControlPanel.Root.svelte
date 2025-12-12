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
	<Popover.Root {open} {onOpenChange}>
		{#if trigger}
			<Popover.Trigger>
				{@render trigger()}
			</Popover.Trigger>
		{/if}
		<Popover.Content
			class="border-control-border bg-control rounded-button shadow-card z-50 border"
			style="padding: var(--spacing-3);"
			side="bottom"
			align="start"
			sideOffset={8}
		>
			{@render children()}
		</Popover.Content>
	</Popover.Root>
{:else if variant === 'toolbar'}
	<div
		class="border-control-border bg-control flex items-center border-b"
		style="gap: var(--spacing-2); padding: var(--spacing-3);"
	>
		{@render children()}
	</div>
{:else}
	<div class="flex items-center" style="gap: var(--spacing-2); padding: var(--spacing-3);">
		{@render children()}
	</div>
{/if}
