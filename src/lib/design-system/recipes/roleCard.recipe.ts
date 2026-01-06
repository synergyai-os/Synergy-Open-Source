import { cva, type VariantProps } from 'class-variance-authority';

/**
 * RoleCard Recipe (CVA)
 *
 * Type-safe variant system for RoleCard component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Handles container styling for role card items in org chart.
 * Similar to MeetingCard - interactive card with hover state.
 */
export const roleCardRecipe = cva(
	// Base classes - container styling for role card
	// Interactive card with hover feedback
	// Uses card padding (24px horizontal) for adequate spacing
	// Note: w-full is applied at component level (layout class, not styling)
	'flex items-center gap-button text-left transition-colors card-padding py-stack-item',
	{
		variants: {
			variant: {
				default: 'bg-surface hover:bg-subtle',
				selected: 'bg-selected hover:bg-selected'
			},
			nested: {
				false: 'rounded-card',
				true: 'rounded-none'
			}
		},
		defaultVariants: {
			variant: 'default',
			nested: false
		}
	}
);

export type RoleCardVariantProps = VariantProps<typeof roleCardRecipe>;
