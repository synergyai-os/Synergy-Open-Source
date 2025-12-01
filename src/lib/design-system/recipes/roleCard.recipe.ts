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
	'flex w-full items-center gap-button rounded-card bg-surface text-left transition-colors card-padding hover:bg-subtle',
	{
		variants: {
			// No variants needed yet - can add selected/active states later if needed
		},
		defaultVariants: {}
	}
);

export type RoleCardVariantProps = VariantProps<typeof roleCardRecipe>;

