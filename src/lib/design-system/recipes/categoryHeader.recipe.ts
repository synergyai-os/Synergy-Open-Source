import { cva, type VariantProps } from 'class-variance-authority';

/**
 * CategoryHeader Recipe (CVA)
 *
 * Type-safe variant system for CategoryHeader component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Category headers are used in org-chart module to display section titles
 * with optional counts and action buttons.
 *
 * Variants:
 * - default: Card-like styling with padding, background, and rounded corners
 * - plain: No padding or background for alignment with plain headers in two-column layouts
 */
export const categoryHeaderRecipe = cva(
	// Base classes - applied to all category headers
	'flex items-center justify-between',
	{
		variants: {
			variant: {
				default: 'rounded-card bg-surface px-button py-stack-item',
				plain: 'mb-header'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export type CategoryHeaderVariantProps = VariantProps<typeof categoryHeaderRecipe>;

