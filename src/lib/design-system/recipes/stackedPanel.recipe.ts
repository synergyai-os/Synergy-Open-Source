import { cva, type VariantProps } from 'class-variance-authority';

/**
 * StackedPanel Recipe (CVA)
 *
 * Type-safe variant system for StackedPanel organism component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Design Notes:
 * - Fixed positioning from right side
 * - Responsive widths (900px tablet, 1200px desktop)
 * - Surface background with card shadow
 * - Smooth transitions for open/close states
 * - Backdrop blur for depth perception
 */
export const stackedPanelRecipe = cva(
	// Base classes - applied to all stacked panels
	// Mobile-first: full width on mobile, responsive max-widths on tablet/desktop
	'fixed top-0 right-0 h-full bg-surface shadow-card transition-transform ease-out',
	{
		variants: {
			variant: {
				default: 'w-full sm:max-w-[900px] lg:max-w-[1200px]'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export const stackedPanelBackdropRecipe = cva(
	// Backdrop styling
	'fixed inset-0 backdrop-blur-sm transition-opacity',
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

export const stackedPanelContentRecipe = cva(
	// Panel content container
	'flex h-full flex-col',
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

export type StackedPanelVariantProps = VariantProps<typeof stackedPanelRecipe>;
export type StackedPanelBackdropVariantProps = VariantProps<typeof stackedPanelBackdropRecipe>;
export type StackedPanelContentVariantProps = VariantProps<typeof stackedPanelContentRecipe>;
