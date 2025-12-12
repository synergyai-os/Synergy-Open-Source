import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Checkbox Recipe
 *
 * Styled components for Bits UI Checkbox with design tokens.
 */

export const checkboxRootRecipe = cva(
	// Base classes - Checkbox root container
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const checkboxBoxRecipe = cva(
	// Base classes - Checkbox box (visual element)
	'flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors cursor-pointer',
	{
		variants: {
			checked: {
				true: 'border-accent-primary bg-accent-primary',
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

export const checkboxIconRecipe = cva(
	// Base classes - Checkbox checkmark icon
	'h-3 w-3 text-primary',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type CheckboxRootVariantProps = VariantProps<typeof checkboxRootRecipe>;
export type CheckboxBoxVariantProps = VariantProps<typeof checkboxBoxRecipe>;
export type CheckboxIconVariantProps = VariantProps<typeof checkboxIconRecipe>;
