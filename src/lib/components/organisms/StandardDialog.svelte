<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Dialog } from 'bits-ui';
	import { Button, Icon } from '$lib/components/atoms';
	import {
		dialogOverlayRecipe,
		dialogContentRecipe,
		dialogHeaderRecipe,
		dialogTitleRecipe,
		dialogDescriptionRecipe,
		dialogBodyRecipe,
		dialogFooterRecipe
	} from '$lib/design-system/recipes';

	type StandardDialogProps = {
		// Required
		open: boolean; // Bindable
		title: string; // Header title

		// Optional - header
		description?: string; // Subtitle under title
		closable?: boolean; // Show X button (default: true)

		// Optional - footer behavior
		submitLabel?: string; // Primary button text → shows footer
		cancelLabel?: string; // Secondary button (default: "Cancel")
		dismissible?: boolean; // Shows footer with just "Close" button
		// If neither submitLabel nor dismissible → NO footer

		// Optional - state
		variant?: 'default' | 'danger'; // Affects submit button styling
		loading?: boolean; // Spinner on submit, disables buttons
		disabled?: boolean; // Disables submit button only

		// Optional - size
		size?: 'sm' | 'md' | 'lg'; // Dialog width (default: 'md')

		// Optional - callbacks
		onsubmit?: () => void | Promise<void>;
		oncancel?: () => void;
		onclose?: () => void; // Called on any close (X, cancel, escape)

		// Slot
		children?: Snippet; // Optional - if omitted, only description shows
	};

	let {
		open = $bindable(false),
		title,
		description,
		closable = true,
		submitLabel,
		cancelLabel = 'Cancel',
		dismissible = false,
		variant = 'default',
		loading = false,
		disabled = false,
		size = 'md',
		onsubmit,
		oncancel,
		onclose,
		children
	}: StandardDialogProps = $props();

	// Determine if footer should be shown
	const showFooter = $derived(!!submitLabel || dismissible);

	// Recipe-based classes - centralized styling through design system
	const overlayClasses = dialogOverlayRecipe();
	const contentClasses = $derived(dialogContentRecipe({ size }));
	const headerClasses = dialogHeaderRecipe();
	const titleClasses = dialogTitleRecipe();
	const descriptionClasses = dialogDescriptionRecipe();
	const bodyClasses = dialogBodyRecipe();
	const footerClasses = dialogFooterRecipe();

	// Handle dialog close (ESC, click outside, X button)
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			onclose?.();
		}
		open = newOpen;
	};

	// Handle cancel button
	const handleCancel = () => {
		oncancel?.();
		open = false;
	};

	// Handle submit button
	const handleSubmit = async () => {
		if (loading || disabled) return;
		await onsubmit?.();
	};
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<!-- Dark overlay backdrop -->
		<Dialog.Overlay class={overlayClasses} />

		<!-- Dialog content - centered with proper positioning -->
		<Dialog.Content class={contentClasses}>
			<!-- Header -->
			<div class="gap-fieldGroup flex flex-col">
				<!-- Title row: title + close button aligned -->
				<div class={headerClasses}>
					<Dialog.Title class={titleClasses}>{title}</Dialog.Title>
					{#if closable}
						<Dialog.Close>
							<Button variant="ghost" size="sm" class="shrink-0">
								<Icon type="close" size="sm" />
							</Button>
						</Dialog.Close>
					{/if}
				</div>
				<!-- Description below title row -->
				{#if description}
					<Dialog.Description class={descriptionClasses}>{description}</Dialog.Description>
				{/if}
			</div>

			<!-- Body -->
			{#if children}
				<div class={bodyClasses}>
					{@render children()}
				</div>
			{/if}

			<!-- Footer (conditional) -->
			{#if showFooter}
				<div class={footerClasses}>
					{#if submitLabel}
						<!-- Form dialog: Cancel + Submit -->
						<Button variant="outline" size="md" onclick={handleCancel} disabled={loading}>
							{cancelLabel}
						</Button>
						<Button
							variant={variant === 'danger' ? 'primary' : 'primary'}
							size="md"
							onclick={handleSubmit}
							disabled={disabled || loading}
							class={variant === 'danger' ? 'bg-error text-inverse hover:bg-error' : ''}
						>
							{#if loading}
								<Icon type="loader" size="md" class="animate-spin" />
							{/if}
							{submitLabel}
						</Button>
					{:else if dismissible}
						<!-- Dismissible dialog: Just Close button -->
						<Button variant="primary" size="md" onclick={handleCancel}>Close</Button>
					{/if}
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
