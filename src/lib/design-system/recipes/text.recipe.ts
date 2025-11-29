import { cva, type VariantProps } from 'class-variance-authority';

export const textRecipe = cva(
	// Base classes - applied to all text
	'font-body',
	{
		variants: {
			variant: {
				// Variants control typography only (font size), not color
				body: '', // No typography-specific classes (size handles font size)
				label: 'text-[0.625rem]', // 10px - EXCEPTION: typography.fontSize.label
				caption: 'text-[0.625rem]' // 10px - EXCEPTION: typography.fontSize.label
			},
			size: {
				sm: 'text-sm', // 14px - matches typography.fontSize.sm (0.875rem)
				base: 'text-base', // 16px - matches typography.fontSize.base (1rem)
				lg: 'text-lg' // 18px - matches typography.fontSize.lg (1.125rem)
			},
			color: {
				// Color is always separate from variant - clean separation of concerns
				default: 'text-primary', // Default color when not specified
				inherit: '[color:inherit]', // Inherit from parent (no !important needed - no conflict)
				secondary: 'text-secondary',
				tertiary: 'text-tertiary',
				error: 'text-error',
				warning: 'text-warning',
				success: 'text-success',
				info: 'text-info'
			},
			weight: {
				normal: 'font-normal',
				medium: 'font-medium',
				semibold: 'font-semibold',
				bold: 'font-bold'
			},
			lineHeight: {
				normal: '',
				compact: 'leading-none'
			}
		},
		defaultVariants: {
			variant: 'body',
			size: 'base',
			color: 'default',
			weight: 'normal',
			lineHeight: 'normal'
		}
	}
);

export type TextVariantProps = VariantProps<typeof textRecipe>;
