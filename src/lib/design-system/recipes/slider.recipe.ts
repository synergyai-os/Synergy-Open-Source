import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Slider Recipe
 *
 * Styled components for Bits UI Slider with design tokens.
 */

export const sliderRootRecipe = cva(
	// Base classes - Slider root container
	'relative flex w-full touch-none items-center select-none',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const sliderTrackRecipe = cva(
	// Base classes - Slider track container
	'relative h-2 w-full grow overflow-hidden rounded-full bg-base',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const sliderRangeRecipe = cva(
	// Base classes - Slider range (filled portion)
	'absolute h-full bg-accent-primary',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const sliderThumbRecipe = cva(
	// Base classes - Slider thumb (draggable handle)
	'block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const sliderTickRecipe = cva(
	// Base classes - Slider tick marks
	'absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-base',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type SliderRootVariantProps = VariantProps<typeof sliderRootRecipe>;
export type SliderTrackVariantProps = VariantProps<typeof sliderTrackRecipe>;
export type SliderRangeVariantProps = VariantProps<typeof sliderRangeRecipe>;
export type SliderThumbVariantProps = VariantProps<typeof sliderThumbRecipe>;
export type SliderTickVariantProps = VariantProps<typeof sliderTickRecipe>;
