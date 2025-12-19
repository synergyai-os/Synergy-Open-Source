import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Sidebar Header Recipe (CVA)
 *
 * Type-safe variant system for SidebarHeader component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Header container styling for the sticky header section at the top of the sidebar.
 * Contains workspace switcher and action icons (search, edit).
 *
 * Note: Uses inline padding (applied via component style attribute) since there's no
 * semantic sidebar-header-padding token yet. Padding matches original: --spacing-2 (8px).
 */
export const sidebarHeaderRecipe = cva(
	// Base classes - sticky header with consistent spacing
	// Padding applied via inline style in component (see component for details)
	'bg-sidebar sticky top-0 z-10 flex flex-shrink-0 items-center justify-between gap-button',
	{
		variants: {
			variant: {
				default: ''
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export type SidebarHeaderVariantProps = VariantProps<typeof sidebarHeaderRecipe>;
