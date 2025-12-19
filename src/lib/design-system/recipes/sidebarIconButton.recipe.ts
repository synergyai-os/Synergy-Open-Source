import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Sidebar Icon Button Recipe (CVA)
 *
 * Type-safe variant system for icon-only buttons in the sidebar header.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Used for: Search button, Edit button, and similar icon-only actions.
 *
 * Premium micro-interactions:
 * - Smooth 200ms transition
 * - Subtle hover state with background and color change
 */
export const sidebarIconButtonRecipe = cva(
	// Base classes - compact icon button with hover states
	'rounded-button text-secondary hover:bg-subtle hover:text-primary transition-all duration-200',
	{
		variants: {
			size: {
				sm: 'p-1', // 4px padding - very compact
				md: 'py-menu-item px-menu-item' // Default - 8px padding
			}
		},
		defaultVariants: {
			size: 'md'
		}
	}
);

export type SidebarIconButtonVariantProps = VariantProps<typeof sidebarIconButtonRecipe>;
