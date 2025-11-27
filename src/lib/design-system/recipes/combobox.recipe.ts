import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Combobox Recipe
 *
 * Premium combobox component with search/filtering support.
 * Uses semantic tokens for consistent styling across the design system.
 *
 * DESIGN SYSTEM NOTE: Focus Ring (using oklch brand hue)
 * The focus ring uses `oklch(55% 0.15 195 / 0.12)` which matches our brand.primary token hue (195).
 * This ensures the glow changes if brand color changes. The oklch format is consistent with our tokens.
 */
export const comboboxTriggerRecipe = cva(
	'flex items-center justify-between rounded-input border border-strong bg-base px-input py-input text-primary transition-all duration-200 ease-out hover:border-default focus:border-focus focus:shadow-[0_0_0_3px_oklch(55%_0.15_195_/_0.12)] focus:outline-none',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * Combobox Input Recipe (for search input inside combobox)
 */
export const comboboxInputRecipe = cva(
	'w-full rounded-input border border-strong bg-base px-input py-input text-primary transition-all duration-200 ease-out placeholder:text-muted hover:border-default focus:border-focus focus:shadow-[0_0_0_3px_oklch(55%_0.15_195_/_0.12)] focus:outline-none',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * Combobox Content Recipe (dropdown container)
 *
 * Premium dropdown styling matching login page aesthetic:
 * - bg-surface (not bg-elevated) for cleaner look
 * - shadow-md for soft, diffused floating effect
 * - rounded-modal for generous radius
 * - Gradient overlay added in component (not recipe - component handles content)
 */
export const comboboxContentRecipe = cva(
	'relative z-50 min-w-[var(--bits-combobox-anchor-width)] overflow-hidden rounded-modal border border-base bg-surface py-inset-sm shadow-md',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * Combobox Viewport Recipe (scrollable container)
 */
export const comboboxViewportRecipe = cva('inset-sm', {
	variants: {},
	defaultVariants: {}
});

/**
 * Combobox Item Recipe (dropdown items)
 *
 * Premium menu item styling:
 * - mx-1 rounded-button for inset, polished look
 * - transition-all duration-200 for smooth feedback
 * - hover:bg-subtle for visible feedback (NOT hover:bg-hover-solid which doesn't exist)
 */
export const comboboxItemRecipe = cva(
	'flex cursor-pointer items-center gap-fieldGroup mx-1 rounded-button px-button py-button text-body-sm text-primary transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle data-disabled:pointer-events-none',
	{
		variants: {
			disabled: {
				true: 'opacity-50'
			}
		},
		defaultVariants: {
			disabled: false
		}
	}
);

export type ComboboxTriggerVariantProps = VariantProps<typeof comboboxTriggerRecipe>;
export type ComboboxInputVariantProps = VariantProps<typeof comboboxInputRecipe>;
export type ComboboxContentVariantProps = VariantProps<typeof comboboxContentRecipe>;
export type ComboboxViewportVariantProps = VariantProps<typeof comboboxViewportRecipe>;
export type ComboboxItemVariantProps = VariantProps<typeof comboboxItemRecipe>;
