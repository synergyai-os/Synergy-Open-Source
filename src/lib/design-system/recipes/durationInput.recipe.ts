import { cva, type VariantProps } from 'class-variance-authority';
import { formInputRecipe } from './formInput.recipe';

/**
 * DurationInput Recipe
 *
 * Compact number input for duration (minutes).
 * Extends formInputRecipe but optimized for inline use (no label).
 * Same premium micro-interactions as FormInput.
 */
export const durationInputRecipe = cva(formInputRecipe(), {
	variants: {},
	defaultVariants: {}
});

export type DurationInputVariantProps = VariantProps<typeof durationInputRecipe>;
