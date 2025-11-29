import { cva, type VariantProps } from 'class-variance-authority';
import { formInputRecipe } from './formInput.recipe';

/**
 * DateInput Recipe
 *
 * Extends formInputRecipe for consistent styling.
 * Date inputs use Bits UI DateField with segmented input (month/day/year).
 * Same premium micro-interactions as FormInput.
 */
export const dateInputRecipe = cva(formInputRecipe(), {
	variants: {},
	defaultVariants: {}
});

export type DateInputVariantProps = VariantProps<typeof dateInputRecipe>;
