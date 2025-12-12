import { cva, type VariantProps } from 'class-variance-authority';
import { formInputRecipe } from './formInput.recipe';

/**
 * TimeInput Recipe
 *
 * Extends formInputRecipe for consistent styling.
 * Time inputs use Bits UI TimeField with segmented input (hour/minute).
 * Same premium micro-interactions as FormInput.
 */
export const timeInputRecipe = cva(formInputRecipe(), {
	variants: {},
	defaultVariants: {}
});

export type TimeInputVariantProps = VariantProps<typeof timeInputRecipe>;
