import { cva, type VariantProps } from 'class-variance-authority';

/**
 * ContextMenu Recipe
 *
 * Styled components for Bits UI ContextMenu with design tokens.
 * Follows the same premium styling pattern as DropdownMenu.
 */

/**
 * ContextMenu Content Recipe
 *
 * Premium menu styling:
 * - bg-surface (not bg-elevated) for cleaner look
 * - rounded-modal for modern curves
 * - border-base for subtle separation
 * - shadow-card for depth
 * - py-inset-sm for compact vertical padding
 */
export const contextMenuContentRecipe = cva(
	'relative overflow-hidden rounded-modal border border-base bg-surface py-inset-sm shadow-card z-50 min-w-[180px]',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * ContextMenu Item Recipe
 *
 * Premium menu item styling:
 * - mx-1 rounded-button for inset, polished look
 * - transition-all duration-200 for smooth feedback
 * - hover:bg-subtle for visible feedback (NOT hover:bg-hover-solid which doesn't exist)
 * - px-button py-button for consistent spacing
 */
export const contextMenuItemRecipe = cva(
	'flex cursor-pointer items-center gap-fieldGroup mx-1 rounded-button px-button py-button text-xs text-primary transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle data-disabled:pointer-events-none data-disabled:opacity-disabled',
	{
		variants: {
			danger: {
				true: 'text-error hover:bg-error/10 focus:bg-error/10',
				false: ''
			}
		},
		defaultVariants: {
			danger: false
		}
	}
);

/**
 * ContextMenu Separator Recipe
 *
 * Subtle divider between menu sections.
 */
export const contextMenuSeparatorRecipe = cva('my-stack-divider border-t border-subtle', {
	variants: {},
	defaultVariants: {}
});

export type ContextMenuContentVariantProps = VariantProps<typeof contextMenuContentRecipe>;
export type ContextMenuItemVariantProps = VariantProps<typeof contextMenuItemRecipe>;
export type ContextMenuSeparatorVariantProps = VariantProps<typeof contextMenuSeparatorRecipe>;
