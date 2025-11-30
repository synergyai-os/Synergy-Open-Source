import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Toggle Recipe
 *
 * Styled components for Bits UI Toggle with design tokens.
 */

export const toggleRootRecipe = cva(
	// Base classes - Toggle root button
	'inline-flex h-10 items-center justify-center rounded-button border border-base bg-elevated px-2 font-medium text-button text-primary transition-colors hover:bg-hover-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			pressed: {
				true: 'bg-accent-primary text-primary',
				false: ''
			}
		},
		defaultVariants: {
			pressed: false
		}
	}
);

export type ToggleRootVariantProps = VariantProps<typeof toggleRootRecipe>;
