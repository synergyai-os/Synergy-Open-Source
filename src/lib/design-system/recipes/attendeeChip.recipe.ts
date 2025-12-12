import { cva, type VariantProps } from 'class-variance-authority';

/**
 * AttendeeChip Recipe (CVA)
 *
 * Type-safe variant system for AttendeeChip molecule component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default
 * Handles container styling for attendee chips with icon, text, badge, and remove button.
 */
export const attendeeChipRecipe = cva(
	// Base classes - applied to all attendee chips
	// Container styling: padding, border, background, rounded corners
	// Internal spacing: gap between icon, text, badge, and button
	'inline-flex items-center rounded-button border bg-surface px-button-sm py-button-sm gap-fieldGroup',
	{
		variants: {
			variant: {
				default: 'border-border-base'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export type AttendeeChipVariantProps = VariantProps<typeof attendeeChipRecipe>;

/**
 * AttendeeChip Close Button Recipe (CVA)
 *
 * Type-safe variant system for the close button inside AttendeeChip.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Handles close button styling with reduced right padding for compact design.
 */
export const attendeeChipCloseButtonRecipe = cva(
	// Base classes - applied to all close buttons
	'flex items-center justify-center rounded-button pl-button-sm py-button-sm text-tertiary transition-colors hover:text-primary',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type AttendeeChipCloseButtonVariantProps = VariantProps<
	typeof attendeeChipCloseButtonRecipe
>;
