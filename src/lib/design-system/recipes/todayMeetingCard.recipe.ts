import { cva, type VariantProps } from 'class-variance-authority';

/**
 * TodayMeetingCard Recipe (CVA)
 *
 * Type-safe variant system for TodayMeetingCard component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Start simple - default variant only for now.
 * Can expand later with variants like 'prominent', 'compact', etc.
 */
export const todayMeetingCardRecipe = cva(
	// Base classes - wrapper container styling only (Card atom handles all card styling)
	// No background needed - Card component with variant="premium" already provides bg-surface
	'',
	{
		variants: {
			// Start simple - no variants yet, can expand later
			// Example future variants: 'prominent', 'compact', 'selected'
		},
		defaultVariants: {}
	}
);

export type TodayMeetingCardVariantProps = VariantProps<typeof todayMeetingCardRecipe>;
