import { cva, type VariantProps } from 'class-variance-authority';

/**
 * DatePicker Content Recipe (calendar popup container)
 *
 * Premium popup styling matching combobox/dropdown aesthetic:
 * - bg-surface for cleaner look
 * - shadow-md for soft, diffused floating effect
 * - rounded-modal for generous radius
 * - py-inset-sm for vertical padding
 */
export const datePickerContentRecipe = cva(
	'relative z-50 min-w-[var(--bits-date-picker-anchor-width)] overflow-hidden rounded-modal border border-base bg-surface py-inset-sm shadow-md',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type DatePickerContentVariantProps = VariantProps<typeof datePickerContentRecipe>;
