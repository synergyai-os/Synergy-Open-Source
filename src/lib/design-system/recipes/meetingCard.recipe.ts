import { cva, type VariantProps } from 'class-variance-authority';

/**
 * MeetingCard Recipe (CVA)
 *
 * Type-safe variant system for MeetingCard component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Handles container styling for meeting card rows in list view.
 */
export const meetingCardRecipe = cva(
	// Base classes - container styling for meeting card row
	'group hover:bg-subtle transition-colors-token flex items-center rounded-card overflow-hidden gap-fieldGroup',
	{
		variants: {
			// Start simple - default variant only for now
			// Can expand later with variants like 'selected', 'highlighted', etc.
		},
		defaultVariants: {}
	}
);

export type MeetingCardVariantProps = VariantProps<typeof meetingCardRecipe>;
