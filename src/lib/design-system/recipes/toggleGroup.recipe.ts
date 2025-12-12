import { cva, type VariantProps } from 'class-variance-authority';

/**
 * ToggleGroup Recipe
 *
 * Styled components for Bits UI ToggleGroup with design tokens.
 */

export const toggleGroupRootRecipe = cva(
	// Base classes - ToggleGroup root container
	'inline-flex flex-wrap items-center gap-button',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const toggleGroupItemRecipe = cva(
	// Base classes - ToggleGroup item button
	// Uses Bits UI data-state attribute for selected state
	// Note: Uses button-sm padding (similar to small buttons) and hardcoded py for nav-item-like spacing
	'inline-flex items-center justify-center rounded-button border border-base bg-surface px-button-sm-x py-[0.375rem] text-small text-secondary transition-colors cursor-pointer whitespace-nowrap min-w-fit hover:bg-hover-solid disabled:opacity-50 disabled:cursor-not-allowed data-[state=on]:bg-accent-primary data-[state=on]:border-accent-primary data-[state=on]:text-primary data-[state=off]:bg-surface data-[state=off]:border-base data-[state=off]:text-secondary data-[state=off]:hover:bg-hover-solid',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type ToggleGroupRootVariantProps = VariantProps<typeof toggleGroupRootRecipe>;
export type ToggleGroupItemVariantProps = VariantProps<typeof toggleGroupItemRecipe>;
