import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Label Recipe
 *
 * Styled components for Bits UI Label with design tokens.
 */

export const labelRootRecipe = cva(
	// Base classes - Label root
	'text-small text-label-primary font-medium',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type LabelRootVariantProps = VariantProps<typeof labelRootRecipe>;
