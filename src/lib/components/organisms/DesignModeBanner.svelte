<script lang="ts">
	import { Button } from '$lib/components/atoms';
	import { Icon } from '$lib/components/atoms';
	import { Text } from '$lib/components/atoms';

	interface Props {
		/**
		 * Whether the workspace is in design mode.
		 * Shows banner when true, hides when false/undefined.
		 */
		isDesignMode: boolean;
		/**
		 * Callback when "Activate Workspace" button is clicked.
		 * Implementation should be provided by parent (out of scope for SYOS-910).
		 */
		onActivate?: () => void;
	}

	let { isDesignMode, onActivate }: Props = $props();
</script>

{#if isDesignMode}
	<div
		class="border-subtle bg-surface flex w-full items-center justify-between border-b"
		style="padding-inline: var(--spacing-4); padding-block: var(--spacing-2);"
		role="banner"
		aria-live="polite"
	>
		<div class="flex items-center" style="gap: var(--spacing-2);">
			<!-- Design mode indicator icon (amber/secondary accent) -->
			<Icon type="edit" size="sm" color="warning" />

			<!-- Banner text -->
			<div class="flex items-center" style="gap: var(--spacing-1);">
				<Text variant="label" size="sm" color="default" weight="medium" as="span">Design Mode</Text>
				<Text variant="label" size="sm" color="default" weight="medium" as="span">
					· Changes aren't tracked until you activate
				</Text>
			</div>
		</div>

		<!-- Activate button (functionality wired in SYOS-910-E) -->
		<Button variant="secondary" size="sm" onclick={onActivate} disabled={!onActivate}>
			Activate Workspace
		</Button>
	</div>
{/if}
