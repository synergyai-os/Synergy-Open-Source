import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tooltip Recipe
 *
 * Styled components for Bits UI Tooltip with design tokens.
 */

export const tooltipProviderRecipe = cva(
	// Base classes - Tooltip provider (no styling needed)
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const tooltipRootRecipe = cva(
	// Base classes - Tooltip root (no styling needed)
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const tooltipTriggerRecipe = cva(
	// Base classes - Tooltip trigger (no styling needed)
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const tooltipContentRecipe = cva(
	// Base classes - Tooltip content
	'rounded-button border border-base bg-elevated px-button-sm py-button-sm text-button text-primary shadow-card',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const tooltipArrowRecipe = cva(
	// Base classes - Tooltip arrow
	'fill-elevated',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type TooltipProviderVariantProps = VariantProps<typeof tooltipProviderRecipe>;
export type TooltipRootVariantProps = VariantProps<typeof tooltipRootRecipe>;
export type TooltipTriggerVariantProps = VariantProps<typeof tooltipTriggerRecipe>;
export type TooltipContentVariantProps = VariantProps<typeof tooltipContentRecipe>;
export type TooltipArrowVariantProps = VariantProps<typeof tooltipArrowRecipe>;
