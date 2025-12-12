import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Sidebar Recipe (CVA)
 *
 * Type-safe variant system for Sidebar organism component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Design Notes:
 * - Uses CSS variables directly for sidebar bg/border (workaround for utility bug)
 * - Generic text tokens (text-primary, text-tertiary) for text colors
 * - No border-right (shell layout: sidebar and content card are visually unified)
 *
 * Variants: default (only variant for now, keeping it simple)
 */
export const sidebarRecipe = cva(
	// Base classes - applied to all sidebars
	// WORKAROUND: component-sidebar-bg/border utilities use wrong CSS property (color: instead of background-color:/border-color:)
	// Using CSS variables directly via inline styles in component
	// No border-r: shell layout pattern means sidebar blends with shell background
	'flex h-full flex-col overflow-hidden text-primary',
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

export type SidebarVariantProps = VariantProps<typeof sidebarRecipe>;
