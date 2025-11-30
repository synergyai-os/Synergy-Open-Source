import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Progress Recipe
 *
 * Styled components for Bits UI Progress with design tokens.
 */

export const progressRootRecipe = cva(
	// Base classes - Progress root container
	'h-2 w-full overflow-hidden rounded-full bg-base',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const progressIndicatorRecipe = cva(
	// Base classes - Progress indicator (filled portion)
	'h-full rounded-full bg-accent-primary transition-all duration-300',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type ProgressRootVariantProps = VariantProps<typeof progressRootRecipe>;
export type ProgressIndicatorVariantProps = VariantProps<typeof progressIndicatorRecipe>;
