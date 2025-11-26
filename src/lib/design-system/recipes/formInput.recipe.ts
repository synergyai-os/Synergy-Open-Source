import { cva, type VariantProps } from 'class-variance-authority';

/**
 * FormInput Recipe
 *
 * Premium micro-interactions:
 * - Smooth 200ms transition on all properties
 * - Focus: brand border + subtle shadow glow
 * - Hover: slightly darker border
 *
 * DESIGN SYSTEM NOTE: Focus Ring (using oklch brand hue)
 * The focus ring uses `oklch(55% 0.15 195 / 0.12)` which matches our brand.primary token hue (195).
 * This ensures the glow changes if brand color changes. The oklch format is consistent with our tokens.
 * TODO: Once token build supports light/dark mode shadow tokens, migrate to --shadow-focusRing
 */
export const formInputRecipe = cva(
	'rounded-input border border-strong bg-base px-input py-input text-primary transition-all duration-200 ease-out placeholder:text-muted hover:border-default focus:border-focus focus:shadow-[0_0_0_3px_oklch(55%_0.15_195_/_0.12)] focus:outline-none',
	{
		variants: {},
		defaultVariants: {}
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
