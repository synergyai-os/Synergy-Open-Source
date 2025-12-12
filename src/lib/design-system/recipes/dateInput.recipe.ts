import { cva, type VariantProps } from 'class-variance-authority';
import { formInputRecipe } from './formInput.recipe';

/**
 * DateInput Recipe
 *
 * Extends formInputRecipe for consistent styling.
 * Date inputs use Bits UI DateField with segmented input (month/day/year).
 * Same premium micro-interactions as FormInput.
 *
 * Note: formInputRecipe now includes text-sm and compact padding (14px x 8px),
 * so explicit overrides below are redundant but kept for documentation.
 * The only difference is custom padding-right for icon spacing.
 */
export const dateInputRecipe = cva(
	[
		formInputRecipe(),
		// Explicit padding for icon spacing - pr-6 (24px) accommodates calendar icon
		'pr-[var(--spacing-6)]'
	],
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * DateInput Container Recipe
 *
 * Wrapper container for DateInput component.
 * Fixed width using CSS variable (sizing token not generating utility yet).
 */
export const dateInputContainerRecipe = cva('relative', {
	variants: {},
	defaultVariants: {}
});

export type DateInputVariantProps = VariantProps<typeof dateInputRecipe>;
export type DateInputContainerVariantProps = VariantProps<typeof dateInputContainerRecipe>;
