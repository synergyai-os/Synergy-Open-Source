import { cva, type VariantProps } from 'class-variance-authority';

/**
 * PinInput Recipe (CVA)
 *
 * Type-safe variant system for PinInput component.
 * 6-digit verification code input with consistent styling.
 *
 * States: default, error
 *
 * DESIGN SYSTEM NOTE: PinInput uses fixed size (4rem × 4rem) for cells
 * This ensures consistent appearance for verification codes.
 * The size is applied via inline styles as it's component-specific.
 */
export const pinInputRootRecipe = cva(
	// Base classes - root container
	'flex justify-center gap-fieldGroup',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * PinInput Cell Recipe
 *
 * Styles for individual PIN input cells.
 */
export const pinInputCellRecipe = cva(
	// Base classes - cell styling
	// Uses same focus pattern as formInputRecipe for consistency
	'border-2 rounded-input border-base bg-base text-center font-bold text-primary text-body leading-none transition-all duration-200 placeholder:text-tertiary focus:border-focus focus:shadow-[0_0_0_3px_oklch(55%_0.15_195_/_0.12)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			error: {
				true: 'border-error',
				false: ''
			}
		},
		defaultVariants: {
			error: false
		}
	}
);

/**
 * PinInput Label Recipe
 *
 * Styles for PIN input labels.
 */
export const pinInputLabelRecipe = cva(
	// Base classes - label styling
	'text-small text-primary font-medium',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * PinInput Error Recipe
 *
 * Styles for error messages.
 */
export const pinInputErrorRecipe = cva(
	// Base classes - error message styling
	'text-small text-error',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type PinInputRootVariantProps = VariantProps<typeof pinInputRootRecipe>;
export type PinInputCellVariantProps = VariantProps<typeof pinInputCellRecipe>;
export type PinInputLabelVariantProps = VariantProps<typeof pinInputLabelRecipe>;
export type PinInputErrorVariantProps = VariantProps<typeof pinInputErrorRecipe>;
