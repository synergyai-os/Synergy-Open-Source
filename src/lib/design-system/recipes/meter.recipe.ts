import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Meter Recipe
 *
 * Styled components for Bits UI Meter with design tokens.
 */

export const meterRootRecipe = cva(
	// Base classes - Meter root container
	'h-4 w-full overflow-hidden rounded-full bg-base',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const meterIndicatorRecipe = cva(
	// Base classes - Meter indicator (filled portion)
	'h-full rounded-full bg-accent-primary transition-all duration-300',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type MeterRootVariantProps = VariantProps<typeof meterRootRecipe>;
export type MeterIndicatorVariantProps = VariantProps<typeof meterIndicatorRecipe>;
