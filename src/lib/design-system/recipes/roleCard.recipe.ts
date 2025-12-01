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
	// Uses list item padding (12px horizontal, 8px vertical) instead of card-padding (24px all sides)
	'flex w-full items-center gap-button rounded-card bg-surface text-left transition-colors px-input py-stack-item',
	{
		variants: {
			variant: {
				default: 'hover:bg-subtle',
				selected: 'bg-selected hover:bg-selected'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export type RoleCardVariantProps = VariantProps<typeof roleCardRecipe>;
