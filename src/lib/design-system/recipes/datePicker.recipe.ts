import { cva, type VariantProps } from 'class-variance-authority';

/**
 * DatePicker Content Recipe (calendar popup container)
 *
 * Premium popup styling matching combobox/dropdown aesthetic:
 * - bg-surface for cleaner look
 * - shadow-md for soft, diffused floating effect
 * - rounded-modal for generous radius
 * - Padding applied to inner wrapper: 4px top, 8px bottom, 4px left/right
 */
export const datePickerContentRecipe = cva(
	'relative z-50 min-w-[var(--bits-date-picker-anchor-width)] overflow-hidden rounded-modal border border-base bg-surface shadow-md',
	{
		variants: {},
		defaultVariants: {}
		// Padding is applied to inner wrapper div via inline style
		// (Bits UI Content component doesn't accept style prop directly)
	}
);

/**
 * DatePicker Header Recipe (navigation container)
 *
 * Contains month/year heading and prev/next buttons.
 * Uses flex layout with compact spacing.
 */
export const datePickerHeaderRecipe = cva(
	'flex items-center justify-between gap-button-sm px-button-sm',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * DatePicker Navigation Button Recipe (prev/next arrows)
 *
 * Compact button styling:
 * - Subtle hover state with bg-subtle
 * - Rounded-button for polished look
 * - Transition for smooth feedback
 */
export const datePickerNavButtonRecipe = cva(
	'flex items-center justify-center rounded-button px-button-sm py-button-sm text-secondary transition-all duration-200 hover:bg-subtle hover:text-primary focus:bg-subtle focus:text-primary focus:outline-none',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * DatePicker Heading Recipe (month/year text)
 *
 * Displays current month and year.
 * Uses compact text size for less visual weight.
 */
export const datePickerHeadingRecipe = cva('text-sm font-medium text-primary', {
	variants: {},
	defaultVariants: {}
});

/**
 * DatePicker Grid Head Recipe (weekday header container)
 *
 * Container for weekday labels.
 */
export const datePickerGridHeadRecipe = cva('', {
	variants: {},
	defaultVariants: {}
});

/**
 * DatePicker Grid Row Recipe (calendar row)
 *
 * Container for calendar cells (weekdays or dates).
 */
export const datePickerGridRowRecipe = cva('flex', {
	variants: {},
	defaultVariants: {}
});

/**
 * DatePicker Head Cell Recipe (weekday labels)
 *
 * Displays weekday abbreviations (M, T, W, etc.).
 * Uses compact text size and minimal padding.
 */
export const datePickerHeadCellRecipe = cva(
	'flex flex-1 items-center justify-center py-button-sm text-xs font-medium text-secondary',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * DatePicker Grid Body Recipe (date grid container)
 *
 * Container for date cells.
 */
export const datePickerGridBodyRecipe = cva('', {
	variants: {},
	defaultVariants: {}
});

/**
 * DatePicker Cell Recipe (date cell container)
 *
 * Container for individual date buttons.
 * Uses flex-1 for equal width distribution.
 */
export const datePickerCellRecipe = cva('flex flex-1 items-center justify-center', {
	variants: {},
	defaultVariants: {}
});

/**
 * DatePicker Day Recipe (date button)
 *
 * Compact date button styling:
 * - Minimal padding for compact calendar
 * - hover:bg-active for visible feedback (8% opacity overlay - darker than bg-subtle)
 * - Selected state uses bg-interactive-primary with text-inverse for readability
 * - Transition for smooth feedback
 */
export const datePickerDayRecipe = cva(
	'flex items-center justify-center rounded-button px-button-sm py-button-sm text-xs text-primary transition-all duration-200 outline-none hover:bg-active focus:bg-active focus:outline-none data-selected:bg-interactive-primary data-selected:text-inverse data-disabled:pointer-events-none data-disabled:opacity-50 data-disabled:text-tertiary',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type DatePickerContentVariantProps = VariantProps<typeof datePickerContentRecipe>;
export type DatePickerHeaderVariantProps = VariantProps<typeof datePickerHeaderRecipe>;
export type DatePickerNavButtonVariantProps = VariantProps<typeof datePickerNavButtonRecipe>;
export type DatePickerHeadingVariantProps = VariantProps<typeof datePickerHeadingRecipe>;
export type DatePickerGridHeadVariantProps = VariantProps<typeof datePickerGridHeadRecipe>;
export type DatePickerGridRowVariantProps = VariantProps<typeof datePickerGridRowRecipe>;
export type DatePickerHeadCellVariantProps = VariantProps<typeof datePickerHeadCellRecipe>;
export type DatePickerGridBodyVariantProps = VariantProps<typeof datePickerGridBodyRecipe>;
export type DatePickerCellVariantProps = VariantProps<typeof datePickerCellRecipe>;
export type DatePickerDayVariantProps = VariantProps<typeof datePickerDayRecipe>;
