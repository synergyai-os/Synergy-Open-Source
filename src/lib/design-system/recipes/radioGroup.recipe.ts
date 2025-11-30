import { cva, type VariantProps } from 'class-variance-authority';

/**
 * RadioGroup Recipe
 *
 * Styled components for Bits UI RadioGroup with design tokens.
 */

export const radioGroupRootRecipe = cva(
	// Base classes - RadioGroup root container
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const radioGroupItemRecipe = cva(
	// Base classes - RadioGroup item container
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const radioGroupIndicatorRecipe = cva(
	// Base classes - RadioGroup indicator (circular button)
	'flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors cursor-pointer',
	{
		variants: {
			checked: {
				true: 'border-accent-primary',
				false: ''
			},
			disabled: {
				true: 'cursor-not-allowed opacity-50',
				false: ''
			}
		},
		defaultVariants: {
			checked: false,
			disabled: false
		}
	}
);

export const radioGroupDotRecipe = cva(
	// Base classes - RadioGroup inner dot (when checked)
	'h-2 w-2 rounded-full bg-accent-primary',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type RadioGroupRootVariantProps = VariantProps<typeof radioGroupRootRecipe>;
export type RadioGroupItemVariantProps = VariantProps<typeof radioGroupItemRecipe>;
export type RadioGroupIndicatorVariantProps = VariantProps<typeof radioGroupIndicatorRecipe>;
export type RadioGroupDotVariantProps = VariantProps<typeof radioGroupDotRecipe>;
