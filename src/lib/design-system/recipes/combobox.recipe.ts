import { cva, type VariantProps } from 'class-variance-authority';
import { formInputRecipe } from './formInput.recipe';

/**
 * Combobox Recipe
 *
 * Premium combobox component with search/filtering support.
 * Extends formInputRecipe for consistent styling (DRY principle).
 * Inherits size variants, focus ring, and compact styling from formInputRecipe.
 */
export const comboboxTriggerRecipe = cva([formInputRecipe(), 'flex items-center justify-between'], {
	variants: {},
	defaultVariants: {}
});

/**
 * Combobox Input Recipe (for search input inside combobox)
 * Extends formInputRecipe for consistent styling.
 * Supports size variants: sm (compact), md (default), lg (generous)
 *
 * Note: Size variants are passed through to formInputRecipe.
 * The 'w-full' class ensures the input takes full width of its container.
 *
 * IMPORTANT: This recipe composes formInputRecipe() which already has size variants.
 * The component should call formInputRecipe({ size }) directly and add 'w-full'.
 * This recipe is kept for type safety but the actual implementation uses formInputRecipe directly.
 */
export const comboboxInputRecipe = cva([formInputRecipe(), 'w-full'], {
	variants: {},
	defaultVariants: {}
});

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
	'relative z-[100] min-w-[var(--bits-combobox-anchor-width)] overflow-hidden rounded-modal border border-base bg-surface py-inset-sm shadow-md',
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
	'flex cursor-pointer items-center gap-fieldGroup mx-1 rounded-button px-button py-button text-xs text-primary transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle data-[highlighted]:bg-subtle data-disabled:pointer-events-none',
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
