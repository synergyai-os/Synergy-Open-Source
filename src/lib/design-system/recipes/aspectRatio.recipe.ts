import { cva, type VariantProps } from 'class-variance-authority';

/**
 * AspectRatio Recipe
 *
 * Styled components for Bits UI AspectRatio with design tokens.
 */

export const aspectRatioRootRecipe = cva(
	// Base classes - AspectRatio root container
	// Note: Layout classes (rounded-card, bg-elevated) are applied at usage sites
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type AspectRatioRootVariantProps = VariantProps<typeof aspectRatioRootRecipe>;
