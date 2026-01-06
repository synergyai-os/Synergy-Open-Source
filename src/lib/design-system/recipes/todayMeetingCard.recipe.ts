import { cva, type VariantProps } from 'class-variance-authority';

/**
 * TodayMeetingCard Recipe (CVA)
 *
 * Type-safe variant system for TodayMeetingCard component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Start simple - default variant only for now.
 * Can expand later with additional variants if needed.
 */
export const todayMeetingCardRecipe = cva(
	// Base classes - wrapper container styling only (Card atom handles all card styling)
	// No background needed - Card component already provides background styling
	'',
	{
		variants: {
			// Start simple - no variants yet, can expand later if needed
		},
		defaultVariants: {}
	}
);

export type TodayMeetingCardVariantProps = VariantProps<typeof todayMeetingCardRecipe>;
