import { cva, type VariantProps } from 'class-variance-authority';

/**
 * FormInput Recipe
 *
 * Base recipe for all input components. Provides consistent styling with size variants.
 *
 * Size variants (compact-first philosophy):
 * - sm: Extra compact for dense UIs (8px text, 8px×4px padding)
 * - md: Default compact (Linear-inspired, 10px text, 12px×6px padding)
 * - lg: Generous for touch/accessibility
 *
 * Premium micro-interactions:
 * - Smooth 200ms transition on all properties
 * - Focus: brand border + subtle shadow glow
 * - Hover: slightly darker border
 *
 * DESIGN SYSTEM NOTE: Focus Ring (using CSS variable)
 * Uses --shadow-focusRing token which provides light/dark mode support.
 * The token uses color-mix() for proper alpha handling in Tailwind v4.
 */
export const formInputRecipe = cva(
	// Base classes - applied to all inputs
	'rounded-input border border-strong bg-base text-primary transition-all duration-200 ease-out placeholder:text-muted hover:border-default focus:border-focus focus:shadow-[var(--shadow-focusRing)] focus:outline-none',
	{
		variants: {
			size: {
				sm: 'px-[var(--spacing-2)] py-[var(--spacing-1)] text-2xs', // Extra compact: 8px×4px, 8px text
				md: 'px-input py-input text-xs', // Default compact: 12px×6px, 10px text
				lg: 'px-[var(--spacing-4)] py-[var(--spacing-3)] text-base' // Generous: 16px×12px, 14px text
			}
		},
		defaultVariants: {
			size: 'md'
		}
	}
);

/**
 * @deprecated Use Text component instead: <Text variant="body" size="sm" color="default" as="span" class="font-medium">
 * FormInput now uses Text component for labels to ensure consistency when text styles change.
 */
export const formInputLabelRecipe = cva('fontSize-sm font-medium text-primary', {
	variants: {},
	defaultVariants: {}
});

export type FormInputVariantProps = VariantProps<typeof formInputRecipe>;
export type FormInputLabelVariantProps = VariantProps<typeof formInputLabelRecipe>;
