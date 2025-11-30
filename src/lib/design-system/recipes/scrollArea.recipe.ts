import { cva, type VariantProps } from 'class-variance-authority';

/**
 * ScrollArea Recipe
 *
 * Styled components for Bits UI ScrollArea with design tokens.
 * Used for scrollable containers with custom scrollbars.
 */

export const scrollAreaRootRecipe = cva(
	// Base classes - ScrollArea root container
	'relative overflow-hidden',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const scrollAreaViewportRecipe = cva(
	// Base classes - Scrollable viewport
	// Note: Layout classes (h-full, w-full) are applied at usage sites, not in recipe
	'rounded-card',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const scrollAreaScrollbarRecipe = cva(
	// Base classes - Scrollbar container
	'flex touch-none select-none transition-opacity duration-200',
	{
		variants: {
			orientation: {
				vertical: 'p-px',
				horizontal: 'p-px'
			}
		},
		defaultVariants: {
			orientation: 'vertical'
		}
	}
);

export const scrollAreaThumbRecipe = cva(
	// Base classes - Scrollbar thumb (draggable handle)
	'bg-tertiary relative flex-1 rounded-avatar',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const scrollAreaCornerRecipe = cva(
	// Base classes - Corner piece (usually no styling needed)
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type ScrollAreaRootVariantProps = VariantProps<typeof scrollAreaRootRecipe>;
export type ScrollAreaViewportVariantProps = VariantProps<typeof scrollAreaViewportRecipe>;
export type ScrollAreaScrollbarVariantProps = VariantProps<typeof scrollAreaScrollbarRecipe>;
export type ScrollAreaThumbVariantProps = VariantProps<typeof scrollAreaThumbRecipe>;
export type ScrollAreaCornerVariantProps = VariantProps<typeof scrollAreaCornerRecipe>;
